export interface DiffToken {
  type: 'equal' | 'insert' | 'delete';
  value: string;
}

/**
 * A lightweight, reliable word-level diff algorithm for tracking changes between draft and editorial prose.
 * Based on Longest Common Subsequence (LCS) dynamic programming on tokenized word tokens.
 */
export function computeWordDiff(original: string, modified: string): DiffToken[] {
  if (!original && !modified) return [];
  if (!original) return [{ type: 'insert', value: modified }];
  if (!modified) return [{ type: 'delete', value: original }];
  if (original === modified) return [{ type: 'equal', value: original }];

  // Tokenize preserving spaces and punctuation boundaries
  const tokenize = (text: string): string[] => {
    return text.match(/[\w'-]+|[^\w\s]+|\s+/g) || [];
  };

  const wordsA = tokenize(original);
  const wordsB = tokenize(modified);

  const n = wordsA.length;
  const m = wordsB.length;

  // For very long documents, prevent quadratic memory blowup by chunking paragraphs if needed
  if (n > 1200 || m > 1200) {
    return computeParagraphDiff(original, modified);
  }

  // Standard LCS DP Table
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (wordsA[i - 1] === wordsB[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to construct diff tokens
  const rawTokens: DiffToken[] = [];
  let i = n;
  let j = m;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && wordsA[i - 1] === wordsB[j - 1]) {
      rawTokens.push({ type: 'equal', value: wordsA[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rawTokens.push({ type: 'insert', value: wordsB[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      rawTokens.push({ type: 'delete', value: wordsA[i - 1] });
      i--;
    }
  }

  rawTokens.reverse();

  // Merge contiguous tokens of the same type for cleaner rendering
  const merged: DiffToken[] = [];
  for (const token of rawTokens) {
    if (merged.length > 0 && merged[merged.length - 1].type === token.type) {
      merged[merged.length - 1].value += token.value;
    } else {
      merged.push({ ...token });
    }
  }

  return merged;
}

/**
 * Paragraph-level diff fallback for very large scenes
 */
function computeParagraphDiff(textA: string, textB: string): DiffToken[] {
  const parasA = textA.split('\n\n');
  const parasB = textB.split('\n\n');

  const result: DiffToken[] = [];
  const max = Math.max(parasA.length, parasB.length);

  for (let i = 0; i < max; i++) {
    const a = parasA[i];
    const b = parasB[i];

    if (a !== undefined && b !== undefined) {
      if (a === b) {
        result.push({ type: 'equal', value: a });
      } else {
        // Small word diff within paragraph
        const sub = computeWordDiff(a, b);
        result.push(...sub);
      }
    } else if (a !== undefined) {
      result.push({ type: 'delete', value: a });
    } else if (b !== undefined) {
      result.push({ type: 'insert', value: b });
    }

    if (i < max - 1) {
      result.push({ type: 'equal', value: '\n\n' });
    }
  }

  return result;
}

/**
 * Calculate statistical summaries from diff tokens
 */
export function calculateDiffStats(tokens: DiffToken[]) {
  let insertionsCount = 0;
  let deletionsCount = 0;
  let insertedWords = 0;
  let deletedWords = 0;

  tokens.forEach((t) => {
    const words = (t.value.match(/\b\w+\b/g) || []).length;
    if (t.type === 'insert') {
      insertionsCount++;
      insertedWords += words;
    } else if (t.type === 'delete') {
      deletionsCount++;
      deletedWords += words;
    }
  });

  return {
    insertionsCount,
    deletionsCount,
    insertedWords,
    deletedWords,
    netWordChange: insertedWords - deletedWords
  };
}
