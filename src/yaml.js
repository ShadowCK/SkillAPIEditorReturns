/**
 * RegEx patterns used by the YAML parser
 */
const Regex = {
  INT: /^-?[0-9]+$/,
  FLOAT: /^-?[0-9]+\.[0-9]+$/,
};

/**
 * Parses the YAML data string
 *
 * @param {string} text - the YAML data string
 *
 * @returns {YAMLObject} the parsed data
 */
const parseYAML = (text) => {
  const textCleaned = text
    .replace(/\r\n/g, '\n')
    .replace(/\n *\n/g, '\n')
    .replace(/ +\n/g, '\n');
  const data = new window.YAMLObject();
  const index = 0;
  const lines = textCleaned.split('\n');
  data.parse(lines, index, 0);
  return data;
};

/**
 * Counts the number of leading spaces in a string
 *
 * @param {string} string - the string to check
 *
 * @returns {Number} the number of leading spaces
 */
const countSpaces = (string) => {
  let result = 0;
  while (string.charCodeAt(result) === 32) {
    result++;
  }
  return result;
};

/**
 * Represents a collection of YAML data (ConfigurationSection in Bukkit)
 */
class YAMLObject {
  constructor(key) {} /* eslint-disable-line */

  /**
   * Checks whether or not the YAML data contains a value under the given key
   *
   * @param {string} key - key of the value to check for
   *
   * @returns {boolean} true if contains the value, false otherwise
   */
  has(key) {
    return this[key] !== undefined;
  }

  /**
   * Retrieves a value from the data
   *
   * @param {string} key   - key of the value to retrieve
   * @param {Object} value - default value to return if one isn't found
   *
   * @returns {string} the obtained value
   */
  get(key, value) {
    return this.has(key) ? this[key] : value;
  }

  /**
   * Parses YAML data using the provided parameters
   *
   * @param {Array}  lines  - the lines of the YAML data
   * @param {Number} index  - the starting index of the data to parse
   * @param {Number} indent - the number of spaces preceeding the keys of the data
   *
   * @returns {Number} the ending index of the parsed data
   */
  parse(lines, index, indent) {
    let lineIndex = index;
    while (lineIndex < lines.length && countSpaces(lines[lineIndex]) >= indent) {
      while (
        lineIndex < lines.length &&
        (countSpaces(lines[lineIndex]) !== indent ||
          lines[lineIndex].replace(/ /g, '').charAt(0) === '#' ||
          lines[lineIndex].indexOf(':') === -1)
      ) {
        lineIndex++;
      }
      if (lineIndex === lines.length) {
        return lineIndex;
      }

      const key = lines[lineIndex].substring(indent, lines[lineIndex].indexOf(':'));

      // New empty section
      if (
        lines[lineIndex].indexOf(': {}') === lines[lineIndex].length - 4 &&
        lines[lineIndex].length >= 4
      ) {
        this[key] = {};
      }

      // String list
      else if (
        lineIndex < lines.length - 1 &&
        lines[lineIndex + 1].charAt(indent) === '-' &&
        lines[lineIndex + 1].charAt(indent + 1) === ' ' &&
        countSpaces(lines[lineIndex + 1]) === indent
      ) {
        const stringList = [];
        while (++lineIndex < lines.length && lines[lineIndex].charAt(indent) === '-') {
          let str = lines[lineIndex].substring(indent + 2);
          if (str.charAt(0) === "'") {
            str = str.substring(1, str.length - 1);
          } else if (str.charAt(0) === '"') {
            str = str.substring(1, str.length - 1);
          }
          stringList.push(str);
        }
        this[key] = stringList;
        lineIndex--;
      }

      // New section with content
      else if (lineIndex < lines.length - 1 && countSpaces(lines[lineIndex + 1]) > indent) {
        lineIndex++;
        const newIndent = countSpaces(lines[lineIndex]);
        const newData = new YAMLObject();
        lineIndex = newData.parse(lines, lineIndex, newIndent) - 1;
        this[key] = newData;
      }

      // Regular value
      else {
        let value = lines[lineIndex].substring(lines[lineIndex].indexOf(':') + 2);
        if (value.charAt(0) === "'") {
          value = value.substring(1, value.length - 1);
        } else if (!Number.isNaN(value)) {
          if (Regex.INT.test(value)) {
            value = parseInt(value, 10);
          } else {
            value = parseFloat(value);
          }
        }
        this[key] = value;
      }

      do {
        lineIndex++;
      } while (lineIndex < lines.length && lines[lineIndex].replace(/ /g, '').charAt(0) === '#');
    }
    return lineIndex;
  }
}

Object.defineProperties(window, {
  parseYAML: {
    get: () => parseYAML,
  },
  countSpaces: {
    get: () => countSpaces,
  },
  YAMLObject: {
    get: () => YAMLObject,
  },
});
