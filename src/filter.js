/**
 * Filters an input box for integers by setting this
 * as the input event listener.
 */
const filterInt = () => {
  // Get the element
  const element = document.activeElement;

  // Remove non-numeric characters
  element.value = element.value.replace(/[^0-9-]/g, '');

  // Remove unnecessary (leading) 0's
  for (let i = 0; i < element.value.length - 1; i++) {
    const char = element.value.charAt(i);
    if (element.value.charAt(i) === '0') {
      element.value = element.value.replace('0', '');
      i--;
    } else if (char !== '-') {
      break;
    }
  }

  // Remove extra negative signs
  if (element.value.lastIndexOf('-') > 0) {
    // Note: original code was wrong with "var negative = element.value.charAt(0) != '-';"
    const negative = element.value.charAt(0) === '-';
    element.value = element.value.replace(/-/g, '');
    if (negative) {
      element.value = `-${element.value}`;
    }
  }

  // Prevent it from being empty
  if (
    element.value.length === 0 ||
    (element.value.length === 1 && element.value.charAt(0) === '-')
  ) {
    element.value += '0';
  }
};

/**
 * Filters an input box for doubles by setting this
 * as the input event listener.
 */
const filterDouble = () => {
  // Get the data
  const element = document.activeElement;

  // Note: `negative` here is using a different checking approach than `filterInt`
  let negative = false;
  let index = -1;
  index = element.value.indexOf('-', index + 1);
  // Revert sign if there is a negative sign
  while (index >= 0) {
    negative = !negative;
    index = element.value.indexOf('-', index + 1);
  }

  // Remove non-numeric characters besides periods
  const filtered = element.value.replace(/[^0-9.-]/g, '');
  if (filtered !== element.value) {
    element.value = filtered;
  }

  // Remove unnecessary 0's
  for (let i = 0; i < element.value.length - 1; i++) {
    const char = element.value.charAt(i);
    if (element.value.charAt(i) === '0' && element.value.charAt(i + 1) !== '.') {
      element.value = element.value.replace('0', '');
      i--;
    } else if (char !== '-') {
      break;
    }
  }

  // Remove all negative signs
  element.value = element.value.replace(/-/g, '');
  // If the final number should be negative, add a negative sign at the start
  if (negative) {
    element.value = `-${element.value}`;
  }

  // Prevent it from being empty
  if (element.value.length === 0 || (element.value.length === 1 && element.value === '-')) {
    element.value += '0';
  }
};

export { filterInt, filterDouble };
