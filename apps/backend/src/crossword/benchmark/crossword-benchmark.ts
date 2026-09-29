import { performance } from 'node:perf_hooks';

import {
  CrosswordGenerationStrategy,
  CrosswordGenerator,
} from '../generator/crossword-generator.js';

const RUNS = 100;
const CANDIDATE_COUNT = 30;
const SEARCH_NODE_LIMIT = 2000;

const WORDS = [
  'CAT',
  'DOG',
  'BIRD',
  'FISH',
  'LION',
  'TIGER',
  'BEAR',
  'HORSE',
  'SHEEP',
  'MOUSE',
  'WOLF',
  'FOX',
  'DEER',
  'EAGLE',
  'SHARK',
  'WHALE',
  'ZEBRA',
  'MONKEY',
  'RABBIT',
  'TURTLE',
  'SNAKE',
  'FROG',
  'OTTER',
  'PANDA',
  'CAMEL',
  'GIRAFFE',
].map((answer) => ({
  answer,
  clue: answer,
}));

const CONFIGS = [
  { rows: 11, cols: 11, targetWordCount: 5 },
  { rows: 13, cols: 13, targetWordCount: 7 },
  { rows: 15, cols: 15, targetWordCount: 9 },
] as const;

type BenchmarkMetrics = {
  successRate: number;
  averagePlacedWords: number;
  averageFillPercentage: number;
  averageNodesVisited: number;
  averageBacktracks: number;
  averagePlacementEvaluations: number;
  averageGenerationTimeMs: number;
  uniqueLayouts: number;
};

type Accumulator = {
  successes: number;
  totalPlacedWords: number;
  totalFillPercentage: number;
  totalNodesVisited: number;
  totalBacktracks: number;
  totalPlacementEvaluations: number;
  totalGenerationTimeMs: number;
  layouts: Set<string>;
};

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;

    return (state >>> 0) / 4_294_967_296;
  };
}

function createAccumulator(): Accumulator {
  return {
    successes: 0,
    totalPlacedWords: 0,
    totalFillPercentage: 0,
    totalNodesVisited: 0,
    totalBacktracks: 0,
    totalPlacementEvaluations: 0,
    totalGenerationTimeMs: 0,
    layouts: new Set<string>(),
  };
}

function getFillPercentage(
  grid: ReturnType<CrosswordGenerator['generate']>['grid'],
): number {
  const occupiedCells = grid.cells
    .flat()
    .filter((cell) => cell.letter !== null).length;

  return (occupiedCells / (grid.rows * grid.cols)) * 100;
}

function getLayoutKey(
  result: ReturnType<CrosswordGenerator['generate']>,
): string {
  return result.grid.placements
    .map(
      (placement) =>
        `${placement.word.answer}@${placement.row},${placement.col},${placement.direction}`,
    )
    .sort()
    .join('|');
}

function runBenchmark(
  rows: number,
  cols: number,
  targetWordCount: number,
  strategy: CrosswordGenerationStrategy,
): BenchmarkMetrics {
  const accumulator = createAccumulator();

  for (let run = 0; run < RUNS; run++) {
    const generator = new CrosswordGenerator({
      rows,
      cols,
      candidateCount: CANDIDATE_COUNT,
      searchNodeLimit: SEARCH_NODE_LIMIT,
      selectionStrategy: strategy,
      random: createSeededRandom(run + 1),
    });

    const startedAt = performance.now();
    const result = generator.generate(WORDS, targetWordCount);
    const elapsedMs = performance.now() - startedAt;

    const stats = result.stats ?? {
      nodesVisited: 0,
      backtracks: 0,
      placementEvaluations: 0,
    };

    accumulator.successes +=
      result.placedWords.length === targetWordCount ? 1 : 0;
    accumulator.totalPlacedWords += result.placedWords.length;
    accumulator.totalFillPercentage += getFillPercentage(result.grid);
    accumulator.totalNodesVisited += stats.nodesVisited;
    accumulator.totalBacktracks += stats.backtracks;
    accumulator.totalPlacementEvaluations += stats.placementEvaluations;
    accumulator.totalGenerationTimeMs += elapsedMs;
    accumulator.layouts.add(getLayoutKey(result));
  }

  return {
    successRate: (accumulator.successes / RUNS) * 100,
    averagePlacedWords: accumulator.totalPlacedWords / RUNS,
    averageFillPercentage: accumulator.totalFillPercentage / RUNS,
    averageNodesVisited: accumulator.totalNodesVisited / RUNS,
    averageBacktracks: accumulator.totalBacktracks / RUNS,
    averagePlacementEvaluations:
      accumulator.totalPlacementEvaluations / RUNS,
    averageGenerationTimeMs: accumulator.totalGenerationTimeMs / RUNS,
    uniqueLayouts: accumulator.layouts.size,
  };
}

function printMetrics(
  strategy: CrosswordGenerationStrategy,
  metrics: BenchmarkMetrics,
): void {
  console.log(`  ${strategy.toUpperCase()}`);
  console.log(`    success rate:              ${metrics.successRate.toFixed(1)}%`);
  console.log(
    `    average placed words:      ${metrics.averagePlacedWords.toFixed(2)}`,
  );
  console.log(
    `    average fill:              ${metrics.averageFillPercentage.toFixed(2)}%`,
  );
  console.log(
    `    average nodes visited:     ${metrics.averageNodesVisited.toFixed(2)}`,
  );
  console.log(
    `    average backtracks:        ${metrics.averageBacktracks.toFixed(2)}`,
  );
  console.log(
    `    average placement evals:   ${metrics.averagePlacementEvaluations.toFixed(2)}`,
  );
  console.log(
    `    average generation time:   ${metrics.averageGenerationTimeMs.toFixed(2)} ms`,
  );
  console.log(`    unique layouts:             ${metrics.uniqueLayouts}/${RUNS}`);
}

function main(): void {
  console.log('CrossMind Crossword Generator Benchmark');
  console.log(
    `Runs: ${RUNS} | Candidates: ${CANDIDATE_COUNT} | Node limit: ${SEARCH_NODE_LIMIT}`,
  );
  console.log('Each baseline/MRV pair uses the same seeded random input.\n');

  for (const config of CONFIGS) {
    console.log(
      `Grid: ${config.rows}x${config.cols} | Target words: ${config.targetWordCount}`,
    );

    const baseline = runBenchmark(
      config.rows,
      config.cols,
      config.targetWordCount,
      'baseline',
    );
    const mrv = runBenchmark(
      config.rows,
      config.cols,
      config.targetWordCount,
      'mrv',
    );

    printMetrics('baseline', baseline);
    printMetrics('mrv', mrv);
    console.log('');
  }
}

main();
