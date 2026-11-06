import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().url(),
  SESSION_SECRET: z.string().min(32),
  // 32 byte, base64. Generate: openssl rand -base64 32
  TOKEN_ENCRYPTION_KEY: z.string().refine(
    (value) => Buffer.from(value, "base64").length === 32,
    { message: "TOKEN_ENCRYPTION_KEY must be 32 bytes encoded as base64" },
  ),
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
