import { getActiveSkill } from './skill.js';
import { getActiveComponent, Type, Trigger, Target, Condition, Mechanic } from './component.js';

import * as debug from './debug.js';
import diContainer from './diContainer.js';

import { sortStrings } from './utils.js';
import * as appData from './appData.js';

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

/**
 * Retrieves the current form being displayed.
 * @param {Array<string>} source - Optional. An array of form IDs to check. Defaults to ['builder', 'skill-form', 'component-chooser', 'trigger-chooser'].
 * @returns {string|null} - The ID of the current form being displayed, or null if no form is found.
 */
const getCurrentForm = (source) => {
  const forms = source || ['builder', 'skill-form', 'component-chooser', 'trigger-chooser'];
  return forms.find((form) => document.getElementById(form).style.display === 'block');
};

const updateSelectedOptionCSS = (action) => {
  if (selectedOption === undefined) {
    debug.logIfAllowed(debug.levels.WARN, 'No selected option found');
    return;
  }
  if (action === 'skill-form') {
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
  appData.set(appData.globals.lastVisitedForm, getCurrentForm());
  setPageStyle('builder', name);
  setPageStyle('skill-form', name);
  setPageStyle('component-chooser', name);
  setPageStyle('trigger-chooser', name);
};

let activeSection = null;

const setupOptionList = (div, list, type) => {
  // Reset div
  // FIXME: This seems unnecessary. The div should be empty already.
  div.innerHTML = '';
  let output = '';

  const createOptions = (source, parent, category) => {
    let container;
    if (category) {
      const section = document.createElement('div');
      section.className = 'options-category';
      parent.appendChild(section);

      section.addEventListener('click', (e) => {
        // Clicking on an option should not expand/collapse the category
        if (e.target.classList.contains('option')) {
          return;
        }
        if (activeSection) {
          activeSection.classList.remove('active');
        }
        if (activeSection === section) {
          activeSection = null;
        } else {
          section.classList.add('active');
          activeSection = section;
        }
      });

      const header = document.createElement('h4');
      header.className = 'options-category-header';
      header.textContent = category;
      section.appendChild(header);

      const selection = document.createElement('div');
      selection.className = 'options-category-selection';
      section.appendChild(selection);

      container = selection;
    } else {
      container = parent;
    }
    Object.entries(source)
      .sort(([keyA], [keyB]) => sortStrings(keyA, keyB))
      .forEach(([, value], index) => {
        if (index % 4 === 0) {
          output += '| ';
        }
        output += `[[${value.name}|_${type.substr(0, 1).toUpperCase()}${type.substr(1)} ${
          value.name
        }]] | `;
        if ((index + 1) % 4 === 0) {
          output += '\n';
        }

        const h5 = document.createElement('h5');
        h5.className = 'option';
        if (value.premium) {
          h5.classList.add('premium');
        }
        if (value.container) {
          h5.classList.add('container');
        }
        h5.textContent = value.name;
        h5.component = value;
        h5.addEventListener('click', () => {
          const activeComponent = getActiveComponent();
          const activeSkill = getActiveSkill();
          debug.logIfAllowed(debug.levels.VERBOSE, '----- Active Component -----');
          debug.logIfAllowed(debug.levels.VERBOSE, activeComponent);
          debug.logIfAllowed(debug.levels.VERBOSE, '-----   Active Skill   -----');
          debug.logIfAllowed(debug.levels.VERBOSE, activeSkill);
          debug.logIfAllowed(debug.levels.VERBOSE, '----------------------------');
          // If the user is adding a trigger that already exists, go back to the builder
          if (activeComponent === activeSkill && activeSkill.usingTrigger(h5.component.name)) {
            debug.logIfAllowed(debug.levels.WARN, 'Trigger already exists, going back to builder');
            showSkillPage('builder');
          } else {
            showSkillPage('skill-form');
            /** @type {import('./component.js').Component} */
            const component = h5.component.constructor
              ? new h5.component.constructor()
              : h5.component.supplier();
            component.parent = activeComponent;
            activeComponent.components.push(component);
            component.createBuilderHTML(activeComponent.html);
            component.createFormHTML();
          }
        });
        container.appendChild(h5);
      });
  };

  const entries = Object.entries(list);
  // Check if the first value has `category: null` explicitly set
  // const useCategory = entries[0][1].category !== null;
  // FIXME: We force the use of categories for now because I didn't add/adjust CSS for the non-category version
  const useCategory = true;

  if (useCategory) {
    const categoryLists = entries.reduce((accumulator, entry) => {
      const [componentKey, component] = entry;
      let { category } = component;
      if (!category) {
        category = 'Uncategorized';
      }
      if (!accumulator[category]) {
        accumulator[category] = {};
      }
      accumulator[category][componentKey] = component;
      return accumulator;
    }, {});
    Object.entries(categoryLists).forEach(([categoryKey, categoryList]) => {
      createOptions(categoryList, div, categoryKey);
    });
  } else {
    createOptions(list, div);
  }

  // saveToFile(`wiki_${type}.txt`, output);
};

const refreshOptions = () => {
  // Set up component option lists
  setupOptionList(document.getElementById('trigger-options'), Trigger, Type.TRIGGER);
  setupOptionList(document.getElementById('target-options'), Target, Type.TARGET);
  setupOptionList(document.getElementById('condition-options'), Condition, Type.CONDITION);
  setupOptionList(document.getElementById('mechanic-options'), Mechanic, Type.MECHANIC);
};

const switchToSkills = () => {
  if (!skillsActive) {
    document.getElementById('skill-tab').className = 'tab tab-left tab-active';
    document.getElementById('class-tab').className = 'tab tab-right';
    document.getElementById('skills').style.display = 'block';
    document.getElementById('classes').style.display = 'none';
    skillsActive = true;
  }
};

const switchToClasses = () => {
  if (skillsActive) {
    document.getElementById('class-tab').className = 'tab tab-right tab-active';
    document.getElementById('skill-tab').className = 'tab tab-left';
    document.getElementById('classes').style.display = 'block';
    document.getElementById('skills').style.display = 'none';
    skillsActive = false;
  }
};

const updateUIForNewActiveSkill = (newActiveSkill) => {
  const skillList = document.getElementById('skill-list');
  // Update UI
  const currentForm = getCurrentForm();
  // Clean up old selected option and set up new selected option
  updateSelectedOptionCSS('reset');
  setSelectedOption(skillList.options[skillList.selectedIndex]);
  if (currentForm === 'skill-form') {
    newActiveSkill.createFormHTML();
    showSkillPage('skill-form');
  } else if (currentForm === 'builder') {
    newActiveSkill.apply();
    showSkillPage('builder');
  }
};

// Init variables
const skillList = document.getElementById('skill-list');
selectedOption = skillList.options[skillList.selectedIndex];

// Register dependencies
diContainer.register('showSkillPage', showSkillPage);
diContainer.register('getSkillsActive', getSkillsActive);
diContainer.register('getCurrentForm', getCurrentForm);

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
