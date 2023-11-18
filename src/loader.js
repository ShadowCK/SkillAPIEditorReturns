/* eslint-disable max-classes-per-file */

import _ from 'underscore';

// The table of loaded scripts
const SCRIPT_TAGS = {
  scriptCount: 0,
  onload: null,
};

/**
 * Updates the loader, launching an event when done
 */
const updateLoader = () => {
  if (SCRIPT_TAGS.scriptCount > 0) {
    return;
  }

  // Done event
  if (onLoaderDone) {
    onLoaderDone();
  }
};

SCRIPT_TAGS.onload = (e) => {
  SCRIPT_TAGS[e.target.id].loaded = true;
  SCRIPT_TAGS.scriptCount--;
  if (SCRIPT_TAGS.scriptCount === 0) {
    updateLoader();
  }
};

/**
 * Loads a script asynchronously, launching the callback
 * when the script is loaded or immediately if it is
 * already loaded.
 *
 * @param {string}   script   - name of the script to load
 * @param {function} [callback] - callback for when it's done loading
 */
const depend = (script, callback) =>
  new Promise((resolve, reject) => {
    // If the script is already loaded, run the callback
    if (SCRIPT_TAGS[script]) {
      const data = SCRIPT_TAGS[script];
      if (data.loaded) {
        if (callback) {
          callback();
        }
      } else {
        data.tag.addEventListener('load', callback);
      }
      return;
    }
    // SECOND CHECK
    // If loaded but not stored, store the script and run the callback
    const src = `./src/${script}.js`;
    const scripts = document.querySelectorAll('script');
    const foundScript = _.findWhere(scripts, { src });
    if (foundScript) {
      SCRIPT_TAGS[script] = { tag: foundScript, loaded: true };
      if (callback) {
        callback();
      }
      return;
    }
    // Otherwise, load the script
    const scriptTag = document.createElement('script');
    scriptTag.id = script;
    scriptTag.type = 'text/javascript';
    scriptTag.addEventListener(
      'load',
      (e) => {
        if (callback) {
          callback();
        }
        SCRIPT_TAGS.onload(e);
        resolve();
      },
      { once: true },
    );
    SCRIPT_TAGS[script] = { tag: scriptTag, loaded: false };
    scriptTag.src = src;
    document.querySelector('head').appendChild(scriptTag);
    SCRIPT_TAGS.scriptCount++;
  });

const waitForScript = (script, callback) =>
  new Promise((resolve, reject) => {
    if (SCRIPT_TAGS[script]) {
      const data = SCRIPT_TAGS[script];
      if (data.loaded) {
        if (callback) {
          callback();
        }
        resolve();
      } else {
        data.tag.addEventListener(
          'load',
          () => {
            if (callback) {
              callback();
            }
            resolve();
          },
          { once: true },
        );
      }
    } else {
      reject(new Error(`Script ${script} not found`));
    }
  });

const waitForScripts = (scripts, callback) =>
  Promise.all(scripts.map((script) => waitForScript(script))).then(() => {
    if (callback) {
      callback();
    }
  });

export { depend, waitForScript, waitForScripts };

Object.defineProperties(window, {
  SCRIPT_TAGS: {
    get: () => SCRIPT_TAGS,
  },
  depend: {
    get: () => depend,
  },
});
