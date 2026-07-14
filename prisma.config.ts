import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, ".env") });

export default {
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL || process.env.DIRECT_URL,
  },
};
