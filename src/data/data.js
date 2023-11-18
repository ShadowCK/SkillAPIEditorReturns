let DATA = {};

const version = (localStorage.getItem('server-version') || '1.13').substring(2);

window.depend('data/1.8', () => {
  if (version === '8') {
    DATA = window.DATA_8;
  }
});

window.depend('data/1.9', () => {
  if (version === '9') {
    DATA = window.DATA_9;
  }
});
window.depend('data/1.10', () => {
  if (version === '10') {
    DATA = window.DATA_10;
  }
});
window.depend('data/1.11', () => {
  if (version === '11') {
    DATA = window.DATA_11;
  }
});
window.depend('data/1.12', () => {
  if (version === '12') {
    DATA = window.DATA_12;
  }
});
window.depend('data/1.13', () => {
  if (version === '13') {
    DATA = window.DATA_13;
  }
});

const GOOD_POTIONS = [
  'Speed',
  'Fast Digging',
  'Increase Damage',
  'Jump',
  'Regeneration',
  'Damage Resistance',
  'Fire Resistance',
  'Water Breathing',
  'Invisibility',
  'Night Vision',
  'Health Boost',
  'Absorption',
  'Saturation',
  'Glowing',
  'Luck',
  'Slow Falling',
  'Conduit Power',
  'Dolphins Grace',
];

const BAD_POTIONS = [
  'Slow',
  'Slow Digging',
  'Confusion',
  'Blindness',
  'Hunger',
  'Weakness',
  'Poison',
  'Wither',
  'Levitation',
  'Unluck',
];

const DYES = [
  'BLACK',
  'BLUE',
  'BROWN',
  'CYAN',
  'GRAY',
  'GREEN',
  'LIGHT_BLUE',
  'LIGHT_GRAY',
  'LIME',
  'MAGENTA',
  'ORANGE',
  'PINK',
  'PURPLE',
  'RED',
  'WHITE',
  'YELLOW',
];

const getMaterials = () => DATA.MATERIALS;

const getAnyMaterials = () => ['Any', ...DATA.MATERIALS];

const getSounds = () => DATA.SOUNDS;

const getEntities = () => DATA.ENTITIES;

const getParticles = () => DATA.PARTICLES || [];

const getBiomes = () => DATA.BIOMES;

const getDamageTypes = () => DATA.DAMAGE_TYPES;

const getPotionTypes = () => DATA.POTIONS;

const getAnyPotion = () => ['Any', ...DATA.POTIONS];

const getGoodPotions = () => {
  const list = DATA.POTIONS.filter((type) => GOOD_POTIONS.includes(type));
  return ['All', 'None', ...list];
};

const getBadPotions = () => {
  const list = DATA.POTIONS.filter((type) => BAD_POTIONS.includes(type));
  return ['All', 'None', ...list];
};

const getDyes = () => DYES;

Object.defineProperties(window, {
  getMaterials: {
    get: () => getMaterials,
  },
  getAnyMaterials: {
    get: () => getAnyMaterials,
  },
  getSounds: {
    get: () => getSounds,
  },
  getEntities: {
    get: () => getEntities,
  },
  getParticles: {
    get: () => getParticles,
  },
  getBiomes: {
    get: () => getBiomes,
  },
  getDamageTypes: {
    get: () => getDamageTypes,
  },
  getPotionTypes: {
    get: () => getPotionTypes,
  },
  getAnyPotion: {
    get: () => getAnyPotion,
  },
  getGoodPotions: {
    get: () => getGoodPotions,
  },
  getBadPotions: {
    get: () => getBadPotions,
  },
  getDyes: {
    get: () => getDyes,
  },
});
