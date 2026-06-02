/**
 * AFL Draft Value Index (DVI) — 2025 Edition
 * --------------------------------------------
 * Source: AFL.com.au official Draft Value Index
 * Points are assigned to picks 1–54 only.
 * Every pick from 55 onward has a value of 0.
 *
 * Key rules:
 *  - To match a bid, a club must spend picks totalling
 *    the bid pick's DVI value minus a 10% discount.
 *  - Example: bid at Pick 1 (3000 pts) → costs 2700 pts to match.
 *  - Picks 55+ are worth 0 pts and cannot be used to match bids.
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

// Bid match discount: 10% off the bid pick's DVI value
const BID_MATCH_DISCOUNT = 0.10;

/**
 * Get the DVI value for a given pick number.
 * Returns 0 for picks outside the 1–54 range.
 */
function getPickValue(pickNumber) {
  return DRAFT_VALUE_INDEX[pickNumber] || 0;
}

/**
 * Calculate how many points a club needs to spend
 * to match a bid made at a given pick number.
 */
function getMatchCost(bidPickNumber) {
  const bidValue = getPickValue(bidPickNumber);
  return Math.ceil(bidValue * (1 - BID_MATCH_DISCOUNT));
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