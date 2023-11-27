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
if (savedAppData) {
  // Remove properties not in defaultAppData from savedAppData.
  [...savedAppData.keys()].forEach((key) => {
    if (!defaultAppData.some(([k]) => k === key)) {
      savedAppData.delete(key);
    }
  });

  // Add missing default properties to savedAppData.
  defaultAppData.forEach(([key, value]) => {
    if (!savedAppData.has(key)) {
      savedAppData.set(key, value);
    }
  });
} else {
  console.log('No saved app data, using default app data');
}
const appData = savedAppData || new Map(defaultAppData);

const get = (key) => appData.get(key);

const set = (key, value) => {
  appData.set(key, value);
  return appData;
};

export { settings, globals, get, set, appData as _map };
