import {
  areaPath,
  donutSegmentPath,
  donutSegments,
  linePath,
  scalePoints,
} from '../geometry';

describe('scalePoints', () => {
  it('não devolve ponto algum para série vazia', () => {
    expect(scalePoints([], 100, 50)).toEqual([]);
  });

  it('centraliza o único ponto de uma série de um valor', () => {
    expect(scalePoints([42], 100, 50)).toEqual([{ x: 50, y: 25 }]);
  });

  it('espalha os pontos da esquerda à direita', () => {
    const points = scalePoints([0, 5, 10], 100, 50);

    expect(points.map((point) => point.x)).toEqual([0, 50, 100]);
  });

  it('inverte o eixo vertical: valor maior fica mais em cima', () => {
    const points = scalePoints([0, 10], 100, 50);

    expect(points[0]?.y).toBe(50);
    expect(points[1]?.y).toBe(0);
  });

  it('desenha no meio da altura quando todos os valores são iguais', () => {
    // Sem isso a escala dividiria por zero e o traçado sumiria.
    const points = scalePoints([7, 7, 7], 100, 50);

    expect(points.map((point) => point.y)).toEqual([25, 25, 25]);
  });

  it('lida com valores negativos', () => {
    const points = scalePoints([-100, 0, 100], 100, 50);

    expect(points[0]?.y).toBe(50);
    expect(points[1]?.y).toBe(25);
    expect(points[2]?.y).toBe(0);
  });
});

describe('linePath', () => {
  it('devolve caminho vazio sem pontos', () => {
    expect(linePath([])).toBe('');
  });

  it('começa com um deslocamento e segue com retas', () => {
    const path = linePath([
      { x: 0, y: 10 },
      { x: 5, y: 0 },
    ]);

    expect(path).toBe('M0 10 L5 0');
  });

  it('arredonda para duas casas', () => {
    expect(linePath([{ x: 1.23456, y: 2.6 }])).toBe('M1.23 2.6');
  });
});

describe('areaPath', () => {
  it('fecha o traçado na base', () => {
    const path = areaPath(
      [
        { x: 0, y: 10 },
        { x: 20, y: 0 },
      ],
      40,
    );

    expect(path).toBe('M0 10 L20 0 L20 40 L0 40 Z');
  });

  it('devolve caminho vazio sem pontos', () => {
    expect(areaPath([], 40)).toBe('');
  });
});

describe('donutSegmentPath', () => {
  it('começa no topo do círculo', () => {
    const path = donutSegmentPath(0, 0.25, 50, 10, 50);

    // Centro em 50, raio 50: o topo é o ponto (50, 0).
    expect(path.startsWith('M50 0')).toBe(true);
  });

  it('marca arco maior quando a fatia passa de meia volta', () => {
    const big = donutSegmentPath(0, 0.75, 50, 10, 50);
    const small = donutSegmentPath(0, 0.25, 50, 10, 50);

    expect(big).toContain('0 1 1');
    expect(small).toContain('0 0 1');
  });

  it('fecha o traçado, para a fatia ser preenchida e não só contornada', () => {
    expect(donutSegmentPath(0, 0.5, 50, 10, 50).endsWith('Z')).toBe(true);
  });
});

describe('donutSegments', () => {
  it('devolve um traçado por participação', () => {
    expect(donutSegments([0.5, 0.3, 0.2], 50, 10, 50)).toHaveLength(3);
  });

  it('encadeia as fatias: cada uma começa onde a anterior terminou', () => {
    const [first, second] = donutSegments([0.25, 0.25], 50, 10, 50);
    const firstEnd = donutSegmentPath(0.25, 0.5, 50, 10, 50);

    expect(first).toBe(donutSegmentPath(0, 0.25, 50, 10, 50));
    expect(second).toBe(firstEnd);
  });

  it('não fecha a volta completa em uma fatia única', () => {
    // De 0 a 1 os pontos coincidem e o arco some. A fatia precisa parar antes.
    const [only] = donutSegments([1], 50, 10, 50);

    expect(only).toBe(donutSegmentPath(0, 0.9999, 50, 10, 50));
  });

  it('não devolve traçado algum para lista vazia', () => {
    expect(donutSegments([], 50, 10, 50)).toEqual([]);
  });
});
