/**
 * Represents an attribute of a skill or class
 *
 * @param {string} key   - the config key for the attribute
 * @param {double} base  - the starting value for the attribute
 * @param {double} scale - the increase of the value per level
 *
 */
class Attribute {
  constructor(key, base, scale) {
    this.key = key;
    this.base = base;
    this.scale = scale;
  }

  static ATTRIBS = ['vitality', 'spirit', 'intelligence', 'dexterity', 'strength'];
}

export default Attribute;
