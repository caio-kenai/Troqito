// Falha o teste quando um estado é atualizado fora de act(), em vez de apenas
// registrar um aviso que passa despercebido na saída do Jest.
const originalError = console.error;

beforeAll(() => {
  console.error = (...args: unknown[]) => {
    const [first] = args;
    if (typeof first === 'string' && first.includes('not wrapped in act')) {
      throw new Error(first);
    }
    originalError(...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
