const settings = {
  ShowComment: 'show-comment',
};

const appData = new Map();

const get = (key) => appData.get(key);

const set = (key, value) => {
  appData.set(key, value);
  return appData;
};

export { settings, get, set };

// Set default values
appData.set(settings.ShowComment, true);
