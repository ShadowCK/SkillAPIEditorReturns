// This script intentionally exposes certain functions for debugging purposes.
// It is not intended to be used in production.

import { getActiveComponent } from './component.js';
import { getActiveSkill, getSkills, newSkill } from './skill.js';

const init = () => {
  Object.defineProperties(window, {
    getActiveSkill: {
      value: getActiveSkill,
    },
    getActiveComponent: {
      value: getActiveComponent,
    },
    newSkill: {
      value: newSkill,
    },
    skills: {
      get() {
        return getSkills();
      },
    },
  });
};

export default init;
