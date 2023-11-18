import { DATA_7, DATA_8 } from './1.8.js';
import DATA_9 from './1.9.js';
import DATA_10 from './1.10.js';
import DATA_11 from './1.11.js';
import DATA_12 from './1.12.js';
import DATA_13 from './1.13.js';

let DATA = {};

const version = (localStorage.getItem('server-version') || '1.13').substring(2);

switch (version) {
  case '7':
    DATA = DATA_7;
    break;
  case '8':
    DATA = DATA_8;
    break;
  case '9':
    DATA = DATA_9;
    break;
  case '10':
    DATA = DATA_10;
    break;
  case '11':
    DATA = DATA_11;
    break;
  case '12':
    DATA = DATA_12;
    break;
  case '13':
    DATA = DATA_13;
    break;
  default:
    DATA = DATA_13;
    break;
}

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

export {
  getMaterials,
  getAnyMaterials,
  getSounds,
  getEntities,
  getParticles,
  getBiomes,
  getDamageTypes,
  getPotionTypes,
  getAnyPotion,
  getGoodPotions,
  getBadPotions,
  getDyes,
};
