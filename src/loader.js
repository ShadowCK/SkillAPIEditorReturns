import _ from 'underscore';

// The pending extensions
const EXTENSIONS = {};

/** 防止多次调用一个构造函数。所有的父类构造函数已经包括在子类的baseConstructors中 */
let superConstructorEnabled = true;
/**
 * Super constructor function for extended classes
 * Must be a function, because arrow functions can't be used with "new"
 */
function superConstructor(...args) {
  if (!superConstructorEnabled) {
    return;
  }
  superConstructorEnabled = false;
  for (let i = 0; i < this.childConstructors.length; i++) {
    this.childConstructors[i].apply(this, args);
  }
  superConstructorEnabled = true;
}

/**
 * Applies the queued extensions for the class name
 * FIXME: This is a recursive function, but it's not tail-recursive,
 * However, the performance impact should be minor.
 *
 * @param className class name
 */
const applyExtensions = (className) => {
  const subCtor = window[className];
  const list = EXTENSIONS[className];
  // For each base class registered in the extension list, apply the extension
  for (let i = 0; i < list.length; i++) {
    const baseName = list[i];
    if (EXTENSIONS[baseName]) {
      applyExtensions(baseName);
    }
    const baseCtor = window[baseName];
    if (baseCtor && subCtor) {
      subCtor.prototype.super = superConstructor;
      subCtor.prototype.childConstructors = subCtor.prototype.childConstructors || [];
      for (
        let j = 0;
        baseCtor.prototype.childConstructors && j < baseCtor.prototype.childConstructors.length;
        j++
      ) {
        subCtor.prototype.childConstructors.push(baseCtor.prototype.childConstructors[j]);
      }
      subCtor.prototype.childConstructors.push(baseCtor);
      // Copy over the base class's prototype/inherited properties
      Object.entries(baseCtor.prototype).forEach(([key, value]) => {
        if (!subCtor.prototype[key]) {
          subCtor.prototype[key] = value;
        }
      });
    }
  }
};

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

  // Extensions
  Object.keys(EXTENSIONS).forEach((subName) => {
    applyExtensions(subName);
  });

  // Done event
  if (window.onLoaderDone) {
    window.onLoaderDone();
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
 * Makes the subclass extend the base class by copying
 * prototype methods over. Also provides a superconstructor
 * using "this.super(<params>)".
 *
 * @param {string} sub  - the sub class doing the extending
 * @param {string} base - the base class being extended
 */
const extend = (sub, base) => {
  if (!EXTENSIONS[sub]) {
    EXTENSIONS[sub] = [];
  }
  EXTENSIONS[sub].push(base);
};

/**
 * Loads a script asynchronously, launching the callback
 * when the script is loaded or immediately if it is
 * already loaded.
 *
 * @param {string}   script   - name of the script to load
 * @param {function} [callback] - callback for when it's done loading
 */
const depend = (script, callback) => {
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
    if (callback) {callback();}
    return;
  }
    // Otherwise, load the script
  const scriptTag = document.createElement('script');
  scriptTag.id = script;
  scriptTag.type = 'text/javascript';
  if (callback) {
        scriptTag.addEventListener('load', callback);
      }
  scriptTag.addEventListener('load', SCRIPT_TAGS.onload);
  SCRIPT_TAGS[script] = { tag: scriptTag, loaded: false };
  scriptTag.src = src;
  document.querySelector('head').appendChild(scriptTag);
  SCRIPT_TAGS.scriptCount++;
};

export { extend, depend };

Object.defineProperties(window, {
  depend: {
    get: () => depend,
  },
  extend: {
    get: () => extend,
  },
});
