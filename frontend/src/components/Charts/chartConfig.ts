import * as d3 from "d3";

export const CHART_CONFIG = {
  margins: { top: 30, right: 30, bottom: 30, left: 50 },
  scatterMargins: { top: 20, right: 20, bottom: 60, left: 70 },
  jitterWidth: 40,
  tickLength: 6,
  pointRadius: 4,
  maxInteractivePoints: 1000,
  resizeDebounceMs: 100,
  transitionDuration: 300,
  pixelsPerTick: 30,
} as const;

export const SHAPE_GENERATORS = {
  circle: (r: number) =>
    d3
      .symbol()
      .type(d3.symbolCircle)
      .size(r * r * Math.PI)(),
  cross: (r: number) =>
    d3
      .symbol()
      .type(d3.symbolCross)
      .size(r * r * 4)(),
  square: (r: number) =>
    d3
      .symbol()
      .type(d3.symbolSquare)
      .size(r * r * 4)(),
  diamond: (r: number) =>
    d3
      .symbol()
      .type(d3.symbolDiamond)
      .size(r * r * 4)(),
  triangle: (r: number) =>
    d3
      .symbol()
      .type(d3.symbolTriangle)
      .size(r * r * 3)(),
  star: (r: number) =>
    d3
      .symbol()
      .type(d3.symbolStar)
      .size(r * r * 4)(),
  wye: (r: number) =>
    d3
      .symbol()
      .type(d3.symbolWye)
      .size(r * r * 4)(),
};

export const SHAPES = Object.keys(SHAPE_GENERATORS) as Array<
  keyof typeof SHAPE_GENERATORS
>;
