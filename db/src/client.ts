import { PrismaClient } from "../generated/client.ts";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const client =
    globalForPrisma.prisma || new PrismaClient();
export default client
export * from "../generated/client.ts"

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;