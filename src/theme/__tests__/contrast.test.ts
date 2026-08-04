import {
  contrastRatio,
  meetsContrast,
  WCAG_AA_LARGE,
  WCAG_AA_NORMAL,
} from '../contrast';
import { darkTheme, lightTheme } from '../themes';

describe('contrastRatio', () => {
  it('devolve 21 para preto sobre branco', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
  });

  it('devolve 1 para cores iguais', () => {
    expect(contrastRatio('#12904F', '#12904F')).toBeCloseTo(1, 5);
  });

  it('é simétrico entre frente e fundo', () => {
    expect(contrastRatio('#0B7540', '#FFFFFF')).toBeCloseTo(
      contrastRatio('#FFFFFF', '#0B7540'),
      5,
    );
  });

  it('aceita notação hexadecimal curta', () => {
    expect(contrastRatio('#000', '#fff')).toBeCloseTo(21, 5);
  });

  it('rejeita cor inválida em vez de devolver um número errado', () => {
    expect(() => contrastRatio('verde', '#FFFFFF')).toThrow(
      /Cor hexadecimal inválida/,
    );
  });
});

// Contraste é requisito do produto, então é verificado por teste e não por
// inspeção visual. Cada par abaixo aparece de fato na interface.
describe.each([
  ['claro', lightTheme],
  ['escuro', darkTheme],
])('tema %s', (_name, theme) => {
  const { colors } = theme;

  it.each([
    ['texto sobre o fundo', colors.text, colors.background],
    ['texto sobre a superfície', colors.text, colors.surface],
    ['texto secundário sobre o fundo', colors.textMuted, colors.background],
    ['texto secundário sobre a superfície', colors.textMuted, colors.surface],
    ['texto sobre a cor primária', colors.textOnPrimary, colors.primary],
    ['receita sobre a superfície', colors.income, colors.surface],
    ['despesa sobre a superfície', colors.expense, colors.surface],
    ['receita sobre seu próprio fundo', colors.income, colors.incomeSurface],
    ['despesa sobre seu próprio fundo', colors.expense, colors.expenseSurface],
    ['aviso sobre seu próprio fundo', colors.warning, colors.warningSurface],
    ['erro sobre seu próprio fundo', colors.danger, colors.dangerSurface],
    ['informação sobre seu próprio fundo', colors.info, colors.infoSurface],
  ])('%s atinge o mínimo AA', (_label, foreground, background) => {
    const ratio = contrastRatio(foreground, background);
    expect({ ratio: Number(ratio.toFixed(2)), foreground, background }).toEqual(
      {
        ratio: expect.any(Number),
        foreground,
        background,
      },
    );
    expect(meetsContrast(foreground, background, WCAG_AA_NORMAL)).toBe(true);
  });

  it('mantém a borda distinguível da superfície', () => {
    expect(
      contrastRatio(colors.borderStrong, colors.surface),
    ).toBeGreaterThanOrEqual(1.5);
  });

  it('mantém a cor primária visível sobre o fundo', () => {
    expect(
      meetsContrast(colors.primary, colors.background, WCAG_AA_LARGE),
    ).toBe(true);
  });
});
