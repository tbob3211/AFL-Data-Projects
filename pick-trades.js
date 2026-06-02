/**
 * pick-trades.js — Pre-Draft Pick Trade Overrides
 * -------------------------------------------------
 * This file hard-codes pick trades that have occurred
 * before the draft. It runs after the ladder is loaded
 * and modifies ALL_PICKS accordingly.
 *
 * HOW TO ADD A TRADE:
 * -------------------
 * Each trade is an object in the PICK_TRADES array below.
 * There are two types:
 *
 * Type 1 — SWAP (two clubs swap specific round picks):
 * {
 *   type:    'swap',
 *   round:   1,          // which round (1–5)
 *   clubA:   'gcs',      // first club's pick goes to clubB
 *   clubB:   'mel',      // second club's pick goes to clubA
 *   note:    'GCS R1 pick to MEL, MEL R1 pick to GCS',
 * }
 *
 * Type 2 — TRANSFER (one club gives their pick to another):
 * {
 *   type:    'transfer',
 *   round:   1,          // which round pick is being transferred
 *   from:    'gcs',      // club giving away their pick
 *   to:      'mel',      // club receiving the pick
 *   note:    'GCS trade their R1 pick to MEL',
 * }
 *
 * CLUB ID REFERENCE:
 * ------------------
 *   ade = Adelaide          mel = Melbourne
 *   bri = Brisbane          nth = North Melbourne
 *   car = Carlton           por = Port Adelaide
 *   col = Collingwood       ric = Richmond
 *   ess = Essendon          stk = St Kilda
 *   fre = Fremantle         syd = Sydney
 *   gcs = Gold Coast        wce = West Coast
 *   gws = GWS Giants        wbd = Western Bulldogs
 *   gee = Geelong
 *   haw = Hawthorn
 *
 * NOTES:
 * ------
 * - Trades are applied in order, so later trades can
 *   build on earlier ones (e.g. a traded pick being
 *   traded again).
 * - Round picks are identified by their round number
 *   and the club currently holding that pick at the
 *   time the trade is applied.
 * - If a club no longer holds a pick in the specified
 *   round (because it was already traded away), the
 *   trade will be skipped and a warning logged.
 */

const PICK_TRADES = [

  // ── ADD YOUR TRADES HERE ──────────────────────────────────────
  //
  // SWAP example — two clubs exchange their round picks:
  // { type: 'swap', round: 1, clubA: 'gcs', clubB: 'mel', note: 'GCS R1 ↔ MEL R1' },
  //
  // TRANSFER example — one club gives their pick to another:
  // { type: 'transfer', round: 1, from: 'gcs', to: 'mel', note: 'GCS R1 → MEL' },
  { type: 'transfer', round: 1, from: 'gcs', to: 'mel', note: 'GCS R1 → MEL' },
  { type: 'transfer', round: 1, from: 'syd', to: 'car', note: 'SYD R1 → CAR' },
  { type: 'transfer', round: 1, from: 'wbd', to: 'por', note: 'WBD R1 → POR' },
  { type: 'transfer', round: 2, from: 'car', to: 'por', note: 'CAR R2 → POR' },
  { type: 'transfer', round: 2, from: 'nth', to: 'car', note: 'NTH R2 → CAR' },
  { type: 'transfer', round: 2, from: 'stk', to: 'haw', note: 'STK R2 → HAW' },
  { type: 'transfer', round: 2, from: 'gws', to: 'haw', note: 'GWS R2 → HAW' },
  { type: 'transfer', round: 2, from: 'mel', to: 'gws', note: 'MEL R2 → GWS' },
  { type: 'transfer', round: 2, from: 'gcs', to: 'car', note: 'GCS R2 → CAR' },
  { type: 'transfer', round: 3, from: 'ess', to: 'ade', note: 'ESS R3 → ADE' },
  { type: 'transfer', round: 3, from: 'car', to: 'syd', note: 'CAR R3 → SYD' },
  { type: 'transfer', round: 3, from: 'col', to: 'syd', note: 'COL R3 → SYD' },
  { type: 'transfer', round: 3, from: 'gws', to: 'mel', note: 'GWS R3 → MEL' },
  { type: 'transfer', round: 3, from: 'bri', to: 'car', note: 'BRI R3 → CAR' },
  { type: 'transfer', round: 3, from: 'mel', to: 'bri', note: 'MEL R3 → BRI' },
  { type: 'transfer', round: 3, from: 'gcs', to: 'por', note: 'GCS R3 → POR' },
  { type: 'transfer', round: 3, from: 'haw', to: 'bri', note: 'HAW R3 → BRI' },
  { type: 'transfer', round: 3, from: 'syd', to: 'wce', note: 'SYD R3 → WCE' },
  { type: 'transfer', round: 4, from: 'gws', to: 'col', note: 'GWS R4 → COL' },
  { type: 'transfer', round: 4, from: 'ade', to: 'nth', note: 'ADE R4 → NTH' },
  { type: 'transfer', round: 4, from: 'wbd', to: 'wce', note: 'WBD R4 → WCE' },
  { type: 'transfer', round: 4, from: 'mel', to: 'haw', note: 'MEL R4 → HAW' },
  { type: 'transfer', round: 4, from: 'haw', to: 'syd', note: 'HAW R4 → SYD' },
  { type: 'transfer', round: 4, from: 'syd', to: 'col', note: 'SYD R4 → COL' },

];

/**
 * applyPickTrades(allPicks)
 * -------------------------
 * Takes the ALL_PICKS array (already built from the live
 * ladder) and applies every trade in PICK_TRADES.
 * Modifies the array in place and returns it.
 *
 * Call this from index.html immediately after loadLadder()
 * has finished building ALL_PICKS.
 */
function applyPickTrades(allPicks) {
  const PICKS_PER_ROUND = 18;

  PICK_TRADES.forEach((trade, tradeIdx) => {
    const roundStart = (trade.round - 1) * PICKS_PER_ROUND;
    const roundEnd   = roundStart + PICKS_PER_ROUND;
    const roundSlice = allPicks.slice(roundStart, roundEnd);

    if (trade.type === 'transfer') {
      // Find the pick belonging to 'from' in this round
      const pickOffset = roundSlice.indexOf(trade.from);
      if (pickOffset === -1) {
        console.warn(
          `pick-trades.js: Trade #${tradeIdx + 1} skipped — ` +
          `'${trade.from}' does not hold a Round ${trade.round} pick. ` +
          `It may have already been traded. (${trade.note || ''})`
        );
        return;
      }
      const globalIdx = roundStart + pickOffset;
      allPicks[globalIdx] = trade.to;
      console.log(
        `pick-trades.js: Trade #${tradeIdx + 1} applied — ` +
        `Round ${trade.round} Pick ${globalIdx + 1}: ${trade.from} → ${trade.to}` +
        (trade.note ? ` (${trade.note})` : '')
      );

    } else if (trade.type === 'swap') {
      // Find both clubs' picks in this round
      const offsetA = roundSlice.indexOf(trade.clubA);
      const offsetB = roundSlice.indexOf(trade.clubB);
      if (offsetA === -1 || offsetB === -1) {
        console.warn(
          `pick-trades.js: Trade #${tradeIdx + 1} skipped — ` +
          `one or both clubs don't hold a Round ${trade.round} pick. ` +
          `(${trade.note || ''})`
        );
        return;
      }
      const idxA = roundStart + offsetA;
      const idxB = roundStart + offsetB;
      [allPicks[idxA], allPicks[idxB]] = [allPicks[idxB], allPicks[idxA]];
      console.log(
        `pick-trades.js: Trade #${tradeIdx + 1} applied — ` +
        `Round ${trade.round}: swapped ${trade.clubA} (Pick ${idxA + 1}) ` +
        `and ${trade.clubB} (Pick ${idxB + 1})` +
        (trade.note ? ` (${trade.note})` : '')
      );

    } else {
      console.warn(`pick-trades.js: Unknown trade type '${trade.type}' at index ${tradeIdx}`);
    }
  });

  return allPicks;
}