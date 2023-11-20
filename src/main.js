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

import _ from 'underscore';

import {
  getSkillsActive,
  showSkillPage,
  refreshOptions,
  saveToFile,
  switchToSkills,
  switchToClasses,
} from './domHelpers.js';
import { initSkills, initClasses, loadFiles, parseConfig } from './loader.js';
import { getActiveComponent, setActiveComponent } from './component.js';
import { getVersionData, setActiveData } from './data/index.js';
import * as skill from './skill.js';
import { getActiveSkill, setActiveSkill, getSkills, newSkill } from './skill.js';
import { getActiveClass, setActiveClass, getClasses, newClass } from './class.js';
import Attribute from './classes/Attribute.js';

const getSkillSaveData = () => {
  const t1 = performance.now();
  const activeSkill = getActiveSkill();
  const activeComponent = getActiveComponent();
  const skills = getSkills();

  activeSkill.update();
  if (activeComponent) {
    activeComponent.update();
  }
  let data = 'loaded: false\n';
  const alphabetic = [...skills];
  alphabetic.sort((a, b) => {
    const an = a.data[0].value;
    const bn = b.data[0].value;
    if (an > bn) {
      return 1;
    }
    if (an < bn) {
      return -1;
    }
    return 0;
  });
  for (let i = 0; i < alphabetic.length; i++) {
    data += alphabetic[i].getSaveString();
  }
  const t2 = performance.now();
  console.log(`Call to getSkillSaveData took ${t2 - t1} milliseconds.`);
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
  // TODO:
  document.getElementById('skillList').addEventListener('change', (e) => {
    const activeSkill = getActiveSkill();
    const activeComponent = getActiveComponent();

    activeSkill.update();
    if (activeComponent) {
      activeComponent.update();
    }
    const skillList = e.currentTarget;
    if (skillList.selectedIndex === skillList.length - 1) {
      newSkill();
    } else {
      const skills = getSkills();
      const newActiveSkill = skills[skillList.selectedIndex];
      setActiveSkill(newActiveSkill);
      newActiveSkill.apply();
      showSkillPage('builder');
    }
  });
  document.getElementById('skillDetails').addEventListener('click', () => {
    const activeSkill = getActiveSkill();
    activeSkill.createFormHTML();
    showSkillPage('skillForm');
  });
  document.getElementById('saveButton').addEventListener('click', () => {
    saveToFile('skills.yml', getSkillSaveData());
  });
  document.getElementById('saveSkill').addEventListener('click', () => {
    const activeSkill = getActiveSkill();
    saveToFile(`${activeSkill.data[0].value}.yml`, activeSkill.getSaveString());
  });
  document.getElementById('deleteSkill').addEventListener('click', () => {
    const list = document.getElementById('skillList');
    let index = list.selectedIndex;

    const skills = getSkills();
    skills.splice(index, 1);
    if (skills.length === 0) {
      newSkill();
    }
    list.remove(index);
    index = Math.min(index, skills.length - 1);
    const newActiveSkill = skills[index];
    setActiveSkill(newActiveSkill);
    list.selectedIndex = index;

    newActiveSkill.apply();
    showSkillPage('builder');
  });

  // class.js
  document.getElementById('classList').addEventListener('change', (e) => {
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
  document.getElementById('saveButton').addEventListener('click', () => {
    saveToFile('classes.yml', getClassSaveData());
  });
};

// Set up event listeners when the page loads
window.onload = () => {
  const isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
  const isFirefox = typeof InstallTrigger !== 'undefined'; // Firefox 1.0+
  const isChrome = !!window.chrome && !isOpera; // Chrome 1+
  const badBrowser = !isOpera && !isFirefox && !isChrome;
  document.getElementById('badBrowser').style.display = badBrowser ? 'block' : 'none';
  if (badBrowser) {
    return;
  }

  init();

  document.getElementById('addTrigger').addEventListener('click', () => {
    const activeSkill = getActiveSkill();
    setActiveComponent(activeSkill);
    showSkillPage('triggerChooser');
  });

  document.getElementById('skillTab').addEventListener('click', () => {
    switchToSkills();
  });
  document.getElementById('classTab').addEventListener('click', () => {
    switchToClasses();
  });

  const cancelButtons = document.querySelectorAll('.cancelButton');
  for (let i = 0; i < cancelButtons.length; i++) {
    cancelButtons[i].addEventListener('click', () => {
      showSkillPage('builder');
    });
  }

  const attribs = localStorage.getItem('attribs');
  const skillData = localStorage.getItem('skillData');
  const skillIndex = localStorage.getItem('skillIndex');
  const classData = localStorage.getItem('classData');
  const classIndex = localStorage.getItem('classIndex');
  if (attribs) {
    Attribute.ATTRIBS = attribs.split(',');
  }
  if (skillData) {
    initSkills(skillData, skillIndex);
  }
  if (classData) {
    initClasses(classData, classIndex);
  }
  if (localStorage.getItem('skillsActive') === 'false') {
    switchToClasses();
  }
};

/**
 * Remember the current session data for next time
 */
window.onbeforeunload = () => {
  localStorage.setItem('skillData', getSkillSaveData());
  localStorage.setItem('classData', getClassSaveData());
  localStorage.setItem('skillsActive', getSkillsActive ? 'true' : 'false');
  localStorage.setItem('skillIndex', document.getElementById('skillList').selectedIndex);
  localStorage.setItem('classIndex', document.getElementById('classList').selectedIndex);
};
