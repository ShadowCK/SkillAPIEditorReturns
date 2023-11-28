const currentMousePosition = { x: 0, y: 0 };

/**
 * @param {MouseEvent} e
 */
const updateCurrentMousePosition = (e) => {
  currentMousePosition.x = e.clientX;
  currentMousePosition.y = e.clientY;
};

document.addEventListener('mousemove', updateCurrentMousePosition);

const getCurrentMouse = () => ({
  x: currentMousePosition.x,
  y: currentMousePosition.y,
});
const getMouseX = () => currentMousePosition.x;
const getMouseY = () => currentMousePosition.y;

export { getCurrentMouse, updateCurrentMousePosition, getMouseX, getMouseY };
