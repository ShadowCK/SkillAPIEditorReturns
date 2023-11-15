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
import { depend } from './loader.js';

// Default attributes
let ATTRIBS = ['vitality', 'spirit', 'intelligence', 'dexterity', 'strength'];

/**
 * Sets the style for the page based on the current visible one
 */
function setPageStyle(name, visible) {
  document.getElementById(name).style.display = visible === name ? 'block' : 'none';
}

/**
 * Returns the view back to the skill builder when in the skill tab
 */
function showSkillPage(name) {
  setPageStyle('builder', name);
  setPageStyle('skillForm', name);
  setPageStyle('componentChooser', name);
  setPageStyle('triggerChooser', name);
}

function setupOptionList(div, list, type) {
  div.innerHTML = '';
  let x;
  let output = '';
  const keys = Object.keys(list).sort();
  for (let i = 0; i < keys.length; i++) {
    x = keys[i];
    if (i % 4 === 0) output += '| ';
    output += `[[${list[x].name}|_${type.substr(0, 1).toUpperCase()}${type.substr(1)} ${
      list[x].name
    }]] | `;
    if ((i + 1) % 4 === 0) {
      output += '\n';
    }

    const h5 = document.createElement('h5');
    if (list[x].premium) h5.className = 'premium';
    h5.innerHTML = list[x].name;
    h5.component = list[x];
    h5.addEventListener('click', () => {
      if (
        window.activeComponent === window.activeSkill &&
        window.activeSkill.usingTrigger(h5.component.name)
      ) {
        showSkillPage('builder');
      } else {
        showSkillPage('skillForm');
        const component = h5.component.construct
          ? new h5.component.construct()
          : h5.component.supplier();
        component.parent = window.activeComponent;
        window.activeComponent.components.push(component);
        component.createBuilderHTML(window.activeComponent.html);
        component.createFormHTML();
      }
    });
    div.appendChild(h5);
  }

  // saveToFile('wiki_' + type + '.txt', output);
}

function refreshOptions() {
  // Set up component option lists
  setupOptionList(document.getElementById('triggerOptions'), window.Trigger, window.Type.TRIGGER);
  setupOptionList(document.getElementById('targetOptions'), window.Target, window.Type.TARGET);
  setupOptionList(
    document.getElementById('conditionOptions'),
    window.Condition,
    window.Type.CONDITION,
  );
  setupOptionList(
    document.getElementById('mechanicOptions'),
    window.Mechanic,
    window.Type.MECHANIC,
  );
}

function parseConfig(text) {
  const data = JSON.parse(text);
  const mapping = {
    CONDITION: window.Condition,
    MECHANIC: window.Mechanic,
    TARGET: window.Target,
    TRIGGER: window.Trigger,
  };
  for (let i = 0; i < data.length; i++) {
    const entry = data[i];
    mapping[entry.type][entry.display.toUpperCase().replace(/ /g, '_')] = {
      name: entry.display,
      container: entry.container,
      supplier() {
        return new window.CustomComponent(entry);
      },
    };
  }
}

function loadConfig(e) {
  const text = e.target.result;
  localStorage.setItem('config', text);
  parseConfig(text);
  refreshOptions();
}

/**
 * Saves text data to a file locally
 *
 * Code slightly modified from this page:
 * https://thiscouldbebetter.wordpress.com/2012/12/18/loading-editing-and-saving-a-text-file-in-html5-using-javascrip/
 */
function saveToFile(file, data) {
  const textFileAsBlob = new Blob([data], { type: 'text/plain;charset=utf-8' });

  const downloadLink = document.createElement('a');
  downloadLink.download = file;
  downloadLink.innerHTML = 'Download File';
  if (window.webkitURL != null) {
    // Chrome allows the link to be clicked
    // without actually adding it to the DOM.
    downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
  } else {
    // Firefox requires the link to be added to the DOM
    // before it can be clicked.
    downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
    downloadLink.onclick = (e) => {
      document.body.removeChild(e.target);
    };
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
  }

  downloadLink.click();
}

function getSkillSaveData() {
  window.activeSkill.update();
  if (window.activeComponent) {
    window.activeComponent.update();
  }
  let data = 'loaded: false\n';
  const alphabetic = window.skills.slice(0);
  alphabetic.sort((a, b) => {
    const an = a.data[0].value;
    const bn = b.data[0].value;
    if (an > bn) return 1;
    if (an < bn) return -1;
    return 0;
  });
  for (let i = 0; i < alphabetic.length; i++) {
    data += alphabetic[i].getSaveString();
  }
  return data;
}

function getClassSaveData() {
  window.activeClass.update();
  let data = 'loaded: false\n';
  for (let i = 0; i < window.classes.length; i++) {
    data += window.classes[i].getSaveString();
  }
  return data;
}

let skillsActive = true;

function switchToSkills() {
  if (!skillsActive) {
    document.getElementById('skillTab').className = 'tab tabLeft tabActive';
    document.getElementById('classTab').className = 'tab tabRight';
    document.getElementById('skills').style.display = 'block';
    document.getElementById('classes').style.display = 'none';
    skillsActive = true;
  }
}

function switchToClasses() {
  if (skillsActive) {
    document.getElementById('classTab').className = 'tab tabRight tabActive';
    document.getElementById('skillTab').className = 'tab tabLeft';
    document.getElementById('classes').style.display = 'block';
    document.getElementById('skills').style.display = 'none';
    skillsActive = false;
  }
}

/**
 * Represents an attribute of a skill or class
 *
 * @param {string} key   - the config key for the attribute
 * @param {double} base  - the starting value for the attribute
 * @param {double} scale - the increase of the value per level
 *
 * @constructor
 */
function Attribute(key, base, scale) {
  this.key = key;
  this.base = base;
  this.scale = scale;
}

// Loads attribute data from a file
// e - event details
function loadAttributes(e) {
  const text = e.target.result;
  document.activeElement.blur();
  const yaml = window.parseYAML(text);
  ATTRIBS = Object.keys(yaml);
  if (!skillsActive) {
    window.activeClass.update();
    window.activeClass.createFormHTML();
  }
  localStorage.setItem('attribs', ATTRIBS);
}

// Loads skill data from a string
function loadSkillText(text) {
  // Load new skills
  const data = window.parseYAML(text);
  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof window.YAMLObject && key !== 'loaded') {
      if (window.isSkillNameTaken(key)) {
        window.getSkill(key).load(value);
        if (window.getSkill(key) === window.activeSkill) {
          window.activeSkill.apply();
          showSkillPage('builder');
        } else {
          window.addSkill(key).load(value);
        }
      }
    }
  });
}

// Loads skill data from a file after it has been read
// e - event details
function loadSkills(e) {
  const text = e.target.result;
  document.activeElement.blur();
  loadSkillText(text);
}

// Loads class data from a string
function loadClassText(text) {
  // Load new classes
  const data = window.parseYAML(text);
  // Change below to be using Object.keys() instead of for...in
  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof window.YAMLObject && key !== 'loaded' && !window.isClassNameTaken(key)) {
      if (window.isClassNameTaken(key)) {
        window.getClass(key).load(value);
        if (window.getClass(key) === window.activeClass) {
          window.activeClass.createFormHTML();
        }
      } else {
        window.addClass(key).load(value);
      }
    }
  });
}

// Loads class data from a file after it has been read
// e - event details
function loadClasses(e) {
  const text = e.target.result;
  document.activeElement.blur();
  loadClassText(text);
}

// Loads an individual skill or class file
function loadIndividual(e) {
  const text = e.target.result;
  if (text.indexOf('global:') >= 0) {
    loadAttributes(e);
  } else if (
    text.indexOf('components:') >= 0 ||
    (text.indexOf('group:') === -1 &&
      text.indexOf('combo:') === -1 &&
      text.indexOf('skills:') === -1)
  ) {
    loadSkills(e);
  } else {
    loadClasses(e);
  }
}

/**
 * Loads a section of config data
 */
function loadSection(data) {
  this.components = [];
  Object.keys(data).forEach((key) => {
    if (key === this.datakey) {
      const attribs = data[key];
      Object.keys(attribs).forEach((attribKey) => {
        for (let i = 0; i < this.data.length; i++) {
          if (this.data[i].key === attribKey && this.data[i].load) {
            this.data[i].load(attribs[attribKey]);
            break;
          } else if (`${this.data[i].key}-base` === attribKey && this.data[i].loadBase) {
            this.data[i].loadBase(attribs[attribKey]);
            break;
          } else if (`${this.data[i].key}-scale` === attribKey && this.data[i].loadScale) {
            this.data[i].loadScale(attribs[attribKey]);
            break;
          }
        }
      });
    } else if (key === this.componentKey) {
      const components = data[key];
      Object.keys(components).forEach((componentKey) => {
        const { type } = components[componentKey];
        let list;
        if (type === window.Type.TRIGGER) {
          list = window.Trigger;
        } else if (type === window.Type.TARGET) {
          list = window.Target;
        } else if (type === window.Type.CONDITION) {
          list = window.Condition;
        } else if (type === window.Type.MECHANIC) {
          list = window.Mechanic;
        }

        let name = componentKey;
        if (name.indexOf('-') > 0) {
          name = name.substring(0, name.indexOf('-'));
        }
        if (list !== undefined && list !== null) {
          Object.keys(list).forEach((listKey) => {
            if (list[listKey].name.toLowerCase() === name.toLowerCase()) {
              const component = list[listKey].construct
                ? new list[listKey].construct()
                : list[listKey].supplier();
              component.parent = this;
              this.components.push(component);
              component.load(components[componentKey]);
            }
          });
        }
      });
    } else if (this.dataKey !== 'data') {
      for (let i = 0; i < this.data.length; i++) {
        if (this.data[i].key === key) {
          if (!this.data[i].load) {
            debugger; // eslint-disable-line no-debugger
          }
          this.data[i].load(data[key]);
          break;
        } else if (`${this.data[i].key}-base` === key) {
          this.data[i].loadBase(data[key]);
          break;
        } else if (`${this.data[i].key}-scale` === key) {
          this.data[i].loadScale(data[key]);
          break;
        }
      }
    }
  });
}

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

const determineFileHandler = (fileName) => {
  // Skip file if not a .yml file, unless it's tool-config.json
  if (fileName.indexOf('.yml') === -1 && fileName !== 'tool-config.json') {
    return null;
  }
  if (fileName === 'tool-config.json') {
    return loadConfig;
  }
  if (fileName.indexOf('skills') === 0) {
    return loadSkills;
  }
  if (fileName.indexOf('classes') === 0) {
    return loadClasses;
  }
  return loadIndividual;
};

// Examines dropped files and sets up loading applicable ones
document.addEventListener(
  'drop',
  (e) => {
    e.stopPropagation();
    e.preventDefault();

    for (let i = 0; i < e.dataTransfer.files.length; i++) {
      const file = e.dataTransfer.files[i];
      const reader = new FileReader();
      // Determine the correct handler for the file
      const handler = determineFileHandler(file.name);
      if (handler) {
        reader.onload = handler;
        reader.readAsText(file);
      }
    }
  },
  false,
);

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

  document.getElementById('addTrigger').addEventListener('click', () => {
    window.activeComponent = window.activeSkill;
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
    ATTRIBS = attribs.split(',');
  }
  if (skillData) {
    window.skills = [];
    document.getElementById('skillList').remove(0);
    loadSkillText(skillData);
    if (skillIndex) {
      document.getElementById('skillList').selectedIndex = parseInt(skillIndex, 10);
      window.activeSkill =
        window.skills[Math.max(0, Math.min(window.skills.length - 1, parseInt(skillIndex, 10)))];
      window.activeSkill.apply();
      showSkillPage('builder');
    }
  }
  if (classData) {
    window.classes = [];
    document.getElementById('classList').remove(0);
    loadClassText(classData);
    if (classIndex) {
      document.getElementById('classList').selectedIndex = parseInt(classIndex, 10);
      window.activeClass =
        window.classes[Math.max(0, Math.min(window.classes.length - 1, parseInt(classIndex, 10)))];
      window.activeClass.createFormHTML();
    }
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
  localStorage.setItem('skillsActive', this.skillsActive ? 'true' : 'false');
  localStorage.setItem('skillIndex', document.getElementById('skillList').selectedIndex);
  localStorage.setItem('classIndex', document.getElementById('classList').selectedIndex);
};

// #region Load Other Scripts
depend('filter');
depend('input');
depend('yaml');
depend('component', () => {
  const config = localStorage.getItem('config');
  if (config) {
    parseConfig(config);
  }
  refreshOptions();
});
depend('data/data', () => {
  depend('skill', () => {
    document.getElementById('skillList').addEventListener('change', (e) => {
      window.activeSkill.update();
      if (window.activeComponent) {
        window.activeComponent.update();
      }
      const skillList = e.currentTarget;
      if (skillList.selectedIndex === skillList.length - 1) {
        window.newSkill();
      } else {
        window.activeSkill = window.skills[skillList.selectedIndex];
        window.activeSkill.apply();
        showSkillPage('builder');
      }
    });
    document.getElementById('skillDetails').addEventListener('click', () => {
      window.activeSkill.createFormHTML();
      showSkillPage('skillForm');
    });
    document.getElementById('saveButton').addEventListener('click', () => {
      saveToFile('skills.yml', getSkillSaveData());
    });
    document.getElementById('saveSkill').addEventListener('click', () => {
      saveToFile(`${window.activeSkill.data[0].value}.yml`, window.activeSkill.getSaveString());
    });
    document.getElementById('deleteSkill').addEventListener('click', () => {
      const list = document.getElementById('skillList');
      let index = list.selectedIndex;

      window.skills.splice(index, 1);
      if (window.skills.length === 0) {
        window.newSkill();
      }
      list.remove(index);
      index = Math.min(index, window.skills.length - 1);
      window.activeSkill = window.skills[index];
      list.selectedIndex = index;

      window.activeSkill.apply();
      showSkillPage('builder');
    });
  });

  depend('class', () => {
    document.getElementById('classList').addEventListener('change', (e) => {
      const classList = e.currentTarget;
      window.activeClass.update();
      if (classList.selectedIndex === classList.length - 1) {
        window.newClass();
      } else {
        window.activeClass = window.classes[classList.selectedIndex];
        window.activeClass.createFormHTML();
      }
    });
    document.getElementById('saveButton').addEventListener('click', () => {
      saveToFile('classes.yml', getClassSaveData());
    });
  });

  document.getElementById('version-select').onchange = (e) => {
    window.DATA = window[`DATA_${e.target.value.substr(2)}`];
    localStorage.setItem('server-version', e.target.value);
  };

  const previousValue = localStorage.getItem('server-version');
  if (previousValue) {
    document.getElementById('version-select').value = previousValue;
  }
});
// #endregion
