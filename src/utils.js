import pinyin from 'pinyin';
import * as appData from './appData.js';

/**
 * The original skillAPI sorts skills by their names' unicode values.
 * The order determines the triggers' execution order.
 * @param {string} strA
 * @param {string} strB
 * @returns {number}
 */
const compareUnicode = (strA, strB) => {
  if (strA > strB) {
    return 1;
  }
  if (strA < strB) {
    return -1;
  }
  return 0;
};

const toPinyin = (str) =>
  pinyin(str, {
    style: pinyin.STYLE_NORMAL, // 生成不带声调的拼音
    heteronym: false, // 不启用多音字模式
  })
    .join('')
    .replace(/\s+/g, ''); // 移除拼音之间的空格

window.toPinyin = toPinyin;

const sortStrings = (strA, strB) => {
  const isSortByPinyin = appData.get(appData.settings.SortPinyin);
  return isSortByPinyin
    ? compareUnicode(toPinyin(strA), toPinyin(strB))
    : compareUnicode(strA, strB);
};

/**
 * Removes an event listener from one element when another target element is removed from the DOM.
 *
 * @param {HTMLElement} listenerElement - The element from which the event listener will be removed.
 * @param {HTMLElement} targetElement - The target element that is being monitored for removal from the DOM.
 * @param {string} eventType - The type of event for which the listener is registered (e.g., 'click', 'mousemove').
 * @param {Function} listener - The event listener function to be removed from the listenerElement.
 * @param {Function} [callback] - An optional callback function to be executed after the listener is removed.
 *
 * @example
 * // Assuming you have a button that should stop listening for clicks after a specific div is removed
 * const button = document.getElementById('myButton');
 * const div = document.getElementById('myDiv');
 *
 * const handleClick = () => console.log('Button clicked!');
 * const handleRemoval = () => console.log('Div was removed, listener detached!');
 *
 * removeListenerOnTargetRemoval(button, div, 'click', handleClick, handleRemoval);
 */
const removeListenerOnTargetRemoval = (
  listenerElement,
  targetElement,
  eventType,
  listener,
  callback,
) => {
  let currentParent = targetElement.parentNode;

  let observer;
  const updateObserver = () => {
    // Disconnet current observer (if it exists)
    if (observer) {
      observer.disconnect();
    }

    // Re-observe with the new parent
    if (currentParent) {
      observer.observe(currentParent, { childList: true });
    }
  };

  const handleParentChange = () => {
    currentParent = targetElement.parentNode;
    updateObserver();
  };

  observer = new MutationObserver((mutations) => {
    const removed = mutations.find((mutation) =>
      Array.from(mutation.removedNodes).includes(targetElement),
    );
    if (!removed) {
      return;
    }
    if (targetElement.parentNode !== null) {
      handleParentChange();
    }
    // `element` is removed from DOM
    else {
      listenerElement.removeEventListener(eventType, listener);
      observer.disconnect();
      if (typeof callback === 'function') {
        callback();
      }
    }
  });

  updateObserver();
};

export { toPinyin, sortStrings, removeListenerOnTargetRemoval };
