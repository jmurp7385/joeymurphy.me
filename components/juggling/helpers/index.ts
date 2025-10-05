export function classifySiteswap(siteswap: string): {
  type: 'invalid' | 'cascade' | 'shower' | 'half-shower' | 'fountain' | 'mixed';
  numberBalls: number;
  reason: string;
} {
  // Step 1: Parse the siteswap
  const throwHeights = [...siteswap].map(Number);
  const period = throwHeights.length;
  const sum = throwHeights.reduce(
    (accumulator, value) => accumulator + value,
    0,
  );
  const numberBalls = sum / period;

  // Step 2: Validate the siteswap
  if (!Number.isInteger(numberBalls)) {
    return {
      type: 'invalid',
      numberBalls: -1,
      reason: 'Average throw height must be an integer.',
    };
  }

  // Step 3: Analyze throw parity and structure
  const oddThrows = throwHeights.filter((h) => h % 2 === 1);
  const evenThrows = throwHeights.filter((h) => h % 2 === 0);
  const ones = throwHeights.filter((h) => h === 1);
  const highThrows = throwHeights.filter((h) => h > 1);

  // Step 4: Classify the pattern
  if (oddThrows.length === period) {
    // All throws are odd
    if (period === 1) {
      // Single odd throw (e.g., "3")
      return {
        type: 'cascade',
        numberBalls: numberBalls,
        reason: 'Single odd throw, alternating hands.',
      };
    } else if (highThrows.length === 1 && ones.length === period - 1) {
      // One high throw, rest are "1"s (e.g., "51", "71")
      return {
        type: 'shower',
        numberBalls,
        reason: `High throw (${highThrows[0]}) followed by ${ones.length} '1's.`,
      };
    } else if (
      ones.length > 0 &&
      throwHeights.slice(-ones.length).every((h) => h === 1)
    ) {
      // Multiple high throws followed by "1"s (e.g., "531")
      return {
        type: 'half-shower',
        numberBalls,
        reason: `High throws (${highThrows.join(', ')}) followed by ${
          ones.length
        } '1's.`,
      };
    } else {
      // Multiple odd throws, no "1"s or mixed (e.g., "7531")
      return {
        type: 'cascade',
        numberBalls,
        reason: 'All odd throws, alternating hands.',
      };
    }
  } else if (evenThrows.length === period) {
    // All throws are even (e.g., "4")
    return {
      type: 'fountain',
      numberBalls,
      reason: 'All even throws, same-hand pattern.',
    };
  } else {
    // Mixed odd and even (not in your examples, but possible)
    return {
      type: 'mixed',
      numberBalls,
      reason: 'Combination of odd and even throws.',
    };
  }
}

function generateNextCycle(siteswapAnalysis: {
  period: number;
  isValid: boolean;
  numBalls: number | undefined;
  siteswap: number[];
}) {
  const { period, isValid, numBalls } = siteswapAnalysis;

  // If the siteswap is invalid, return null
  if (!isValid || !numBalls) {
    return;
  }

  // Parse the original siteswap string to get throw heights
  const throws = siteswapAnalysis.siteswap; // Store siteswap in analysis for convenience

  // Simulate the first cycle to determine ball landings
  const landingQueue = []; // Tracks { beat, throwHeight } for each ball
  for (let beat = 0; beat < period; beat++) {
    landingQueue.push({
      beat: beat + throws[beat], // When the ball lands
      throwHeight: throws[beat], // Original throw height
    });
  }

  // Sort landings by beat to process in order
  landingQueue.sort((a, b) => a.beat - b.beat);

  // Generate throws for the next cycle (beats: period to 2 * period - 1)
  const nextCycleThrows = [];
  let throwIndex = 0; // Index into the original throw sequence, cycling with modulo

  for (let beat = period; beat < 2 * period; beat++) {
    // Check if a ball lands at this beat
    const landing = landingQueue.find((item) => item.beat === beat);
    if (landing) {
      // Rethrow the ball with the next throw height from the sequence
      const nextThrow = throws[throwIndex % period];
      nextCycleThrows.push(nextThrow);
      // Add the new landing to the queue
      landingQueue.push({
        beat: beat + nextThrow,
        throwHeight: nextThrow,
      });
      landingQueue.shift(); // Remove the landed ball (assumes one ball per beat for simplicity)
    } else {
      // No landing, so no throw (could be a "0" in multiplex, but keep simple for now)
      nextCycleThrows.push(0); // Placeholder for no throw
    }
    throwIndex++;
  }

  return nextCycleThrows;
}

// Modified analyzeSiteswap to include the siteswap string in the output
function analyzeSiteswap(siteswap: number[]) {
  const period = siteswap.length;

  const landings = new Set();
  for (let index = 0; index < period; index++) {
    const landing = (index + siteswap[index]) % period;
    if (landings.has(landing)) {
      return { siteswap, period, isValid: false, numBalls: undefined };
    }
    landings.add(landing);
  }

  const sum = siteswap.reduce((accumulator, value) => accumulator + value, 0);
  const numberBalls = sum / period;
  const isValid = Number.isInteger(numberBalls);
  const beat = numberBalls; // Reference beat value for normalizing throw durations (based on "3")

  return {
    siteswap,
    period,
    isValid,
    beat,
    numBalls: isValid ? numberBalls : undefined,
  };
}

// Test the functions
const siteswaps = [[3], [5, 3, 1], [7, 5, 3, 1], [4]];
for (const siteswap of siteswaps) {
  const analysis = analyzeSiteswap(siteswap);
  const nextCycle = generateNextCycle(analysis);
  console.log(`Siteswap: ${siteswap}`);
  console.log(`Analysis:`, analysis);
  console.log(`Next Cycle Throws:`, nextCycle);
  console.log('---');
}
