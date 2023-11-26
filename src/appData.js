const settings = {
  ShowComment: 'show-comment',
  // If true, will convert Chinese characters to pinyin, otherwise directly sort by unicode
  SortPinyin: 'sort-pinyin',
  ZenMode: 'zen-mode',
};

const globals = {
  lastVisitedForm: 'last-visited-form',
};

const savedAppData = JSON.parse(localStorage.getItem('appData'));
const defaultAppData = [
  [settings.ShowComment, true],
  [settings.SortPinyin, true],
  [settings.ZenMode, false],
  [globals.lastVisitedForm, null],
];
if (!savedAppData) {
  console.log('No saved app data, using default app data');
}
const appData = new Map(savedAppData || defaultAppData);

const get = (key) => appData.get(key);

const set = (key, value) => {
  appData.set(key, value);
  return appData;
};

export { settings, globals, get, set, appData as _map };
