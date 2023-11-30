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
} from '../input.js';
import { Component, Type } from './component.js';

class MechanicAttribute extends Component {
  constructor() {
    super('Attribute', Type.MECHANIC, false);

    this.description = 'Gives a player bonus attributes temporarily.';

    this.data.push(
      new StringValue('Attribute', 'key', 'Intelligence').setTooltip(
        'The name of the attribute to add to',
      ),
    );
    this.data.push(
      new AttributeValue('Amount', 'amount', 5, 2).setTooltip(
        "How much to add to the player's attribute",
      ),
    );
    this.data.push(
      new AttributeValue('Seconds', 'seconds', 3, 0).setTooltip(
        'How long in seconds to give the attributes to the player',
      ),
    );
    this.data.push(
      new ListValue('Stackable', 'stackable', ['True', 'False'], 'False').setTooltip(
        '[PREM] Whether or not applying multiple times stacks the effects',
      ),
    );
  }
}

class MechanicBlock extends Component {
  constructor() {
    super('Block', Type.MECHANIC, false);

    this.description = 'Changes blocks to the given type of block for a limited duration.';

    this.data.push(
      new ListValue('Shape', 'shape', ['Sphere', 'Cuboid'], 'Sphere').setTooltip(
        'The shape of the region to change the blocks for',
      ),
    );
    this.data.push(
      new ListValue('Type', 'type', ['Air', 'Any', 'Solid'], 'Solid').setTooltip(
        'The type of blocks to replace. Air or any would be for making obstacles while solid would change the environment',
      ),
    );
    this.data.push(
      new ListValue('Block', 'block', data.getMaterials, 'Ice').setTooltip(
        'The type of block to turn the region into',
      ),
    );
    this.data.push(
      new IntValue('Block Data', 'data', 0).setTooltip(
        'The block data to apply, mostly applicable for things like signs, woods, steps, or the similar',
      ),
    );
    this.data.push(
      new AttributeValue('Seconds', 'seconds', 5, 0).setTooltip(
        'How long the blocks should be replaced for',
      ),
    );
    this.data.push(
      new AttributeValue('Forward Offset', 'forward', 0, 0).setTooltip(
        'How far forward in front of the target the region should be in blocks. A negative value will put it behind.',
      ),
    );
    this.data.push(
      new AttributeValue('Upward Offset', 'upward', 0, 0).setTooltip(
        'How far above the target the region should be in blocks. A negative value will put it below.',
      ),
    );
    this.data.push(
      new AttributeValue('Right Offset', 'right', 0, 0).setTooltip(
        'How far to the right the region should be of the target. A negative value will put it to the left.',
      ),
    );

    // Sphere options
    this.data.push(
      new AttributeValue('Radius', 'radius', 3, 0)
        .requireValue('shape', ['Sphere'])
        .setTooltip('The radius of the sphere region in blocks'),
    );

    // Cuboid options
    this.data.push(
      new AttributeValue('Width (X)', 'width', 5, 0)
        .requireValue('shape', ['Cuboid'])
        .setTooltip('The width of the cuboid in blocks'),
    );
    this.data.push(
      new AttributeValue('Height (Y)', 'height', 5, 0)
        .requireValue('shape', ['Cuboid'])
        .setTooltip('The height of the cuboid in blocks'),
    );
    this.data.push(
      new AttributeValue('Depth (Z)', 'depth', 5, 0)
        .requireValue('shape', ['Cuboid'])
        .setTooltip('The depth of the cuboid in blocks'),
    );
  }
}

class MechanicBuff extends Component {
  constructor() {
    super('Buff', Type.MECHANIC, false);

    this.description = 'Buffs combat stats of the target';

    this.data.push(
      new ListValue('Immediate', 'immediate', ['True', 'False'], 'False').setTooltip(
        'Whether or not to apply the buff to the current damage trigger.',
      ),
    );
    this.data.push(
      new ListValue(
        'Type',
        'type',
        ['DAMAGE', 'DEFENSE', 'SKILL_DAMAGE', 'SKILL_DEFENSE', 'HEALING'],
        'DAMAGE',
      )
        .requireValue('immediate', ['False'])
        .setTooltip(
          'What type of buff to apply. DAMAGE/DEFENSE is for regular attacks, SKILL_DAMAGE/SKILL_DEFENSE are for damage from abilities, and HEALING is for healing from abilities',
        ),
    );
    this.data.push(
      new ListValue('Modifier', 'modifier', ['Flat', 'Multiplier'], 'Flat').setTooltip(
        'The sort of scaling for the buff. Flat will increase/reduce incoming damage by a fixed amount where Multiplier does it by a percentage of the damage. Multipliers above 1 will increase damage taken while multipliers below 1 reduce damage taken.',
      ),
    );
    this.data.push(
      new StringValue('Category', 'category', '')
        .requireValue('type', ['SKILL_DAMAGE', 'SKILL_DEFENSE'])
        .setTooltip(
          'What kind of skill damage to affect. If left empty, this will affect all skill damage.',
        ),
    );
    this.data.push(
      new AttributeValue('Value', 'value', 1, 0).setTooltip(
        'The amount to increase/decrease incoming damage by',
      ),
    );
    this.data.push(
      new AttributeValue('Seconds', 'seconds', 3, 0)
        .requireValue('immediate', ['False'])
        .setTooltip('The duration of the buff in seconds'),
    );
  }
}

class MechanicCancel extends Component {
  constructor() {
    super('Cancel', Type.MECHANIC, false);

    this.description =
      'Cancels the event that caused the trigger this is under to go off. For example, damage based triggers will stop the damage that was dealt while the Launch trigger would stop the projectile from firing.';
  }
}

class MechanicCancelEffect extends Component {
  constructor() {
    super('Cancel Effect', Type.MECHANIC, false);

    this.description = 'Stops a particle effect prematurely.';

    this.data.push(
      new StringValue('Effect Key', 'effect-key', 'default').setTooltip(
        'The key used when setting up the effect',
      ),
    );
  }
}

class MechanicChannel extends Component {
  constructor() {
    super('Channel', Type.MECHANIC, true);

    this.description =
      'Applies child effects after a duration which can be interrupted. During the channel, the player cannot move, attack, or use other spells.';

    this.data.push(
      new ListValue('Still', 'still', ['True', 'False'], 'True').setTooltip(
        'Whether or not to hold the player in place while channeling',
      ),
    );
    this.data.push(
      new AttributeValue('Time', 'time', 3, 0).setTooltip(
        'The amouont of time, in seconds, to channel for',
      ),
    );
  }
}

class MechanicCleanse extends Component {
  constructor() {
    super('Cleanse', Type.MECHANIC, false);

    this.description = 'Cleanses negative potion or status effects from the targets.';

    this.data.push(
      new ListValue('Potion', 'potion', data.getBadPotions, 'All').setTooltip(
        'The type of potion effect to remove from the target',
      ),
    );
    this.data.push(
      new ListValue(
        'Status',
        'status',
        ['None', 'All', 'Curse', 'Disarm', 'Root', 'Silence', 'Stun'],
        'All',
      ).setTooltip('The status to remove from the target'),
    );
  }
}

class MechanicCommand extends Component {
  constructor() {
    super('Command', Type.MECHANIC, false);

    this.description =
      'Executes a command for each of the targets either from them directly by oping them or via the console using their name.';

    this.data.push(new StringValue('Command', 'command', '').setTooltip('The command to execute'));
    this.data.push(
      new ListValue('Execute Type', 'type', ['Console', 'OP'], 'OP').setTooltip(
        "How to execute the command. Console will execute the command for the console while OP will have the target player execute it while given a temporary OP permission. Use {player} to embed the target player's name into the command",
      ),
    );
  }
}

class MechanicCooldown extends Component {
  constructor() {
    super('Cooldown', Type.MECHANIC, false);

    this.description =
      "Lowers the cooldowns of the target's skill(s). If you provide a negative amount, it will increase the cooldown.";

    this.data.push(
      new StringValue('Skill (or "all")', 'skill', 'all').setTooltip(
        'The skill to modify the cooldown for',
      ),
    );
    this.data.push(
      new ListValue('Type', 'type', ['Seconds', 'Percent'], 'Seconds').setTooltip(
        'The modification unit to use. Seconds will add/subtract seconds from the cooldown while Percent will add/subtract a percentage of its full cooldown',
      ),
    );
    this.data.push(
      new AttributeValue('Value', 'value', -1, 0).setTooltip(
        "The amount to add/subtract from the skill's cooldown",
      ),
    );
  }
}

class MechanicDamage extends Component {
  constructor() {
    super('Damage', Type.MECHANIC, false);

    this.description =
      'Inflicts skill damage to each target. Multiplier type would be a percentage of the target health.';

    this.data.push(
      new ListValue(
        'Type',
        'type',
        ['Damage', 'Multiplier', 'Percent Left', 'Percent Missing'],
        'Damage',
      ).setTooltip(
        "The unit to use for the amount of damage. Damage will deal flat damage, Multiplier will deal a percentage of the target's max health, Percent Left will deal a percentage of their current health, and Percent Missing will deal a percentage of the difference between their max health and current health",
      ),
    );
    this.data.push(
      new AttributeValue('Value', 'value', 3, 1).setTooltip('The amount of damage to deal'),
    );
    this.data.push(
      new ListValue('True Damage', 'true', ['True', 'False'], 'False').setTooltip(
        'Whether or not to deal true damage. True damage ignores armor and all plugin checks.',
      ),
    );
    this.data.push(
      new StringValue('Classifier', 'classifier', 'default').setTooltip(
        '[PREMIUM ONLY] The type of damage to deal. Can act as elemental damage or fake physical damage',
      ),
    );
  }
}

class MechanicDamageBuff extends Component {
  constructor() {
    super('Damage Buff', Type.MECHANIC, false);

    this.description =
      'Modifies the physical damage dealt by each target by a multiplier or a flat amount for a limited duration. Negative flat amounts or multipliers less than one will reduce damage dealt while the opposite will increase damage dealt. (e.g. a 5% damage buff would be a multiplier or 1.05)';

    this.data.push(
      new ListValue('Type', 'type', ['Flat', 'Multiplier'], 'Flat').setTooltip(
        'The type of buff to apply. Flat increases damage by a fixed amount while multiplier increases it by a percentage.',
      ),
    );
    this.data.push(
      new ListValue('Skill Damage', 'skill', ['True', 'False'], 'False').setTooltip(
        'Whether or not to buff skill damage. If false, it will affect physical damage.',
      ),
    );
    this.data.push(
      new AttributeValue('Value', 'value', 1, 0).setTooltip(
        'The amount to increase/decrease the damage by. A negative amoutn with the "Flat" type will decrease damage, similar to a number less than 1 for the multiplier.',
      ),
    );
    this.data.push(
      new AttributeValue('Seconds', 'seconds', 3, 0).setTooltip(
        'The duration of the buff in seconds',
      ),
    );
  }
}

class MechanicDamageLore extends Component {
  constructor() {
    super('Damage Lore', Type.MECHANIC, false);

    this.description =
      'Damages each target based on a value found in the lore of the item held by the caster.';

    this.data.push(
      new ListValue('Hand', 'hand', ['Main', 'Offhand'], 'Main').setTooltip(
        'The hand to check for the item. Offhand items are MC 1.9+ only.',
      ),
    );
    this.data.push(
      new StringValue('Regex', 'regex', 'Damage: {value}').setTooltip(
        'The regex for the text to look for. Use {value} for where the important number should be. If you do not know about regex, consider looking it up on Wikipedia or avoid using major characters such as [ ] { } ( ) . + ? * ^ \\ |',
      ),
    );
    this.data.push(
      new AttributeValue('Multiplier', 'multiplier', 1, 0).setTooltip(
        'The multiplier to use on the value to get the actual damage to deal',
      ),
    );
    this.data.push(
      new ListValue('True Damage', 'true', ['True', 'False'], 'False').setTooltip(
        'Whether or not to deal true damage. True damage ignores armor and all plugin checks.',
      ),
    );
    this.data.push(
      new StringValue('Classifier', 'classifier', 'default').setTooltip(
        '[PREMIUM ONLY] The type of damage to deal. Can act as elemental damage or fake physical damage',
      ),
    );
  }
}

class MechanicDefenseBuff extends Component {
  constructor() {
    super('Defense Buff', Type.MECHANIC, false);

    this.description =
      'Modifies the physical damage taken by each target by a multiplier or a flat amount for a limited duration. Negative flag amounts or multipliers less than one will reduce damage taken while the opposite will increase damage taken. (e.g. a 5% defense buff would be a multiplier or 0.95, since you would be taking 95% damage)';

    this.data.push(
      new ListValue('Type', 'type', ['Flat', 'Multiplier'], 'Flat').setTooltip(
        'The type of buff to apply. Flat will increase/reduce incoming damage by a fixed amount where Multiplier does it by a percentage of the damage. Multipliers above 1 will increase damage taken while multipliers below 1 reduce damage taken.',
      ),
    );
    this.data.push(
      new ListValue('Skill Defense', 'skill', ['True', 'False'], 'False').setTooltip(
        'Whether or not to buff skill defense. If false, it will affect physical defense.',
      ),
    );
    this.data.push(
      new AttributeValue('Value', 'value', 1, 0).setTooltip(
        'The amount to increase/decrease incoming damage by',
      ),
    );
    this.data.push(
      new AttributeValue('Seconds', 'seconds', 3, 0).setTooltip(
        'The duration of the buff in seconds',
      ),
    );
  }
}

class MechanicDelay extends Component {
  constructor() {
    super('Delay', Type.MECHANIC, true);

    this.description = 'Applies child components after a delay.';

    this.data.push(
      new AttributeValue('Delay', 'delay', 2, 0).setTooltip(
        'The amount of time to wait before applying child components in seconds',
      ),
    );
  }
}

class MechanicDisguise extends Component {
  constructor() {
    super('Disguise', Type.MECHANIC, false);

    this.description =
      'Disguises each target according to the settings. This mechanic requires the LibsDisguise plugin to be installed on your server.';

    this.data.push(
      new AttributeValue('Duration', 'duration', -1, 0).setTooltip(
        'How long to apply the disguise for in seconds. Use a negative number to permanently disguise the targets.',
      ),
    );
    this.data.push(
      new ListValue('Type', 'type', ['Mob', 'Player', 'Misc'], 'Mob').setTooltip(
        'The type of disguise to use, as defined by the LibsDisguise plugin.',
      ),
    );

    this.data.push(
      new ListValue(
        'Mob',
        'mob',
        [
          'Bat',
          'Blaze',
          'Cave Spider',
          'Chicken',
          'Cow',
          'Creeper',
          'Donkey',
          'Elder Guardian',
          'Ender Dragon',
          'Enderman',
          'Endermite',
          'Ghast',
          'Giant',
          'Guardian',
          'Horse',
          'Iron Golem',
          'Magma Cube',
          'Mule',
          'Mushroom Cow',
          'Ocelot',
          'Pig',
          'Pig Zombie',
          'Rabbit',
          'Sheep',
          'Shulker',
          'Silverfish',
          'Skeleton',
          'Slime',
          'Snowman',
          'Spider',
          'Squid',
          'Undead Horse',
          'Villager',
          'Witch',
          'Wither',
          'Wither Skeleton',
          'Wolf',
          'Zombie',
          'Zombie Villager',
        ],
        'Zombie',
      )
        .requireValue('type', ['Mob'])
        .setTooltip('The type of mob to disguise the target as'),
    );
    this.data.push(
      new ListValue('Adult', 'adult', ['True', 'False'], 'True')
        .requireValue('type', ['Mob'])
        .setTooltip('Whether or not to use the adult variant of the mob'),
    );

    this.data.push(
      new StringValue('Player', 'player', 'Eniripsa96')
        .requireValue('type', ['Player'])
        .setTooltip('The player to disguise the target as'),
    );

    this.data.push(
      new ListValue(
        'Misc',
        'misc',
        [
          'Area Effect Cloud',
          'Armor Stand',
          'Arrow',
          'Boat',
          'Dragon Fireball',
          'Dropped Item',
          'Egg',
          'Ender Crystal',
          'Ender Pearl',
          'Ender Signal',
          'Experience Orb',
          'Falling Block',
          'Fireball',
          'Firework',
          'Fishing Hook',
          'Item Frame',
          'Leash Hitch',
          'Minecart',
          'Minecart Chest',
          'Minecart Command',
          'Minecart Furnace',
          'Minecart Hopper',
          'Minecart Mob Spawner',
          'Minecart TNT',
          'Painting',
          'Primed TNT',
          'Shulker Bullet',
          'Snowball',
          'Spectral Arrow',
          'Splash Potion',
          'Tipped Arrow',
          'Thrown EXP Bottle',
          'Wither Skull',
        ],
        'Painting',
      )
        .requireValue('type', ['Misc'])
        .setTooltip('The object to disguise the target as'),
    );
    this.data.push(
      new IntValue('Data', 'data', 0)
        .requireValue('type', ['Misc'])
        .setTooltip(
          'Data value to use for the disguise type. What it does depends on the disguise',
        ),
    );
  }
}

class MechanicDurability extends Component {
  constructor() {
    super('Durability', Type.MECHANIC, false);

    this.description = 'Lowers the durability of a held item';

    this.data.push(
      new AttributeValue('Amount', 'amount', 1, 0).setTooltip(
        "Amount to reduce the item's durability by",
      ),
    );
    this.data.push(
      new ListValue('Offhand', 'offhand', ['True', 'False'], 'False').setTooltip(
        'Whether or not to apply to the offhand slot',
      ),
    );
  }
}

class MechanicExplosion extends Component {
  constructor() {
    super('Explosion', Type.MECHANIC, false);

    this.description = "Causes an explosion at the current target's position";

    this.data.push(
      new AttributeValue('Power', 'power', 3, 0).setTooltip('The strength of the explosion'),
    );
    this.data.push(
      new ListValue('Damage Blocks', 'damage', ['True', 'False'], 'False').setTooltip(
        'Whether or not to damage blocks with the explosion',
      ),
    );
    this.data.push(
      new ListValue('Fire', 'fire', ['True', 'False'], 'False').setTooltip(
        'Whether or not to set affected blocks on fire',
      ),
    );
  }
}

class MechanicFire extends Component {
  constructor() {
    super('Fire', Type.MECHANIC, false);

    this.description = 'Sets the target on fire for a duration.';

    this.data.push(
      new AttributeValue('Seconds', 'seconds', 3, 1).setTooltip(
        'The duration of the fire in seconds',
      ),
    );
  }
}

class MechanicFlag extends Component {
  constructor() {
    super('Flag', Type.MECHANIC, false);

    this.description =
      'Marks the target with a flag for a duration. Flags can be checked by other triggers, spells or the related for interesting synergies and effects.';

    this.data.push(
      new StringValue('Key', 'key', 'key').setTooltip(
        'The unique string for the flag. Use the same key when checking it in a Flag Condition.',
      ),
    );
    this.data.push(
      new AttributeValue('Seconds', 'seconds', 3, 1).setTooltip(
        'The duration the flag should be set for. To set one indefinitely, use Flag Toggle.',
      ),
    );
  }
}

class MechanicFlagClear extends Component {
  constructor() {
    super('Flag Clear', Type.MECHANIC, false);

    this.description = 'Clears a flag from the target.';

    this.data.push(
      new StringValue('Key', 'key', 'key').setTooltip(
        'The unique string for the flag. This should match that of the mechanic that set the flag to begin with.',
      ),
    );
  }
}

class MechanicFlagToggle extends Component {
  constructor() {
    super('Flag Toggle', Type.MECHANIC, false);

    this.description =
      'Toggles a flag on or off for the target. This can be used to make toggle effects.';

    this.data.push(
      new StringValue('Key', 'key', 'key').setTooltip(
        'The unique string for the flag. Use the same key when checking it in a Flag Condition',
      ),
    );
  }
}

class MechanicFood extends Component {
  constructor() {
    super('Food', Type.MECHANIC, false);

    this.description = "Adds or removes to a player's hunger and saturation";

    this.data.push(
      new AttributeValue('Food', 'food', 1, 1).setTooltip(
        'The amount of food to give. Use a negative number to lower the food meter.',
      ),
    );
    this.data.push(
      new AttributeValue('Saturation', 'saturation', 0, 0).setTooltip(
        'How much saturation to give. Use a negative number to lower saturation. This is the hidden value that determines how long until food starts going down.',
      ),
    );
  }
}

class MechanicForgetTargets extends Component {
  constructor() {
    super('Forget Targets', Type.MECHANIC, false);

    this.description = 'Clears targets stored by the "Remember Targets" mechanic';

    this.data.push(
      new StringValue('Key', 'key', 'key').setTooltip(
        'The unique key the targets were stored under',
      ),
    );
  }
}

class MechanicHeal extends Component {
  constructor() {
    super('Heal', Type.MECHANIC, false);

    this.description = 'Restores health to each target.';

    this.data.push(
      new ListValue('Type', 'type', ['Health', 'Percent'], 'Health').setTooltip(
        'The unit to use for the amount of health to restore. Health restores a flat amount while Percent restores a percentage of their max health.',
      ),
    );
    this.data.push(
      new AttributeValue('Value', 'value', 3, 1).setTooltip('The amount of health to restore'),
    );
  }
}

class MechanicHealthSet extends Component {
  constructor() {
    super('Health Set', Type.MECHANIC, false);

    this.description =
      "Sets the target's health to the specified amount, ignoring resistances, damage buffs, and so on";

    this.data.push(new AttributeValue('Health', 'health', 1, 0).setTooltip('The health to set to'));
  }
}

class MechanicHeldItem extends Component {
  constructor() {
    super('Held Item', Type.MECHANIC, false);

    this.description =
      'Sets the held item slot of the target player. This will do nothing if trying to set it to a skill slot.';

    this.data.push(new AttributeValue('Slot', 'slot', 0, 0).setTooltip('The slot to set it to'));
  }
}

class MechanicImmunity extends Component {
  constructor() {
    super('Immunity', Type.MECHANIC, false);

    this.description = 'Provides damage immunity from one source for a duration.';

    this.data.push(
      new ListValue('Type', 'type', data.getDamageTypes, 'Poison').setTooltip(
        'The damage type to give an immunity for',
      ),
    );
    this.data.push(
      new AttributeValue('Seconds', 'seconds', 3, 0).setTooltip('How long to give an immunity for'),
    );
    this.data.push(
      new AttributeValue('Multiplier', 'multiplier', 0, 0).setTooltip(
        'The multiplier for the incoming damage. Use 0 if you want full immunity.',
      ),
    );
  }
}

class MechanicInterrupt extends Component {
  constructor() {
    super('Interrupt', Type.MECHANIC, false);

    this.description = 'Interrupts any channeling being done by each target if applicable.';
  }
}

class MechanicItem extends Component {
  constructor() {
    super('Item', Type.MECHANIC, false);

    this.description = 'Gives each player target the item defined by the settings.';

    this.data.push(
      new ListValue('Material', 'material', data.getMaterials, 'Arrow').setTooltip(
        'The type of item to give to the player',
      ),
    );
    this.data.push(
      new IntValue('Amount', 'amount', 1).setTooltip(
        'The quantity of the item to give to the player',
      ),
    );
    this.data.push(
      new IntValue('Durability', 'data', 0).setTooltip(
        'The durability value of the item to give to the player',
      ),
    );
    this.data.push(
      new IntValue('Data', 'byte', 0).setTooltip(
        'The data value of the item to give to the player for things such as egg type or wool color',
      ),
    );
    this.data.push(
      new ListValue('Custom', 'custom', ['True', 'False'], 'False').setTooltip(
        'Whether or not to apply a custom name/lore to the item',
      ),
    );

    this.data.push(
      new StringValue('Name', 'name', 'Name')
        .requireValue('custom', ['True'])
        .setTooltip('The name of the item'),
    );
    this.data.push(
      new StringListValue('Lore', 'lore', [])
        .requireValue('custom', ['True'])
        .setTooltip('The lore text for the item (the text below the name)'),
    );
  }
}

class MechanicItemProjectile extends Component {
  constructor() {
    super('Item Projectile', Type.MECHANIC, true);

    this.description =
      'Launches a projectile using an item as its visual that applies child components upon landing. The target passed on will be the collided target or the location where it landed if it missed.';

    this.data.push(
      new ListValue('Item', 'item', data.getMaterials, 'Jack O Lantern').setTooltip(
        'The item type to use as a projectile',
      ),
    );
    this.data.push(
      new IntValue('Item Data', 'item-data', 0).setTooltip(
        'The durability value for the item to use as a projectile, most notably for dyes or colored items like wool',
      ),
    );
    utils.addProjectileOptions(this);
    utils.addEffectOptions(this, true);
  }
}

class MechanicItemRemove extends Component {
  constructor() {
    super('Item Remove', Type.MECHANIC, false);

    this.description = 'Removes an item from a player inventory. This does nothing to mobs.';

    this.data.push(
      new AttributeValue('Amount', 'amount', 1, 0).setTooltip(
        "The amount of the item needed in the player's inventory",
      ),
    );

    utils.addItemOptions(this);
  }
}

class MechanicLaunch extends Component {
  constructor() {
    super('Launch', Type.MECHANIC, false);

    this.description =
      'Launches the target relative to their forward direction. Use negative values to go in the opposite direction (e.g. negative forward makes the target go backwards)';

    this.data.push(
      new ListValue(
        '[PREM] Relative',
        'relative',
        ['Target', 'Caster', 'Between'],
        'Target',
      ).setTooltip(
        'Determines what is considered "forward". Target uses the direction the target is facing, Caster uses the direction the caster is facing, and Between uses the direction from the caster to the target.',
      ),
    );
    this.data.push(
      new AttributeValue('Forward Speed', 'forward', 0, 0).setTooltip(
        'The speed to give the target in the direction they are facing',
      ),
    );
    this.data.push(
      new AttributeValue('Upward Speed', 'upward', 2, 0.5).setTooltip(
        'The speed to give the target upwards',
      ),
    );
    this.data.push(
      new AttributeValue('Right Speed', 'right', 0, 0).setTooltip(
        'The speed to give the target to their right',
      ),
    );
  }
}

class MechanicLightning extends Component {
  constructor() {
    super('Lightning', Type.MECHANIC, false);

    this.description =
      'Strikes lightning on or near the target. Negative offsets will offset it in the opposite direction (e.g. negative forward offset puts it behind the target).';

    this.data.push(
      new ListValue('Damage', 'damage', ['True', 'False'], 'True').setTooltip(
        'Whether or not the lightning should deal damage',
      ),
    );
    this.data.push(
      new AttributeValue('Forward Offset', 'forward', 0, 0).setTooltip(
        'How far in front of the target in blocks to place the lightning',
      ),
    );
    this.data.push(
      new AttributeValue('Right Offset', 'right', 0, 0).setTooltip(
        'How far to the right of the target in blocks to place the lightning',
      ),
    );
  }
}

class MechanicMana extends Component {
  constructor() {
    super('Mana', Type.MECHANIC, false);

    this.description = 'Restores or deducts mana from the target.';

    this.data.push(
      new ListValue('Type', 'type', ['Mana', 'Percent'], 'Mana').setTooltip(
        'The unit to use for the amount of mana to restore/drain. Mana does a flat amount while Percent does a percentage of their max mana',
      ),
    );
    this.data.push(
      new AttributeValue('Value', 'value', 1, 0).setTooltip('The amount of mana to restore/drain'),
    );
  }
}

class MechanicMessage extends Component {
  constructor() {
    super('Message', Type.MECHANIC, false);

    this.description =
      'Sends a message to each player target. To include numbers from Value mechanics, use the filters {<key>} where <key> is the key the value is stored under.';

    this.data.push(
      new StringValue('Message', 'message', 'text').setTooltip('The message to display'),
    );
  }
}

class MechanicParticle extends Component {
  constructor() {
    super('Particle', Type.MECHANIC, false);

    this.description = 'Plays a particle effect about the target.';

    utils.addParticleOptions(this);

    this.data.push(
      new DoubleValue('Forward Offset', 'forward', 0).setTooltip(
        'How far forward in front of the target in blocks to play the particles. A negative value will go behind.',
      ),
    );
    this.data.push(
      new DoubleValue('Upward Offset', 'upward', 0).setTooltip(
        'How far above the target in blocks to play the particles. A negative value will go below.',
      ),
    );
    this.data.push(
      new DoubleValue('Right Offset', 'right', 0).setTooltip(
        'How far to the right of the target to play the particles. A negative value will go to the left.',
      ),
    );
  }
}

class MechanicParticleAnimation extends Component {
  constructor() {
    super('Particle Animation', Type.MECHANIC, false);

    this.description =
      'Plays an animated particle effect at the location of each target over time by applying various transformations.';

    this.data.push(
      new IntValue('Steps', 'steps', 1, 0).setTooltip(
        'The number of times to play particles and apply translations each application.',
      ),
    );
    this.data.push(
      new DoubleValue('Frequency', 'frequency', 0.05, 0).setTooltip(
        'How often to apply the animation in seconds. 0.05 is the fastest (1 tick). Lower than that will act the same.',
      ),
    );
    this.data.push(
      new IntValue('Angle', 'angle', 0).setTooltip(
        'How far the animation should rotate over the duration in degrees',
      ),
    );
    this.data.push(
      new IntValue('Start Angle', 'start', 0).setTooltip(
        'The starting orientation of the animation. Horizontal translations and the forward/right offsets will be based off of this.',
      ),
    );
    this.data.push(
      new AttributeValue('Duration', 'duration', 5, 0).setTooltip(
        'How long the animation should last for in seconds',
      ),
    );
    this.data.push(
      new AttributeValue('H-Translation', 'h-translation', 0, 0).setTooltip(
        'How far the animation moves horizontally relative to the center over a cycle. Positive values make it expand from the center while negative values make it contract.',
      ),
    );
    this.data.push(
      new AttributeValue('V-Translation', 'v-translation', 0, 0).setTooltip(
        'How far the animation moves vertically over a cycle. Positive values make it rise while negative values make it sink.',
      ),
    );
    this.data.push(
      new IntValue('H-Cycles', 'h-cycles', 1).setTooltip(
        'How many times to move the animation position throughout the animation. Every other cycle moves it back to where it started. For example, two cycles would move it out and then back in.',
      ),
    );
    this.data.push(
      new IntValue('V-Cycles', 'v-cycles', 1).setTooltip(
        'How many times to move the animation position throughout the animation. Every other cycle moves it back to where it started. For example, two cycles would move it up and then back down.',
      ),
    );

    utils.addParticleOptions(this);

    this.data.push(
      new DoubleValue('Forward Offset', 'forward', 0).setTooltip(
        'How far forward in front of the target in blocks to play the particles. A negative value will go behind.',
      ),
    );
    this.data.push(
      new DoubleValue('Upward Offset', 'upward', 0).setTooltip(
        'How far above the target in blocks to play the particles. A negative value will go below.',
      ),
    );
    this.data.push(
      new DoubleValue('Right Offset', 'right', 0).setTooltip(
        'How far to the right of the target to play the particles. A negative value will go to the left.',
      ),
    );
  }
}

class MechanicParticleEffect extends Component {
  constructor() {
    super('Particle Effect', Type.MECHANIC, false);

    this.description =
      'Plays a particle effect that follows the current target, using formulas to determine shape, size, and motion';

    utils.addEffectOptions(this, false);
  }
}

class MechanicParticleProjectile extends Component {
  constructor() {
    super('Particle Projectile', Type.MECHANIC, true);

    this.description =
      'Launches a projectile using particles as its visual that applies child components upon landing. The target passed on will be the collided target or the location where it landed if it missed.';

    utils.addProjectileOptions(this);

    this.data.push(
      new DoubleValue('Gravity', 'gravity', 0).setTooltip(
        'How much gravity to apply each tick. Negative values make it fall while positive values make it rise',
      ),
    );
    this.data.push(
      new ListValue('Pierce', 'pierce', ['True', 'False'], 'False').setTooltip(
        'Whether or not this projectile should pierce through initial targets and continue hitting those behind them',
      ),
    );

    utils.addParticleOptions(this);

    this.data.push(
      new DoubleValue('Frequency', 'frequency', 0.05).setTooltip(
        'How often to play a particle effect where the projectile is. It is recommended not to change this value unless there are too many particles playing',
      ),
    );
    this.data.push(
      new DoubleValue('Lifespan', 'lifespan', 3).setTooltip(
        "How long in seconds before the projectile will expire in case it doesn't hit anything",
      ),
    );

    utils.addEffectOptions(this, true);
  }
}

class MechanicPassive extends Component {
  constructor() {
    super('Passive', Type.MECHANIC, true);

    this.description =
      'Applies child components continuously every period. The seconds value below is the period or how often it applies.';

    this.data.push(
      new AttributeValue('Seconds', 'seconds', 1, 0).setTooltip(
        'The delay in seconds between each application',
      ),
    );
  }
}

class MechanicPermission extends Component {
  constructor() {
    super('Permission', Type.MECHANIC, true);

    this.description =
      'Grants each player target a permission for a limited duration. This mechanic requires Vault with an accompanying permissions plugin in order to work.';

    this.data.push(
      new StringValue('Permission', 'perm', 'plugin.perm.key').setTooltip(
        'The permission to give to the player',
      ),
    );
    this.data.push(
      new AttributeValue('Seconds', 'seconds', 3, 0).setTooltip(
        'How long in seconds to give the permission to the player',
      ),
    );
  }
}

class MechanicPotion extends Component {
  constructor() {
    super('Potion', Type.MECHANIC, false);

    this.description = 'Applies a potion effect to the target for a duration.';

    this.data.push(
      new ListValue('Potion', 'potion', data.getPotionTypes, 'Absorption').setTooltip(
        'The type of potion effect to apply',
      ),
    );
    this.data.push(
      new ListValue('Ambient Particles', 'ambient', ['True', 'False'], 'True').setTooltip(
        'Whether or not to show ambient particles',
      ),
    );
    this.data.push(
      new AttributeValue('Tier', 'tier', 1, 0).setTooltip('The strength of the potion'),
    );
    this.data.push(
      new AttributeValue('Seconds', 'seconds', 3, 1).setTooltip('How long to apply the effect for'),
    );
  }
}

class MechanicPotionProjectile extends Component {
  constructor() {
    super('Potion Projectile', Type.MECHANIC, true);

    this.description =
      'Drops a splash potion from each target that does not apply potion effects by default. This will apply child elements when the potion lands. The targets supplied will be everything hit by the potion. If nothing is hit by the potion, the target will be the location it landed.';

    this.data.push(
      new ListValue('Type', 'type', data.getPotionTypes, 'Fire Resistance').setTooltip(
        'The type of the potion to use for the visuals',
      ),
    );
    this.data.push(
      new ListValue('Group', 'group', ['Ally', 'Enemy', 'Both'], 'Enemy').setTooltip(
        'The alignment of entities to hit',
      ),
    );
    this.data.push(
      new ListValue('Linger', 'linger', ['True', 'False'], 'False').setTooltip(
        'Whether or not the potion should be a lingering potion (for 1.9+ only)',
      ),
    );
  }
}

class MechanicProjectile extends Component {
  constructor() {
    super('Projectile', Type.MECHANIC, true);

    this.description =
      'Launches a projectile that applies child components on hit. The target supplied will be the struck target.';

    this.data.push(
      new ListValue(
        'Projectile',
        'projectile',
        ['Arrow', 'Egg', 'Ghast Fireball', 'Snowball'],
        'Arrow',
      ).setTooltip('The type of projectile to fire'),
    );
    this.data.push(
      new ListValue('Flaming', 'flaming', ['True', 'False'], 'False').setTooltip(
        'Whether or not to make the launched projectiles on fire.',
      ),
    );
    this.data.push(
      new ListValue('Cost', 'cost', ['None', 'All', 'One'], 'None').setTooltip(
        'The cost of the skill of the fired item. All will cost the same number of items as the skill fired.',
      ),
    );

    utils.addProjectileOptions(this);
    utils.addEffectOptions(this, true);
  }
}

class MechanicPurge extends Component {
  constructor() {
    super('Purge', Type.MECHANIC, false);

    this.description = 'Purges the target of positive potion effects or statuses';

    this.data.push(
      new ListValue('Potion', 'potion', data.getGoodPotions, 'All').setTooltip(
        'The potion effect to remove from the target, if any',
      ),
    );
    this.data.push(
      new ListValue('Status', 'status', ['None', 'All', 'Absorb', 'Invincible'], 'All').setTooltip(
        'The status to remove from the target, if any',
      ),
    );
  }
}

class MechanicPush extends Component {
  constructor() {
    super('Push', Type.MECHANIC, false);

    this.description =
      'Pushes the target relative to the caster. This will do nothing if used with the caster as the target. Positive numbers apply knockback while negative numbers pull them in.';

    this.data.push(
      new ListValue('Type', 'type', ['Fixed', 'Inverse', 'Scaled'], 'Fixed').setTooltip(
        'How to scale the speed based on relative position. Fixed does the same speed to all targets. Inverse pushes enemies farther away faster. Scaled pushes enemies closer faster.',
      ),
    );
    this.data.push(
      new AttributeValue('Speed', 'speed', 3, 1).setTooltip(
        'How fast to push the target away. Use a negative value to pull them closer.',
      ),
    );
    this.data.push(
      new StringValue('Source', 'source', 'none').setTooltip(
        'The source to push/pull from. This should be a key used in a Remember Targets mechanic. If no targets are remembered, this will default to the caster.',
      ),
    );
  }
}

class MechanicRememberTargets extends Component {
  constructor() {
    super('Remember Targets', Type.MECHANIC, false);

    this.description = 'Stores the current targets for later use under a specified key';

    this.data.push(
      new StringValue('Key', 'key', 'target').setTooltip(
        'The unique key to store the targets under. The "Remember" target will use this key to apply effects to the targets later on.',
      ),
    );
  }
}

class MechanicRepeat extends Component {
  constructor() {
    super('Repeat', Type.MECHANIC, true);

    this.description =
      'Applies child components multiple times. When it applies them is determined by the delay (seconds before the first application) and period (seconds between successive applications).';

    this.data.push(
      new AttributeValue('Repetitions', 'repetitions', 3, 0).setTooltip(
        'How many times to activate child components',
      ),
    );
    this.data.push(
      new DoubleValue('Period', 'period', 1).setTooltip(
        'The time in seconds between each time applying child components',
      ),
    );
    this.data.push(
      new DoubleValue('Delay', 'delay', 0).setTooltip(
        'The initial delay before starting to apply child components',
      ),
    );
    this.data.push(
      new ListValue('Stop on Fail', 'stop-on-fail', ['True', 'False'], 'False').setTooltip(
        'Whether or not to stop the repeat task early if the effects fail',
      ),
    );
  }
}

class MechanicSound extends Component {
  constructor() {
    super('Sound', Type.MECHANIC, false);

    this.description = "Plays a sound at the target's location.";

    this.data.push(
      new ListValue('Sound', 'sound', data.getSounds, data.getSounds()[0]).setTooltip(
        'The sound clip to play',
      ),
    );
    this.data.push(
      new AttributeValue('Volume', 'volume', 100, 0).setTooltip(
        'The volume of the sound as a percentage. Numbers above 100 will not get any louder, but will be heard from a farther distance',
      ),
    );
    this.data.push(
      new AttributeValue('Pitch', 'pitch', 1, 0).setTooltip(
        'The pitch of the sound as a numeric speed multiplier between 0.5 and 2.',
      ),
    );
  }
}

class MechanicSpeed extends Component {
  constructor() {
    super('Speed', Type.MECHANIC, false);

    this.description =
      'Modifies the base speed of a player using a multiplier (stacks with potions)';

    this.data.push(
      new AttributeValue('Multiplier', 'multiplier', 1.2, 0).setTooltip(
        "The multiplier of the player's base speed to use",
      ),
    );
    this.data.push(
      new AttributeValue('Duration', 'duration', 3, 1).setTooltip(
        'How long to multiply their speed for',
      ),
    );
  }
}

class MechanicStatus extends Component {
  constructor() {
    super('Status', Type.MECHANIC, false);

    this.description = 'Applies a status effect to the target for a duration.';

    this.data.push(
      new ListValue(
        'Status',
        'status',
        ['Absorb', 'Curse', 'Disarm', 'Invincible', 'Root', 'Silence', 'Stun'],
        'Stun',
      ).setTooltip('The status to apply'),
    );
    this.data.push(
      new AttributeValue('Duration', 'duration', 3, 1).setTooltip(
        'How long in seconds to apply the status',
      ),
    );
  }
}

class MechanicTaunt extends Component {
  constructor() {
    super('Taunt', Type.MECHANIC, false);

    this.description =
      'Draws aggro of targeted creatures. Regular mobs are set to attack the caster. The Spigot/Bukkit API for this was not functional on older versions, so it may not work on older servers. For MythicMobs, this uses their aggro system using the amount chosen below.';

    this.data.push(
      new AttributeValue('Amount', 'amount', 1, 0).setTooltip(
        'The amount of aggro to apply if MythicMobs is active. Use negative amounts to reduce aggro',
      ),
    );
  }
}

class MechanicTrigger extends Component {
  constructor() {
    super('Trigger', Type.MECHANIC, true);

    this.description = 'Listens for a trigger on the current targets for a duration.';

    this.data.push(
      new ListValue(
        'Trigger',
        'trigger',
        [
          'Crouch',
          'Death',
          'Environment Damage',
          'Kill',
          'Land',
          'Launch',
          'Physical Damage',
          'Skill Damage',
          'Took Physical Damage',
          'Took Skill Damage',
        ],
        'Death',
      ).setTooltip('The trigger to listen for'),
    );
    this.data.push(
      new AttributeValue('Duration', 'duration', 5, 0).setTooltip(
        'How long to listen to the trigger for',
      ),
    );
    this.data.push(
      new ListValue('Stackable', 'stackable', ['True', 'False'], 'True').setTooltip(
        'Whether or not different players (or the same player) can listen to the same target at the same time',
      ),
    );
    this.data.push(
      new ListValue('Once', 'once', ['True', 'False'], 'True').setTooltip(
        'Whether or not the trigger should only be used once each cast. When false, the trigger can execute as many times as it happens for the duration.',
      ),
    );

    // CROUCH
    this.data.push(
      new ListValue(
        'Type',
        'type',
        ['Start Crouching', 'Stop Crouching', 'Both'],
        'Start Crouching',
      )
        .requireValue('trigger', ['Crouch'])
        .setTooltip('Whether or not you want to apply components when crouching or not crouching'),
    );

    // ENVIRONMENT_DAMAGE
    this.data.push(
      new ListValue('Type', 'type', data.getDamageTypes, 'Fall')
        .requireValue('trigger', ['Environment Damage'])
        .setTooltip('The source of damage to apply for'),
    );

    // LAND
    this.data.push(
      new DoubleValue('Min Distance', 'min-distance', 0)
        .requireValue('trigger', ['Land'])
        .setTooltip('The minimum distance the player should fall before effects activating.'),
    );

    // LAUNCH
    this.data.push(
      new ListValue(
        'Type',
        'type',
        ['Any', 'Arrow', 'Egg', 'Ender Pearl', 'Fireball', 'Fishing Hook', 'Snowball'],
        'Any',
      )
        .requireValue('trigger', ['Launch'])
        .setTooltip('The type of projectile that should be launched.'),
    );

    // PHYSICAL
    this.data.push(
      new ListValue('Type', 'type', ['Both', 'Melee', 'Projectile'], 'Both')
        .requireValue('trigger', ['Physical Damage', 'Took Physical Damage'])
        .setTooltip('The type of damage dealt'),
    );

    // SKILL
    this.data.push(
      new StringValue('Category', 'category', '')
        .requireValue('trigger', ['Skill Damage', 'Took Skill Damage'])
        .setTooltip(
          'The type of skill damage to apply for. Leave this empty to apply to all skill damage.',
        ),
    );

    // DAMAGE
    const damageTriggers = [
      'Physical Damage',
      'Skill Damage',
      'Took Physical Damage',
      'Took Skill Damage',
    ];
    this.data.push(
      new ListValue('Target Listen Target', 'target', ['True', 'False'], 'True')
        .requireValue('trigger', damageTriggers)
        .setTooltip(
          'True makes children target the target that has been listened to. False makes children target the entity fighting the target entity.',
        ),
    );
    this.data.push(
      new DoubleValue('Min Damage', 'dmg-min', 0)
        .requireValue('trigger', damageTriggers)
        .setTooltip('The minimum damage that needs to be dealt'),
    );
    this.data.push(
      new DoubleValue('Max Damage', 'dmg-max', 999)
        .requireValue('trigger', damageTriggers)
        .setTooltip('The maximum damage that needs to be dealt'),
    );
  }
}

class MechanicValueAdd extends Component {
  constructor() {
    super('Value Add', Type.MECHANIC, false);

    this.description =
      "Adds to a stored value under a unique key for the caster. If the value wasn't set before, this will set the value to the given amount.";

    this.data.push(
      new StringValue('Key', 'key', 'value').setTooltip(
        'The unique key to store the value under. This key can be used in place of attribute values to use the stored value.',
      ),
    );
    this.data.push(
      new AttributeValue('Amount', 'amount', 1, 0).setTooltip('The amount to add to the value'),
    );
  }
}

class MechanicValueAttribute extends Component {
  constructor() {
    super('Value Attribute', Type.MECHANIC, false);

    this.description =
      "Loads a player's attribute count for a specific attribute as a stored value to be used in other mechanics.";

    this.data.push(
      new StringValue('Key', 'key', 'attribute').setTooltip(
        'The unique key to store the value under. This key can be used in place of attribute values to use the stored value.',
      ),
    );
    this.data.push(
      new StringValue('Attribute', 'attribute', 'Vitality').setTooltip(
        'The name of the attribute you are loading the value of',
      ),
    );
  }
}

class MechanicValueCopy extends Component {
  constructor() {
    super('Value Copy', Type.MECHANIC, false);

    this.description = 'Copies a stored value from the caster to the target or vice versa';

    this.data.push(
      new StringValue('Key', 'key', 'value').setTooltip(
        'The unique key to store the value under. This key can be used in place of attribute values to use the stored value.',
      ),
    );
    this.data.push(
      new StringValue('Destination', 'destination', 'value').setTooltip(
        'The key to copy the original value to',
      ),
    );
    this.data.push(
      new ListValue('To target', 'to-target', ['True', 'False'], 'True').setTooltip(
        'The amount to add to the value',
      ),
    );
  }
}

class MechanicValueDistance extends Component {
  constructor() {
    super('Value Distance', Type.MECHANIC, false);

    this.description = 'Stores the distance between the target and the caster into a value';

    this.data.push(
      new StringValue('Key', 'key', 'attribute').setTooltip(
        'The unique key to store the value under. This key can be used in place of attribute values to use the stored value.',
      ),
    );
  }
}

class MechanicValueHealth extends Component {
  constructor() {
    super('Value Health', Type.MECHANIC, false);

    this.description =
      "Stores the target's current health as a value under a given key for the caster";

    this.data.push(
      new StringValue('Key', 'key', 'value').setTooltip(
        'The unique key to store the value under. This key can be used in place of attribute values to use the stored value.',
      ),
    );
    this.data.push(
      new ListValue('Type', 'type', ['Current', 'Max', 'Missing', 'Percent'], 'Current').setTooltip(
        'Current provides the health the target has, max provides their total health, missing provides how much health they have lost, and percent is the ratio of health to total health.',
      ),
    );
  }
}

class MechanicValueLocation extends Component {
  constructor() {
    super('Value Location', Type.MECHANIC, false);

    this.description =
      "Loads the first target's current location into a stored value for use at a later time.";

    this.data.push(
      new StringValue('Key', 'key', 'location').setTooltip(
        'The unique key to store the location under. This key can be used in place of attribute values to use the stored value.',
      ),
    );
  }
}

class MechanicValueLore extends Component {
  constructor() {
    super('Value Lore', Type.MECHANIC, false);

    this.description =
      "Loads a value from a held item's lore into a stored value under the given unique key for the caster.";

    this.data.push(
      new StringValue('Key', 'key', 'lore').setTooltip(
        'The unique key to store the value under. This key can be used in place of attribute values to use the stored value.',
      ),
    );
    this.data.push(
      new ListValue('Hand', 'hand', ['Main', 'Offhand'], 'Main').setTooltip(
        'The hand to check for the item. Offhand items are MC 1.9+ only.',
      ),
    );
    this.data.push(
      new StringValue('Regex', 'regex', 'Damage: {value}').setTooltip(
        'The regex string to look for, using {value} as the number to store. If you do not know about regex, consider looking it up on Wikipedia or avoid using major characters such as [ ] { } ( ) . + ? * ^ \\ |',
      ),
    );
    this.data.push(
      new AttributeValue('Multiplier', 'multiplier', 1, 0).setTooltip(
        'The multiplier for the acquired value. If you want the value to remain unchanged, leave this value at 1.',
      ),
    );
  }
}

class MechanicValueLoreSlot extends Component {
  constructor() {
    super('Value Lore Slot', Type.MECHANIC, false);

    this.description =
      "Loads a value from an item's lore into a stored value under the given unique key for the caster.";

    this.data.push(
      new StringValue('Key', 'key', 'lore').setTooltip(
        'The unique key to store the value under. This key can be used in place of attribute values to use the stored value.',
      ),
    );
    this.data.push(
      new IntValue('Slot', 'slot', 9).setTooltip(
        'The slot of the inventory to fetch the item from. Slots 0-8 are the hotbar, 9-35 are the main inventory, 36-39 are armor, and 40 is the offhand slot.',
      ),
    );
    this.data.push(
      new StringValue('Regex', 'regex', 'Damage: {value}').setTooltip(
        'The regex string to look for, using {value} as the number to store. If you do not know about regex, consider looking it up on Wikipedia or avoid using major characters such as [ ] { } ( ) . + ? * ^ \\ |',
      ),
    );
    this.data.push(
      new AttributeValue('Multiplier', 'multiplier', 1, 0).setTooltip(
        'The multiplier for the acquired value. If you want the value to remain unchanged, leave this value at 1.',
      ),
    );
  }
}

class MechanicValueMana extends Component {
  constructor() {
    super('Value Mana', Type.MECHANIC, false);

    this.description =
      "Stores the target player's current mana as a value under a given key for the caster";

    this.data.push(
      new StringValue('Key', 'key', 'value').setTooltip(
        'The unique key to store the value under. This key can be used in place of attribute values to use the stored value.',
      ),
    );
    this.data.push(
      new ListValue('Type', 'type', ['Current', 'Max', 'Missing', 'Percent'], 'Current').setTooltip(
        'Current provides the mana the target has, max provides their total mana, missing provides how much mana they have lost, and percent is the ratio of health to total mana.',
      ),
    );
  }
}

class MechanicValueMultiply extends Component {
  constructor() {
    super('Value Multiply', Type.MECHANIC, false);

    this.description =
      "Multiplies a stored value under a unique key for the caster. If the value wasn't set before, this will not do anything.";

    this.data.push(
      new StringValue('Key', 'key', 'value').setTooltip(
        'The unique key to store the value under. This key can be used in place of attribute values to use the stored value.',
      ),
    );
    this.data.push(
      new AttributeValue('Multiplier', 'multiplier', 1, 0).setTooltip(
        'The amount to multiply the value by',
      ),
    );
  }
}

class MechanicValuePlaceholder extends Component {
  constructor() {
    super('Value Placeholder', Type.MECHANIC, false);

    this.description = 'Uses a placeholder string and stores it as a value for the caster';

    this.data.push(
      new StringValue('Key', 'key', 'value').setTooltip(
        'The unique key to store the value under. This key can be used in place of attribute values to use the stored value.',
      ),
    );
    this.data.push(
      new ListValue('Type', 'type', ['Number', 'String'], 'Number').setTooltip(
        'The type of value to store. Number values require numeric placeholders. String values can be used in messages or commands.',
      ),
    );
    this.data.push(
      new StringValue('Placeholder', 'placeholder', '%player_food_level%').setTooltip(
        'The placeholder string to use. Can contain multiple placeholders if using the String type.',
      ),
    );
  }
}

class MechanicValueRandom extends Component {
  constructor() {
    super('Value Random', Type.MECHANIC, false);

    this.description = 'Stores a specified value under a given key for the caster.';

    this.data.push(
      new StringValue('Key', 'key', 'value').setTooltip(
        'The unique key to store the value under. This key can be used in place of attribute values to use the stored value.',
      ),
    );
    this.data.push(
      new ListValue('Type', 'type', ['Normal', 'Triangular'], 'Normal').setTooltip(
        'The type of random to use. Triangular favors numbers in the middle, similar to rolling two dice.',
      ),
    );
    this.data.push(
      new AttributeValue('Min', 'min', 0, 0).setTooltip('The minimum value it can be'),
    );
    this.data.push(
      new AttributeValue('Max', 'max', 0, 0).setTooltip('The maximum value it can be'),
    );
  }
}

class MechanicValueSet extends Component {
  constructor() {
    super('Value Set', Type.MECHANIC, false);

    this.description = 'Stores a specified value under a given key for the caster.';

    this.data.push(
      new StringValue('Key', 'key', 'value').setTooltip(
        'The unique key to store the value under. This key can be used in place of attribute values to use the stored value.',
      ),
    );
    this.data.push(
      new AttributeValue('Value', 'value', 1, 0).setTooltip('The value to store under the key'),
    );
  }
}

class MechanicWarp extends Component {
  constructor() {
    super('Warp', Type.MECHANIC, false);

    this.description =
      'Warps the target relative to their forward direction. Use negative numbers to go in the opposite direction (e.g. negative forward will cause the target to warp backwards).';

    this.data.push(
      new ListValue('Through Walls', 'walls', ['True', 'False'], 'False').setTooltip(
        'Whether or not to allow the target to teleport through walls',
      ),
    );
    this.data.push(
      new AttributeValue('Forward', 'forward', 3, 1).setTooltip(
        'How far forward in blocks to teleport. A negative value teleports backwards.',
      ),
    );
    this.data.push(
      new AttributeValue('Upward', 'upward', 0, 0).setTooltip(
        'How far upward in blocks to teleport. A negative value teleports downward.',
      ),
    );
    this.data.push(
      new AttributeValue('Right', 'right', 0, 0).setTooltip(
        'How far to the right in blocks to teleport. A negative value teleports to the left.',
      ),
    );
  }
}

class MechanicWarpLoc extends Component {
  constructor() {
    super('Warp Location', Type.MECHANIC, false);

    this.description = 'Warps the target to a specified location.';

    this.data.push(
      new StringValue('World (or "current")', 'world', 'current').setTooltip(
        'The name of the world that the location is in',
      ),
    );
    this.data.push(
      new DoubleValue('X', 'x', 0).setTooltip('The X-coordinate of the desired position'),
    );
    this.data.push(
      new DoubleValue('Y', 'y', 0).setTooltip('The Y-coordinate of the desired position'),
    );
    this.data.push(
      new DoubleValue('Z', 'z', 0).setTooltip('The Z-coordinate of the desired position'),
    );
    this.data.push(
      new DoubleValue('Yaw', 'yaw', 0).setTooltip(
        'The Yaw of the desired position (left/right orientation)',
      ),
    );
    this.data.push(
      new DoubleValue('Pitch', 'pitch', 0).setTooltip(
        'The Pitch of the desired position (up/down orientation)',
      ),
    );
  }
}

class MechanicWarpRandom extends Component {
  constructor() {
    super('Warp Random', Type.MECHANIC, false);

    this.description = 'Warps the target in a random direction the given distance.';

    this.data.push(
      new ListValue('Only Horizontal', 'horizontal', ['True', 'False'], 'True').setTooltip(
        'Whether or not to limit the random position to the horizontal plane',
      ),
    );
    this.data.push(
      new ListValue('Through Walls', 'walls', ['True', 'False'], 'False').setTooltip(
        'Whether or not to allow the target to teleport through walls',
      ),
    );
    this.data.push(
      new AttributeValue('Distance', 'distance', 3, 1).setTooltip(
        'The max distance in blocks to teleport',
      ),
    );
  }
}

class MechanicWarpSwap extends Component {
  constructor() {
    super('Warp Swap', Type.MECHANIC, false);

    this.description =
      'Switches the location of the caster and the target. If multiple targets are provided, this takes the first one.';
  }
}

class MechanicWarpTarget extends Component {
  constructor() {
    super('Warp Target', Type.MECHANIC, false);

    this.description =
      'Warps either the target or the caster to the other. This does nothing when the target is the caster.';

    this.data.push(
      new ListValue(
        'Type',
        'type',
        ['Caster to Target', 'Target to Caster'],
        'Caster to Target',
      ).setTooltip('The direction to warp the involved targets'),
    );
  }
}

class MechanicWarpValue extends Component {
  constructor() {
    super('Warp Value', Type.MECHANIC, false);

    this.description =
      'Warps all targets to a location remembered using the Value Location mechanic.';

    this.data.push(
      new StringValue('Key', 'key', 'location').setTooltip(
        'The unique key the location is stored under. This should be the same key used in the Value Location mechanic.',
      ),
    );
  }
}

class MechanicWolf extends Component {
  constructor() {
    super('Wolf', Type.MECHANIC, true);

    this.description =
      'Summons a wolf on each target for a duration. Child components will start off targeting the wolf so you can add effects to it. You can also give it its own skillset, though Cast triggers will not occur.';

    this.data.push(
      new ListValue('Collar Color', 'color', data.getDyes, 'Black').setTooltip(
        'The color of the collar that the wolf should wear',
      ),
    );
    this.data.push(
      new StringValue('Wolf Name', 'name', "{player}'s Wolf").setTooltip(
        "The displayed name of the wolf. Use {player} to embed the caster's name.",
      ),
    );
    this.data.push(
      new AttributeValue('Health', 'health', 10, 0).setTooltip('The starting health of the wolf'),
    );
    this.data.push(
      new AttributeValue('Damage', 'damage', 3, 0).setTooltip(
        'The damage dealt by the wolf each attack',
      ),
    );
    this.data.push(
      new ListValue('Sitting', 'sitting', ['True', 'False'], 'False').setTooltip(
        '[PREMIUM] whether or not the wolf starts of sitting',
      ),
    );
    this.data.push(
      new AttributeValue('Duration', 'seconds', 10, 0).setTooltip(
        'How long to summon the wolf for',
      ),
    );
    this.data.push(
      new AttributeValue('Amount', 'amount', 1, 0).setTooltip('How many wolves to summon'),
    );
    this.data.push(
      new StringListValue('Skills (one per line)', 'skills', []).setTooltip(
        'The skills to give the wolf. Skills are executed at the level of the skill summoning the wolf. Skills needing a Cast trigger will not work.',
      ),
    );
  }
}

class MechanicTest extends Component {
  constructor() {
    super('Test', Type.MECHANIC, false);

    this.description = 'Test';

    this.data.splice(1, 1);

    this.data.push(
      new ListValue('Check Data', 'check-data', ['True', 'False'], 'False').setTooltip(
        'Whether or not the item needs to have a certain data value',
      ),
    );
    this.data.push(
      new ListValue('Check Haha', 'check-haha', ['True', 'False'], 'False').setTooltip(
        'Whether or not the item needs to have a certain data value',
      ),
    );
    this.data.push(
      new IntValue('Data', 'data', 0)
        .requireValue('check-data', ['True'])
        .requireValue('check-haha', ['True'])
        .setTooltip('The data value the item must have'),
    );
  }
}

export {
  MechanicAttribute,
  MechanicBlock,
  MechanicBuff,
  MechanicCancel,
  MechanicCancelEffect,
  MechanicChannel,
  MechanicCleanse,
  MechanicCommand,
  MechanicCooldown,
  MechanicDamage,
  MechanicDamageBuff,
  MechanicDamageLore,
  MechanicDefenseBuff,
  MechanicDelay,
  MechanicDisguise,
  MechanicDurability,
  MechanicExplosion,
  MechanicFire,
  MechanicFlag,
  MechanicFlagClear,
  MechanicFlagToggle,
  MechanicFood,
  MechanicForgetTargets,
  MechanicHeal,
  MechanicHealthSet,
  MechanicHeldItem,
  MechanicImmunity,
  MechanicInterrupt,
  MechanicItem,
  MechanicItemProjectile,
  MechanicItemRemove,
  MechanicLaunch,
  MechanicLightning,
  MechanicMana,
  MechanicMessage,
  MechanicParticle,
  MechanicParticleAnimation,
  MechanicParticleEffect,
  MechanicParticleProjectile,
  MechanicPassive,
  MechanicPermission,
  MechanicPotion,
  MechanicPotionProjectile,
  MechanicProjectile,
  MechanicPurge,
  MechanicPush,
  MechanicRememberTargets,
  MechanicRepeat,
  MechanicSound,
  MechanicSpeed,
  MechanicStatus,
  MechanicTaunt,
  MechanicTrigger,
  MechanicValueAdd,
  MechanicValueAttribute,
  MechanicValueCopy,
  MechanicValueDistance,
  MechanicValueHealth,
  MechanicValueLocation,
  MechanicValueLore,
  MechanicValueLoreSlot,
  MechanicValueMana,
  MechanicValueMultiply,
  MechanicValuePlaceholder,
  MechanicValueRandom,
  MechanicValueSet,
  MechanicWarp,
  MechanicWarpLoc,
  MechanicWarpRandom,
  MechanicWarpSwap,
  MechanicWarpTarget,
  MechanicWarpValue,
  MechanicWolf,
  MechanicTest,
};
