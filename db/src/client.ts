import { PrismaClient } from "../build";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const client =
    globalForPrisma.prisma || new PrismaClient();
export default client
export * from "../build"

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;