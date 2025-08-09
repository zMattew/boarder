import path from "node:path";
import type { PrismaConfig } from "prisma";

// import your .env file
import "dotenv/config";

export default {
  schema: path.join("schema.prisma"),
  migrations:{
    path: path.join("migrations"),
  }
} satisfies PrismaConfig;