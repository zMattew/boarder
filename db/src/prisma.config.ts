import type { PrismaConfig } from "prisma";
import "dotenv/config";

export default {
  schema: "./schema/prisma",
  migrations:{
    path: "./migrations",
  }
} satisfies PrismaConfig;