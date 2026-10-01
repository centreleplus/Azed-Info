const ALL_PACKS = ['Freemium', 'Essentiel', 'Live +', 'Révision +', 'Intégrale'];

const PACK_WEIGHTS = {
  'Freemium': 1,
  'Essentiel': 2,
  'Live +': 3,
  'Révision +': 4,
  'Intégrale': 5
};

const DEFAULT_SELECTED_PACKS = ['Freemium', 'Essentiel'];

function normalizePackName(val) {
  if (!val || typeof val !== 'string') return 'Freemium';
  const clean = val.trim().toLowerCase();

  if (clean.includes('intégr') || clean.includes('integ') || clean.includes('350') || clean.includes('annuel') || clean.includes('plus plus') || clean.includes('++')) {
    return 'Intégrale';
  }
  if (clean.includes('révis') || clean.includes('revis') || clean.includes('140') || clean.includes('revision_plus') || (clean.includes('plus') && !clean.includes('live'))) {
    return 'Révision +';
  }
  if (clean.includes('live') || clean.includes('live_plus') || clean.includes('150') || clean.includes('trimestre') || clean.includes('standard')) {
    return 'Live +';
  }
  if (clean.includes('essentiel') || clean.includes('120') || clean.includes('pass')) {
    return 'Essentiel';
  }
  if (clean.includes('premium')) {
    if (clean.includes('++')) return 'Intégrale';
    if (clean.includes('+')) return 'Révision +';
    return 'Live +';
  }

  return 'Freemium';
}

function getHighestPack(packs) {
  if (!packs || !Array.isArray(packs) || packs.length === 0) {
    return 'Freemium';
  }

  let maxWeight = 0;
  let topPack = 'Freemium';

  for (const p of packs) {
    const norm = normalizePackName(p);
    const weight = PACK_WEIGHTS[norm] || 1;
    if (weight > maxWeight) {
      maxWeight = weight;
      topPack = norm;
    }
  }

  return topPack;
}

module.exports = {
  ALL_PACKS,
  PACK_WEIGHTS,
  DEFAULT_SELECTED_PACKS,
  normalizePackName,
  getHighestPack
};
