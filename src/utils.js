import pinyin from 'pinyin';
import * as appData from './appData.js';

/**
 * The original skillAPI sorts skills by their names' unicode values.
 * The order determines the triggers' execution order.
 * @param {string} strA
 * @param {string} strB
 * @returns {number}
 */
const compareUnicode = (strA, strB) => {
  if (strA > strB) {
    return 1;
  }
  if (strA < strB) {
    return -1;
  }
  return 0;
};

const toPinyin = (str) =>
  pinyin(str, {
    style: pinyin.STYLE_NORMAL, // 生成不带声调的拼音
    heteronym: false, // 不启用多音字模式
  })
    .join('')
    .replace(/\s+/g, ''); // 移除拼音之间的空格

window.toPinyin = toPinyin;

const sortStrings = (strA, strB) => {
  const isSortByPinyin = appData.get(appData.settings.SortPinyin);
  return isSortByPinyin
    ? compareUnicode(toPinyin(strA), toPinyin(strB))
    : compareUnicode(strA, strB);
};

export { toPinyin, sortStrings };
