/* eslint-disable max-classes-per-file */

import {
  currentComponentInputs,
  ListValue,
  AttributeValue,
  StringValue,
  StringListValue,
  MultiListValue,
  copyRequirements,
  ByteListValue,
} from '../input.js';
import * as appData from '../appData.js';
import { settings } from '../appData.js';
import diContainer from '../diContainer.js';
import * as debug from '../debug.js';
import { notNull, assertMatches, assertNotNull } from '../assert.js';

let showSkillPage;

/** @type {typeof import('../skill.js'.Skill)} */
let Skill;
let loadSection;
let getCurrentForm;

let hoverSpace;
// The active component being edited or added to
/** @type {Component} */
let activeComponent;
let saveIndex;

const getActiveComponent = () => activeComponent;
let setActiveComponent;

const getSaveIndex = () => saveIndex;
const setSaveIndex = (value) => {
  saveIndex = value;
};

const resetSettingButton = (state, button, onText, offText) => {
  button.textContent = state ? onText : offText; // Unnecessary for now we are recreating the form.
  button.classList.add(state ? 'on' : 'off');
  button.classList.remove(state ? 'off' : 'on');
};

const createSettingButton = (options) => {
  const {
    isForComponent = true,
    form,
    component, // ? not used for now but is useful when `isForComponent` is true
    button = document.createElement('h5'),
    key,
    callback,
    onText,
    offText,
  } = options; // expected parameters

  button.key = key;
  button.className = 'setting-button';
  // Set text and class with the default state
  resetSettingButton(appData.get(key), button, onText, offText);

  button.addEventListener('click', () => {
    // Revert on/off state
    appData.set(key, !appData.get(key));
    // Reset text and class with the new state
    resetSettingButton(appData.get(key), button, onText, offText);
    if (callback != null && typeof callback === 'function') {
      callback({ ...options, newValue: appData.get(key) });
    }
  });

  if (isForComponent) {
    form.appendChild(button);
  } else {
    document.getElementById('footer-settings').appendChild(button);
  }
};

const createSettingButtons = (component, form) => {
  createSettingButton({
    form,
    component, // ? Unnecessary for now
    key: settings.ShowCommentsInComponent,
    onText: 'Hide Comment',
    offText: 'Show Comment',
    callback: () => {
      component.update();
      component.createFormHTML();
    },
  });
};

/**
 * Determines if a 'thing' can be dropped into a 'target'.
 * It checks if the 'thing' and 'target' are not the same and
 * 'thing' is not a parent of 'target'.
 *
 * @param {Object} thing - The thing to be dropped.
 * @param {Object} target - The target where the thing is to be dropped.
 * @returns {boolean} - Returns false if 'thing' is the same as 'target' or if 'thing' is a parent of 'target'. Otherwise, returns true.
 */
const canDrop = (thing, target) => {
  if (thing === target) {
    return false;
  }

  let currentTarget = target;
  while (currentTarget.parentNode) {
    currentTarget = currentTarget.parentNode;
    if (currentTarget === thing) {
      return false;
    }
  }
  return true;
};

const allowDrop = (e) => {
  e.preventDefault();
  if (hoverSpace) {
    hoverSpace.style.marginBottom = '0px';
    hoverSpace.onmouseout = undefined;
  }
  hoverSpace = e.target;
  while (hoverSpace.className.indexOf('component') < 0) {
    hoverSpace = hoverSpace.parentNode;
  }
  const thing = document.getElementById('drag-component');
  if (
    hoverSpace.id !== 'drag-component' &&
    hoverSpace.parentNode.comp.container &&
    canDrop(thing, hoverSpace)
  ) {
    hoverSpace.style.marginBottom = '30px';
    hoverSpace.onmouseout = (mouseEvent) => {
      if (hoverSpace === undefined || hoverSpace === null) {
        mouseEvent.currentTarget.onmouseout = null;
        return;
      }
      hoverSpace.style.marginBottom = '0px';
      hoverSpace.onmouseout = null;
      hoverSpace = null;
    };
  } else {
    hoverSpace = null;
  }
};

const drag = (e) => {
  e.dataTransfer.setData('text', 'anything');
  const dragged = document.getElementById('drag-component');
  if (dragged) {
    dragged.id = '';
  }
  e.target.id = 'drag-component';
};

const drop = (e) => {
  if (hoverSpace) {
    hoverSpace.style.marginBottom = '0px';
    hoverSpace = undefined;
  }

  e.preventDefault();
  const thing = document.getElementById('drag-component').parentNode;
  let { target } = e;
  while (target.className.indexOf('component') < 0) {
    target = target.parentNode;
  }
  if (
    target.id === 'drag-component' ||
    !target.parentNode.comp.container ||
    !canDrop(thing, target)
  ) {
    return;
  }
  const targetComp = target.parentNode.comp;
  const thingComp = thing.comp;
  // eslint-disable-next-line prefer-destructuring
  target = target.parentNode.childNodes[1];
  thing.parentNode.removeChild(thing);
  target.appendChild(thing);

  thingComp.parent.components.splice(thingComp.parent.components.indexOf(thingComp), 1);
  thingComp.parent = targetComp;
  thingComp.parent.components.push(thingComp);
};

/**
 * Checks if a given source component contains a specified target component.
 * Supports both direct and recursive searches. In a direct search, only
 * examines the immediate children of the source component. In a recursive
 * search, traverses all descendants of the source component.
 *
 * @param {Component} source - The source component in which to search for the target.
 * @param {Component} target - The target component to search for within the source component.
 * @param {Boolean} recursive - Specifies the type of search. If true, performs
 *                              a recursive search through all descendants of the source.
 *                              If false, only checks the immediate children of the source.
 * @returns {Boolean} Returns true if the target component is found within the source
 *                    component (or its descendants, if recursive search is enabled).
 *                    Returns false otherwise.
 *
 * @example
 * const componentA = { components: [componentB, componentC] };
 * const componentB = { components: [componentD] };
 *
 * // Direct search - checks only immediate children
 * console.log(contains(componentA, componentC, false)); // Output: true
 *
 * // Recursive search - checks all descendants
 * console.log(contains(componentA, componentD, true)); // Output: true
 */
const contains = (source, target, recursive) => {
  if (source === target) {
    return true;
  }
  // * This check ensures safety but is unnecessary. `components` should not be null or undefined in any case.
  if (!source.components) {
    return false;
  }
  if (recursive) {
    return source.components.some((child) => contains(child, target, recursive));
  }
  return source.components.includes(target);
};

/**
 * @param {import('../input.js').FormInput} input
 * @returns
 */
const isValidInput = (input) => {
  if (input.hidden) {
    return false;
  }
  const hasValidValue = [input.value, input.base, input.scale, input.values].some(
    (v) => v !== null && v !== undefined && v !== 'null' && v !== 'undefined',
  );
  if (!input.hasValidValueForInputLabel() || !hasValidValue) {
    return false;
  }
  // If no default value or "show-all-labels" setting is on, it is valid
  if (input.defaultValue == null || appData.get(appData.settings.ShowAllLabels)) {
    return true;
  }
  // Otherwise, check if the value is the same as the default value
  // * Input may be a string of the default value
  if (
    input instanceof AttributeValue &&
    assertNotNull(input.defaultValue.base, input.defaultValue.scale) &&
    (input.base === input.defaultValue.base || input.base === input.defaultValue.base.toString()) &&
    (input.scale === input.defaultValue.scale ||
      input.scale === input.defaultValue.scale.toString())
  ) {
    return false;
  }
  // ByteListValue will only hold number values
  if (input instanceof ByteListValue && input.value === input.defaultValue.value) {
    return false;
  }
  // MultiListValue
  if (
    input instanceof MultiListValue &&
    (input.values === input.defaultValue ||
      input.values.toString() === input.defaultValue.toString())
  ) {
    return false;
  }
  // Input may be a string of the default value
  if (input.value === input.defaultValue || input.value === input.defaultValue.toString()) {
    return false;
  }
  return true;
};

/**
 * Types of components
 */
// prettier-ignore
const Type = {
    TRIGGER   : 'trigger',
    TARGET    : 'target',
    CONDITION : 'condition',
    MECHANIC  : 'mechanic'
};

/**
 * Represents a component of a dynamic skill
 *
 * @param {string}    name      - name of the component
 * @param {string}    type      - type of the component
 * @param {boolean}   container - whether or not the component can contain others
 * @param {Component} [parent]  - parent of the component if any
 */
class Component {
  constructor(name, type, container, parent) {
    this.name = name;
    this.type = type;
    this.container = container;
    this.parent = parent;
    this.html = undefined;
    /** @type {import('./components/component.js'.Component[])} */
    this.components = [];
    this.comment = new StringListValue('Comment', 'comment', [])
      .setTooltip('A comment to help you remember what this component does')
      .addHTMLClasses('main', 'input-comment');
    /** @type {import('../input.js'.FormInput[])} */
    this.data = [
      new StringValue('Icon Key', 'icon-key', '').setTooltip(
        'The key used by the component in the Icon Lore. If this is set to "example" and has a value name of "value", it can be referenced using the string "{attr:example.value}".',
      ),
    ];
    if (this.type === Type.MECHANIC) {
      this.data.push(
        new ListValue('Counts as Cast', 'counts', ['True', 'False'], 'True').setTooltip(
          'Whether or not this mechanic running treats the skill as "casted" and will consume mana and start the cooldown. Set to false if it is a mechanic appled when the skill fails such as cleanup or an error message.',
        ),
      );
    } else if (
      this.type === Type.TRIGGER &&
      name !== 'Cast' &&
      name !== 'Initialize' &&
      name !== 'Cleanup'
    ) {
      this.data.push(
        new ListValue('Mana', 'mana', ['True', 'False'], 'False').setTooltip(
          'Whether or not this trigger requires the mana cost to activate',
        ),
      );
      this.data.push(
        new ListValue('Cooldown', 'cooldown', ['True', 'False'], 'False').setTooltip(
          'Whether or not this trigger requires to be off cooldown to activate',
        ),
      );
    }

    this.dataKey = 'data';
    this.componentKey = 'children';
  }

  dupe(parent) {
    let i;
    const ele = new Component(this.name, this.type, this.container, parent);
    for (i = 0; i < this.components.length; i++) {
      ele.components.push(this.components[i].dupe(ele));
    }
    ele.data = ele.data.slice(0, 1);
    for (i = ele.data.length; i < this.data.length; i++) {
      ele.data.push(copyRequirements(this.data[i], this.data[i].dupe()));
    }
    ele.description = this.description;
    return ele;
  }

  createInputLabels(parent) {
    // If already has input-container, cleanup and readd input labels
    const foundInputContainer = parent.querySelector('.input-container');
    if (foundInputContainer) {
      foundInputContainer.innerHTML = '';
    }

    const hasValidInput = this.data.find((input) => isValidInput(input));
    if (hasValidInput) {
      const inputContainer = foundInputContainer || document.createElement('div');
      inputContainer.className = 'input-container';
      this.data.forEach((input) => {
        if (isValidInput(input)) {
          const inputLabel = document.createElement('div');
          inputLabel.input = input;
          inputLabel.className = 'input-label';
          inputLabel.innerHTML = `<span class="input-label-name">${
            input.name
          }</span>: <span class="input-label-value">${input.getValueForInputLabel()}</span>`;
          inputContainer.appendChild(inputLabel);
          inputLabel.addEventListener('click', () => {
            this.createFormHTML();
            showSkillPage('skill-form');
            const getInputElementInSkillForm = () => {
              // * Input elements may have same ids depending on how SkillAPI reads them.
              // * We should respect that.
              const candidates = [
                ...document.querySelectorAll(`#${input.key}`),
                ...document.querySelectorAll(`#${input.key}-base`),
              ];
              return candidates.find((element) => element.input === input);
            };
            const inputElementInSkillForm = getInputElementInSkillForm();
            assertNotNull(inputElementInSkillForm);
            inputElementInSkillForm.focus();
          });
        }
      });
      if (!foundInputContainer) {
        parent.appendChild(inputContainer);
      }
    }
  }

  /**
   * Creates the builder HTML element for the component and
   * appends it onto the target HTML element.
   *
   * @param {Element} target - the HTML element to append the result to
   * @param {number}  index  - the index of the component in the parent
   */
  createBuilderHTML(target, index) {
    // Normally, inputs are checked and hidden in createFormHTML().
    // If we never called createFormHTML(), we need to check and hide inputs here.
    // Otherwise, labels will be shown for hidden inputs since they were not checked.
    // The NoDom version is super light-weighted compared to the original version.
    this.createFormHTMLNoDom();
    // Create the wrapping divs with the appropriate classes
    // The wrapper includes the self element and childDiv/html.
    const container = document.createElement('div');
    container.comp = this;
    if (this.type === Type.TRIGGER) {
      container.className = 'component-wrapper';
    }

    // Component's self element
    const div = document.createElement('div');
    div.className = `component ${this.type}`;
    if (this.type !== Type.TRIGGER) {
      div.draggable = true;
      div.ondragstart = drag;
    }
    div.ondrop = drop;
    if (this.container) {
      div.ondragover = allowDrop;
    }
    this.selfElement = div;
    if (activeComponent === this) {
      div.classList.add('active-component');
    }
    div.addEventListener('click', (e) => {
      if (e.target === e.currentTarget || e.target.parentNode === e.currentTarget) {
        debug.logIfAllowed(
          debug.levels.VERBOSE,
          `Clicked on selfElement of ${this.type} component ${this.name}!`,
        );
        if (this === activeComponent) {
          this.createFormHTML();
          showSkillPage('skill-form');
        } else {
          setActiveComponent(this);
        }
      }
    });

    // Component label
    const label = document.createElement('h3');
    label.title = `Edit ${this.name} options`;
    label.className = `${this.type}-label`;
    label.textContent = this.name;
    label.component = this;
    label.addEventListener('click', (e) => {
      debug.logIfAllowed(
        debug.levels.VERBOSE,
        `Clicked on targetLabel of ${this.type} component ${this.name}!`,
      );
      // Prevents the click from bubbling up to the selfElement
      e.stopPropagation();
      this.createFormHTML();
      showSkillPage('skill-form');
    });
    div.appendChild(label);

    // Comment
    if (this.comment.value && this.comment.value.some((s) => s !== '')) {
      const comment = document.createElement('pre');
      comment.className = 'component-comment';
      comment.textContent = this.comment.value.join('\n');
      div.append(comment);
    }

    // Create input labels
    this.createInputLabels(div);

    const builderButtonWrapper = document.createElement('div');
    builderButtonWrapper.className = 'builder-button-wrapper';
    div.append(builderButtonWrapper);

    // Container components can add children so they get a button
    if (this.container) {
      const add = document.createElement('div');
      add.className = 'builder-button';
      add.textContent = '+ Add Child';
      add.component = this;
      add.addEventListener('click', () => {
        setActiveComponent(this);
        showSkillPage('component-chooser');
      });
      builderButtonWrapper.appendChild(add);

      const vision = document.createElement('div');
      vision.title = 'Hide Children';
      vision.className = 'builder-button small-button';
      vision.style.background = 'url("media/img/eye.png") no-repeat center #222';
      vision.component = this;
      this.vision = vision;
      vision.toggleVision = () => {
        const comp = vision.component;
        if (comp.childrenHidden) {
          comp.childDiv.style.display = 'block';
          vision.style.backgroundImage = 'url("media/img/eye.png")';
        } else {
          comp.childDiv.style.display = 'none';
          vision.style.backgroundImage = 'url("media/img/eyeShaded.png")';
        }
        comp.childrenHidden = !comp.childrenHidden;
      };
      vision.addEventListener('click', vision.toggleVision);
      builderButtonWrapper.appendChild(vision);
      this.childrenHidden = false;
    }

    // Add the duplicate button
    if (this.type !== Type.TRIGGER) {
      const duplicate = document.createElement('div');
      duplicate.className = 'builder-button small-button';
      duplicate.title = 'Duplicate';
      duplicate.style.background = 'url("media/img/duplicate.png") no-repeat center #222';
      duplicate.component = this;
      duplicate.addEventListener('click', () => {
        const comp = this;
        const copy = comp.dupe(comp.parent);
        comp.parent.components.push(copy);
        copy.createBuilderHTML(comp.parent.html);
      });
      builderButtonWrapper.appendChild(duplicate);
    }

    // Add the remove button
    const remove = document.createElement('div');
    remove.title = 'Remove';
    remove.className = 'builder-button small-button cancel-button';
    remove.style.background = 'url("media/img/delete.png") no-repeat center #f00';
    remove.component = this;
    this.removeFunction = () => {
      const list = remove.component.parent.components;
      for (let i = 0; i < list.length; i++) {
        if (list[i] === remove.component) {
          list.splice(i, 1);
          break;
        }
      }
      container.remove();
      // Set new activeComponent if the deleted component or its child is active
      if (activeComponent instanceof Skill === false && contains(this, activeComponent, true)) {
        assertNotNull(this.parent);
        setActiveComponent(this.parent);
      }
    };
    remove.addEventListener('click', this.removeFunction);
    builderButtonWrapper.appendChild(remove);

    container.appendChild(div);

    // Apply child components
    const childContainer = document.createElement('div');
    childContainer.className = 'component-children';
    if (this.components.length > 0) {
      for (let i = 0; i < this.components.length; i++) {
        this.components[i].createBuilderHTML(childContainer);
      }
    }
    container.appendChild(childContainer);
    this.childDiv = childContainer;

    // Append the content. If index is undefined or any other falsy value, it will append to the end.
    target.insertBefore(container, target.childNodes[index]);
    this.html = childContainer;
  }

  /**
   * Creates the form HTML for editing the component data and
   * applies it to the appropriate part of the page.
   */
  createFormHTML() {
    const target = document.getElementById('skill-form');

    const form = document.createElement('form');

    const header = document.createElement('h4');
    header.textContent = this.name;
    form.appendChild(header);

    if (this.description) {
      const desc = document.createElement('p');
      desc.textContent = this.description;
      form.appendChild(desc);
    }

    // Add comment if "show-comment" setting is on
    if (appData.get(appData.settings.ShowComments)) {
      form.appendChild(document.createElement('hr'));
      this.comment.createHTML(form);
    }

    let index = 1;
    // If only has Icon Key, will not add Icon Key
    if (this.data.length > 1) {
      // If comment was not created (otherwise it will create a divider with it), create a divider
      if (!form.querySelector('hr')) {
        form.appendChild(document.createElement('hr'));
      }
      // If no AttributeValue, will not add Icon Key
      const hasAttribValue = this.data.some((input) => input instanceof AttributeValue);
      if (hasAttribValue) {
        index = 0;
      }
      this.data[0].hidden = !hasAttribValue;
      // Initialize inputs
      for (let i = index; i < this.data.length; i++) {
        this.data[i].hidden = false;
        this.data[i].createHTML(form);
      }
    }

    const hr = document.createElement('hr');
    form.appendChild(hr);

    const done = document.createElement('h5');
    done.className = 'done-button';
    done.textContent = 'Done';
    done.component = this;
    done.addEventListener('click', () => {
      this.update();
      document.getElementById('skill-form').removeChild(this.form);
      // Check if parent is null. Should not happen, but just in case
      assertMatches(
        notNull,
        () => {
          debug.logIfAllowed(debug.levels.ERROR, 'Parent or parent html is null');
        },
        this.parent,
        this.parent.html,
      );
      // Delete the element for this component in the builder
      const componentElement = Array.from(this.parent.html.children).find(
        (child) => child.comp === this,
      );
      const insertIndex = Array.from(this.parent.html.children).indexOf(componentElement);
      this.parent.html.removeChild(componentElement);
      // Generate a new one
      this.createBuilderHTML(this.parent.html, insertIndex);
      debug.logIfAllowed(debug.levels.INFO, 'insertIndex: ', insertIndex);
      showSkillPage('builder');
    });
    form.appendChild(done);

    const handleContextMenu = (e) => {
      if (form.parentNode === e.currentTarget) {
        e.preventDefault();
        const lastVisitedForm = appData.get('last-visited-form');
        if (['trigger-chooser', 'component-chooser'].includes(lastVisitedForm)) {
          // Remove the newly added component
          this.removeFunction();
          debug.logIfAllowed(
            debug.levels.VERBOSE,
            `Removed ${this.type} component ${this.name} because it was cancelled`,
          );
          // Go back to the chooser
          showSkillPage(lastVisitedForm);
        } else {
          done.dispatchEvent(new Event('click'));
        }
      } else {
        target.removeEventListener('contextmenu', handleContextMenu);
        debug.logIfAllowed(
          debug.levels.VERBOSE,
          `Removed context menu listener on skill-form for ${this.type} component ${this.name}`,
        );
      }
    };
    target.addEventListener('contextmenu', handleContextMenu);

    createSettingButtons(this, form);

    this.form = form;

    // Reset skill form
    target.innerHTML = '';
    target.appendChild(form);
    setActiveComponent(this);

    for (let i = index; i < this.data.length; i++) {
      this.data[i].applyRequireValues();
    }
  }

  /**
   * Check every input, and hide unused inputs.
   * Hidden inputs will not get exported to the save file.
   *
   * This is specifically used for saving purposes.
   */
  createFormHTMLNoDom() {
    currentComponentInputs.clear();

    // data[0] is icon key
    if (this.data.length > 1) {
      // If has AttributeValue, will add Icon Key
      const index = this.data.some((input) => input instanceof AttributeValue) ? 0 : 1;

      // Initialize inputs
      for (let i = index; i < this.data.length; i++) {
        const input = this.data[i];
        input.hidden = false;
        // Note: We are adding a copy of the input to the map so that less side effects happen.
        currentComponentInputs.set(input.key, input.dupe());
      }
      const hasAttribValue = this.data.some((input) => input instanceof AttributeValue);
      if (!hasAttribValue) {
        this.data[0].hidden = true;
      }

      for (let i = index; i < this.data.length; i++) {
        this.data[i].applyRequireValuesNoDom();
      }
    }
  }

  /**
   * Updates the component using the form data if it exists
   */
  update() {
    this.comment.update();
    for (let j = 0; j < this.data.length; j++) {
      this.data[j].update();
    }
  }

  /**
   * Gets the save string for the component
   *
   * @param {string} spacing - spacing to put before the data
   */
  getSaveString(spacing) {
    this.createFormHTMLNoDom();

    // Append an id to the component name that is unique in the scope of the skill
    let id = '';
    let index = saveIndex;
    while (index > 0 || id.length === 0) {
      id += String.fromCharCode((index % 26) + 97);
      index = Math.floor(index / 26);
    }
    let result = `${spacing + this.name}-${id}:\n`;
    saveIndex++;
    // Component type: trigger, target, condition, mechanic
    result += `${spacing}  type: '${this.type}'\n`;
    // Comment
    result += `${this.comment.getSaveString(`${spacing}  `)}`;
    // Component data
    if (this.data.length > 0) {
      result += `${spacing}  data:\n`;
      // Append inputs that are not hidden
      for (let i = 0; i < this.data.length; i++) {
        const input = this.data[i];
        if (!input.hidden) {
          result += input.getSaveString(`${spacing}    `);
        }
      }
    }
    // Child components
    if (this.components.length > 0) {
      result += `${spacing}  children:\n`;
      for (let j = 0; j < this.components.length; j++) {
        result += this.components[j].getSaveString(`${spacing}    `);
      }
    }
    return result;
  }
}

class CustomComponent extends Component {
  constructor(data) {
    super(data.display, data.type.toLowerCase(), data.container);
    this.description = data.description;

    for (let i = 0; i < data.options.length; i++) {
      const option = data.options[i];
      switch (option.type) {
        case 'NUMBER':
          this.data.push(
            new AttributeValue(option.display, option.key, option.base, option.scale).setTooltip(
              option.description,
            ),
          );
          break;
        case 'TEXT':
          this.data.push(
            new StringValue(option.display, option.key, option.default).setTooltip(
              option.description,
            ),
          );
          break;
        case 'DROPDOWN':
          this.data.push(
            new ListValue(option.display, option.key, option.options, option.options[0]).setTooltip(
              option.description,
            ),
          );
          break;
        case 'LIST':
          this.data.push(
            new MultiListValue(option.display, option.key, option.options, []).setTooltip(
              option.description,
            ),
          );
          break;
        default:
          throw new Error(`Invalid component with key ${data.key}`);
      }
    }
  }
}

setActiveComponent = (value) => {
  if (activeComponent instanceof Component) {
    activeComponent.selfElement.classList.remove('active-component');
  }
  if (value instanceof Component) {
    value.selfElement.classList.add('active-component');
  }

  activeComponent = value;
};
const _setActiveComponent = (value) => setActiveComponent(value);

// Inject dependencies
diContainer.inject('showSkillPage').then((value) => {
  showSkillPage = value;
});
diContainer.inject('Skill').then((value) => {
  Skill = value;
});
diContainer.inject('loadSection').then((value) => {
  loadSection = value;
  Component.prototype.load = loadSection;
});
diContainer.inject('getCurrentForm').then((value) => {
  getCurrentForm = value;
});

// Register dependencies
diContainer.register('getActiveComponent', getActiveComponent);

export {
  createSettingButton,
  setSaveIndex,
  getSaveIndex,
  Component,
  CustomComponent,
  getActiveComponent,
  _setActiveComponent as setActiveComponent,
  contains,
  Type,
};
