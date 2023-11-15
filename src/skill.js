// TODO: Externalize this function in utils.js
function isAttribute(input) {
  return input instanceof window.AttributeValue || input.key === 'incompatible';
}

/**
 * Represents the data for a dynamic skill
 *
 * @param {string} name - the name of the skill
 *
 * @constructor
 */
function Skill(name) {
  this.components = [];

  // Included to simplify code when adding components
  this.html = document.getElementById('builderContent');

  this.dataKey = 'attributes';
  this.componentKey = 'components';

  // Skill data
  this.data = [
    new window.StringValue('Name', 'name', name).setTooltip(
      'The name of the skill. This should not contain color codes',
    ),
    new window.StringValue('Type', 'type', 'Dynamic').setTooltip(
      'The flavor text describing the skill such as "AOE utility" or whatever you want it to be',
    ),
    new window.IntValue('Max Level', 'max-level', 5).setTooltip(
      'The maximum level the skill can reach',
    ),
    new window.ListValue('Skill Req', 'skill-req', ['None'], 'None').setTooltip(
      'The skill that needs to be upgraded before this one can be unlocked',
    ),
    new window.IntValue('Skill Req Level', 'skill-req-lvl', 1).setTooltip(
      'The level that the required skill needs to reach before this one can be unlocked',
    ),
    new window.ListValue('Permission', 'needs-permission', ['True', 'False'], 'False').setTooltip(
      'Whether or not this skill requires a permission to unlock. The permission would be "skillapi.skill.{skillName}"',
    ),
    new window.AttributeValue('Level Req', 'level', 1, 0).setTooltip(
      'The class level the player needs to be before unlocking or upgrading this skill',
    ),
    new window.AttributeValue('Cost', 'cost', 1, 0).setTooltip(
      'The amount of skill points needed to unlock and upgrade this skill',
    ),
    new window.AttributeValue('Cooldown', 'cooldown', 0, 0).setTooltip(
      'The time in seconds before the skill can be cast again (only works with the Cast trigger)',
    ),
    new window.AttributeValue('Mana', 'mana', 0, 0).setTooltip(
      'The amount of mana it takes to cast the skill (only works with the Cast trigger)',
    ),
    new window.AttributeValue('Min Spent', 'points-spent-req', 0, 0).setTooltip(
      'The amount of skill points that need to be spent before upgrading this skill',
    ),
    new window.StringValue('Cast Message', 'msg', '&6{player} &2has cast &6{skill}').setTooltip(
      'The message to display to players around the caster when the skill is cast. The radius of the area is in the config.yml options',
    ),
    new window.StringValue('Combo', 'combo', '').setTooltip(
      'The click combo to assign the skill (if enabled). Use L, R, S, LS, RS, P, and Q for the types of clicks separated by spaces. For example, "L L R R" would work for 4 click combos.',
    ),
    new window.ListValue('Indicator', 'indicator', ['2D', '3D', 'None'], '2D').setTooltip(
      '[PREMIUM] What sort of display to use for cast previews. This applies to the "hover bar" in the casting bars setup.',
    ),
    new window.ListValue('Icon', 'icon', window.getMaterials, 'Jack O Lantern').setTooltip(
      'The item used to represent the skill in skill trees',
    ),
    new window.IntValue('Icon Data', 'icon-data', 0).setTooltip(
      'The data/durability value of the item used to represent the skill in skill trees',
    ),
    new window.StringListValue('Icon Lore', 'icon-lore', [
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
    new window.StringListValue('Incompatible', 'incompatible', []).setTooltip(
      'List of skill names that must not be upgraded in order to upgrade this skill',
    ),
  ];
}

/* eslint-disable */
let activeSkill = new Skill('Skill 1');
let activeComponent = null;
const skills = [activeSkill];
/* eslint-enable */

/**
 * Adds a skill to the editor without switching the view to it
 *
 * @param {string} name - the name of the skill to add
 *
 * @returns {Skill} the added skill
 */
function addSkill(name) {
  const skill = new Skill(name);
  window.skills.push(skill);

  const option = document.createElement('option');
  option.text = name;
  const list = document.getElementById('skillList');
  list.add(option, list.length - 1);

  return skill;
}

/**
 * Retrieves a skill by name
 *
 * @param {string} name - name of the skill to retrieve
 *
 * @returns {Skill} the skill with the given name or null if not found
 */
function getSkill(name) {
  const nameLower = name.toLowerCase();
  for (let i = 0; i < window.skills.length; i++) {
    if (window.skills[i].data[0].value.toLowerCase() === nameLower) {
      return window.skills[i];
    }
  }
  return null;
}

/**
 * Checks whether or not a skill name is currently taken
 *
 * @param {string} name - name to check for
 *
 * @returns {boolean} true if the name is taken, false otherwise
 */
function isSkillNameTaken(name) {
  return getSkill(name) != null;
}

/**
 * Creates a new skill and switches the view to it
 *
 * @returns {Skill} the new skill
 */
function newSkill() {
  let id = 1;
  while (isSkillNameTaken(`Skill ${id}`)) {
    id++;
  }

  window.activeSkill = addSkill(`Skill ${id}`);

  const list = document.getElementById('skillList');
  list.selectedIndex = list.length - 2;

  window.activeSkill.apply();
  window.activeSkill.createFormHTML();
  window.showSkillPage('skillForm');

  return window.activeSkill;
}

/**
 * Applies the skill data to the HTML page, overwriting any previous data
 */
Skill.prototype.apply = function apply() {
  const builder = document.getElementById('builderContent');
  builder.innerHTML = '';

  // Set up the builder content
  for (let i = 0; i < this.components.length; i++) {
    this.components[i].createBuilderHTML(builder);
  }
};

/**
 * Creates the form HTML for editing the skill and applies it to
 * the appropriate area on the page
 */
Skill.prototype.createFormHTML = function createFormHTML() {
  const form = document.createElement('form');

  const header = document.createElement('h4');
  header.innerHTML = 'Skill Details';
  form.appendChild(header);

  form.appendChild(document.createElement('hr'));
  form.appendChild(this.createEditButton(form));
  form.appendChild(document.createElement('hr'));

  this.data[3].list.splice(1, this.data[3].list.length - 1);
  for (let i = 0; i < window.skills.length; i++) {
    if (window.skills[i] !== this) {
      this.data[3].list.push(window.skills[i].data[0].value);
    }
  }
  for (let i = 0; i < this.data.length; i++) {
    this.data[i].createHTML(form);
  }

  const hr = document.createElement('hr');
  form.appendChild(hr);

  form.appendChild(this.createEditButton(form));

  const target = document.getElementById('skillForm');
  target.innerHTML = '';
  target.appendChild(form);
};

Skill.prototype.createEditButton = function createEditButton(form) {
  const done = document.createElement('h5');
  done.className = 'doneButton';
  done.innerHTML = 'Edit Effects';
  done.skill = this;
  done.form = form;
  done.addEventListener('click', () => {
    done.skill.update();
    const list = document.getElementById('skillList');
    list[list.selectedIndex].text = done.skill.data[0].value;
    done.form.parentNode.removeChild(done.form);
    window.showSkillPage('builder');
  });
  return done;
};

/**
 * Updates the skill data from the details form if it exists
 */
Skill.prototype.update = function update() {
  let index;
  const list = document.getElementById('skillList');
  for (let i = 0; i < window.skills.length; i++) {
    if (window.skills[i] === this) {
      index = i;
      break;
    }
  }
  const prevName = this.data[0].value;
  for (let j = 0; j < this.data.length; j++) {
    this.data[j].update();
  }
  const newName = this.data[0].value;
  this.data[0].value = prevName;
  if (isSkillNameTaken(newName)) return;
  this.data[0].value = newName;
  list[index].text = this.data[0].value;
};

/**
 * Checks whether or not the skill is using a given trigger
 *
 * @param {string} trigger - name of the trigger to check
 *
 * @returns {boolean} true if using it, false otherwise
 */
Skill.prototype.usingTrigger = function usingTrigger(trigger) {
  for (let i = 0; i < this.components.length; i++) {
    if (this.components[i].name === trigger) return true;
  }
  return false;
};

/**
 * Creates and returns a save string for the skill
 */
Skill.prototype.getSaveString = function getSaveString() {
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
    window.saveIndex = 0;
    for (let i = 0; i < this.components.length; i++) {
      saveString += this.components[i].getSaveString('    ');
    }
  }
  return saveString;
};

/**
 * Loads skill data from the config lines stating at the given index
 *
 * @param {YAMLObject} data - the data to load
 *
 * @returns {Number} the index of the last line of data for this skill
 */
Skill.prototype.load = function load(data) {
  if (data.active || data.embed || data.passive) {
    // Load old skill config for conversion
  } else {
    this.loadBase(data);
  }
};

Skill.prototype.loadBase = window.loadSection;

activeSkill.createFormHTML();
window.showSkillPage('skillForm');
