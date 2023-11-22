import { getActiveComponent } from './component.js';
import { getActiveSkill } from './skill.js';

const init = () => {
  Object.defineProperties(window, {
    getActiveSkill: {
      value: () => getActiveSkill(),
    },
    getActiveComponent: {
      value: () => getActiveComponent(),
    },
  });
};

export default init;
