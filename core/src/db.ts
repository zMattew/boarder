import { getSource } from '@repo/db'
import { decrypt } from './crypto.ts';

async function postgresDBConnection(url: string) {
    try {
        const Pool = (await import("pg")).Pool
        const pool = new Pool({
            connectionString: url
        });
        return await pool.connect();
    } catch (error) {
        throw error;
    }
}

async function mysqlDBConnection(url: string) {
    try {
        const options = connectionUrlToConnectionOptions(url)
        const createConnection = (await import("mysql2/promise")).createConnection
        const pool = await createConnection(options);
        return pool
    } catch (error) {
        throw error;
    }
}

export function connectionUrlToConnectionOptions(connectionUrl: string) {
    const parsedUrl = new URL(connectionUrl);
    const connectionOptions: ConnectionOptions = {
        host: parsedUrl.hostname,
        port: parseInt(parsedUrl.port),
        database: parsedUrl.pathname.slice(1),
        user: parsedUrl.username,
        password: parsedUrl.password,
    };
    return connectionOptions;
}


export async function dbIntrospection(sourceId: string) {
    try {
        const source = await getSource(sourceId);
        if (!source?.connectionUrl) throw new Error("Connection URL not found from saved Source");
        const connectionUrlString = await decrypt(source.connectionUrl)
        const { client, protocol } = await dbPool(connectionUrlString)
        let schema: Record<string, Record<string, unknown>[]> = {}
        switch (protocol) {
            case 'postgres':
            case 'postgresql': {
                const { rows: tables } = await client.query("SELECT table_name as name FROM information_schema.tables WHERE table_schema='public';")
                const queriesPromise = []
                for (let table of tables) {
                    const queryPromise = client.query(`
    SELECT 
      c.column_name,
      c.data_type,
      c.is_nullable,
      c.column_default,
      fk.constraint_name AS foreign_key,
      fk.referenced_table AS target_table,
      fk.referenced_column AS target_column
    FROM 
      information_schema.columns AS c
    LEFT JOIN (
      SELECT 
        kcu.table_name AS source_table,
        kcu.column_name AS source_column,
        ccu.table_name AS referenced_table,
        ccu.column_name AS referenced_column,
        tc.constraint_name
      FROM 
        information_schema.table_constraints AS tc
      JOIN 
        information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
      JOIN 
        information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
      WHERE 
        tc.constraint_type = 'FOREIGN KEY'
    ) AS fk ON c.table_name = fk.source_table AND c.column_name = fk.source_column
    WHERE 
      c.table_name = '${table.name}'
    ORDER BY c.ordinal_position;
  `)
                    queriesPromise.push(queryPromise)
                }
                const schemaPromise = await Promise.all(queriesPromise)
                client.release()
                let res = {}
                for (let [index, table] of Object.entries(tables)) {
                    const data = schemaPromise[parseInt(index)].rows.map((col) => {
                        let parsedCol = {}
                        for (let [key, value] of Object.entries(col)) {
                            parsedCol = {
                                ...parsedCol, ...(value != null ? { [key]: value } : {})
                            }
                        }
                        return parsedCol

                    })
                    res = { ...res, [table.name]: data }
                }
                schema = res
            }
                break
            case 'mysql': {
                const { database } = connectionUrlToConnectionOptions(connectionUrlString)
                await client.connect()
                const [tables] = await client.query(`show tables;`) 

                const queriesPromise = []
                for (let table of tables as Record<string, any>[]) {
                    const queryPromise = client.query(`
SELECT 
      c.COLUMN_NAME,
      c.DATA_TYPE,
      c.IS_NULLABLE,
      c.COLUMN_DEFAULT,
      fk.CONSTRAINT_NAME AS foreign_key,
      fk.REFERENCED_TABLE_NAME AS target_table,
      fk.REFERENCED_COLUMN_NAME AS target_column
FROM 
      information_schema.COLUMNS AS c
LEFT JOIN (
      SELECT 
            kcu.TABLE_NAME AS source_table,
            kcu.COLUMN_NAME AS source_column,
            kcu.CONSTRAINT_NAME,
            kcu.REFERENCED_TABLE_NAME,
            kcu.REFERENCED_COLUMN_NAME
      FROM 
            information_schema.KEY_COLUMN_USAGE AS kcu
      WHERE 
            kcu.TABLE_SCHEMA = '${database}' 
            AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
    ) AS fk ON c.TABLE_NAME = fk.source_table AND c.COLUMN_NAME = fk.source_column
WHERE 
      c.TABLE_NAME = '${table[`Tables_in_${database}`]}' 
      AND c.TABLE_SCHEMA = '${database}' 
ORDER BY c.ORDINAL_POSITION;`)
                    queriesPromise.push(queryPromise)
                }
                const schemaPromise = await Promise.all(queriesPromise)
                client.end()
                let res = {}
                for (let [index, table] of Object.entries(tables)) {
                    const data = (schemaPromise[parseInt(index)][0] as Record<string, any>[]).map((col) => {
                        let parsedCol = {}
                        for (let [key, value] of Object.entries(col)) {
                            parsedCol = {
                                ...parsedCol, ...(value != null ? { [key.toLowerCase()]: value } : {})
                            }
                        }
                        return parsedCol

                    })
                    res = { ...res, [table[`Tables_in_${database}`]]: data }
                }
                schema = res
            }
                break
            default:
                throw new Error("Protocol not supported")
        }
        return schema
    } catch (error) {
        throw error
    }
}

export async function dbPoolFromSource(sourceId: string) {
    const source = await getSource(sourceId)
    if (!source) throw "Invalid source"
    const db = await dbEncryptedPool(source.connectionUrl)
    return db
}

export async function dbEncryptedPool(encryptedUrl: string) {
    const url = await decrypt(encryptedUrl)
    return await dbPool(url)
}

export async function dbPool(url: string) {
    try {
        const protocol = new URL(url).protocol
        const paresedProtocol = protocol.substring(0, protocol.length - 1)
        switch (paresedProtocol) {
            case "postgres":
            case 'postgresql':
                return { protocol: paresedProtocol, client: await postgresDBConnection(url) }
            case 'mysql':
                return { protocol: paresedProtocol, client: await mysqlDBConnection(url) }
            default:
                throw new Error("Unsupported protocol")
        }
    } catch (error) {
        throw error
    }

}
export async function testSQLQuery(sourceId: string, query: string) {
    try {
        const { protocol, client } = await dbPoolFromSource(sourceId);
        switch (protocol) {
            case "postgres":
            case 'postgresql':
                const pgResult = await client.query(query);
                if (pgResult.fields)
                    return {
                        success: true,
                        data: pgResult.rows.slice(0, 3),
                        type: pgResult.fields,
                    };
                else throw new Error("Unable to recover proper types sample");
            case 'mysql':
                const [msResult, msType] = await client.query(query)
                if (msType)
                    return {
                        success: true,
                        data: msResult,
                        type: msType
                    }
                else throw new Error("Unable to recover proper types sample");
        }
    } catch (error) {
        console.error("Error testing query:", error);
        return {
            success: false,
            error: error,
        };
    }
}


type ConnectionOptions = {
    port?: number;
    host?: string;
    database?: string;
    user?: string;
    password?: string;
};