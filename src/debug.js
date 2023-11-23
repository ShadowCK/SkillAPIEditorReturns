// This script is designed to expose specific functions for debugging purposes.
// It also incorporates a streamlined logging system capable of outputting messages across various severity levels.
// Note: This script is intended for development use only and should not be deployed in production environments.

/* eslint import/no-cycle: "warn" */
import { getActiveComponent } from './component.js';
import { getSkillsActive } from './domHelpers.js';
import { getActiveSkill, getSkills, newSkill } from './skill.js';

const levels = {
  VERBOSE: 4,
  INFO: 3,
  WARN: 2,
  ERROR: 1,
  ALWAYS: 0,
  OFF: -1,
};

let hasInited = false;
let canDebug = false;
let debugLevel = levels.OFF;

const isOn = () => canDebug;

const error = () => {
  if (hasInited) {
    throw new Error('Debugging is not enabled in production mode');
  } else {
    throw new Error('Debugging has not been initialized');
  }
};

let _getDebugLevel = error;
let _setDebugLevel = error;
let _log = error;

// Wrap the mutable functions in `const`
const getDebugLevel = () => _getDebugLevel();
const setDebugLevel = (level) => _setDebugLevel(level);
const log = (level, ...messages) => _log(level, ...messages);

/**
 * Logs messages if debugging is allowed.
 * This function is a safe wrapper around the `log` function. It checks if debugging is enabled
 * (i.e., `canDebug` is true) before attempting to log messages. Using this function ensures
 * that attempts to log messages when debugging is not enabled will not throw errors and will
 * silently return without any action.
 *
 * @param {number} level - The debug level at which to log the message.
 * @param {...any} messages - The messages to be logged.
 */
const logIfAllowed = (level, ...messages) => {
  if (canDebug) {
    log(level, ...messages);
  }
};

const init = (isProduction) => {
  hasInited = true;
  if (isProduction) {
    return;
  }

  canDebug = true;
  debugLevel = levels.VERBOSE;

  _getDebugLevel = () => debugLevel;
  _setDebugLevel = (level) => {
    debugLevel = level;
  };
  _log = (level = 0, ...messages) => {
    if (messages.length === 0 || debugLevel < level) {
      return;
    }
    console.log(`[${level}]`, ...messages);
  };

  Object.defineProperties(window, {
    getActiveSkill: {
      value: getActiveSkill,
    },
    getActiveComponent: {
      value: getActiveComponent,
    },
    newSkill: {
      value: newSkill,
    },
    skills: {
      get() {
        return getSkills();
      },
    },
    getSkillsActive: {
      value: getSkillsActive,
    },
    getDebugLevel: {
      value: getDebugLevel,
    },
    setDebugLevel: {
      value: setDebugLevel,
    },
    log: {
      value: log,
    },
  });
};

export { levels, init, isOn, getDebugLevel, setDebugLevel, log, logIfAllowed };
