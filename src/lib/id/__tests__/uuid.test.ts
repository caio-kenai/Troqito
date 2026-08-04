import { isUuidV7, timestampFromUuidV7, uuidv7 } from '../uuid';

jest.mock('expo-crypto', () => ({
  getRandomBytes: (length: number) =>
    Uint8Array.from({ length }, (_, index) => (index * 37 + 11) % 256),
}));

describe('uuidv7', () => {
  it('produz um identificador no formato da versão 7', () => {
    expect(isUuidV7(uuidv7())).toBe(true);
  });

  it('marca a versão e a variante conforme a RFC 9562', () => {
    const value = uuidv7(1_700_000_000_000);
    expect(value[14]).toBe('7');
    expect(['8', '9', 'a', 'b']).toContain(value[19]);
  });

  it('preserva o instante de criação', () => {
    const now = 1_754_000_000_000;
    expect(timestampFromUuidV7(uuidv7(now))).toBe(now);
  });

  // A ordenação temporal é o motivo de usar v7 em vez de v4: sem ela, os
  // índices por identificador perderiam localidade.
  it('gera identificadores ordenáveis pelo tempo', () => {
    const earlier = uuidv7(1_700_000_000_000);
    const later = uuidv7(1_700_000_000_001);
    expect(earlier < later).toBe(true);
  });

  it('rejeita valores que não são UUID v7', () => {
    expect(isUuidV7('não é um uuid')).toBe(false);
    // UUID v4 válido, mas de versão errada.
    expect(isUuidV7('9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d')).toBe(false);
    expect(() => timestampFromUuidV7('nada')).toThrow(/UUID v7/);
  });
});
