/* eslint-disable max-classes-per-file */

import * as data from '../data/index.js';
import { ListValue, DoubleValue, IntValue, StringListValue, MultiListValue } from '../input.js';
import { Component, Type } from './component.js';

class TriggerBlockBreak extends Component {
  constructor() {
    super('Block Break', Type.TRIGGER, true);
    this.description =
      'Applies skill effects when a player breaks a block matching  the given details';

    this.data.push(
      new MultiListValue('Material', 'material', data.getAnyMaterials, ['Any']).setTooltip(
        'The type of block expected to be broken',
      ),
    );
    this.data.push(
      new IntValue('Data', 'data', -1).setTooltip(
        'The expected data value of the block (-1 for any data value)',
      ),
    );
  }
}

class TriggerBlockPlace extends Component {
  constructor() {
    super('Block Place', Type.TRIGGER, true);
    this.description =
      'Applies skill effects when a player places a block matching  the given details';

    this.data.push(
      new MultiListValue('Material', 'material', data.getAnyMaterials, ['Any']).setTooltip(
        'The type of block expected to be placed',
      ),
    );
    this.data.push(
      new IntValue('Data', 'data', -1).setTooltip(
        'The expected data value of the block (-1 for any data value)',
      ),
    );
  }
}

class TriggerCast extends Component {
  constructor() {
    super('Cast', Type.TRIGGER, true);

    this.description =
      'Applies skill effects when a player casts the skill using either the cast command, the skill bar, or click combos.';
  }
}

class TriggerCleanup extends Component {
  constructor() {
    super('Cleanup', Type.TRIGGER, true);

    this.description =
      'Applies skill effects when the player disconnects or unlearns the skill. This is always applied with a skill level of 1 just for the sake of math.';
  }
}

class TriggerCrouch extends Component {
  constructor() {
    super('Crouch', Type.TRIGGER, true);

    this.description =
      'Applies skill effects when a player starts or stops crouching using the shift key.';

    this.data.push(
      new ListValue(
        'Type',
        'type',
        ['Start Crouching', 'Stop Crouching', 'Both'],
        'Start Crouching',
      ).setTooltip('Whether or not you want to apply components when crouching or not crouching'),
    );
  }
}

class TriggerDeath extends Component {
  constructor() {
    super('Death', Type.TRIGGER, true);

    this.description = 'Applies skill effects when a player dies.';
  }
}

class TriggerEnvironmentDamage extends Component {
  constructor() {
    super('Environment Damage', Type.TRIGGER, true);

    this.description = 'Applies skill effects when a player takes environmental damage.';

    this.data.push(
      new ListValue('Type', 'type', data.getDamageTypes, 'Fall').setTooltip(
        'The source of damage to apply for',
      ),
    );
  }
}

class TriggerInitialize extends Component {
  constructor() {
    super('Initialize', Type.TRIGGER, true);

    this.description = 'Applies skill effects immediately. This can be used for passive abilities.';
  }
}

class TriggerKill extends Component {
  constructor() {
    super('Kill', Type.TRIGGER, true);

    this.description = 'Applies skill effects upon killing something';
  }
}

class TriggerLand extends Component {
  constructor() {
    super('Land', Type.TRIGGER, true);

    this.description = 'Applies skill effects when a player lands on the ground.';

    this.data.push(
      new DoubleValue('Min Distance', 'min-distance', 0).setTooltip(
        'The minimum distance the player should fall before effects activating.',
      ),
    );
  }
}

class TriggerLaunch extends Component {
  constructor() {
    super('Launch', Type.TRIGGER, true);

    this.description = 'Applies skill effects when a player launches a projectile.';

    this.data.push(
      new ListValue(
        'Type',
        'type',
        ['Any', 'Arrow', 'Egg', 'Ender Pearl', 'Fireball', 'Fishing Hook', 'Snowball'],
        'Any',
      ).setTooltip('The type of projectile that should be launched.'),
    );
  }
}

class TriggerMove extends Component {
  constructor() {
    super('Move', Type.TRIGGER, true);

    this.description =
      'Applies skill effects when a player moves around. This triggers every tick the player is moving, so use this sparingly. Use the "api-moved" value to check/use the distance traveled.';
  }
}

class TriggerPhysicalDamage extends Component {
  constructor() {
    super('Physical Damage', Type.TRIGGER, true);

    this.description =
      'Applies skill effects when a player deals physical (or non-skill) damage. This includes melee attacks and firing a bow.';

    this.data.push(
      new ListValue('Target Caster', 'target', ['True', 'False'], 'True').setTooltip(
        'True makes children target the caster. False makes children target the damaged entity',
      ),
    );
    this.data.push(
      new ListValue('Type', 'type', ['Both', 'Melee', 'Projectile'], 'Both').setTooltip(
        'The type of damage dealt',
      ),
    );
    this.data.push(
      new DoubleValue('Min Damage', 'dmg-min', 0).setTooltip(
        'The minimum damage that needs to be dealt',
      ),
    );
    this.data.push(
      new DoubleValue('Max Damage', 'dmg-max', 999).setTooltip(
        'The maximum damage that needs to be dealt',
      ),
    );
  }
}

class TriggerSkillDamage extends Component {
  constructor() {
    super('Skill Damage', Type.TRIGGER, true);

    this.description = 'Applies skill effects when a player deals damage with a skill.';

    this.data.push(
      new ListValue('Target Caster', 'target', ['True', 'False'], 'True').setTooltip(
        'True makes children target the caster. False makes children target the damaged entity',
      ),
    );
    this.data.push(
      new DoubleValue('Min Damage', 'dmg-min', 0).setTooltip(
        'The minimum damage that needs to be dealt',
      ),
    );
    this.data.push(
      new DoubleValue('Max Damage', 'dmg-max', 999).setTooltip(
        'The maximum damage that needs to be dealt',
      ),
    );
    this.data.push(
      new StringListValue('Category', 'category', ['default']).setTooltip(
        'The type of skill damage to apply for. Leave this empty to apply to all skill damage.',
      ),
    );
  }
}

class TriggerTookPhysicalDamage extends Component {
  constructor() {
    super('Took Physical Damage', Type.TRIGGER, true);

    this.description =
      'Applies skill effects when a player takes physical (or non-skill) damage. This includes melee attacks and projectiles not fired by a skill.';

    this.data.push(
      new ListValue('Target Caster', 'target', ['True', 'False'], 'True').setTooltip(
        'True makes children target the caster. False makes children target the attacking entity',
      ),
    );
    this.data.push(
      new ListValue('Type', 'type', ['Both', 'Melee', 'Projectile'], 'Both').setTooltip(
        'The type of damage dealt',
      ),
    );
    this.data.push(
      new DoubleValue('Min Damage', 'dmg-min', 0).setTooltip(
        'The minimum damage that needs to be dealt',
      ),
    );
    this.data.push(
      new DoubleValue('Max Damage', 'dmg-max', 999).setTooltip(
        'The maximum damage that needs to be dealt',
      ),
    );
  }
}

class TriggerTookSkillDamage extends Component {
  constructor() {
    super('Took Skill Damage', Type.TRIGGER, true);

    this.description =
      'Applies skill effects when a player takes damage from a skill other than their own.';

    this.data.push(
      new ListValue('Target Caster', 'target', ['True', 'False'], 'True').setTooltip(
        'True makes children target the caster. False makes children target the attacking entity',
      ),
    );
    this.data.push(
      new DoubleValue('Min Damage', 'dmg-min', 0).setTooltip(
        'The minimum damage that needs to be dealt',
      ),
    );
    this.data.push(
      new DoubleValue('Max Damage', 'dmg-max', 999).setTooltip(
        'The maximum damage that needs to be dealt',
      ),
    );
    this.data.push(
      new StringListValue('Category', 'category', ['default']).setTooltip(
        'The type of skill damage to apply for. Leave this empty to apply to all skill damage.',
      ),
    );
  }
}

export {
  TriggerBlockBreak,
  TriggerBlockPlace,
  TriggerCast,
  TriggerCleanup,
  TriggerCrouch,
  TriggerDeath,
  TriggerEnvironmentDamage,
  TriggerInitialize,
  TriggerKill,
  TriggerLand,
  TriggerLaunch,
  TriggerMove,
  TriggerPhysicalDamage,
  TriggerSkillDamage,
  TriggerTookPhysicalDamage,
  TriggerTookSkillDamage,
};
