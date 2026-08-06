/**
 * Geometria dos gráficos.
 *
 * Fica separada dos componentes porque é a parte que dá para verificar por
 * teste: um caminho SVG errado não aparece como erro, aparece como desenho
 * torto que ninguém consegue afirmar se está certo só olhando.
 */

export type Point = { x: number; y: number };

/**
 * Converte valores em coordenadas dentro da caixa do gráfico.
 *
 * Quando todos os valores são iguais, a escala não tem amplitude: em vez de
 * dividir por zero, a linha é desenhada no meio da altura.
 */
export function scalePoints(
  values: readonly number[],
  width: number,
  height: number,
): Point[] {
  if (values.length === 0) return [];
  if (values.length === 1) return [{ x: width / 2, y: height / 2 }];

  const min = Math.min(...values);
  const max = Math.max(...values);
  const amplitude = max - min;

  return values.map((value, index) => ({
    x: (index / (values.length - 1)) * width,
    y:
      amplitude === 0
        ? height / 2
        : height - ((value - min) / amplitude) * height,
  }));
}

/** Caminho SVG ligando os pontos com retas. */
export function linePath(points: readonly Point[]): string {
  if (points.length === 0) return '';

  return points
    .map((point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${command}${round(point.x)} ${round(point.y)}`;
    })
    .join(' ');
}

/** Mesmo traçado, fechado até a base, para preencher a área sob a linha. */
export function areaPath(points: readonly Point[], height: number): string {
  if (points.length === 0) return '';

  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last) return '';

  return [
    linePath(points),
    `L${round(last.x)} ${round(height)}`,
    `L${round(first.x)} ${round(height)}`,
    'Z',
  ].join(' ');
}

/**
 * Arco de rosca entre duas frações do círculo.
 *
 * O ângulo começa no topo, e não à direita, porque é onde a leitura de um
 * gráfico circular começa.
 */
export function donutSegmentPath(
  from: number,
  to: number,
  radius: number,
  thickness: number,
  center: number,
): string {
  const start = angle(from);
  const end = angle(to);
  const inner = radius - thickness;

  const outerStart = onCircle(center, radius, start);
  const outerEnd = onCircle(center, radius, end);
  const innerEnd = onCircle(center, inner, end);
  const innerStart = onCircle(center, inner, start);

  const largeArc = to - from > 0.5 ? 1 : 0;

  return [
    `M${round(outerStart.x)} ${round(outerStart.y)}`,
    `A${round(radius)} ${round(radius)} 0 ${largeArc} 1 ${round(outerEnd.x)} ${round(outerEnd.y)}`,
    `L${round(innerEnd.x)} ${round(innerEnd.y)}`,
    `A${round(inner)} ${round(inner)} 0 ${largeArc} 0 ${round(innerStart.x)} ${round(innerStart.y)}`,
    'Z',
  ].join(' ');
}

/**
 * Converte participações em arcos consecutivos.
 *
 * O acúmulo mora aqui, e não no componente, porque somar em uma variável
 * enquanto se percorre a lista é mutação durante a renderização — e porque
 * assim dá para verificar o resultado por teste.
 */
export function donutSegments(
  shares: readonly number[],
  radius: number,
  thickness: number,
  center: number,
): string[] {
  const paths: string[] = [];
  let cursor = 0;

  for (const share of shares) {
    const from = cursor;
    // Uma fatia de 100% desenhada de 0 a 1 fecha sobre si e some, porque o
    // ponto inicial e o final coincidem. O limite deixa uma fresta invisível.
    const to = Math.min(cursor + share, 0.9999);
    paths.push(donutSegmentPath(from, to, radius, thickness, center));
    cursor = to;
  }

  return paths;
}

function angle(fraction: number): number {
  return fraction * 2 * Math.PI - Math.PI / 2;
}

function onCircle(center: number, radius: number, radians: number): Point {
  return {
    x: center + radius * Math.cos(radians),
    y: center + radius * Math.sin(radians),
  };
}

/** Duas casas bastam: o SVG é renderizado em pontos, não em micrômetros. */
function round(value: number): number {
  return Math.round(value * 100) / 100;
}
