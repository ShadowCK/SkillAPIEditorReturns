/**
 * Clamps a number between the specified minimum and maximum values.
 *
 * @param {number} value - The number to be clamped.
 * @param {number} min - The minimum value of the range.
 * @param {number} max - The maximum value of the range.
 * @returns {number} - The clamped value.
 */
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export { clamp }; // eslint-disable-line import/prefer-default-export
