/**
 * AFL Draft Value Index (DVI) — 2025 Edition
 * --------------------------------------------
 * Source: AFL.com.au official Draft Value Index
 * Points are assigned to picks 1–54 only.
 * Every pick from 55 onward has a value of 0.
 *
 * Bid match cost is scaled by the tied club's ladder position:
 *   Positions 11–18 : 10% discount  (× 0.90)
 *   Positions  5–10 : no adjustment (× 1.00)
 *   Positions  3– 4 : 10% loading   (× 1.10)
 *   Positions  1– 2 : 20% loading   (× 1.20)
 *
 * Picks 55+ are worth 0 pts and cannot be used to match bids.
 */

const DRAFT_VALUE_INDEX = {
   1: 3000,
   2: 2481,
   3: 2072,
   4: 1749,
   5: 1494,
   6: 1293,
   7: 1133,
   8: 1003,
   9:  896,
  10:  808,
  11:  733,
  12:  669,
  13:  614,
  14:  567,
  15:  526,
  16:  490,
  17:  459,
  18:  431,
  19:  407,
  20:  385,
  21:  366,
  22:  348,
  23:  332,
  24:  318,
  25:  305,
  26:  293,
  27:  282,
  28:  272,
  29:  263,
  30:  254,
  31:  246,
  32:  239,
  33:  232,
  34:  225,
  35:  219,
  36:  213,
  37:  208,
  38:  202,
  39:  197,
  40:  193,
  41:  188,
  42:  184,
  43:  180,
  44:  176,
  45:  172,
  46:  169,
  47:  165,
  48:  162,
  49:  159,
  50:  156,
  51:  153,
  52:  150,
  53:  147,
  54:   14,
};

/**
 * Get the DVI value for a given pick number.
 * Returns 0 for picks outside the 1–54 range.
 */
function getPickValue(pickNumber) {
  return DRAFT_VALUE_INDEX[pickNumber] || 0;
}

/**
 * Returns the cost multiplier for a club based on their ladder position.
 * ladderRank 1 = top of ladder, 18 = bottom.
 */
function getMatchMultiplier(ladderRank) {
  if (!ladderRank || ladderRank >= 11) return 0.90; // 10% discount
  if (ladderRank >= 5)                 return 1.00; // no adjustment
  if (ladderRank >= 3)                 return 1.10; // 10% loading
  return 1.20;                                       // 20% loading (rank 1–2)
}

/**
 * Returns a human-readable label for the modifier applied.
 */
function getMatchModifierLabel(ladderRank) {
  if (!ladderRank || ladderRank >= 11) return '10% discount (ladder positions 11–18)';
  if (ladderRank >= 5)                 return 'no adjustment (ladder positions 5–10)';
  if (ladderRank >= 3)                 return '10% loading (ladder positions 3–4)';
  return '20% loading (ladder positions 1–2)';
}

/**
 * Calculate how many points a club needs to spend to match a bid.
 * ladderRank: the tied club's ladder position (1=top, 18=bottom).
 */
function getMatchCost(bidPickNumber, ladderRank) {
  const bidValue = getPickValue(bidPickNumber);
  return Math.ceil(bidValue * getMatchMultiplier(ladderRank));
}

/**
 * Given a club's remaining pick numbers, find the
 * cheapest combination of picks that meets the cost to match.
 * Returns the pick numbers to be used, or null if impossible.
 */
function findMatchingPicks(availablePickNumbers, costRequired) {
  // Sort picks by value descending (spend most valuable first)
  const picks = availablePickNumbers
    .map(n => ({ pick: n, value: getPickValue(n) }))
    .filter(p => p.value > 0)
    .sort((a, b) => b.value - a.value);

  // Greedy: use picks from most to least valuable until cost met
  let remaining = costRequired;
  const used = [];
  for (const p of picks) {
    if (remaining <= 0) break;
    used.push(p.pick);
    remaining -= p.value;
  }

  return remaining <= 0 ? used : null; // null = cannot match
}