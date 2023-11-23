import { getActiveSkill, injectShowSkillPage as injectShowSkillPage1 } from './skill.js';
import {
  getActiveComponent,
  Type,
  Trigger,
  Target,
  Condition,
  Mechanic,
  injectShowSkillPage as injectShowSkillPage2,
} from './component.js';

let skillsActive = true;
const getSkillsActive = () => skillsActive;
const setSkillsActive = (value) => {
  skillsActive = value;
  return value;
};

/** @type {HTMLSelectElement} */
let selectedOption;
const getSelectedOption = () => selectedOption;
const setSelectedOption = (option) => {
  selectedOption = option;
};

/**
 * Retrieves the current form being displayed.
 * @param {Array<string>} source - Optional. An array of form IDs to check. Defaults to ['builder', 'skillForm', 'componentChooser', 'triggerChooser'].
 * @returns {string|null} - The ID of the current form being displayed, or null if no form is found.
 */
const getCurrentForm = (source) => {
  const forms = source || ['builder', 'skillForm', 'componentChooser', 'triggerChooser'];
  return forms.find((form) => document.getElementById(form).style.display === 'block');
};

const updateSelectedOptionCSS = (action) => {
  if (action === 'skillForm') {
    selectedOption.classList.remove('in-builder');
    selectedOption.classList.add('active-skill', 'in-skill-form');
  } else if (action === 'builder') {
    selectedOption.classList.remove('in-skill-form');
    selectedOption.classList.add('active-skill', 'in-builder');
  } else if (action === 'reset') {
    selectedOption.classList.remove('active-skill', 'in-builder', 'in-skill-form');
  }
};

/**
 * Sets the style for the page based on the current visible one
 */
const setPageStyle = (name, visible) => {
  const target = document.getElementById(name);
  if (visible === name) {
    target.style.display = 'block';
    updateSelectedOptionCSS(name);
  } else {
    target.style.display = 'none';
  }
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
  // Reset div
  // FIXME: This seems unnecessary. The div should be empty already.
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
    if (list[x].container) {
      h5.classList.add('container');
    }
    h5.textContent = list[x].name;
    h5.component = list[x];
    h5.addEventListener('click', () => {
      const activeComponent = getActiveComponent();
      const activeSkill = getActiveSkill();
      console.log('----- Active Component -----');
      console.log(activeComponent);
      console.log('-----   Active Skill   -----');
      console.log(activeSkill);
      console.log('----------------------------');
      // If the user is adding a trigger that already exists, go back to the builder
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
  downloadLink.text = 'Download File';
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

const updateUIForNewActiveSkill = (newActiveSkill) => {
  const skillList = document.getElementById('skillList');
  // Update UI
  const currentForm = getCurrentForm();
  // Clean up old selected option and set up new selected option
  updateSelectedOptionCSS('reset');
  setSelectedOption(skillList.options[skillList.selectedIndex]);
  if (currentForm === 'skillForm') {
    newActiveSkill.createFormHTML();
    showSkillPage('skillForm');
  } else if (currentForm === 'builder') {
    newActiveSkill.apply();
    showSkillPage('builder');
  }
};

// Init variables
const skillList = document.getElementById('skillList');
selectedOption = skillList.options[skillList.selectedIndex];

// DI - inject depdenencies
injectShowSkillPage1(showSkillPage);
injectShowSkillPage2(showSkillPage);

export {
  getSkillsActive,
  setSkillsActive,
  getSelectedOption,
  setSelectedOption,
  getCurrentForm,
  updateSelectedOptionCSS,
  setPageStyle,
  showSkillPage,
  setupOptionList,
  refreshOptions,
  saveToFile,
  switchToSkills,
  switchToClasses,
  updateUIForNewActiveSkill,
};
