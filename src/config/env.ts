import { z } from 'zod';

export const APP_STAGES = ['development', 'preview', 'production'] as const;
export type AppStage = (typeof APP_STAGES)[number];

const envSchema = z.object({
  stage: z.enum(APP_STAGES),
});

export type Env = z.infer<typeof envSchema>;

/**
 * O Expo substitui `process.env.EXPO_PUBLIC_*` em tempo de build, mas apenas
 * quando o acesso é literal. Ler `process.env` por variável ou desestruturação
 * devolve `undefined` no aplicativo, então cada valor é lido explicitamente.
 */
export function parseEnv(): Env {
  const result = envSchema.safeParse({
    stage: process.env.EXPO_PUBLIC_APP_STAGE ?? 'development',
  });

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`)
      .join('; ');
    throw new Error(`Variáveis de ambiente inválidas — ${issues}`);
  }

  return result.data;
}

export const env = parseEnv();

export const isProduction = env.stage === 'production';
export const isDevelopment = env.stage === 'development';
