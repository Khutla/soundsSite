import type { SearchableProduct } from "@/lib/products/types";

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
}

function levenshtein(a: string, b: string) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));

  for (let i = 0; i < rows; i++) matrix[i][0] = i;
  for (let j = 0; j < cols; j++) matrix[0][j] = j;

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[rows - 1][cols - 1];
}

function similarity(a: string, b: string) {
  const left = normalize(a);
  const right = normalize(b);
  if (!left || !right) return 0;
  if (left === right) return 1;
  if (left.includes(right) || right.includes(left)) {
    const shorter = Math.min(left.length, right.length);
    const longer = Math.max(left.length, right.length);
    return 0.85 + (shorter / longer) * 0.15;
  }

  const distance = levenshtein(left, right);
  const maxLen = Math.max(left.length, right.length);
  return 1 - distance / maxLen;
}

function tokenize(query: string) {
  return normalize(query).split(" ").filter(Boolean);
}

function wordsFrom(text: string) {
  return normalize(text).split(" ").filter(Boolean);
}

function scoreTokenAgainstField(token: string, field: string, weight: number) {
  const normalizedField = normalize(field);
  if (!normalizedField) return 0;

  let best = 0;

  if (normalizedField.includes(token)) {
    best = Math.max(best, 0.95 * weight);
  }

  for (const word of wordsFrom(field)) {
    if (word.startsWith(token) || token.startsWith(word)) {
      best = Math.max(best, 0.9 * weight);
    }

    const wordScore = similarity(word, token);
    if (wordScore >= 0.55) {
      best = Math.max(best, wordScore * weight);
    }
  }

  const fieldScore = similarity(normalizedField.slice(0, 120), token);
  if (fieldScore >= 0.6) {
    best = Math.max(best, fieldScore * weight * 0.85);
  }

  return best;
}

function scoreProduct(product: SearchableProduct, query: string) {
  const tokens = tokenize(query);
  if (tokens.length === 0) return 0;

  const fields = [
    { text: product.name, weight: 1 },
    { text: product.category?.name ?? "", weight: 0.75 },
    { text: product.slug.replace(/-/g, " "), weight: 0.65 },
    { text: product.description, weight: 0.35 },
  ];

  let total = 0;
  for (const token of tokens) {
    let bestTokenScore = 0;
    for (const field of fields) {
      bestTokenScore = Math.max(
        bestTokenScore,
        scoreTokenAgainstField(token, field.text, field.weight)
      );
    }
    total += bestTokenScore;
  }

  return total / tokens.length;
}

const MATCH_THRESHOLD = 0.38;

export function fuzzyMatchProducts<T extends SearchableProduct>(
  products: T[],
  query: string
): T[] {
  const trimmed = query.trim();
  if (!trimmed) return products;

  return products
    .map((product) => ({ product, score: scoreProduct(product, trimmed) }))
    .filter(({ score }) => score >= MATCH_THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .map(({ product }) => product);
}
