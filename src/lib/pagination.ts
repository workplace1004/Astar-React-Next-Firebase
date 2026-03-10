const DEFAULT_MAX_VISIBLE = 8;
const SLIDING_SIZE = 4;
const LAST_COUNT = 4;

/**
 * Returns page numbers and ellipsis for compact pagination with a sliding window.
 * When on page 4: 1, ..., 3, 4, 5, 6, ..., 21, 22, 23, 24 (current page stays in view, 1 and 2 disappear).
 */
export function getPaginationItems(
  totalPages: number,
  currentPage: number,
  maxVisible: number = DEFAULT_MAX_VISIBLE
): (number | "ellipsis")[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Sliding block of 4 including current: e.g. on page 4 → 3, 4, 5, 6
  const blockStart = Math.max(1, currentPage - 1);
  const blockEnd = Math.min(totalPages, blockStart + SLIDING_SIZE - 1);
  const block: number[] = [];
  for (let p = blockStart; p <= blockEnd; p++) block.push(p);

  const result: (number | "ellipsis")[] = [];

  if (blockStart > 1) {
    result.push(1);
    if (blockStart > 2) result.push("ellipsis");
  }
  result.push(...block);
  if (blockEnd < totalPages) {
    const tailStart = Math.max(blockEnd + 1, totalPages - LAST_COUNT + 1);
    if (blockEnd < tailStart - 1) result.push("ellipsis");
    for (let p = tailStart; p <= totalPages; p++) result.push(p);
  }

  return result;
}
