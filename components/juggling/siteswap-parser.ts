/**
 * @file siteswap-parser.ts
 * A utility for parsing juggling siteswap patterns.
 * Supports standard asynchronous, synchronous, and multiplex notations.
 */

/**
 * Represents the successfully parsed components of a siteswap pattern.
 */
export interface ParsedSiteswap {
  pattern: (number | number[])[];
  numBalls: number;
  isSync: boolean;
}

/**
 * Parses a siteswap string into its core components.
 * @param siteswapString The siteswap pattern to parse (e.g., "531", "(4,4)", "[34]1").
 * @returns A `ParsedSiteswap` object.
 * @throws An error if the siteswap string is invalid.
 *
 * This function handles standard, synchronous, and multiplex patterns. It uses base-36
 * parsing to allow for throws greater than 9 (e.g., 'a' for 10). It also validates
 * the pattern by ensuring its average throw value is a whole number, which determines
 * the number of balls required.
 */
export const parseSiteswap = (siteswapString: string): ParsedSiteswap => {
  siteswapString = siteswapString.toLowerCase().replaceAll(/\s/g, '');
  if (!siteswapString) throw new Error('Siteswap cannot be empty.');

  const throws: (number | number[])[] = [];
  let remainingString = siteswapString;

  // Manually tokenize the string to handle different pattern types.
  while (remainingString.length > 0) {
    if (remainingString.startsWith('(')) {
      const endIndex = remainingString.indexOf(')');
      if (endIndex === -1)
        throw new Error('Mismatched parentheses in sync pattern.');
      const content = remainingString.slice(1, endIndex).split(',');
      throws.push(
        Number.parseInt(content[0].replace('x', ''), 36),
        Number.parseInt(content[1].replace('x', ''), 36),
      );
      remainingString = remainingString.slice(Math.max(0, endIndex + 1));
    } else if (remainingString.startsWith('[')) {
      const endIndex = remainingString.indexOf(']');
      if (endIndex === -1)
        throw new Error('Mismatched brackets in multiplex pattern.');
      const content = remainingString.slice(1, endIndex);
      throws.push([...content].map((t) => Number.parseInt(t, 36)));
      remainingString = remainingString.slice(Math.max(0, endIndex + 1));
    } else {
      const char = remainingString[0];
      throws.push(Number.parseInt(char, 36));
      remainingString = remainingString.slice(1);
    }
  }

  const isSync = siteswapString.includes('(');
  // A valid siteswap's average throw value must be an integer, which equals the number of balls.
  const sum = throws.flat().reduce((a, b) => a + b, 0);
  const numberBeats = throws.length;
  if (sum === 0 || numberBeats === 0 || sum % numberBeats !== 0) {
    throw new Error('Invalid siteswap pattern.');
  }
  const numberBalls = sum / numberBeats;
  return { pattern: throws, numBalls: numberBalls, isSync };
};
