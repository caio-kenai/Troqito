import { APP_STAGES, parseEnv } from '../env';

describe('parseEnv', () => {
  const original = process.env.EXPO_PUBLIC_APP_STAGE;

  afterEach(() => {
    process.env.EXPO_PUBLIC_APP_STAGE = original;
  });

  it.each([...APP_STAGES])('aceita o estágio %s', (stage) => {
    process.env.EXPO_PUBLIC_APP_STAGE = stage;
    expect(parseEnv()).toEqual({ stage });
  });

  it('assume development quando a variável não é definida', () => {
    delete process.env.EXPO_PUBLIC_APP_STAGE;
    expect(parseEnv().stage).toBe('development');
  });

  it('rejeita um estágio desconhecido em vez de silenciar o erro', () => {
    process.env.EXPO_PUBLIC_APP_STAGE = 'homologacao';
    expect(() => parseEnv()).toThrow(/Variáveis de ambiente inválidas/);
  });
});
