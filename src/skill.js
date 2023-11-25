import {
  ListValue,
  AttributeValue,
  IntValue,
  StringValue,
  StringListValue,
  isAttribute,
} from './input.js';
import { setActiveComponent, setSaveIndex } from './component.js';
import { getMaterials } from './data/index.js';
import * as debug from './debug.js';
import diContainer from './diContainer.js';

// Inject dependencies
let showSkillPage;
diContainer.inject('showSkillPage').then((value) => {
  showSkillPage = value;
});

/** @type {Skill} */
let activeSkill;
/** @type {Skill[]} */
let skills;

const getActiveSkill = () => activeSkill;
const setActiveSkill = (value) => {
  activeSkill = value;
};
const getSkills = () => skills;
const setSkills = (value) => {
  skills = value;
};

/**
 * Retrieves a skill by name
 *
 * @param {string} name - name of the skill to retrieve
 *
 * @returns {Skill} the skill with the given name or null if not found
 */
const getSkill = (name) => {
  const nameLower = name.toLowerCase();
  for (let i = 0; i < skills.length; i++) {
    if (skills[i].data[0].value.toLowerCase() === nameLower) {
      return skills[i];
    }
  }
  return null;
};

/**
 * Checks whether or not a skill name is currently taken
 *
 * @param {string} name - name to check for
 *
 * @returns {boolean} true if the name is taken, false otherwise
 */
const isSkillNameTaken = (name) => getSkill(name) != null;

/**
 * Represents the data for a dynamic skill
 *
 * @param {string} name - the name of the skill
 */
class Skill {
  constructor(name) {
    /** @type {import('./component.js').Component[]} */
    this.components = [];

    // Included to simplify code when adding components
    this.html = document.getElementById('builderContent');

    this.dataKey = 'attributes';
    this.componentKey = 'components';

    // Skill data
    this.data = [
      new StringValue('Name', 'name', name).setTooltip(
        'The name of the skill. This should not contain color codes',
      ),
      new StringValue('Type', 'type', 'Dynamic').setTooltip(
        'The flavor text describing the skill such as "AOE utility" or whatever you want it to be',
      ),
      new IntValue('Max Level', 'max-level', 5).setTooltip('The maximum level the skill can reach'),
      new ListValue('Skill Req', 'skill-req', ['None'], 'None').setTooltip(
        'The skill that needs to be upgraded before this one can be unlocked',
      ),
      new IntValue('Skill Req Level', 'skill-req-lvl', 1).setTooltip(
        'The level that the required skill needs to reach before this one can be unlocked',
      ),
      new ListValue('Permission', 'needs-permission', ['True', 'False'], 'False').setTooltip(
        'Whether or not this skill requires a permission to unlock. The permission would be "skillapi.skill.{skillName}"',
      ),
      new AttributeValue('Level Req', 'level', 1, 0).setTooltip(
        'The class level the player needs to be before unlocking or upgrading this skill',
      ),
      new AttributeValue('Cost', 'cost', 1, 0).setTooltip(
        'The amount of skill points needed to unlock and upgrade this skill',
      ),
      new AttributeValue('Cooldown', 'cooldown', 0, 0).setTooltip(
        'The time in seconds before the skill can be cast again (only works with the Cast trigger)',
      ),
      new AttributeValue('Mana', 'mana', 0, 0).setTooltip(
        'The amount of mana it takes to cast the skill (only works with the Cast trigger)',
      ),
      new AttributeValue('Min Spent', 'points-spent-req', 0, 0).setTooltip(
        'The amount of skill points that need to be spent before upgrading this skill',
      ),
      new StringValue('Cast Message', 'msg', '&6{player} &2has cast &6{skill}').setTooltip(
        'The message to display to players around the caster when the skill is cast. The radius of the area is in the config.yml options',
      ),
      new StringValue('Combo', 'combo', '').setTooltip(
        'The click combo to assign the skill (if enabled). Use L, R, S, LS, RS, P, and Q for the types of clicks separated by spaces. For example, "L L R R" would work for 4 click combos.',
      ),
      new ListValue('Indicator', 'indicator', ['2D', '3D', 'None'], '2D').setTooltip(
        '[PREMIUM] What sort of display to use for cast previews. This applies to the "hover bar" in the casting bars setup.',
      ),
      new ListValue('Icon', 'icon', getMaterials, 'Jack O Lantern').setTooltip(
        'The item used to represent the skill in skill trees',
      ),
      new IntValue('Icon Data', 'icon-data', 0).setTooltip(
        'The data/durability value of the item used to represent the skill in skill trees',
      ),
      new StringListValue('Icon Lore', 'icon-lore', [
        '&d{name} &7({level}/{max})',
        '&2Type: &6{type}',
        '',
        '{req:level}Level: {attr:level}',
        '{req:cost}Cost: {attr:cost}',
        '',
        '&2Mana: {attr:mana}',
        '&2Cooldown: {attr:cooldown}',
      ]).setTooltip(
        'The description shown for the item in skill trees. Include values of mechanics such as damage dealt using their "Icon Key" values',
      ),
      new StringListValue('Incompatible', 'incompatible', []).setTooltip(
        'List of skill names that must not be upgraded in order to upgrade this skill',
      ),
    ];
  }

  /**
   * Applies the skill data to the HTML page, overwriting any previous data
   */
  apply() {
    const builder = document.getElementById('builderContent');
    // Reset builder
    builder.innerHTML = '';

    // Set up the builder content
    for (let i = 0; i < this.components.length; i++) {
      this.components[i].createBuilderHTML(builder);
    }

    builder.skill = this;
  }

  /**
   * Creates the form HTML for editing the skill and applies it to
   * the appropriate area on the page
   */
  createFormHTML(IsSameSkill) {
    const form = document.createElement('form');

    const header = document.createElement('h4');
    header.textContent = 'Skill Details';
    form.appendChild(header);

    form.appendChild(document.createElement('hr'));
    form.appendChild(this.createEditButton(form));
    form.appendChild(document.createElement('hr'));

    this.data[3].list.splice(1, this.data[3].list.length - 1);
    for (let i = 0; i < skills.length; i++) {
      if (skills[i] !== this) {
        this.data[3].list.push(skills[i].data[0].value);
      }
    }
    for (let i = 0; i < this.data.length; i++) {
      this.data[i].createHTML(form);
    }

    const hr = document.createElement('hr');
    form.appendChild(hr);

    form.appendChild(this.createEditButton(form));

    // Reset skill form
    const target = document.getElementById('skillForm');
    target.innerHTML = '';
    target.appendChild(form);
    if (!IsSameSkill) {
      setActiveComponent(this);
    }

    form.skill = this;
  }

  createEditButton(form) {
    const done = document.createElement('h5');
    done.className = 'doneButton';
    done.textContent = 'Edit Effects';
    done.skill = this;
    done.form = form;
    done.addEventListener('click', () => {
      done.skill.update();
      const list = document.getElementById('skillList');
      list[list.selectedIndex].text = done.skill.data[0].value;
      done.form.remove();
      const builder = document.getElementById('builderContent');
      if (builder.skill !== activeSkill) {
        activeSkill.apply();
      }
      showSkillPage('builder');
    });
    return done;
  }

  /**
   * Updates the skill data from the details form if it exists
   */
  update() {
    const index = skills.indexOf(this);
    if (index === -1) {
      debug.logIfAllowed(debug.levels.ERROR, 'Skill not found in skill list', this);
      debug.logIfAllowed(debug.levels.ERROR, 'skill list:', skills);
      throw new Error('Skill not found in skill list');
    }
    const list = document.getElementById('skillList');
    const prevName = this.data[0].value;
    for (let j = 0; j < this.data.length; j++) {
      this.data[j].update();
    }
    const newName = this.data[0].value;
    this.data[0].value = prevName;
    if (isSkillNameTaken(newName)) {
      return;
    }
    this.data[0].value = newName;
    list[index].text = this.data[0].value;
  }

  /**
   * Checks whether or not the skill is using a given trigger
   *
   * @param {string} trigger - name of the trigger to check
   *
   * @returns {boolean} true if using it, false otherwise
   */
  usingTrigger(trigger) {
    for (let i = 0; i < this.components.length; i++) {
      if (this.components[i].name === trigger) {
        return true;
      }
    }
    return false;
  }

  /**
   * Creates and returns a save string for the skill
   */
  getSaveString() {
    let saveString = '';

    saveString += `${this.data[0].value}:\n`;
    for (let i = 0; i < this.data.length; i++) {
      if (!isAttribute(this.data[i])) {
        saveString += this.data[i].getSaveString('  ');
      }
    }
    saveString += '  attributes:\n';
    for (let i = 0; i < this.data.length; i++) {
      if (isAttribute(this.data[i])) {
        saveString += this.data[i].getSaveString('    ');
      }
    }
    if (this.components.length > 0) {
      saveString += '  components:\n';
      setSaveIndex(0);
      for (let i = 0; i < this.components.length; i++) {
        saveString += this.components[i].getSaveString('    ');
      }
    }
    return saveString;
  }

  /**
   * Loads skill data from the config lines stating at the given index
   *
   * @param {YAMLObject} data - the data to load
   *
   * @returns {Number} the index of the last line of data for this skill
   */
  load(data) {
    if (data.active || data.embed || data.passive) {
      // Load old skill config for conversion
    } else {
      this.loadBase(data);
    }
  }
}

/**
 * Adds a skill to the editor without switching the view to it
 *
 * @param {string} name - the name of the skill to add
 *
 * @returns {Skill} the added skill
 */
const addSkill = (name) => {
  const skill = new Skill(name);
  skills.push(skill);

  const option = document.createElement('option');
  option.text = name;
  const list = document.getElementById('skillList');
  list.add(option, list.length - 1);

  return skill;
};

/**
 * Creates a new skill and switches the view to it
 *
 * @returns {Skill} the new skill
 */
const newSkill = () => {
  let id = 1;
  while (isSkillNameTaken(`Skill ${id}`)) {
    id++;
  }

  activeSkill = addSkill(`Skill ${id}`);

  const list = document.getElementById('skillList');
  list.selectedIndex = list.length - 2;

  return activeSkill;
};

let hasInitialized = false;
const init = () => {
  if (hasInitialized) {
    throw new Error('Skill has already been initialized');
  }
  hasInitialized = true;
  activeSkill = new Skill('Skill 1');
  skills = [activeSkill];
  activeSkill.createFormHTML();
  showSkillPage('skillForm');
};

// Inject dependencies
diContainer.inject('loadSection').then((value) => {
  Skill.prototype.loadBase = value;
});

// Register dependencies
diContainer.register('getActiveSkill', getActiveSkill);
diContainer.register('getSkills', getSkills);
diContainer.register('newSkill', newSkill);

export {
  init,
  getActiveSkill,
  setActiveSkill,
  getSkills,
  setSkills,
  getSkill,
  isSkillNameTaken,
  addSkill,
  newSkill,
};
