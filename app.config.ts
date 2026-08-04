import type { ConfigContext, ExpoConfig } from 'expo/config';

const STAGES = ['development', 'preview', 'production'] as const;
type Stage = (typeof STAGES)[number];

function resolveStage(): Stage {
  const value = process.env.EXPO_PUBLIC_APP_STAGE ?? 'development';
  if (!STAGES.includes(value as Stage)) {
    throw new Error(
      `EXPO_PUBLIC_APP_STAGE inválido: "${value}". Use ${STAGES.join(', ')}.`,
    );
  }
  return value as Stage;
}

// Estágios convivem no mesmo aparelho porque cada um tem applicationId próprio.
const STAGE_CONFIG: Record<Stage, { name: string; packageSuffix: string }> = {
  development: { name: 'Troqito Dev', packageSuffix: '.dev' },
  preview: { name: 'Troqito Preview', packageSuffix: '.preview' },
  production: { name: 'Troqito', packageSuffix: '' },
};

export default ({ config }: ConfigContext): ExpoConfig => {
  const stage = resolveStage();
  const { name, packageSuffix } = STAGE_CONFIG[stage];

  return {
    ...config,
    name,
    slug: 'troqito',
    version: '0.1.0',
    orientation: 'portrait',
    scheme: 'troqito',
    userInterfaceStyle: 'automatic',
    icon: './assets/brand/troqito-icon-source.png',
    android: {
      package: `com.caiokenai.troqito${packageSuffix}`,
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: './assets/brand/troqito-icon-source.png',
        backgroundColor: '#0B6B3A',
      },
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/brand/troqito-icon-source.png',
          imageWidth: 180,
          resizeMode: 'contain',
          backgroundColor: '#0B6B3A',
          dark: { backgroundColor: '#08301C' },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      stage,
    },
  };
};
