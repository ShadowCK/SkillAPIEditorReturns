import pinyin from 'pinyin';

const toPinyin = (str) =>
  pinyin(str, {
    style: pinyin.STYLE_NORMAL, // 生成不带声调的拼音
    heteronym: false, // 不启用多音字模式
  })
    .join('')
    .replace(/\s+/g, ''); // 移除拼音之间的空格

window.toPinyin = toPinyin;

export { toPinyin }; // eslint-disable-line import/prefer-default-export
