import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().url(),
  SESSION_SECRET: z.string().min(32),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(input: Record<string, string | undefined>): Env {
  return envSchema.parse(input);
}

let cached: Env | undefined;

export function getEnv(): Env {
  cached ??= parseEnv(process.env);
  return cached;
}
