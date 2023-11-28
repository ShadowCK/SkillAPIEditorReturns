const settings = {
  ShowComment: 'show-comment',
  // If true, will convert Chinese characters to pinyin, otherwise directly sort by unicode
  SortPinyin: 'sort-pinyin',
  ZenMode: 'zen-mode',
  ShowLabels: 'show-labels',
};

const globals = {
  lastVisitedForm: 'last-visited-form',
};

const savedAppData = new Map(JSON.parse(localStorage.getItem('appData')));
const defaultAppData = [
  [settings.ShowComment, true],
  [settings.SortPinyin, true],
  [settings.ZenMode, false],
  [settings.ShowLabels, true],
  [globals.lastVisitedForm, null],
];

const cleanup = (appData) => {
  // Remove properties not in defaultAppData from appData.
  [...appData.keys()].forEach((key) => {
    if (!defaultAppData.some(([k]) => k === key)) {
      appData.delete(key);
    }
  });

  // Add missing default properties to appData.
  defaultAppData.forEach(([key, value]) => {
    if (!appData.has(key)) {
      appData.set(key, value);
    }
  });
};

if (savedAppData) {
  cleanup(savedAppData);
} else {
  console.log('No saved app data, using default app data');
}
const appData = savedAppData || new Map(defaultAppData);

const get = (key) => appData.get(key);

const set = (key, value) => {
  appData.set(key, value);
  return appData;
};

const getSaveString = () => JSON.stringify(Array.from(appData));

export { settings, globals, get, set, getSaveString };
