// Aircraft Configurations and Dynamic Seat Layout Definitions for SkySeat
// Assessment Requirements:
// 1. 3–2 layout: A B C | aisle | D E
// 2. 2–3–2 layout: A B | aisle | C D E | aisle | F G
// Seat pricing:
// - Standard seats: ₹0
// - Premium seats: ₹250 (e.g. Front rows 2–5)
// - Extra-legroom seats: ₹350 (Row 1 Bulkhead and Exit rows)

export const SEAT_PRICING = {
  standard: 0,
  premium: 250,
  extraLegroom: 350,
};

export const AIRCRAFT_LAYOUTS = {
  '3-2': {
    id: '3-2',
    name: 'Airbus A220 / Regional (3–2 Layout)',
    shortName: '3–2 Layout',
    description: '3 seats (A, B, C) · Aisle · 2 seats (D, E)',
    category: 'Narrow-body',
    rows: 20,
    // seat blocks separated by aisles
    blocks: [
      ['A', 'B', 'C'],
      ['D', 'E'],
    ],
    columns: ['A', 'B', 'C', 'D', 'E'],
    exitRows: [10],
    bulkheadRows: [1],
    premiumRows: [2, 3, 4, 5],
  },
  '2-3-2': {
    id: '2-3-2',
    name: 'Boeing 767 / Widebody (2–3–2 Layout)',
    shortName: '2–3–2 Layout',
    description: '2 seats (A, B) · Aisle · 3 seats (C, D, E) · Aisle · 2 seats (F, G)',
    category: 'Wide-body',
    rows: 20,
    // seat blocks separated by aisles
    blocks: [
      ['A', 'B'],
      ['C', 'D', 'E'],
      ['F', 'G'],
    ],
    columns: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    exitRows: [10],
    bulkheadRows: [1],
    premiumRows: [2, 3, 4, 5],
  },
};

/**
 * Returns seat tier: 'extraLegroom' | 'premium' | 'standard'
 */
export function getSeatTier(rowNumber, colLetter, layoutId = '3-2') {
  const layout = AIRCRAFT_LAYOUTS[layoutId] || AIRCRAFT_LAYOUTS['3-2'];
  const r = typeof rowNumber === 'string' ? parseInt(rowNumber, 10) : rowNumber;

  if (layout.bulkheadRows.includes(r) || layout.exitRows.includes(r)) {
    return 'extraLegroom';
  }
  if (layout.premiumRows.includes(r)) {
    return 'premium';
  }
  return 'standard';
}

/**
 * Returns seat fee in INR (₹)
 */
export function getSeatFee(seatId, layoutId = '3-2') {
  if (!seatId) return 0;
  const match = seatId.match(/^(\d+)([A-Z])$/);
  if (!match) return 0;
  const row = parseInt(match[1], 10);
  const col = match[2];
  const tier = getSeatTier(row, col, layoutId);
  return SEAT_PRICING[tier] ?? 0;
}

/**
 * Get human-readable tier label
 */
export function getSeatTierLabel(seatId, layoutId = '3-2') {
  if (!seatId) return 'Standard';
  const match = seatId.match(/^(\d+)([A-Z])$/);
  if (!match) return 'Standard';
  const row = parseInt(match[1], 10);
  const col = match[2];
  const tier = getSeatTier(row, col, layoutId);
  switch (tier) {
    case 'extraLegroom':
      return 'Extra Legroom';
    case 'premium':
      return 'Premium';
    default:
      return 'Standard (Free)';
  }
}

/**
 * Generate all valid seat IDs for a given layout
 */
export function getAllSeatsForLayout(layoutId = '3-2') {
  const layout = AIRCRAFT_LAYOUTS[layoutId] || AIRCRAFT_LAYOUTS['3-2'];
  const seats = [];
  for (let r = 1; r <= layout.rows; r++) {
    for (const c of layout.columns) {
      seats.push(`${r}${c}`);
    }
  }
  return seats;
}

/**
 * Verify whether a seat exists in a specific layout
 */
export function isValidSeatForLayout(seatId, layoutId = '3-2') {
  if (!seatId) return false;
  const layout = AIRCRAFT_LAYOUTS[layoutId] || AIRCRAFT_LAYOUTS['3-2'];
  const match = seatId.match(/^(\d+)([A-Z])$/);
  if (!match) return false;
  const row = parseInt(match[1], 10);
  const col = match[2];
  return row >= 1 && row <= layout.rows && layout.columns.includes(col);
}

// Preserve backwards-compatible aircraft definitions for flight generator
export const AIRCRAFT = {
  narrow: [
    { id: 'A220', name: 'Airbus A220-300', speed: 830, layout: '3-2', rows: 20 },
    { id: 'E195', name: 'Embraer E195-E2', speed: 840, layout: '3-2', rows: 20 },
    { id: 'A320', name: 'Airbus A320neo', speed: 840, layout: '3-2', rows: 20 },
  ],
  wide: [
    { id: 'B763', name: 'Boeing 767-300ER', speed: 900, layout: '2-3-2', rows: 20 },
    { id: 'A332', name: 'Airbus A330-200', speed: 910, layout: '2-3-2', rows: 20 },
    { id: 'B788', name: 'Boeing 787-8 Dreamliner', speed: 905, layout: '2-3-2', rows: 20 },
  ],
};
