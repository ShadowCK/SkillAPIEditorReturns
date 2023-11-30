/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Steven Sucy
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import {
  getSkillsActive,
  getCurrentForm,
  showSkillPage,
  refreshOptions,
  saveToFile,
  switchToSkills,
  switchToClasses,
  updateUIForNewActiveSkill,
  setupMouseEnterLeaveListener,
} from './domHelpers.js';
import { initSkills, initClasses, loadFiles, parseConfig } from './loader.js';
import {
  Component,
  createSettingButton,
  getActiveComponent,
  setActiveComponent,
} from './components/component.js';
import { getVersionData, setActiveData } from './data/index.js';
import * as skill from './skill.js';
import {
  Skill,
  getActiveSkill,
  setActiveSkill,
  getSkills,
  newSkill,
  setSkills,
  getSkill,
} from './skill.js';
import { getActiveClass, setActiveClass, getClasses, newClass } from './class.js';
import Attribute from './classes/Attribute.js';
import * as debug from './debug.js';
import { isMouseOverElement, sortStrings } from './utils.js';
import * as appData from './appData.js';
import { getMouseX, getMouseY } from './inputManager.js';

const updateActiveSkillAndComponent = () => {
  const activeSkill = getActiveSkill();
  const activeComponent = getActiveComponent();

  if (activeSkill) {
    activeSkill.update();
  }
  if (activeComponent && activeComponent !== activeSkill) {
    activeComponent.update();
  }
};

const getSkillSaveData = () => {
  const t1 = performance.now();
  const skills = getSkills();

  updateActiveSkillAndComponent();
  let data = 'loaded: false\n';
  const alphabetic = [...skills];
  alphabetic.sort((a, b) => sortStrings(a.data[0].value, b.data[0].value));
  for (let i = 0; i < alphabetic.length; i++) {
    data += alphabetic[i].getSaveString();
  }
  const t2 = performance.now();
  debug.logIfAllowed(
    debug.levels.VERBOSE,
    `Call to getSkillSaveData took ${t2 - t1} milliseconds.`,
  );
  return data;
};

const getClassSaveData = () => {
  const activeClass = getActiveClass();
  const classes = getClasses();

  activeClass.update();
  let data = 'loaded: false\n';
  for (let i = 0; i < classes.length; i++) {
    data += classes[i].getSaveString();
  }
  return data;
};

// Prepares for handling dropped files
document.addEventListener(
  'dragover',
  (e) => {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  },
  false,
);

// Examines dropped files and sets up loading applicable ones
document.addEventListener(
  'drop',
  (e) => {
    e.stopPropagation();
    e.preventDefault();
    loadFiles(e.dataTransfer.files);
  },
  false,
);

const init = () => {
  // debug.js
  debug.init(WEBPACK_MODE !== 'development');
  debug.logIfAllowed(debug.levels.ALWAYS, 'You are in development mode! debug.js is initialized.');

  // component.js
  const config = localStorage.getItem('config');
  if (config) {
    parseConfig(config);
  }
  refreshOptions();

  // data.js
  const versionSelect = document.getElementById('version-select');
  versionSelect.onchange = () => {
    setActiveData(getVersionData(versionSelect.value.substring(2)));
    localStorage.setItem('server-version', versionSelect.value);
  };

  const previousValue = localStorage.getItem('server-version');
  if (previousValue) {
    versionSelect.value = previousValue;
    // DATA is already initiailized in data/index.js
  }

  // skill.js
  skill.init();

  /** @type {HTMLSelectElement} */
  const skillList = document.getElementById('skill-list');

  skillList.addEventListener('mousedown', (e) => {
    if (e.target.tagName !== 'OPTION') {
      return;
    }

    // find of the index of e.target in skilllist
    const { options } = skillList;
    let currentSelectedIndex;
    for (let i = 0; i < options.length; i++) {
      if (options[i] === e.target) {
        currentSelectedIndex = i;
        break;
      }
    }

    const previousSelectedIndex = skillList.selectedIndex;

    // * Same skill option is selected
    if (previousSelectedIndex === currentSelectedIndex) {
      debug.logIfAllowed(debug.levels.VERBOSE, 'Same skill option is selected');
      const currentForm = getCurrentForm();
      const activeSkill = getActiveSkill();

      const process = (form) => {
        if (form === 'skill-form') {
          // Create form content if not already created
          if (document.getElementById('builder-content').innerHTML === '') {
            debug.logIfAllowed(
              debug.levels.VERBOSE,
              '#builder-content does not exist for the active skill - recreating it',
              activeSkill,
            );
            activeSkill.apply();
          }
          showSkillPage('builder');
          return true;
        }
        if (form === 'builder') {
          // May be cleared because of previously opening a component (it also uses skill-form)
          if (document.getElementById('skill-form').innerHTML === '') {
            debug.logIfAllowed(
              debug.levels.VERBOSE,
              '#skill-form does not exist for the active skill - recreating it',
              activeSkill,
            );
            activeSkill.createFormHTML(true);
          }
          showSkillPage('skill-form');
          return true;
        }
        return false;
      };

      if (!process(currentForm)) {
        // Try it again with last visited form
        const lastVisitedForm = appData.get(appData.globals.lastVisitedForm);
        if (!process(lastVisitedForm)) {
          debug.logIfAllowed(
            debug.levels.VERBOSE,
            'Both `currentForm` and `lastVisitedForm` are neither "builder" nor "skill-form" - defaulting to "builder".',
          );
          process('builder');
        }
      }
    }
  });

  skillList.addEventListener('change', () => {
    updateActiveSkillAndComponent();

    let newActiveSkill;
    // If selected "New Skill", create a new skill
    if (skillList.selectedIndex === skillList.length - 1) {
      // newSkill() will set active skill for us
      newActiveSkill = newSkill(false);
    } else {
      const skills = getSkills();
      newActiveSkill = skills[skillList.selectedIndex];
      // We need to manually set active skill
      setActiveSkill(newActiveSkill);
    }
    setActiveComponent(newActiveSkill);
    updateUIForNewActiveSkill(newActiveSkill);
  });

  document.getElementById('skill-details').addEventListener('click', () => {
    const activeSkill = getActiveSkill();
    // IsSameSkill must be true because the button is to switch to the active skill's skill-form (from builder)
    activeSkill.createFormHTML(true);
    showSkillPage('skill-form');
  });
  document.getElementById('save-button').addEventListener('click', () => {
    saveToFile('skills.yml', getSkillSaveData());
  });
  document.getElementById('save-skill').addEventListener('click', () => {
    const activeSkill = getActiveSkill();
    saveToFile(`${activeSkill.data[0].value}.yml`, activeSkill.getSaveString());
  });
  document.getElementById('deleteSkill').addEventListener('click', () => {
    const list = document.getElementById('skill-list');
    let index = list.selectedIndex;

    const skills = getSkills();
    skills.splice(index, 1);
    if (skills.length === 0) {
      newSkill();
    }
    list.remove(index);
    index = Math.min(index, skills.length - 1);
    list.selectedIndex = index;
    // Manually trigger the skill list's change event
    setActiveComponent(null); // our active skill is deleted
    setActiveSkill(null); // our active skill is deleted
    list.dispatchEvent(new Event('change')); // will set new active skill and component
  });

  // class.js
  document.getElementById('class-list').addEventListener('change', (e) => {
    const classList = e.currentTarget;
    const classes = getClasses();
    getActiveClass().update();
    if (classList.selectedIndex === classList.length - 1) {
      newClass();
    } else {
      const newActiveClass = classes[classList.selectedIndex];
      setActiveClass(newActiveClass);
      newActiveClass.createFormHTML();
    }
  });
  document.getElementById('save-button').addEventListener('click', () => {
    saveToFile('classes.yml', getClassSaveData());
  });
};

// Set up event listeners when the page loads
window.onload = () => {
  const isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
  const isFirefox = typeof InstallTrigger !== 'undefined'; // Firefox 1.0+
  const isChrome = !!window.chrome && !isOpera; // Chrome 1+
  const badBrowser = !isOpera && !isFirefox && !isChrome;
  document.getElementById('bad-browser').style.display = badBrowser ? 'block' : 'none';
  if (badBrowser) {
    return;
  }

  init();

  createSettingButton({
    isForComponent: false,
    key: appData.settings.ShowComment,
    onText: '[ Comments ]',
    offText: 'Comments',
    callback: () => {
      const currentForm = getCurrentForm();
      if (currentForm === 'skill-form') {
        // FIXME: Make this check more professional and less hacky
        // Quick and dirty way to check if the skill form is for a skill or a component
        if (!document.getElementById('skill-form').textContent.includes('Skill Details')) {
          const activeComponent = getActiveComponent();
          activeComponent.update();
          activeComponent.createFormHTML();
        }
      }
    },
  });

  document.body.dataset.showLabels = appData.get(appData.settings.ShowLabels);
  createSettingButton({
    isForComponent: false,
    key: appData.settings.ShowLabels,
    onText: '[ Labels ]',
    offText: 'Labels',
    callback: ({ newValue }) => {
      if (newValue != null) {
        document.body.dataset.showLabels = !!newValue;
      }
    },
  });

  document.body.dataset.showAllLabels = appData.get(appData.settings.ShowAllLabels);
  createSettingButton({
    isForComponent: false,
    key: appData.settings.ShowAllLabels,
    onText: '[ All Labels ]',
    offText: 'All Labels',
    callback: ({ newValue }) => {
      if (newValue != null) {
        document.body.dataset.showAllLabels = !!newValue;
      }
      if (document.getElementById('builder-content').innerHTML !== '') {
        getActiveSkill().apply();
      }
    },
  });

  createSettingButton({
    isForComponent: false,
    key: appData.settings.SortPinyin,
    onText: '[ Pinyin Sort ]',
    offText: 'Pinyin Sort',
    callback: () => {
      const skillList = document.getElementById('skill-list');
      const skillOptions = Array.from(skillList.options);
      const newSkillOption = skillOptions.pop();
      const sortedSkillOptions = skillOptions.sort((a, b) => sortStrings(a.value, b.value));
      skillList.innerHTML = '';
      skillList.append(...sortedSkillOptions, newSkillOption);
      setSkills(sortedSkillOptions.map((option) => option.skill || getSkill(option.value)));
    },
  });

  document.body.dataset.zenMode = appData.get(appData.settings.ZenMode);
  document.body.dataset.zenModeShowFooter = false;
  createSettingButton({
    isForComponent: false,
    key: appData.settings.ZenMode,
    onText: '[ Zen Mode ]',
    offText: 'Zen Mode',
    callback: ({ newValue }) => {
      if (newValue != null) {
        document.body.dataset.zenMode = !!newValue;
      }
    },
  });

  document.body.dataset.compactMode = appData.get(appData.settings.CompactMode);
  createSettingButton({
    isForComponent: false,
    key: appData.settings.CompactMode,
    onText: '[ Compact Mode ]',
    offText: 'Compact Mode',
    callback: ({ newValue }) => {
      if (newValue != null) {
        document.body.dataset.compactMode = !!newValue;
      }
    },
  });

  setupMouseEnterLeaveListener(
    document.getElementById('footer-overlay'),
    () => {
      document.body.dataset.zenModeShowFooter = true;
    },
    () => {
      document.body.dataset.zenModeShowFooter = false;
    },
  );

  document.getElementById('add-trigger').addEventListener('click', () => {
    const activeSkill = getActiveSkill();
    setActiveComponent(activeSkill);
    showSkillPage('trigger-chooser');
  });

  document.getElementById('skill-tab').addEventListener('click', () => {
    switchToSkills();
  });
  document.getElementById('class-tab').addEventListener('click', () => {
    switchToClasses();
  });

  /**
   * @param {MouseEvent} e
   */
  const triggerCancelOnRightClick = (e) => {
    const cancelButton = e.currentTarget.querySelector('.cancel-button');
    if (cancelButton) {
      e.preventDefault();
      cancelButton.dispatchEvent(new Event('click'));
    }
  };
  document
    .getElementById('trigger-chooser')
    .addEventListener('contextmenu', triggerCancelOnRightClick);
  document
    .getElementById('component-chooser')
    .addEventListener('contextmenu', triggerCancelOnRightClick);

  const cancelButtons = document.querySelectorAll('.cancel-button');
  for (let i = 0; i < cancelButtons.length; i++) {
    cancelButtons[i].addEventListener('click', () => {
      showSkillPage('builder');
    });
  }

  // Register input listeners
  const copyComponent = () => {
    const currentForm = getCurrentForm();
    if (currentForm !== 'builder') {
      debug.logIfAllowed(
        debug.levels.WARN,
        `Copying failed - current form is not "builder" (it is instead ${currentForm}).`,
      );
      return false;
    }
    if (!isMouseOverElement(getMouseX(), getMouseY(), document.getElementById('builder'))) {
      debug.logIfAllowed(debug.levels.WARN, 'Copying failed - mouse is not in the builder.');
      return false;
    }
    const activeComponent = getActiveComponent();
    if (!(activeComponent instanceof Component)) {
      debug.logIfAllowed(
        debug.levels.WARN,
        'Copying failed - active component is either nonexistent or a skill (skills are regarded as "root components").',
      );
      return false;
    }
    // Copy the component to the clipboard
    appData.set('clipboard-component', activeComponent.dupe(null));
    return true;
  };

  const pasteComponent = () => {
    const doPaste = (copiedComponent, activeComponent) => {
      const copy = copiedComponent.dupe(activeComponent);
      activeComponent.components.push(copy);
      copy.createBuilderHTML(activeComponent.html);
      copy.selfElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    };

    const currentForm = getCurrentForm();
    if (currentForm !== 'builder') {
      debug.logIfAllowed(
        debug.levels.WARN,
        `Pasting failed - current form is not "builder" (it is instead ${currentForm}).`,
      );
      return false;
    }
    if (!isMouseOverElement(getMouseX(), getMouseY(), document.getElementById('builder'))) {
      debug.logIfAllowed(debug.levels.WARN, 'Pasting failed - mouse is not in the builder.');
      return false;
    }
    const copiedComponent = appData.get('clipboard-component');
    // Technically, a null check is good enough but a type validation is even better
    if (!(copiedComponent instanceof Component)) {
      debug.logIfAllowed(debug.levels.WARN, 'Pasting failed - no valid component was copied.');
      return false;
    }
    const activeComponent = getActiveComponent();
    if (activeComponent instanceof Skill) {
      if (copiedComponent.type !== 'trigger') {
        debug.logIfAllowed(
          debug.levels.WARN,
          'Pasting failed - pasting a non-trigger component into a skill is not allowed.',
        );
        return false;
      }
      if (activeComponent.usingTrigger(copiedComponent.name)) {
        debug.logIfAllowed(
          debug.levels.WARN,
          'Pasting failed - active skill already has a trigger with the same name.',
        );
        return false;
      }
      // Paste a trigger into a skill
      doPaste(copiedComponent, activeComponent);
      return true;
    }
    if (!(activeComponent instanceof Component)) {
      // activeComponent is neither a skill nor a component. It can't exist.
      debug.logIfAllowed(debug.levels.WARN, 'Pasting failed - active component is nonexistent.');
      return false;
    }
    // Now, activeComponent and copiedComponent are both components
    if (copiedComponent.type === 'trigger') {
      debug.logIfAllowed(
        debug.levels.WARN,
        'Pasting failed - you must paste a trigger into a skill, not a component.',
      );
      return false;
    }
    if (!activeComponent.container) {
      debug.logIfAllowed(
        debug.levels.WARN,
        'Pasting failed - active component is not a container.',
      );
      return false;
    }
    // Paste a component into a component
    doPaste(copiedComponent, activeComponent);
    if (activeComponent.childrenHidden) {
      activeComponent.vision.toggleVision();
    }
    return true;
  };

  document.addEventListener('keydown', (e) => {
    const isCtrlPressed = e.ctrlKey || e.metaKey; // metaKey is Cmd on Mac

    // Ctrl + C is pressed
    if (isCtrlPressed && e.key === 'c') {
      debug.logIfAllowed(debug.levels.VERBOSE, 'Ctrl+C pressed, copying component to clipboard');
      const result = copyComponent();
      if (result) {
        e.preventDefault();
      }
    } else if (isCtrlPressed && e.key === 'v') {
      debug.logIfAllowed(debug.levels.VERBOSE, 'Ctrl+V pressed, pasting component from clipboard');
      const result = pasteComponent();
      if (result) {
        e.preventDefault();
      }
    }
  });

  // Load saved data from local storage
  const attribs = localStorage.getItem('attribs');
  const skillData = localStorage.getItem('skillData');
  const skillIndex = localStorage.getItem('skillIndex');
  const classData = localStorage.getItem('classData');
  const classIndex = localStorage.getItem('classIndex');
  const currentForm = localStorage.getItem('currentForm');
  if (currentForm) {
    debug.logIfAllowed(debug.levels.VERBOSE, `The user was last on the ${currentForm} skill page`);
    showSkillPage(currentForm);
  }
  if (attribs) {
    debug.logIfAllowed(debug.levels.VERBOSE, 'ATTRIBS loaded from local storage', attribs);
    Attribute.ATTRIBS = attribs.split(',');
  }
  if (skillData) {
    debug.logIfAllowed(debug.levels.VERBOSE, 'Loading stored skillData from local storage');
    initSkills(skillData, skillIndex);
  }
  if (classData) {
    debug.logIfAllowed(debug.levels.VERBOSE, 'Loading stored classData from local storage');
    initClasses(classData, classIndex);
  }
  if (localStorage.getItem('skillsActive') === 'false') {
    debug.logIfAllowed(debug.levels.VERBOSE, 'The user was last on the class tab');
    switchToClasses();
  } else {
    debug.logIfAllowed(debug.levels.VERBOSE, 'The user was last on the skill tab');
    switchToSkills();
  }
};

/**
 * Remember the current session data for next time
 */
window.onbeforeunload = () => {
  localStorage.setItem('skillData', getSkillSaveData());
  localStorage.setItem('classData', getClassSaveData());
  localStorage.setItem('skillsActive', getSkillsActive() ? 'true' : 'false');
  localStorage.setItem('skillIndex', document.getElementById('skill-list').selectedIndex);
  localStorage.setItem('classIndex', document.getElementById('class-list').selectedIndex);
  localStorage.setItem('currentForm', getCurrentForm());
  // We do not want temporary data (those not pre-defined in defaultAppData) to be saved
  appData.cleanup();
  localStorage.setItem('appData', appData.getSaveString());
};
