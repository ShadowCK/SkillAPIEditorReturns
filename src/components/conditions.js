/* eslint-disable max-classes-per-file */

import * as data from '../data/index.js';
import * as utils from './utils.js';
import {
  ListValue,
  AttributeValue,
  DoubleValue,
  IntValue,
  StringValue,
  StringListValue,
  MultiListValue,
} from '../input.js';
import { Component, Type } from './component.js';

class ConditionArmor extends Component {
  constructor() {
    super('Armor', Type.CONDITION, true);
    this.description =
      'Applies child components when the target is wearing an armor item matching the given details.';

    this.data.push(
      new ListValue(
        'Armor',
        'armor',
        ['Helmet', 'Chestplate', 'Leggings', 'Boots', 'Any'],
        'Any',
      ).setTooltip('The type of armor to check'),
    );

    utils.addItemOptions(this);
  }
}

class ConditionAttribute extends Component {
  constructor() {
    super('Attribute', Type.CONDITION, true);

    this.description = 'Requires the target to have a given number of attributes';

    this.data.push(
      new StringValue('Attribute', 'attribute', 'Vitality').setTooltip(
        'The name of the attribute you are checking the value of',
      ),
    );
    this.data.push(
      new AttributeValue('Min', 'min', 0, 0).setTooltip(
        'The minimum amount of the attribute the target requires',
      ),
    );
    this.data.push(
      new AttributeValue('Max', 'max', 999, 0).setTooltip(
        'The maximum amount of the attribute the target requires',
      ),
    );
  }
}

class ConditionBiome extends Component {
  constructor() {
    super('Biome', Type.CONDITION, true);

    this.description = 'Applies child components when in a specified biome.';

    this.data.push(
      new ListValue('Type', 'type', ['In Biome', 'Not In Biome'], 'In Biome').setTooltip(
        'Whether or not the target should be in the biome. If checking for in the biome, they must be in any one of the checked biomes. If checking for the opposite, they must not be in any of the checked biomes.',
      ),
    );
    this.data.push(
      new MultiListValue('Biome', 'biome', data.getBiomes, ['Forest']).setTooltip(
        'The biomes to check for. The expectation would be any of the selected biomes need to match',
      ),
    );
  }
}

class ConditionBlock extends Component {
  constructor() {
    super('Block', Type.CONDITION, true);

    this.description =
      'Applies child components if the target is currently standing on a block of the given type.';

    this.data.push(
      new ListValue(
        'Type',
        'standing',
        ['On Block', 'Not On Block', 'In Block', 'Not In Block'],
        'On Block',
      ).setTooltip(
        'Specifies which block to check and whether or not it should match the selected mateiral. "On Block" is directly below the player while "In Block" is the block a player\'s feet are in.',
      ),
    );
    this.data.push(
      new ListValue('Material', 'material', data.getMaterials, 'Dirt').setTooltip(
        'The type of the block to require the targets to stand on',
      ),
    );
  }
}

class ConditionCeiling extends Component {
  constructor() {
    super('Ceiling', Type.CONDITION, true);

    this.description = 'Checks the height of the ceiling above each target';

    this.data.push(
      new AttributeValue('Distance', 'distance', 5, 0).setTooltip(
        'How high to check for the ceiling',
      ),
    );
    this.data.push(
      new ListValue('At least', 'at-least', ['True', 'False'], 'True').setTooltip(
        'When true, the ceiling must be at least the give number of blocks high. If false, the ceiling must be lower than the given number of blocks',
      ),
    );
  }
}

class ConditionChance extends Component {
  constructor() {
    super('Chance', Type.CONDITION, true);

    this.description = 'Rolls a chance to apply child components.';

    this.data.push(
      new AttributeValue('Chance', 'chance', 25, 0).setTooltip(
        'The chance to execute children as a percentage. "25" would be 25%.',
      ),
    );
  }
}

class ConditionClass extends Component {
  constructor() {
    super('Class', Type.CONDITION, true);

    this.description =
      'Applies child components when the target is the given class or optionally a profession of that class. For example, if you check for "Fighter" which professes into "Warrior", a "Warrior" will pass the check if you do not enable "exact".';

    this.data.push(
      new StringValue('Class', 'class', 'Fighter').setTooltip('The class the player should be'),
    );
    this.data.push(
      new ListValue('Exact', 'exact', ['True', 'False'], 'False').setTooltip(
        'Whether or not the player must be exactly the given class. If false, they can be a later profession of the class.',
      ),
    );
  }
}

class ConditionClassLevel extends Component {
  constructor() {
    super('Class Level', Type.CONDITION, true);

    this.description =
      'Applies child components when the level of the class with this skill is within the range. This only checks the level of the caster, not the targets.';

    this.data.push(
      new IntValue('Min Level', 'min-level', 2).setTooltip(
        'The minimum class level the player should be. If the player has multiple classes, this will be of their main class',
      ),
    );
    this.data.push(
      new IntValue('Max Level', 'max-level', 99).setTooltip(
        'The maximum class level the player should be. If the player has multiple classes, this will be of their main class',
      ),
    );
  }
}

class ConditionCombat extends Component {
  constructor() {
    super('Combat', Type.CONDITION, true);

    this.description =
      'Applies child components to targets that are in/out of combat, depending on the settings.';

    this.data.push(
      new ListValue('In Combat', 'combat', ['True', 'False'], 'True').setTooltip(
        'Whether or not the target should be in or out of combat',
      ),
    );
    this.data.push(
      new DoubleValue('Seconds', 'seconds', 10).setTooltip(
        'The time in seconds since the last combat activity before something is considered not in combat',
      ),
    );
  }
}

class ConditionCrouch extends Component {
  constructor() {
    super('Crouch', Type.CONDITION, true);

    this.description = 'Applies child components if the target player(s) are crouching';

    this.data.push(
      new ListValue('Crouching', 'crouch', ['True', 'False'], 'True').setTooltip(
        'Whether or not the player should be crouching',
      ),
    );
  }
}

class ConditionDirection extends Component {
  constructor() {
    super('Direction', Type.CONDITION, true);

    this.description =
      'Applies child components when the target or caster is facing the correct direction relative to the other.';

    this.data.push(
      new ListValue('Type', 'type', ['Target', 'Caster'], 'Target').setTooltip(
        'The entity to check the direction of',
      ),
    );
    this.data.push(
      new ListValue('Direction', 'direction', ['Away', 'Towards'], 'Away').setTooltip(
        'The direction the chosen entity needs to be looking relative to the other.',
      ),
    );
  }
}

class ConditionElevation extends Component {
  constructor() {
    super('Elevation', Type.CONDITION, true);

    this.description =
      'Applies child components when the elevation of the target matches the settings.';

    this.data.push(
      new ListValue('Type', 'type', ['Normal', 'Difference'], 'Normal').setTooltip(
        "The type of comparison to make. Normal is just their Y-coordinate. Difference would be the difference between that the caster's Y-coordinate",
      ),
    );
    this.data.push(
      new AttributeValue('Min Value', 'min-value', 0, 0).setTooltip(
        'The minimum value for the elevation required. A positive minimum value with a "Difference" type would be for when the target is higher up than the caster',
      ),
    );
    this.data.push(
      new AttributeValue('Max Value', 'max-value', 255, 0).setTooltip(
        'The maximum value for the elevation required. A negative maximum value with a "Difference" type would be for when the target is below the caster',
      ),
    );
  }
}

class ConditionElse extends Component {
  constructor() {
    super('Else', Type.CONDITION, true);

    this.description =
      'Applies child elements if the previous component failed to execute. This not only applies for conditions not passing, but mechanics failing due to no target or other cases.';
  }
}

class ConditionEntityType extends Component {
  constructor() {
    super('Entity Type', Type.CONDITION, true);

    this.description =
      'Applies child elements if the target matches one of the selected entity types';

    this.data.push(
      new MultiListValue('Types', 'types', data.getEntities).setTooltip(
        'The entity types to target',
      ),
    );
  }
}

class ConditionFire extends Component {
  constructor() {
    super('Fire', Type.CONDITION, true);

    this.description = 'Applies child components when the target is on fire.';

    this.data.push(
      new ListValue('Type', 'type', ['On Fire', 'Not On Fire'], 'On Fire').setTooltip(
        'Whether or not the target should be on fire',
      ),
    );
  }
}

class ConditionFlag extends Component {
  constructor() {
    super('Flag', Type.CONDITION, true);

    this.description =
      'Applies child components when the target is marked by the appropriate flag.';

    this.data.push(
      new ListValue('Type', 'type', ['Set', 'Not Set'], 'Set').setTooltip(
        'Whether or not the flag should be set',
      ),
    );
    this.data.push(
      new StringValue('Key', 'key', 'key').setTooltip(
        'The unique key representing the flag. This should match the key for when you set it using the Flag mechanic or the Flat Toggle mechanic',
      ),
    );
  }
}

class ConditionGround extends Component {
  constructor() {
    super('Ground', Type.CONDITION, true);

    this.description = 'Applies child components when the target is on the ground';

    this.data.push(
      new ListValue('Type', 'type', ['On Ground', 'Not On Ground'], 'On Ground').setTooltip(
        'Whether or not the target should be on the ground',
      ),
    );
  }
}

class ConditionHealth extends Component {
  constructor() {
    super('Health', Type.CONDITION, true);

    this.description = "Applies child components when the target's health matches the settings.";

    this.data.push(
      new ListValue(
        'Type',
        'type',
        ['Health', 'Percent', 'Difference', 'Difference Percent'],
        'Health',
      ).setTooltip(
        "The type of measurement to use for the health. Health is their flat health left. Percent is the percentage of health they have left. Difference is the difference between the target's flat health and the caster's. Difference percent is the difference between the target's percentage health left and the casters",
      ),
    );
    this.data.push(
      new AttributeValue('Min Value', 'min-value', 0, 0).setTooltip(
        'The minimum health required. A positive minimum with one of the "Difference" types would be for when the target has more health',
      ),
    );
    this.data.push(
      new AttributeValue('Max Value', 'max-value', 10, 2).setTooltip(
        'The maximum health required. A negative maximum with one of the "Difference" types would be for when the target has less health',
      ),
    );
  }
}

class ConditionItem extends Component {
  constructor() {
    super('Item', Type.CONDITION, true);
    this.description =
      'Applies child components when the target is wielding an item matching the given material.';

    utils.addItemOptions(this);
  }
}

class ConditionInventory extends Component {
  constructor() {
    super('Inventory', Type.CONDITION, true);

    this.description =
      'Applies child components when the target player contains the given item in their inventory. This does not work on mobs.';

    this.data.push(
      new AttributeValue('Amount', 'amount', 1, 0).setTooltip(
        "The amount of the item needed in the player's inventory",
      ),
    );

    utils.addItemOptions(this);
  }
}

class ConditionLight extends Component {
  constructor() {
    super('Light', Type.CONDITION, true);

    this.description =
      "Applies child components when the light level at the target's location matches the settings.";

    this.data.push(
      new AttributeValue('Min Light', 'min-light', 0, 0).setTooltip(
        'The minimum light level needed. 16 is full brightness while 0 is complete darkness',
      ),
    );
    this.data.push(
      new AttributeValue('Max Light', 'max-light', 16, 16).setTooltip(
        'The maximum light level needed. 16 is full brightness while 0 is complete darkness',
      ),
    );
  }
}

class ConditionMana extends Component {
  constructor() {
    super('Mana', Type.CONDITION, true);

    this.description = "Applies child components when the target's mana matches the settings.";

    this.data.push(
      new ListValue(
        'Type',
        'type',
        ['Mana', 'Percent', 'Difference', 'Difference Percent'],
        'Mana',
      ).setTooltip(
        "The type of measurement to use for the mana. Mana is their flat mana left. Percent is the percentage of mana they have left. Difference is the difference between the target's flat mana and the caster's. Difference percent is the difference between the target's percentage mana left and the casters",
      ),
    );
    this.data.push(
      new AttributeValue('Min Value', 'min-value', 0, 0).setTooltip(
        'The minimum amount of mana needed',
      ),
    );
    this.data.push(
      new AttributeValue('Max Value', 'max-value', 10, 2).setTooltip(
        'The maximum amount of mana needed',
      ),
    );
  }
}

class ConditionName extends Component {
  constructor() {
    super('Name', Type.CONDITION, true);

    this.description = 'Applies child components when the target has a name matching the settings.';

    this.data.push(
      new ListValue('Contains Text', 'contains', ['True', 'False'], 'True').setTooltip(
        'Whether or not the target should have a name containing the text',
      ),
    );
    this.data.push(
      new ListValue('Regex', 'regex', ['True', 'False'], 'False').setTooltip(
        'Whether or not the text is formatted as regex. If you do not know what regex is, ignore this option',
      ),
    );
    this.data.push(
      new StringValue('Text', 'text', 'text').setTooltip(
        "The text to look for in the target's name",
      ),
    );
  }
}

class ConditionOffhand extends Component {
  constructor() {
    super('Offhand', Type.CONDITION, true);
    this.description =
      'Applies child components when the target is wielding an item matching the given material as an offhand item. This is for v1.9+ servers only.';

    utils.addItemOptions(this);
  }
}

class ConditionPermission extends Component {
  constructor() {
    super('Permission', Type.CONDITION, true);

    this.description = 'Applies child components if the caster has the required permission';

    this.data.push(
      new StringValue('Permission', 'perm', 'some.permission').setTooltip(
        'The permission the player needs to have',
      ),
    );
  }
}

class ConditionPotion extends Component {
  constructor() {
    super('Potion', Type.CONDITION, true);

    this.description = 'Applies child components when the target has the potion effect.';

    this.data.push(
      new ListValue('Type', 'type', ['Active', 'Not Active'], 'Active').setTooltip(
        'Whether or not the potion should be active',
      ),
    );
    this.data.push(
      new ListValue('Potion', 'potion', data.getAnyPotion, 'Any').setTooltip(
        'The type of potion to look for',
      ),
    );
    this.data.push(
      new AttributeValue('Min Rank', 'min-rank', 0, 0).setTooltip(
        'The minimum rank the potion effect can be',
      ),
    );
    this.data.push(
      new AttributeValue('Max Rank', 'max-rank', 999, 0).setTooltip(
        'The maximum rank the potion effect can be',
      ),
    );
  }
}

class ConditionSkillLevel extends Component {
  constructor(skill) {
    super('Skill Level', Type.CONDITION, true);

    this.description =
      'Applies child components when the skill level is with the range. This checks the skill level of the caster, not the targets.';

    this.data.push(
      new StringValue('Skill', 'skill', skill).setTooltip(
        "The name of the skill to check the level of. If you want to check the current skill, enter the current skill's name anyway",
      ),
    );
    this.data.push(
      new IntValue('Min Level', 'min-level', 2).setTooltip('The minimum level of the skill needed'),
    );
    this.data.push(
      new IntValue('Max Level', 'max-level', 99).setTooltip(
        'The maximum level of the skill needed',
      ),
    );
  }
}

class ConditionSlot extends Component {
  constructor() {
    super('Slot', Type.CONDITION, true);
    this.description =
      'Applies child components when the target player has a matching item in the given slot.';

    this.data.push(
      new StringListValue('Slots (one per line)', 'slot', ['9']).setTooltip(
        'The slots to look at. Slots 0-8 are the hot bar, 9-35 are the main inventory, 36-39 are armor, and 40 is the offhand slot. Multiple slots will check if any of the slots match.',
      ),
    );

    utils.addItemOptions(this);
  }
}

class ConditionStatus extends Component {
  constructor() {
    super('Status', Type.CONDITION, true);

    this.description = 'Applies child components when the target has the status condition.';

    this.data.push(
      new ListValue('Type', 'type', ['Active', 'Not Active'], 'Active').setTooltip(
        'Whether or not the status should be active',
      ),
    );
    this.data.push(
      new ListValue(
        'Status',
        'status',
        ['Any', 'Absorb', 'Curse', 'Disarm', 'Invincible', 'Root', 'Silence', 'Stun'],
        'Any',
      ).setTooltip('The status to look for'),
    );
  }
}

class ConditionTime extends Component {
  constructor() {
    super('Time', Type.CONDITION, true);

    this.description = 'Applies child components when the server time matches the settings.';

    this.data.push(
      new ListValue('Time', 'time', ['Day', 'Night'], 'Day').setTooltip(
        'The time to check for in the current world',
      ),
    );
  }
}

class ConditionTool extends Component {
  constructor() {
    super('Tool', Type.CONDITION, true);

    this.description = 'Applies child components when the target is wielding a matching tool.';

    this.data.push(
      new ListValue(
        'Material',
        'material',
        ['Any', 'Wood', 'Stone', 'Iron', 'Gold', 'Diamond'],
        'Any',
      ).setTooltip('The material the held tool needs to be made out of'),
    );
    this.data.push(
      new ListValue(
        'Tool',
        'tool',
        ['Any', 'Axe', 'Hoe', 'Pickaxe', 'Shovel', 'Sword'],
        'Any',
      ).setTooltip('The type of tool it needs to be'),
    );
  }
}

class ConditionValue extends Component {
  constructor() {
    super('Value', Type.CONDITION, true);

    this.description = 'Applies child components if a stored value is within the given range.';

    this.data.push(
      new StringValue('Key', 'key', 'value').setTooltip(
        'The unique string used for the value set by the Value mechanics.',
      ),
    );
    this.data.push(
      new AttributeValue('Min Value', 'min-value', 1, 0).setTooltip(
        'The lower bound of the required value',
      ),
    );
    this.data.push(
      new AttributeValue('Max Value', 'max-value', 999, 0).setTooltip(
        'The upper bound of the required value',
      ),
    );
  }
}

class ConditionWater extends Component {
  constructor() {
    super('Water', Type.CONDITION, true);

    this.description =
      'Applies child components when the target is in or out of water, depending on the settings.';

    this.data.push(
      new ListValue('State', 'state', ['In Water', 'Out Of Water'], 'In Water').setTooltip(
        'Whether or not the target needs to be in the water',
      ),
    );
  }
}

class ConditionWeather extends Component {
  constructor() {
    super('Weather', Type.CONDITION, true);

    this.description =
      "Applies child components when the target's location has the given weather condition";

    this.data.push(
      new ListValue('Type', 'type', ['None', 'Rain', 'Snow', 'Thunder'], 'Rain').setTooltip(
        'Whether or not the target needs to be in the water',
      ),
    );
  }
}

export {
  ConditionArmor,
  ConditionAttribute,
  ConditionBiome,
  ConditionBlock,
  ConditionCeiling,
  ConditionChance,
  ConditionClass,
  ConditionClassLevel,
  ConditionCombat,
  ConditionCrouch,
  ConditionDirection,
  ConditionElevation,
  ConditionElse,
  ConditionEntityType,
  ConditionFire,
  ConditionFlag,
  ConditionGround,
  ConditionHealth,
  ConditionItem,
  ConditionInventory,
  ConditionLight,
  ConditionMana,
  ConditionName,
  ConditionOffhand,
  ConditionPermission,
  ConditionPotion,
  ConditionSkillLevel,
  ConditionSlot,
  ConditionStatus,
  ConditionTime,
  ConditionTool,
  ConditionValue,
  ConditionWater,
  ConditionWeather,
};
