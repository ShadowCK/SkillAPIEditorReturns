/* eslint-disable max-classes-per-file */

import { filterInt, filterDouble } from './filter.js';

/** @type {Map.<string, FormInput>} */
const currentComponentInputs = new Map(); // Not necessary - can use component.data instead

/**
 * Does the check when an input is updated or initialized to
 * determine the visibility for those requiring certain values.
 *
 * @param {HTMLElement} htmlElement - The HTML element that contains the requireLists property.
 */
const checkRequireValue = (htmlElement) => {
  for (let i = 0; i < htmlElement.requireLists.length; i++) {
    const requireData = htmlElement.requireLists[i];
    let visible = false;
    for (let j = 0; j < requireData.values.length; j++) {
      if (requireData.values[j] === (htmlElement.value || htmlElement.selectedIndex)) {
        visible = true;
        break;
      }
    }
    if (visible) {
      requireData.input.show();
    } else {
      requireData.input.hide();
    }
  }
};

/**
 * Does the check when an input is updated or initialized to
 * determine the visibility for those requiring certain values.
 *
 * This is specifically used for saving purposes.
 *
 * @param {FormInput} input - The FormInput that contains the requireLists property.
 */
const checkRequireValueNoDom = (input) => {
  input.requireLists.forEach((requireData) => {
    const visible = requireData.values.includes(input.value);
    requireData.input.hidden = !visible;
  });
};

class FormInput {
  name;

  key;

  hidden;

  HTMLClasses = [];

  addHTMLClasses(...tags) {
    this.HTMLClasses.push(...tags);
    return this;
  }

  /**
   * Requires one of the given values to be active for the
   * value with the given key for this input to be visible.
   * (this is to be set to each input type as a function)
   *
   * @param {string} key    - the value key of the required value input
   * @param {Array}  values - the list of values that result in this being visible
   */
  requireValue(key, values) {
    this.requirements = this.requirements || [];
    this.requirements.push({ key, values });
    return this;
  }

  /**
   * Applies the values required from above
   */
  applyRequireValues() {
    for (let i = 0; this.requirements && i < this.requirements.length; i++) {
      const { key, values } = this.requirements[i];
      /** The HTMLElement of the required input */
      const required = document.getElementById(key);
      if (required != null) {
        // It's acceptable to add data to the element
        // as we are not adding extra data to the input.
        required.requireLists = required.requireLists || [];
        required.requireLists.push({ input: this, values });
        checkRequireValue(required);
        if (!required.hasCheckRequireValueListener) {
          required.hasCheckRequireValueListener = true;
          required.addEventListener('change', () => {
            checkRequireValue(required);
          });
        }
      }
    }
  }

  /**
   * This is specifically used for saving purposes.
   */
  applyRequireValuesNoDom() {
    if (this.requirements) {
      this.requirements.forEach(({ key, values }) => {
        /** A duplicate of the required input */
        const required = currentComponentInputs.get(key);
        if (required != null) {
          // We are not mutating the original input, which is good!
          required.requireLists = required.requireLists || [];
          required.requireLists.push({ input: this, values });
          checkRequireValueNoDom(required);
        }
      });
    }
  }

  /**
   * Sets the tooltip of the input label to show a description of the value
   *
   * @param {string} text - the text to display in the tooltip
   */
  setTooltip(text) {
    if (text.charAt(0) === '[') {
      this.tooltip = text;
    } else {
      this.tooltip = `[${this.key}] ${text}`;
    }
    return this;
  }

  /* eslint-disable */
  dupe() {
    throw new Error('Method "dupe" must be implemented.');
  }

  /**
   * Creates the form HTML for the value and appends
   * it to the target element
   *
   * @param {Element} target - the HTML element to append to
   */
  createHTML(target) {
    throw new Error('Method "createHTML" must be implemented.');
  }

  /**
   * Hides the HTML elements of the value
   */
  hide() {
    throw new Error('Method "hide" must be implemented.');
  }

  /**
   * Shows the HTML elements of the value
   */
  show() {
    throw new Error('Method "show" must be implemented.');
  }

  /**
   * Updates the current value using the HTML elements
   */
  update() {
    throw new Error('Method "update" must be implemented.');
  }

  /**
   * Retrieves the save string for the value
   *
   * @param {string} spacing - the spacing to go before the value
   */
  getSaveString(spacing) {
    throw new Error('Method "getSaveString" must be implemented.');
  }

  hasValidValueForInputLabel() {
    throw new Error('Method "hasValidValueForInputLabel" must be implemented.');
  }

  getValueForInputLabel() {
    throw new Error('Method "getValueForInputLabel" must be implemented.');
  }

  bindWithElements(...htmlElements) {
    htmlElements.forEach((element) => {
      element.input = this;
    });
    this.elements = htmlElements;
  }

  /* eslint-enable */
}

/**
 * Represents a defined list of options for a value
 * that is stored as an index instead of the names of
 * the values themselves.
 *
 * @param {string} name  - the display name of the value
 * @param {string} key   - the config key for the value
 * @param {Array}  list  - the list of available options
 * @param {Number} index - the current selected index
 */
class IndexListValue extends FormInput {
  constructor(name, key, list, index) {
    super();
    this.name = name;
    this.key = key;
    this.list = list;
    this.index = index;
    this.defaultValue = index;

    this.label = undefined;
    this.select = undefined;
    this.hidden = false;
  }

  dupe() {
    return new IndexListValue(this.name, this.key, this.list, this.index)
      .setTooltip(this.tooltip)
      .addHTMLClasses(...this.HTMLClasses);
  }

  /**
   * Creates the form HTML for the value and appends
   * it to the target element
   *
   * @param {Element} target - the HTML element to append to
   */
  createHTML(target) {
    this.label = document.createElement('label');
    this.label.textContent = this.name;
    if (this.tooltip) {
      this.label.dataset.tooltip = this.tooltip;
      this.label.className = 'tooltip';
    }
    target.appendChild(this.label);

    this.select = document.createElement('select');
    this.select.id = this.key;
    for (let i = 0; i < this.list.length; i++) {
      const option = document.createElement('option');
      option.text = this.list[i];
      this.select.add(option);
    }
    this.select.selectedIndex = this.index;
    target.appendChild(this.select);

    this.bindWithElements(this.select);
  }

  /**
   * Hides the HTML elements of the value
   */
  hide() {
    if (this.label && this.select && !this.hidden) {
      this.hidden = true;
      this.label.style.display = 'none';
      this.select.style.display = 'none';
    }
  }

  /**
   * Shows the HTML elements of the value
   */
  show() {
    if (this.label && this.select && this.hidden) {
      this.hidden = false;
      this.label.style.display = 'block';
      this.select.style.display = 'block';
    }
  }

  /**
   * Updates the current index of the value using the HTML elements
   */
  update() {
    if (this.select) {
      this.index = this.select.selectedIndex;
    }
  }

  /**
   * Retrieves the save string for the value
   *
   * @param {string} spacing - the spacing to go before the value
   */
  getSaveString(spacing) {
    return `${spacing}${this.key}: ${this.index}\n`;
  }

  /**
   * Loads a config value
   *
   * @param {integer} value - config int value
   */
  load(value) {
    this.index = value;
  }

  hasValidValueForInputLabel() {
    return this.index >= 0 && this.index < this.list.length;
  }

  getValueForInputLabel() {
    return this.list[this.index];
  }
}

/**
 * Represents a defined list of options for a value
 *
 * @param {string} name  - the display name of the value
 * @param {string} key   - the config key for the value
 * @param {string[]}  list  - the list of available options
 * @param {string} value - the current selected value
 */
class ListValue extends FormInput {
  constructor(name, key, list, value) {
    super();
    this.name = name;
    this.key = key;
    this.list = list;
    this.value = value;
    this.defaultValue = value;

    this.label = undefined;
    this.select = undefined;
    this.hidden = false;
  }

  dupe() {
    return new ListValue(this.name, this.key, this.list, this.value)
      .setTooltip(this.tooltip)
      .addHTMLClasses(...this.HTMLClasses);
  }

  /**
   * Creates the form HTML for the value and appends
   * it to the target element
   *
   * @param {Element} target - the HTML element to append to
   */
  createHTML(target) {
    this.label = document.createElement('label');
    this.label.textContent = this.name;
    if (this.tooltip) {
      this.label.dataset.tooltip = this.tooltip;
      this.label.className = 'tooltip';
    }
    target.appendChild(this.label);

    this.select = document.createElement('select');
    this.select.classList.add(...this.HTMLClasses);
    this.select.id = this.key;
    let selected = -1;

    const vLower = this.value.toLowerCase().replace('_', ' ');
    const list = typeof this.list === 'function' ? this.list() : this.list;
    for (let i = 0; i < list.length; i++) {
      const option = document.createElement('option');
      option.text = list[i];
      this.select.add(option);

      const lower = list[i].toLowerCase().replace('_', ' ');
      if (lower === vLower || (selected === -1 && list[i] === 'None')) {
        selected = i;
      }
    }
    this.select.selectedIndex = Math.max(0, selected);
    target.appendChild(this.select);

    this.bindWithElements(this.select);
  }

  /**
   * Hides the HTML elements of the value
   */
  hide() {
    if (this.label && this.select && !this.hidden) {
      this.hidden = true;
      this.label.style.display = 'none';
      this.select.style.display = 'none';
    }
  }

  /**
   * Shows the HTML elements of the value
   */
  show() {
    if (this.label && this.select && this.hidden) {
      this.hidden = false;
      this.label.style.display = 'block';
      this.select.style.display = 'block';
    }
  }

  /**
   * Updates the current value using the HTML elements
   */
  update() {
    if (this.select) {
      this.value = this.select[this.select.selectedIndex].text;
      if (this.value === 'None') {
        this.value = '';
      }
    }
  }

  /**
   * Retrieves the save string for the value
   *
   * @param {string} spacing - the spacing to go before the value
   */
  getSaveString(spacing) {
    return `${spacing}${this.key}: '${this.value}'\n`;
  }

  /**
   * Loads a config value
   *
   * @param {string} value - config string value
   */
  load(value) {
    this.value = value;
  }

  hasValidValueForInputLabel() {
    const list = typeof this.list === 'function' ? this.list() : this.list;
    return list.includes(this.value);
  }

  getValueForInputLabel() {
    return this.value;
  }
}

/**
 * Represents a scaling double value
 *
 * @param {string} name  - the display name of the value
 * @param {string} key   - the config key of the value
 * @param {Number} base  - the current starting value
 * @param {Number} scale - the current scale of the value
 */
class AttributeValue extends FormInput {
  constructor(name, key, base, scale) {
    super();
    this.name = name;
    this.key = key;
    this.base = base;
    this.scale = scale;
    this.defaultValue = { base, scale };

    this.label = undefined;
    this.left = undefined;
    this.right = undefined;
    this.baseBox = undefined;
    this.scaleBox = undefined;
    this.hidden = false;
  }

  dupe() {
    return new AttributeValue(this.name, this.key, this.base, this.scale)
      .setTooltip(this.tooltip)
      .addHTMLClasses(...this.HTMLClasses);
  }

  /**
   * Creates the form HTML for the value and appends
   * it to the target element
   *
   * @param {Element} target - the HTML element to append to
   */
  createHTML(target) {
    this.label = document.createElement('label');
    this.label.textContent = this.name;
    if (this.tooltip) {
      this.label.dataset.tooltip = this.tooltip;
      this.label.className = 'tooltip';
    }
    target.appendChild(this.label);

    this.baseBox = document.createElement('input');
    this.baseBox.classList.add(...this.HTMLClasses);
    this.baseBox.id = `${this.key}-base`;
    this.baseBox.value = this.base;
    this.baseBox.className = 'base';
    target.appendChild(this.baseBox);

    this.left = document.createElement('label');
    this.left.textContent = '+ (';
    this.left.className = 'attr-label';
    target.appendChild(this.left);

    this.scaleBox = document.createElement('input');
    this.scaleBox.classList.add(...this.HTMLClasses);
    this.scaleBox.id = `${this.key}-scale`;
    this.scaleBox.value = this.scale;
    this.scaleBox.className = 'scale';
    target.appendChild(this.scaleBox);

    this.right = document.createElement('label');
    this.right.textContent = ')';
    this.right.className = 'attr-label';
    target.appendChild(this.right);

    this.bindWithElements(this.baseBox, this.scaleBox);
  }

  /**
   * Hides the HTML elements of the value
   */
  hide() {
    if (this.label && this.baseBox && this.scaleBox && this.left && this.right && !this.hidden) {
      this.hidden = true;
      this.label.style.display = 'none';
      this.baseBox.style.display = 'none';
      this.left.style.display = 'none';
      this.scaleBox.style.display = 'none';
      this.right.style.display = 'none';
    }
  }

  /**
   * Shows the HTML elements of the value
   */
  show() {
    if (this.label && this.baseBox && this.scaleBox && this.left && this.right && this.hidden) {
      this.hidden = false;
      this.label.style.display = 'block';
      this.baseBox.style.display = 'block';
      this.left.style.display = 'block';
      this.scaleBox.style.display = 'block';
      this.right.style.display = 'block';
    }
  }

  /**
   * Updates the current values using the HTML elements
   */
  update() {
    if (this.baseBox && this.scaleBox) {
      this.base = this.baseBox.value;
      this.scale = this.scaleBox.value;
    }
  }

  /**
   * Retrieves the save string for the value
   *
   * @param {string} spacing - the spacing to go before the value
   */
  getSaveString(spacing) {
    return `${spacing}${this.key}-base: ${this.base}\n${spacing}${this.key}-scale: ${this.scale}\n`;
  }

  /**
   * Loads a config value
   *
   * @param {float} value - config double value
   */
  loadBase(value) {
    this.base = value;
  }

  /**
   * Loads a config value
   *
   * @param {float} value - config double value
   */
  loadScale(value) {
    this.scale = value;
  }

  hasValidValueForInputLabel() {
    return this.base != null && this.scale != null;
  }

  getValueForInputLabel() {
    const formatValue = (value, forceFixed = false, plusSign = true) => {
      const valueNum = Number(value);
      if (Number.isNaN(valueNum) || valueNum === 0 || forceFixed) {
        return `<span class="fixed-value">${value}</span>`;
      }
      return value > 0
        ? `<span class="positive-value">${plusSign ? '+' : ''}${value}</span>`
        : `<span class="negative-value">${value}</span>`;
    };

    if (this.scale !== 0 && this.scale !== '0') {
      return `${formatValue(this.base, false, false)}${formatValue(this.scale)}`;
    }
    return formatValue(this.base, true);
  }
}

/**
 * Represents a fixed double value
 *
 * @param {string} name  - the display name of the value
 * @param {string} key   - the config key of the value
 * @param {Number} value - the current value
 */
class DoubleValue extends FormInput {
  constructor(name, key, value) {
    super();
    this.name = name;
    this.key = key;
    this.value = value;
    this.defaultValue = value;

    this.label = undefined;
    this.box = undefined;
    this.hidden = false;
  }

  dupe() {
    return new DoubleValue(this.name, this.key, this.value)
      .setTooltip(this.tooltip)
      .addHTMLClasses(...this.HTMLClasses);
  }

  /**
   * Creates the form HTML for the value and appends
   * it to the target element
   *
   * @param {Element} target - the HTML element to append to
   */
  createHTML(target) {
    this.label = document.createElement('label');
    this.label.textContent = this.name;
    if (this.tooltip) {
      this.label.dataset.tooltip = this.tooltip;
      this.label.className = 'tooltip';
    }
    target.appendChild(this.label);

    this.box = document.createElement('input');
    this.box.classList.add(...this.HTMLClasses);
    this.box.id = this.key;
    this.box.value = this.value;
    this.box.addEventListener('input', filterDouble);
    target.appendChild(this.box);

    this.bindWithElements(this.box);
  }

  /**
   * Hides the HTML elements of the value
   */
  hide() {
    if (this.label && this.box && !this.hidden) {
      this.hidden = true;
      this.label.style.display = 'none';
      this.box.style.display = 'none';
    }
  }

  /**
   * Shows the HTML elements of the value
   */
  show() {
    if (this.label && this.box && this.hidden) {
      this.hidden = false;
      this.label.style.display = 'block';
      this.box.style.display = 'block';
    }
  }

  /**
   * Updates the current value using the HTML elements
   */
  update() {
    if (this.box) {
      this.value = Number(this.box.value);
    }
  }

  /**
   * Retrieves the save string for the value
   *
   * @param {string} spacing - the spacing to go before the value
   */
  getSaveString(spacing) {
    return `${spacing}${this.key}: ${this.value}\n`;
  }

  /**
   * Loads a config value
   *
   * @param {float} value - config double value
   */
  load(value) {
    this.value = value;
  }

  hasValidValueForInputLabel() {
    return this.value != null;
  }

  getValueForInputLabel() {
    return this.value;
  }
}

/**
 * Represents a fixed integer value
 *
 * @param {string} name  - the display name of the value
 * @param {string} key   - the config key of the value
 * @param {Number} value - the current value
 */
class IntValue extends FormInput {
  constructor(name, key, value) {
    super();
    this.name = name;
    this.key = key;
    this.value = value;
    this.defaultValue = value;

    this.label = undefined;
    this.box = undefined;
    this.hidden = false;
  }

  dupe() {
    return new IntValue(this.name, this.key, this.value)
      .setTooltip(this.tooltip)
      .addHTMLClasses(...this.HTMLClasses);
  }

  /**
   * Creates the form HTML for the value and appends
   * it to the target element
   *
   * @param {Element} target - the HTML element to append to
   */
  createHTML(target) {
    this.label = document.createElement('label');
    this.label.textContent = this.name;
    if (this.tooltip) {
      this.label.dataset.tooltip = this.tooltip;
      this.label.className = 'tooltip';
    }
    target.appendChild(this.label);

    this.box = document.createElement('input');
    this.box.classList.add(...this.HTMLClasses);
    this.box.id = this.key;
    this.box.value = this.value;
    this.box.addEventListener('input', filterInt);
    target.appendChild(this.box);

    this.bindWithElements(this.box);
  }

  /**
   * Hides the HTML elements of the value
   */
  hide() {
    if (this.label && this.box && !this.hidden) {
      this.hidden = true;
      this.label.style.display = 'none';
      this.box.style.display = 'none';
    }
  }

  /**
   * Shows the HTML elements of the value
   */
  show() {
    if (this.label && this.box && this.hidden) {
      this.hidden = false;
      this.label.style.display = 'block';
      this.box.style.display = 'block';
    }
  }

  /**
   * Updates the current value using the HTML elements
   */
  update() {
    if (this.box) {
      this.value = Number(this.box.value);
    }
  }

  /**
   * Retrieves the save string for the value
   *
   * @param {string} spacing - the spacing to go before the value
   */
  getSaveString(spacing) {
    return `${spacing}${this.key}: ${this.value}\n`;
  }

  /**
   * Loads a config value
   *
   * @param {integer} value - config int value
   */
  load(value) {
    this.value = value;
  }

  hasValidValueForInputLabel() {
    return this.value != null;
  }

  getValueForInputLabel() {
    return this.value;
  }
}

/**
 * Represents a fixed string value
 *
 * @param {string} name  - the display name of the value
 * @param {string} key   - the config key of the value
 * @param {string} value - the current value
 */
class StringValue extends FormInput {
  constructor(name, key, value) {
    super();
    this.name = name;
    this.key = key;
    this.value = value;
    this.defaultValue = value;

    this.label = undefined;
    this.box = undefined;
    this.hidden = false;
  }

  dupe() {
    return new StringValue(this.name, this.key, this.value)
      .setTooltip(this.tooltip)
      .addHTMLClasses(...this.HTMLClasses);
  }

  /**
   * Creates the form HTML for the value and appends
   * it to the target element
   *
   * @param {Element} target - the HTML element to append to
   */
  createHTML(target) {
    this.label = document.createElement('label');
    this.label.textContent = this.name;
    if (this.tooltip) {
      this.label.dataset.tooltip = this.tooltip;
      this.label.className = 'tooltip';
    }
    target.appendChild(this.label);

    this.box = document.createElement('input');
    this.box.classList.add(...this.HTMLClasses);
    this.box.id = this.key;
    this.box.value = this.value;
    target.appendChild(this.box);

    this.bindWithElements(this.box);
  }

  /**
   * Hides the HTML elements of the value
   */
  hide() {
    if (this.label && this.box && !this.hidden) {
      this.hidden = true;
      this.label.style.display = 'none';
      this.box.style.display = 'none';
    }
  }

  /**
   * Shows the HTML elements of the value
   */
  show() {
    if (this.label && this.box && this.hidden) {
      this.hidden = false;
      this.label.style.display = 'block';
      this.box.style.display = 'block';
    }
  }

  /**
   * Updates the current value using the HTML elements
   */
  update() {
    if (this.box) {
      this.value = this.box.value;
    }
  }

  /**
   * Retrieves the save string for the value
   *
   * @param {string} spacing - the spacing to go before the value
   */
  getSaveString(spacing) {
    let enclosing = "'";
    if (this.value.indexOf("'") >= 0) {
      if (this.value.indexOf('"') >= 0) {
        this.value = this.value.replace("'", '');
      } else {
        enclosing = '"';
      }
    }
    return `${spacing}${this.key}: ${enclosing}${this.value}${enclosing}\n`;
  }

  /**
   * Loads a config value
   *
   * @param {string} value - config string value
   */
  load(value) {
    this.value = value;
  }

  hasValidValueForInputLabel() {
    return this.value != null;
  }

  getValueForInputLabel() {
    return this.value;
  }
}

/**
 * Represents a fixed string value
 *
 * @param {string} name  - the display name of the value
 * @param {string} key   - the config key of the value
 * @param {Array}  value - the current value
 */
class StringListValue extends FormInput {
  constructor(name, key, value) {
    super();
    this.name = name;
    this.key = key;
    this.value = value;
    this.defaultValue = value;

    this.label = undefined;
    this.box = undefined;
    this.hidden = false;
  }

  dupe() {
    return new StringListValue(this.name, this.key, this.value)
      .setTooltip(this.tooltip)
      .addHTMLClasses(...this.HTMLClasses);
  }

  /**
   * Creates the form HTML for the value and appends
   * it to the target element
   *
   * @param {Element} target - the HTML element to append to
   */
  createHTML(target) {
    this.label = document.createElement('label');
    this.label.textContent = this.name;
    this.label.className = 'area-label';
    if (this.tooltip) {
      this.label.dataset.tooltip = this.tooltip;
      this.label.className = 'tooltip';
    }
    target.appendChild(this.label);

    let content = '';
    for (let i = 0; i < this.value.length; i++) {
      content += this.value[i];
      if (i !== this.value.length - 1) {
        content += '\n';
      }
    }

    this.box = document.createElement('textarea');
    this.box.classList.add(...this.HTMLClasses);
    this.box.id = this.key;
    this.box.value = content;
    target.appendChild(this.box);

    this.bindWithElements(this.box);
  }

  /**
   * Hides the HTML elements of the value
   */
  hide() {
    if (this.label && this.box && !this.hidden) {
      this.hidden = true;
      this.label.style.display = 'none';
      this.box.style.display = 'none';
    }
  }

  /**
   * Shows the HTML elements of the value
   */
  show() {
    if (this.label && this.box && this.hidden) {
      this.hidden = false;
      this.label.style.display = 'block';
      this.box.style.display = 'block';
    }
  }

  /**
   * Updates the current value using the HTML elements
   */
  update() {
    if (this.box) {
      // Will not create [''] for an empty string value, but an empty array [] instead.
      this.value = this.box.value !== '' ? this.box.value.split('\n') : [];
    }
  }

  /**
   * Retrieves the save string for the value
   *
   * @param {string} spacing - the spacing to go before the value
   */
  getSaveString(spacing) {
    let result = `${spacing}${this.key}:\n`;
    // Will not add a - '' line if the array only contains an empty string
    if (this.value.length === 1 && this.value[1] === '') {
      return result;
    }

    for (let i = 0; i < this.value.length; i++) {
      let enclosing = "'";
      if (this.value[i].indexOf("'") >= 0) {
        if (this.value[i].indexOf('"') >= 0) {
          this.value[i] = this.value[i].replace("'", '');
        } else {
          enclosing = '"';
        }
      }
      result += `${spacing}- ${enclosing}${this.value[i]}${enclosing}\n`;
    }
    return result;
  }

  /**
   * Loads a config value
   *
   * @param {Array} value - config string list value
   */
  load(value) {
    this.value = value;
  }

  hasValidValueForInputLabel() {
    return (
      this.value != null &&
      (this.value.length > 1 || (this.value.length === 1 && this.value[0] !== ''))
    );
  }

  getValueForInputLabel() {
    return this.value;
  }
}

/**
 * Represents a defined list of options for a value
 *
 * @param {string} name  - the display name of the value
 * @param {string} key   - the config key for the value
 * @param {Array|function}  list  - the list of available options
 * @param {Array} [values] - the default values to include
 */
class MultiListValue extends FormInput {
  constructor(name, key, list, values) {
    super();
    this.name = name;
    this.key = key;
    this.list = list;
    this.values = values || [];
    this.defaultValue = this.values;

    this.label = undefined;
    this.select = undefined;
    this.valueContainer = undefined;
    this.div = undefined;
    this.hidden = false;
  }

  dupe() {
    return new MultiListValue(this.name, this.key, this.list, this.values)
      .setTooltip(this.tooltip)
      .addHTMLClasses(...this.HTMLClasses);
  }

  /**
   * Creates the form HTML for the value and appends
   * it to the target element
   *
   * @param {Element} target - the HTML element to append to
   */
  createHTML(target) {
    this.label = document.createElement('label');
    this.label.textContent = this.name;
    if (this.tooltip) {
      this.label.dataset.tooltip = this.tooltip;
      this.label.className = 'tooltip';
    }
    target.appendChild(this.label);

    const select = document.createElement('select');
    this.select = select;
    select.classList.add(...this.HTMLClasses);
    select.id = this.key;

    let option = document.createElement('option');
    option.text = '- Select -';
    select.add(option);
    const list = typeof this.list === 'function' ? this.list() : this.list;
    for (let i = 0; i < list.length; i++) {
      option = document.createElement('option');
      option.text = list[i];
      select.add(option);
    }
    select.selectedIndex = 0;
    select.addEventListener('change', () => {
      if (select.selectedIndex !== 0) {
        const val = select[select.selectedIndex].text;
        // this.values.add(val);
        this.populate(val);
        select.selectedIndex = 0;
      }
    });
    target.appendChild(this.select);

    this.help = document.createElement('label');
    this.help.textContent = '- Click to remove -';
    this.help.className = 'grayed';
    target.appendChild(this.help);

    this.div = document.createElement('div');
    this.div.className = 'byte-list';
    target.appendChild(this.div);

    for (let i = 0; i < this.values.length; i++) {
      this.populate(this.values[i]);
    }

    this.bindWithElements(this.select);
  }

  populate(value) {
    const entry = document.createElement('div');
    entry.className = 'multi-list';
    entry.textContent = value;
    entry.addEventListener('click', () => {
      entry.parentNode.removeChild(entry);
    });
    this.div.appendChild(entry);
  }

  /**
   * Hides the HTML elements of the value
   */
  hide() {
    if (this.label && this.select && !this.hidden) {
      this.hidden = true;
      this.label.style.display = 'none';
      this.select.style.display = 'none';
      this.div.style.display = 'none';
    }
  }

  /**
   * Shows the HTML elements of the value
   */
  show() {
    if (this.label && this.select && this.hidden) {
      this.hidden = false;
      this.label.style.display = 'block';
      this.select.style.display = 'block';
      this.div.style.display = 'block';
    }
  }

  /**
   * Updates the current value using the HTML elements
   */
  update() {
    this.values = [];
    for (let entry = this.div.firstChild; entry !== null; entry = entry.nextSibling) {
      this.values.push(entry.textContent);
    }
  }

  /**
   * Retrieves the save string for the value
   *
   * @param {string} spacing - the spacing to go before the value
   */
  getSaveString(spacing) {
    let result = `${spacing}${this.key}:\n`;
    for (let i = 0; i < this.values.length; i++) {
      let enclosing = "'";
      if (this.values[i].indexOf("'") >= 0) {
        if (this.values[i].indexOf('"') >= 0) {
          this.values[i] = this.values[i].replace("'", '');
        } else {
          enclosing = '"';
        }
      }
      result += `${spacing}- ${enclosing}${this.values[i]}${enclosing}\n`;
    }
    return result;
  }

  /**
   * Loads a config value
   *
   * @param {Array} value - config array value
   */
  load(value) {
    this.values = value;
  }

  hasValidValueForInputLabel() {
    return (
      this.values != null &&
      (this.values.length > 1 || (this.values.length === 1 && this.values[0] !== ''))
    );
  }

  getValueForInputLabel() {
    return this.values;
  }
}

/**
 * Represents a byte-represented list of options
 *
 * @param {string} name   - the display name of the value
 * @param {string} key    - the config key of the value
 * @param {Array}  values - the list of names for the values
 * @param {number} value  - the current value
 */
class ByteListValue extends FormInput {
  constructor(name, key, values, value) {
    super();
    this.name = name;
    this.key = key;
    this.value = value;
    this.values = values;
    this.defaultValue = { value, values };

    this.label = undefined;
    this.div = undefined;
    this.hidden = false;
  }

  dupe() {
    return new ByteListValue(this.name, this.key, this.values, this.value)
      .setTooltip(this.tooltip)
      .addHTMLClasses(...this.HTMLClasses);
  }

  /**
   * Creates the form HTML for the value and appends
   * it to the target element
   *
   * @param {Element} target - the HTML element to append to
   */
  createHTML(target) {
    this.label = document.createElement('label');
    this.label.textContent = this.name;
    this.label.className = 'area-label';
    if (this.tooltip) {
      this.label.dataset.tooltip = this.tooltip;
      this.label.className = 'tooltip';
    }
    target.appendChild(this.label);

    // Add div elements
    this.checkboxes = [];
    this.div = document.createElement('div');
    this.div.className = 'byte-list';
    this.div.classList.add(...this.HTMLClasses);
    let html = '';
    for (let i = 0; i < this.values.length; i++) {
      const id = `${this.key}-${this.values[i].replace(' ', '-').toLowerCase()}`;
      // eslint-disable-next-line no-bitwise
      const checked = this.value & (1 << i) ? ' checked' : '';
      html += `<input type="checkbox" name="byte${i}" id="${id}"${checked}>${this.values[i]}<br>`;
    }
    this.div.innerHTML = html;
    for (let i = 0; i < this.div.childNodes.length; i += 3) {
      this.checkboxes[i / 3] = this.div.childNodes[i];
    }
    target.appendChild(this.div);
  }

  /**
   * Hides the HTML elements of the value
   */
  hide() {
    if (this.label && this.div && !this.hidden) {
      this.hidden = true;
      this.label.style.display = 'none';
      this.div.style.display = 'none';
    }
  }

  /**
   * Shows the HTML elements of the value
   */
  show() {
    if (this.label && this.div && this.hidden) {
      this.hidden = false;
      this.label.style.display = 'block';
      this.div.style.display = 'block';
    }
  }

  /**
   * Updates the current value using the HTML elements
   */
  update() {
    if (this.div) {
      this.value = 0;
      for (let i = 0; i < this.checkboxes.length; i++) {
        if (this.checkboxes[i].checked) {
          // eslint-disable-next-line no-bitwise
          this.value += 1 << i;
        }
      }
    }
  }

  /**
   * Retrieves the save string for the value
   *
   * @param {string} spacing - the spacing to go before the value
   */
  getSaveString(spacing) {
    const result = `${spacing}${this.key}: ${this.value}\n`;
    return result;
  }

  /**
   * Loads a config value
   *
   * @param {Array} value - config string list value
   */
  load(value) {
    this.value = value;
  }

  hasValidValueForInputLabel() {
    return this.value != null;
  }

  getValueForInputLabel() {
    return this.value;
  }
}

const copyRequirements = (source, target) => {
  if (source.requirements) {
    target.requirements = source.requirements;
  }
  return target;
};

const isAttribute = (input) => input instanceof AttributeValue || input.key === 'incompatible';

export {
  currentComponentInputs,
  FormInput,
  IndexListValue,
  ListValue,
  AttributeValue,
  DoubleValue,
  IntValue,
  StringValue,
  StringListValue,
  MultiListValue,
  ByteListValue,
  copyRequirements,
  isAttribute,
};
