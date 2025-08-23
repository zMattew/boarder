import { PrismaClient } from "../generated/client.ts";
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const client =
    globalForPrisma.prisma || new PrismaClient({ adapter });
export default client
export * from "../generated/client.ts"

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;