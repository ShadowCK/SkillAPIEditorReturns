const settings = {
  ShowComment: 'show-comment',
  // If true, will convert Chinese characters to pinyin, otherwise directly sort by unicode
  SortPinyin: 'sort-pinyin',
};

const globals = {};

const appData = new Map();

const get = (key) => appData.get(key);

const set = (key, value) => {
  appData.set(key, value);
  return appData;
};

export { settings, globals, get, set };

// Set default values
appData.set(settings.ShowComment, true);
appData.set(settings.SortPinyin, true);
