/* eslint-disable max-classes-per-file */

import { getSkillsActive, refreshOptions, showSkillPage } from './domHelpers.js';
import {
  CustomComponent,
  Type,
  Trigger,
  Target,
  Condition,
  Mechanic,
  injectLoadSection as injectLoadSection1,
} from './component.js';
import { YAMLObject, parseYAML } from './yaml.js';
import {
  getActiveSkill,
  setActiveSkill,
  getSkills,
  setSkills,
  getSkill,
  isSkillNameTaken,
  addSkill,
  injectLoadSection as injectLoadSection2,
} from './skill.js';
import {
  getActiveClass,
  setActiveClass,
  getClasses,
  setClasses,
  getClass,
  isClassNameTaken,
  addClass,
  injectLoadSection as injectLoadSection3,
} from './class.js';
import Attribute from './classes/Attribute.js';

/**
 * Loads a section of config data
 */
function loadSection(data) {
  this.components = [];
  Object.keys(data).forEach((key) => {
    const inputs = this.data;
    if (key === this.dataKey) {
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

// Loads attribute data from a file
// e - event details
const loadAttributes = (e) => {
  const text = e.target.result;
  document.activeElement.blur();
  const yaml = parseYAML(text);
  Attribute.ATTRIBS = Object.keys(yaml);

  const skillsActive = getSkillsActive();
  if (!skillsActive) {
    const activeClass = getActiveClass();
    activeClass.update();
    activeClass.createFormHTML();
  }
  localStorage.setItem('attribs', Attribute.ATTRIBS);
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

// Loads skill data from local storage when the page is loaded
const initSkills = (skillData, skillIndex) => {
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

// Loads class data from local storage when the page is loaded
const initClasses = (classData, classIndex) => {
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

const loadFiles = (files) => {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const reader = new FileReader();
    // Determine the correct handler for the file
    const handler = determineFileHandler(file.name);
    if (handler) {
      reader.onload = handler;
      reader.readAsText(file);
    }
  }
};

injectLoadSection1(loadSection);
injectLoadSection2(loadSection);
injectLoadSection3(loadSection);

export { initSkills, initClasses, loadSection, loadFiles, parseConfig };
