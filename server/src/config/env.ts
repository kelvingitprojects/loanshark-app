import { config as loadEnv } from "dotenv";
import { z } from "zod";

loadEnv();

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.string().default("4000"),
  DATABASE_URL: z.string().default("postgresql://loans_postgres_user:H6R1MmE86c2z33KCC7iX7kj4bLdpNtwq@dpg-d49vi3he2q1c73dssgs0-a/loans_postgres"),
  API_KEY: z.string().default(""),
  ADMIN_EMAIL: z.string().default("kelvin@gmail.com"),
  ADMIN_PASSWORD: z.string().default("kat@2025"),
  // Comma-separated list of allowed origins for CORS in production
  // e.g. "https://your-frontend.vercel.app,https://www.yourdomain.com"
  CORS_ORIGIN: z.string().default("")
});

export type Env = z.infer<typeof EnvSchema>;

export const env: Env = EnvSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  API_KEY: process.env.API_KEY,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  CORS_ORIGIN: process.env.CORS_ORIGIN
});