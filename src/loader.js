/* eslint-disable max-classes-per-file */

import {
  getSkillsActive,
  refreshOptions,
  showSkillPage,
  updateUIForNewActiveSkill,
} from './domHelpers.js';
import {
  CustomComponent,
  Type,
  Trigger,
  Target,
  Condition,
  Mechanic,
  setActiveComponent,
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
} from './skill.js';
import {
  getActiveClass,
  setActiveClass,
  getClasses,
  setClasses,
  getClass,
  isClassNameTaken,
  addClass,
} from './class.js';
import Attribute from './classes/Attribute.js';
import { clamp } from './mathUtils.js';
import diContainer from './diContainer.js';

/**
 * Loads a section of config data
 */
function loadSection(data) {
  const inputs = this.data;

  const loadDataIntoInput = (input, key, value) => {
    if (input.key === key && input.load) {
      input.load(value);
      return true;
    }
    if (`${input.key}-base` === key && input.loadBase) {
      input.loadBase(value);
      return true;
    }
    if (`${input.key}-scale` === key && input.loadScale) {
      input.loadScale(value);
      return true;
    }
    return false;
  };

  const createComponnet = (componentDesc, componentData) => {
    const component = componentDesc.constructor
      ? new componentDesc.constructor()
      : componentDesc.supplier();

    const { comment } = componentData;
    if (comment) {
      component.comment.load(comment);
    }
    component.parent = this;

    this.components.push(component);
    component.load(componentData);
  };

  this.components = [];
  Object.entries(data).forEach(([key, value]) => {
    // Load a data set
    if (key === this.dataKey) {
      const attribs = value;
      Object.entries(attribs).forEach(([attribKey, attribData]) => {
        // Assuming our inputs have unique keys (as they should), we can use find() instead of forEach()
        inputs.find((input) => loadDataIntoInput(input, attribKey, attribData));
      });
    }
    // Load components
    else if (key === this.componentKey) {
      const components = value;
      Object.entries(components).forEach(([componentKey, componentData]) => {
        const { type } = componentData;
        const list = {
          [Type.TRIGGER]: Trigger,
          [Type.TARGET]: Target,
          [Type.CONDITION]: Condition,
          [Type.MECHANIC]: Mechanic,
        }[type];

        let name = componentKey;
        const dashIndex = name.indexOf('-');
        if (dashIndex > 0) {
          name = name.substring(0, dashIndex);
        }
        if (list != null) {
          // Assuming our dynamic components have unique keys (as they should), we can use find() instead of forEach()
          const componentDesc = Object.values(list).find(
            (desc) => desc.name.toLowerCase() === name.toLowerCase(),
          );
          if (componentDesc !== undefined) {
            createComponnet(componentDesc, componentData);
          }
        }
      });
    }
    // Load single data value
    else if (this.dataKey !== 'data') {
      // Assuming our inputs have unique keys (as they should), we can use find() instead of forEach()
      inputs.find((input) => loadDataIntoInput(input, key, value));
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
  const skillList = document.getElementById('skillList');
  skillList.remove(0);
  loadSkillText(skillData); // Load skills from data
  if (skillIndex) {
    const indexNumber = parseInt(skillIndex, 10);
    skillList.selectedIndex = indexNumber;
    const skills = getSkills();
    const newActiveSkill = skills[clamp(indexNumber, 0, skills.length - 1)];
    setActiveSkill(newActiveSkill);
    setActiveComponent(newActiveSkill);
    updateUIForNewActiveSkill(newActiveSkill);
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

diContainer.register('loadSection', loadSection);

export { initSkills, initClasses, loadSection, loadFiles, parseConfig };
