/* eslint-disable max-classes-per-file */

/**
 * Requires one of the given values to be active for the
 * value with the given key for this input to be visible.
 * (this is to be set to each input type as a function)
 *
 * @param {string} key    - the value key of the required value input
 * @param {Array}  values - the list of values that result in this being visible
 */
function requireValue(key, values) {
  this.requirements = this.requirements || [];
  this.requirements.push({ key, values });
  return this;
}

function copyRequirements(source, target) {
  if (source.requirements) {
    target.requirements = source.requirements;
  }
  return target;
}

/**
 * Does the check when an input is updated to determine
 * the visibility for those requiring certain values.
 *
 * @param {Object} e - event data
 */
function checkRequireValue(e) {
  for (let i = 0; i < this.requireLists.length; i++) {
    const requireData = this.requireLists[i];
    let visible = false;
    for (let j = 0; j < requireData.values.length; j++) {
      if (requireData.values[j] === (this.value || this.selectedIndex)) {
        visible = true;
      }
    }
    if (visible) {
      requireData.element.show();
    } else {
      requireData.element.hide();
    }
  }
}

/**
 * Applies the values required from above
 */
function applyRequireValues() {
  for (let i = 0; this.requirements && i < this.requirements.length; i++) {
    const { key, values } = this.requirements[i];

    const element = document.getElementById(key);
    if (element != null) {
      element.requireLists = element.requireLists || [];
      element.requireLists.push({ element: this, values });
      element.addEventListener('change', checkRequireValue);
      checkRequireValue.bind(element)();
    }
  }
}

/**
 * Sets the tooltip of the input label to show a description of the value
 *
 * @param {string} text - the text to display in the tooltip
 */
function setTooltip(text) {
  if (text.charAt(0) === '[') {
    this.tooltip = text;
  } else {
    this.tooltip = `[${this.key}] ${text}`;
  }
  return this;
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
 *
 * @constructor
 */
class IndexListValue {
  constructor(name, key, list, index) {
    this.name = name;
    this.key = key;
    this.list = list;
    this.index = index;

    this.label = undefined;
    this.select = undefined;
    this.hidden = false;
  }

  dupe() {
    return new IndexListValue(this.name, this.key, this.list, this.index).setTooltip(this.tooltip);
  }

  /**
   * Creates the form HTML for the value and appends
   * it to the target element
   *
   * @param {Element} target - the HTML element to append to
   */
  createHTML(target) {
    this.label = document.createElement('label');
    this.label.innerHTML = this.name;
    if (this.tooltip) {
      this.label.setAttribute('data-tooltip', this.tooltip);
      this.label.className = 'tooltip';
    }
    target.appendChild(this.label);

    this.select = document.createElement('select');
    this.select.id = this.key;
    for (let i = 0; i < this.list.length; i++) {
      const option = document.createElement('option');
      option.innerHTML = this.list[i];
      this.select.add(option);
    }
    this.select.selectedIndex = this.index;
    target.appendChild(this.select);
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
}

// -- Hooking up the function at the top, see comments there -- //
IndexListValue.prototype.requireValue = requireValue;
IndexListValue.prototype.applyRequireValues = applyRequireValues;
IndexListValue.prototype.setTooltip = setTooltip;

/**
 * Represents a defined list of options for a value
 *
 * @param {string} name  - the display name of the value
 * @param {string} key   - the config key for the value
 * @param {string[]}  list  - the list of available options
 * @param {string} value - the current selected value
 *
 * @constructor
 */
class ListValue {
  constructor(name, key, list, value) {
    this.name = name;
    this.key = key;
    this.list = list;
    this.value = value;

    this.label = undefined;
    this.select = undefined;
    this.hidden = false;
  }

  dupe() {
    return new ListValue(this.name, this.key, this.list, this.value).setTooltip(this.tooltip);
  }

  /**
   * Creates the form HTML for the value and appends
   * it to the target element
   *
   * @param {Element} target - the HTML element to append to
   */
  createHTML(target) {
    this.label = document.createElement('label');
    this.label.innerHTML = this.name;
    if (this.tooltip) {
      this.label.setAttribute('data-tooltip', this.tooltip);
      this.label.className = 'tooltip';
    }
    target.appendChild(this.label);

    this.select = document.createElement('select');
    this.select.id = this.key;
    let selected = -1;

    const vLower = this.value.toLowerCase().replace('_', ' ');
    const list = typeof this.list === 'function' ? this.list() : this.list;
    for (let i = 0; i < list.length; i++) {
      const option = document.createElement('option');
      option.innerHTML = list[i];
      this.select.add(option);

      const lower = list[i].toLowerCase().replace('_', ' ');
      if (lower === vLower || (selected === -1 && list[i] === 'None')) {
        selected = i;
      }
    }
    this.select.selectedIndex = Math.max(0, selected);
    target.appendChild(this.select);
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
      this.value = this.select[this.select.selectedIndex].innerHTML;
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
}

// -- Hooking up the function at the top, see comments there -- //
ListValue.prototype.requireValue = requireValue;
ListValue.prototype.applyRequireValues = applyRequireValues;
ListValue.prototype.setTooltip = setTooltip;

/**
 * Represents a scaling double value
 *
 * @param {string} name  - the display name of the value
 * @param {string} key   - the config key of the value
 * @param {Number} base  - the current starting value
 * @param {Number} scale - the current scale of the value
 *
 * @constructor
 */
class AttributeValue {
  constructor(name, key, base, scale) {
    this.name = name;
    this.key = key;
    this.base = base;
    this.scale = scale;

    this.label = undefined;
    this.left = undefined;
    this.right = undefined;
    this.baseBox = undefined;
    this.scaleBox = undefined;
    this.hidden = false;
  }

  dupe() {
    return new AttributeValue(this.name, this.key, this.base, this.scale).setTooltip(this.tooltip);
  }

  /**
   * Creates the form HTML for the value and appends
   * it to the target element
   *
   * @param {Element} target - the HTML element to append to
   */
  createHTML(target) {
    this.label = document.createElement('label');
    this.label.innerHTML = this.name;
    if (this.tooltip) {
      this.label.setAttribute('data-tooltip', this.tooltip);
      this.label.className = 'tooltip';
    }
    target.appendChild(this.label);

    this.baseBox = document.createElement('input');
    this.baseBox.id = `${this.key}-base`;
    this.baseBox.value = this.base;
    this.baseBox.className = 'base';
    target.appendChild(this.baseBox);

    this.left = document.createElement('label');
    this.left.innerHTML = '+ (';
    this.left.className = 'attrLabel';
    target.appendChild(this.left);

    this.scaleBox = document.createElement('input');
    this.scaleBox.id = `${this.key}-scale`;
    this.scaleBox.value = this.scale;
    this.scaleBox.className = 'scale';
    target.appendChild(this.scaleBox);

    this.right = document.createElement('label');
    this.right.innerHTML = ')';
    this.right.className = 'attrLabel';
    target.appendChild(this.right);
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
}

// -- Hooking up the function at the top, see comments there -- //
AttributeValue.prototype.requireValue = requireValue;
AttributeValue.prototype.applyRequireValues = applyRequireValues;
AttributeValue.prototype.setTooltip = setTooltip;

/**
 * Represents a fixed double value
 *
 * @param {string} name  - the display name of the value
 * @param {string} key   - the config key of the value
 * @param {Number} value - the current value
 *
 * @constructor
 */
class DoubleValue {
  constructor(name, key, value) {
    this.name = name;
    this.key = key;
    this.value = value;

    this.label = undefined;
    this.box = undefined;
    this.hidden = false;
  }

  dupe() {
    return new DoubleValue(this.name, this.key, this.value).setTooltip(this.tooltip);
  }

  /**
   * Creates the form HTML for the value and appends
   * it to the target element
   *
   * @param {Element} target - the HTML element to append to
   */
  createHTML(target) {
    this.label = document.createElement('label');
    this.label.innerHTML = this.name;
    if (this.tooltip) {
      this.label.setAttribute('data-tooltip', this.tooltip);
      this.label.className = 'tooltip';
    }
    target.appendChild(this.label);

    this.box = document.createElement('input');
    this.box.id = this.key;
    this.box.value = this.value;
    this.box.addEventListener('input', window.filterDouble);
    target.appendChild(this.box);
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
}

// -- Hooking up the function at the top, see comments there -- //
DoubleValue.prototype.requireValue = requireValue;
DoubleValue.prototype.applyRequireValues = applyRequireValues;
DoubleValue.prototype.setTooltip = setTooltip;

/**
 * Represents a fixed integer value
 *
 * @param {string} name  - the display name of the value
 * @param {string} key   - the config key of the value
 * @param {Number} value - the current value
 *
 * @constructor
 */
class IntValue {
  constructor(name, key, value) {
    this.name = name;
    this.key = key;
    this.value = value;

    this.label = undefined;
    this.box = undefined;
    this.hidden = false;
  }

  dupe() {
    return new IntValue(this.name, this.key, this.value).setTooltip(this.tooltip);
  }

  /**
   * Creates the form HTML for the value and appends
   * it to the target element
   *
   * @param {Element} target - the HTML element to append to
   */
  createHTML(target) {
    this.label = document.createElement('label');
    this.label.innerHTML = this.name;
    if (this.tooltip) {
      this.label.setAttribute('data-tooltip', this.tooltip);
      this.label.className = 'tooltip';
    }
    target.appendChild(this.label);

    this.box = document.createElement('input');
    this.box.id = this.key;
    this.box.value = this.value;
    this.box.addEventListener('input', window.filterInt);
    target.appendChild(this.box);
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
}

// -- Hooking up the function at the top, see comments there -- //
IntValue.prototype.requireValue = requireValue;
IntValue.prototype.applyRequireValues = applyRequireValues;
IntValue.prototype.setTooltip = setTooltip;

/**
 * Represents a fixed string value
 *
 * @param {string} name  - the display name of the value
 * @param {string} key   - the config key of the value
 * @param {string} value - the current value
 *
 * @constructor
 */
class StringValue {
  constructor(name, key, value) {
    this.name = name;
    this.key = key;
    this.value = value;

    this.label = undefined;
    this.box = undefined;
    this.hidden = false;
  }

  dupe() {
    return new StringValue(this.name, this.key, this.value).setTooltip(this.tooltip);
  }

  /**
   * Creates the form HTML for the value and appends
   * it to the target element
   *
   * @param {Element} target - the HTML element to append to
   */
  createHTML(target) {
    this.label = document.createElement('label');
    this.label.innerHTML = this.name;
    if (this.tooltip) {
      this.label.setAttribute('data-tooltip', this.tooltip);
      this.label.className = 'tooltip';
    }
    target.appendChild(this.label);

    this.box = document.createElement('input');
    this.box.id = this.key;
    this.box.value = this.value;
    target.appendChild(this.box);
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
}

// -- Hooking up the functions at the top, see comments there -- //
StringValue.prototype.requireValue = requireValue;
StringValue.prototype.applyRequireValues = applyRequireValues;
StringValue.prototype.setTooltip = setTooltip;

/**
 * Represents a fixed string value
 *
 * @param {string} name  - the display name of the value
 * @param {string} key   - the config key of the value
 * @param {Array}  value - the current value
 *
 * @constructor
 */
class StringListValue {
  constructor(name, key, value) {
    this.name = name;
    this.key = key;
    this.value = value;

    this.label = undefined;
    this.box = undefined;
    this.hidden = false;
  }

  dupe() {
    return new StringListValue(this.name, this.key, this.value).setTooltip(this.tooltip);
  }

  /**
   * Creates the form HTML for the value and appends
   * it to the target element
   *
   * @param {Element} target - the HTML element to append to
   */
  createHTML(target) {
    this.label = document.createElement('label');
    this.label.innerHTML = this.name;
    this.label.className = 'areaLabel';
    if (this.tooltip) {
      this.label.setAttribute('data-tooltip', this.tooltip);
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
    this.box.id = this.key;
    this.box.value = content;
    target.appendChild(this.box);
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
      this.value = this.box.value.split('\n');
    }
  }

  /**
   * Retrieves the save string for the value
   *
   * @param {string} spacing - the spacing to go before the value
   */
  getSaveString(spacing) {
    let result = `${spacing}${this.key}:\n`;
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
}

// -- Hooking up the function at the top, see comments there -- //
StringListValue.prototype.requireValue = requireValue;
StringListValue.prototype.applyRequireValues = applyRequireValues;
StringListValue.prototype.setTooltip = setTooltip;

/**
 * Represents a defined list of options for a value
 *
 * @param {string} name  - the display name of the value
 * @param {string} key   - the config key for the value
 * @param {Array|function}  list  - the list of available options
 * @param {Array} [values] - the default values to include
 *
 * @constructor
 */
class MultiListValue {
  constructor(name, key, list, values) {
    this.name = name;
    this.key = key;
    this.list = list;
    this.values = values || [];

    this.label = undefined;
    this.select = undefined;
    this.valueContainer = undefined;
    this.div = undefined;
    this.hidden = false;
  }

  dupe() {
    return new MultiListValue(this.name, this.key, this.list, this.values).setTooltip(this.tooltip);
  }

  /**
   * Creates the form HTML for the value and appends
   * it to the target element
   *
   * @param {Element} target - the HTML element to append to
   */
  createHTML(target) {
    this.label = document.createElement('label');
    this.label.innerHTML = this.name;
    if (this.tooltip) {
      this.label.setAttribute('data-tooltip', this.tooltip);
      this.label.className = 'tooltip';
    }
    target.appendChild(this.label);

    const select = document.createElement('select');
    this.select = select;
    select.id = this.key;

    let option = document.createElement('option');
    option.innerHTML = '- Select -';
    select.add(option);
    const list = typeof this.list === 'function' ? this.list() : this.list;
    for (let i = 0; i < list.length; i++) {
      option = document.createElement('option');
      option.innerHTML = list[i];
      select.add(option);
    }
    select.selectedIndex = 0;
    select.inputRef = this;
    select.addEventListener('change', () => {
      if (select.selectedIndex !== 0) {
        const val = select[select.selectedIndex].innerHTML;
        // this.inputRef.values.add(val);
        select.inputRef.populate(val);
        select.selectedIndex = 0;
      }
    });
    target.appendChild(this.select);

    this.help = document.createElement('label');
    this.help.innerHTML = '- Click to remove -';
    this.help.className = 'grayed';
    target.appendChild(this.help);

    this.div = document.createElement('div');
    this.div.className = 'byteList';
    target.appendChild(this.div);

    for (let i = 0; i < this.values.length; i++) {
      this.populate(this.values[i]);
    }
  }

  populate(value) {
    const entry = document.createElement('div');
    entry.className = 'multilist';
    entry.innerHTML = value;
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
      this.values.push(entry.innerHTML);
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
}

// -- Hooking up the function at the top, see comments there -- //
MultiListValue.prototype.requireValue = requireValue;
MultiListValue.prototype.applyRequireValues = applyRequireValues;
MultiListValue.prototype.setTooltip = setTooltip;

/**
 * Represents a byte-represented list of options
 *
 * @param {string} name   - the display name of the value
 * @param {string} key    - the config key of the value
 * @param {Array}  values - the list of names for the values
 * @param {number} value  - the current value
 *
 * @constructor
 */
class ByteListValue {
  constructor(name, key, values, value) {
    this.name = name;
    this.key = key;
    this.value = value;
    this.values = values;

    this.label = undefined;
    this.div = undefined;
    this.hidden = false;
  }

  dupe() {
    return new ByteListValue(this.name, this.key, this.values, this.value).setTooltip(this.tooltip);
  }

  /**
   * Creates the form HTML for the value and appends
   * it to the target element
   *
   * @param {Element} target - the HTML element to append to
   */
  createHTML(target) {
    this.label = document.createElement('label');
    this.label.innerHTML = this.name;
    this.label.className = 'areaLabel';
    if (this.tooltip) {
      this.label.setAttribute('data-tooltip', this.tooltip);
      this.label.className = 'tooltip';
    }
    target.appendChild(this.label);

    // Add div elements
    this.checkboxes = [];
    this.div = document.createElement('div');
    this.div.className = 'byteList';
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
}

// -- Hooking up the function at the top, see comments there -- //
ByteListValue.prototype.requireValue = requireValue;
ByteListValue.prototype.applyRequireValues = applyRequireValues;
ByteListValue.prototype.setTooltip = setTooltip;

Object.defineProperties(window, {
  IndexListValue: {
    get: () => IndexListValue,
  },
  ListValue: {
    get: () => ListValue,
  },
  AttributeValue: {
    get: () => AttributeValue,
  },
  DoubleValue: {
    get: () => DoubleValue,
  },
  IntValue: {
    get: () => IntValue,
  },
  StringValue: {
    get: () => StringValue,
  },
  StringListValue: {
    get: () => StringListValue,
  },
  MultiListValue: {
    get: () => MultiListValue,
  },
  ByteListValue: {
    get: () => ByteListValue,
  },
});
