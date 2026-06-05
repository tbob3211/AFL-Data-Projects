/**
 * AFL Draft Value Index (DVI) — 2025 Edition (2026 bidding rules)
 * ----------------------------------------------------------------
 * Source: AFL.com.au official Draft Value Index
 * Points are assigned to picks 1–54 only.
 * Every pick from 55 onward has a value of 0.
 *
 * 2026 pick-limit rules:
 *   Bids at picks  1–36 : matching club may use at most 2 picks
 *   Bids at pick  37+   : matching club may use only their very next pick
 *
 * Loading/discount applied to the DVI match cost (2026):
 *   Positions  1– 2 : 20% loading  — bids placed at picks 1–18 only
 *   Positions  3– 4 : 10% loading  — bids placed at picks 1–18 only
 *   Positions  5–10 : no adjustment
 *   Positions 11–18 : 10% discount — bids placed at picks 1–36 only
 *   (From 2027: positions 11–19 for the discount band)
 *
 * Draft deficit (2026): clubs may accrue up to 412 DVI deficit points.
 * The deficit requires holding a first-round pick in the following year's
 * draft, and is deducted from that pick.
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

/** Maximum DVI points a club can accrue as a draft deficit in 2026. */
const DRAFT_DEFICIT_LIMIT = 412;

/**
 * Get the DVI value for a given pick number.
 * Returns 0 for picks outside the 1–54 range.
 */
function getPickValue(pickNumber) {
  return DRAFT_VALUE_INDEX[pickNumber] || 0;
}

/**
 * Returns the cost multiplier for a club based on their ladder position
 * AND the pick number at which the bid was placed.
 * ladderRank 1 = top of ladder, 18 = bottom.
 */
function getMatchMultiplier(ladderRank, bidPickNumber) {
  if (!ladderRank || ladderRank >= 11) {
    // 10% discount applies only for bids placed at picks 1–36
    return bidPickNumber <= 36 ? 0.90 : 1.00;
  }
  if (ladderRank >= 5) return 1.00; // no adjustment
  if (ladderRank >= 3) {
    // 10% loading applies only for bids placed at picks 1–18
    return bidPickNumber <= 18 ? 1.10 : 1.00;
  }
  // 20% loading applies only for bids placed at picks 1–18 (ranks 1–2)
  return bidPickNumber <= 18 ? 1.20 : 1.00;
}

/**
 * Returns a human-readable label for the modifier applied.
 */
function getMatchModifierLabel(ladderRank, bidPickNumber) {
  if (!ladderRank || ladderRank >= 11) {
    return bidPickNumber <= 36
      ? '10% discount (positions 11–18, bids at picks 1–36)'
      : 'no adjustment (bid at pick 37+)';
  }
  if (ladderRank >= 5) return 'no adjustment (positions 5–10)';
  if (ladderRank >= 3) {
    return bidPickNumber <= 18
      ? '10% loading (positions 3–4, bids at picks 1–18)'
      : 'no adjustment (bid at pick 19+)';
  }
  return bidPickNumber <= 18
    ? '20% loading (positions 1–2, bids at picks 1–18)'
    : 'no adjustment (bid at pick 19+)';
}

/**
 * Calculate how many DVI points a club needs to spend to match a bid.
 * Both the ladder rank and the bid pick number affect the cost.
 */
function getMatchCost(bidPickNumber, ladderRank) {
  const bidValue = getPickValue(bidPickNumber);
  return Math.ceil(bidValue * getMatchMultiplier(ladderRank, bidPickNumber));
}

/**
 * Find the combination of picks that meets the cost to match a bid.
 * maxPicks: maximum number of picks that may be spent (default unlimited).
 *   - Pass 2 for bids placed at picks 1–36.
 *   - Pass 1 for bids placed at pick 37+ (next-pick-only rule).
 * Returns the pick numbers to use, or null if the cost cannot be met.
 */
function findMatchingPicks(availablePickNumbers, costRequired, maxPicks = Infinity) {
  const picks = availablePickNumbers
    .map(n => ({ pick: n, value: getPickValue(n) }))
    .filter(p => p.value > 0)
    .sort((a, b) => b.value - a.value);

  let remaining = costRequired;
  const used = [];
  for (const p of picks) {
    if (remaining <= 0 || used.length >= maxPicks) break;
    used.push(p.pick);
    remaining -= p.value;
  }

  return remaining <= 0 ? used : null;
}
