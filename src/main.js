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

import { YAMLObject, parseYAML } from './yaml.js';
import {
  CustomComponent,
  getActiveComponent,
  setActiveComponent,
  Type,
  Trigger,
  Target,
  Condition,
  Mechanic,
} from './component.js';
import { getVersionData, setActiveData } from './data';
import {
  getActiveSkill,
  setActiveSkill,
  getSkills,
  setSkills,
  isAttribute,
  getSkill,
  isSkillNameTaken,
  addSkill,
  newSkill,
} from './skill.js';
import {
  Class,
  getActiveClass,
  setActiveClass,
  getClasses,
  setClasses,
  getClass,
  isClassNameTaken,
  addClass,
  newClass,
} from './class.js';

// Default attributes
let ATTRIBS = ['vitality', 'spirit', 'intelligence', 'dexterity', 'strength'];
const getATTRIBS = () => ATTRIBS;

/**
 * Sets the style for the page based on the current visible one
 */
const setPageStyle = (name, visible) => {
  document.getElementById(name).style.display = visible === name ? 'block' : 'none';
};

/**
 * Returns the view back to the skill builder when in the skill tab
 */
const showSkillPage = (name) => {
  setPageStyle('builder', name);
  setPageStyle('skillForm', name);
  setPageStyle('componentChooser', name);
  setPageStyle('triggerChooser', name);
};

const setupOptionList = (div, list, type) => {
  div.innerHTML = '';
  let x;
  let output = '';
  const keys = Object.keys(list).sort();
  for (let i = 0; i < keys.length; i++) {
    x = keys[i];
    if (i % 4 === 0) {
      output += '| ';
    }
    output += `[[${list[x].name}|_${type.substr(0, 1).toUpperCase()}${type.substr(1)} ${
      list[x].name
    }]] | `;
    if ((i + 1) % 4 === 0) {
      output += '\n';
    }

    const h5 = document.createElement('h5');
    if (list[x].premium) {
      h5.className = 'premium';
    }
    h5.innerHTML = list[x].name;
    h5.component = list[x];
    h5.addEventListener('click', () => {
      const activeComponent = getActiveComponent();
      const activeSkill = getActiveSkill();
      if (activeComponent === activeSkill && activeSkill.usingTrigger(h5.component.name)) {
        showSkillPage('builder');
      } else {
        showSkillPage('skillForm');
        const component = h5.component.constructor
          ? new h5.component.constructor()
          : h5.component.supplier();
        component.parent = activeComponent;
        activeComponent.components.push(component);
        component.createBuilderHTML(activeComponent.html);
        component.createFormHTML();
      }
    });
    div.appendChild(h5);
  }

  // saveToFile('wiki_' + type + '.txt', output);
};

const refreshOptions = () => {
  // Set up component option lists
  setupOptionList(document.getElementById('triggerOptions'), Trigger, Type.TRIGGER);
  setupOptionList(document.getElementById('targetOptions'), Target, Type.TARGET);
  setupOptionList(document.getElementById('conditionOptions'), Condition, Type.CONDITION);
  setupOptionList(document.getElementById('mechanicOptions'), Mechanic, Type.MECHANIC);
};

const parseConfig = (text) => {
  const data = JSON.parse(text);
  const mapping = {
    CONDITION: Condition,
    MECHANIC: Mechanic,
    TARGET: Target,
    TRIGGER: Trigger,
  };
  for (let i = 0; i < data.length; i++) {
    const entry = data[i];
    mapping[entry.type][entry.display.toUpperCase().replace(/ /g, '_')] = {
      name: entry.display,
      container: entry.container,
      supplier() {
        return new CustomComponent(entry);
      },
    };
  }
};

const loadConfig = (e) => {
  const text = e.target.result;
  localStorage.setItem('config', text);
  parseConfig(text);
  refreshOptions();
};

/**
 * Saves text data to a file locally
 *
 * Code slightly modified from this page:
 * https://thiscouldbebetter.wordpress.com/2012/12/18/loading-editing-and-saving-a-text-file-in-html5-using-javascrip/
 */
const saveToFile = (file, data) => {
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
};

const getSkillSaveData = () => {
  const activeSkill = getActiveSkill();
  const activeComponent = getActiveComponent();
  const skills = getSkills();

  activeSkill.update();
  if (activeComponent) {
    activeComponent.update();
  }
  let data = 'loaded: false\n';
  const alphabetic = skills.slice(0);
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

let skillsActive = true;

const switchToSkills = () => {
  if (!skillsActive) {
    document.getElementById('skillTab').className = 'tab tabLeft tabActive';
    document.getElementById('classTab').className = 'tab tabRight';
    document.getElementById('skills').style.display = 'block';
    document.getElementById('classes').style.display = 'none';
    skillsActive = true;
  }
};

const switchToClasses = () => {
  if (skillsActive) {
    document.getElementById('classTab').className = 'tab tabRight tabActive';
    document.getElementById('skillTab').className = 'tab tabLeft';
    document.getElementById('classes').style.display = 'block';
    document.getElementById('skills').style.display = 'none';
    skillsActive = false;
  }
};

/**
 * Represents an attribute of a skill or class
 *
 * @param {string} key   - the config key for the attribute
 * @param {double} base  - the starting value for the attribute
 * @param {double} scale - the increase of the value per level
 *
 */
class Attribute {
  constructor(key, base, scale) {
    this.key = key;
    this.base = base;
    this.scale = scale;
  }
}

// Loads attribute data from a file
// e - event details
const loadAttributes = (e) => {
  const text = e.target.result;
  document.activeElement.blur();
  const yaml = parseYAML(text);
  ATTRIBS = Object.keys(yaml);
  if (!skillsActive) {
    const activeClass = getActiveClass();
    activeClass.update();
    activeClass.createFormHTML();
  }
  localStorage.setItem('attribs', ATTRIBS);
};

// Loads skill data from a string
const loadSkillText = (text) => {
  const activeSkill = getActiveSkill();
  // Load new skills
  const data = parseYAML(text);
  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof YAMLObject && key !== 'loaded') {
      if (isSkillNameTaken(key)) {
        getSkill(key).load(value);
        if (getSkill(key) === activeSkill) {
          activeSkill.apply();
          showSkillPage('builder');
        }
      } else {
        addSkill(key).load(value);
      }
    }
  });
};

// Loads skill data from a file after it has been read
// e - event details
const loadSkills = (e) => {
  const text = e.target.result;
  document.activeElement.blur();
  loadSkillText(text);
};

// Loads class data from a string
const loadClassText = (text) => {
  // Load new classes
  const data = parseYAML(text);
  // Change below to be using Object.keys() instead of for...in
  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof YAMLObject && key !== 'loaded' && !isClassNameTaken(key)) {
      if (isClassNameTaken(key)) {
        getClass(key).load(value);
        const activeClass = getActiveClass();
        if (getClass(key) === activeClass) {
          activeClass.createFormHTML();
        }
      } else {
        addClass(key).load(value);
      }
    }
  });
};

// Loads class data from a file after it has been read
// e - event details
const loadClasses = (e) => {
  const text = e.target.result;
  document.activeElement.blur();
  loadClassText(text);
};

// Loads an individual skill or class file
const loadIndividual = (e) => {
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
};

/**
 * Loads a section of config data
 */
function loadSection(data) {
  this.components = [];
  Object.keys(data).forEach((key) => {
    const inputs = this.data;
    if (key === this.datakey) {
      const attribs = data[key];
      Object.keys(attribs).forEach((attribKey) => {
        for (let i = 0; i < inputs.length; i++) {
          if (inputs[i].key === attribKey && inputs[i].load) {
            inputs[i].load(attribs[attribKey]);
            break;
          } else if (`${inputs[i].key}-base` === attribKey && inputs[i].loadBase) {
            inputs[i].loadBase(attribs[attribKey]);
            break;
          } else if (`${inputs[i].key}-scale` === attribKey && inputs[i].loadScale) {
            inputs[i].loadScale(attribs[attribKey]);
            break;
          }
        }
      });
    } else if (key === this.componentKey) {
      const components = data[key];
      Object.keys(components).forEach((componentKey) => {
        const { type } = components[componentKey];
        let list;
        if (type === Type.TRIGGER) {
          list = Trigger;
        } else if (type === Type.TARGET) {
          list = Target;
        } else if (type === Type.CONDITION) {
          list = Condition;
        } else if (type === Type.MECHANIC) {
          list = Mechanic;
        }

        let name = componentKey;
        if (name.indexOf('-') > 0) {
          name = name.substring(0, name.indexOf('-'));
        }
        if (list !== undefined && list !== null) {
          Object.keys(list).forEach((listKey) => {
            if (list[listKey].name.toLowerCase() === name.toLowerCase()) {
              const component = list[listKey].constructor
                ? new list[listKey].constructor()
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
    ATTRIBS = attribs.split(',');
  }
  if (skillData) {
    setSkills([]); // Reset skills
    document.getElementById('skillList').remove(0);
    loadSkillText(skillData); // Load skills from data
    if (skillIndex) {
      document.getElementById('skillList').selectedIndex = parseInt(skillIndex, 10);
      const skills = getSkills();
      const newActiveSkill =
        skills[Math.max(0, Math.min(skills.length - 1, parseInt(skillIndex, 10)))];
      setActiveSkill(newActiveSkill);
      newActiveSkill.apply();
      showSkillPage('builder');
    }
  }
  if (classData) {
    setClasses([]); // Reset classes
    document.getElementById('classList').remove(0);
    loadClassText(classData); // Load classes from data
    if (classIndex) {
      document.getElementById('classList').selectedIndex = parseInt(classIndex, 10);
      const classes = getClasses();
      const newActiveClass =
        classes[Math.max(0, Math.min(classes.length - 1, parseInt(classIndex, 10)))];
      setActiveClass(newActiveClass);
      newActiveClass.createFormHTML();
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
  localStorage.setItem('skillsActive', skillsActive ? 'true' : 'false');
  localStorage.setItem('skillIndex', document.getElementById('skillList').selectedIndex);
  localStorage.setItem('classIndex', document.getElementById('classList').selectedIndex);
};

export { getATTRIBS, saveToFile, showSkillPage, loadSection };
