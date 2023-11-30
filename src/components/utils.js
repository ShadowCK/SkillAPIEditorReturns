import { ListValue, AttributeValue, DoubleValue, IntValue, StringValue } from '../input.js';

import { getMaterials, getParticles } from '../data/index.js';

const appendOptional = (value) => {
  value.requireValue('use-effect', ['True']);
  return value;
};

const appendNone = (value) => value;

/**
 * Adds the options for item related effects to the component
 *
 * @param {Component} component - the component to add to
 */
const addItemOptions = (component) => {
  component.data.push(
    new ListValue('Check Material', 'check-mat', ['True', 'False'], 'True').setTooltip(
      'Whether or not the item needs to be a certain type',
    ),
  );
  component.data.push(
    new ListValue('Material', 'material', getMaterials, 'Arrow')
      .requireValue('check-mat', ['True'])
      .setTooltip('The type the item needs to be'),
  );

  component.data.push(
    new ListValue('Check Data', 'check-data', ['True', 'False'], 'False').setTooltip(
      'Whether or not the item needs to have a certain data value',
    ),
  );
  component.data.push(
    new IntValue('Data', 'data', 0)
      .requireValue('check-data', ['True'])
      .setTooltip('The data value the item must have'),
  );

  component.data.push(
    new ListValue('Check Lore', 'check-lore', ['True', 'False'], 'False').setTooltip(
      'Whether or not the item requires a bit of text in its lore',
    ),
  );
  component.data.push(
    new StringValue('Lore', 'lore', 'text')
      .requireValue('check-lore', ['True'])
      .setTooltip('The text the item requires in its lore'),
  );

  component.data.push(
    new ListValue('Check Name', 'check-name', ['True', 'False'], 'False').setTooltip(
      'Whether or not the item needs to have a bit of text in its display name',
    ),
  );
  component.data.push(
    new StringValue('Name', 'name', 'name')
      .requireValue('check-name', ['True'])
      .setTooltip('The text the item requires in its display name'),
  );

  component.data.push(
    new ListValue('Regex', 'regex', ['True', 'False'], 'False').setTooltip(
      'Whether or not the name and lore checks are regex strings. If you do not know what regex is, leave this option alone.',
    ),
  );
};

const addProjectileOptions = (component) => {
  // General data
  component.data.push(
    new ListValue('Group', 'group', ['Ally', 'Enemy'], 'Enemy').setTooltip(
      'The alignment of targets to hit',
    ),
  );
  component.data.push(
    new ListValue('Spread', 'spread', ['Cone', 'Horizontal Cone', 'Rain'], 'Cone').setTooltip(
      'The orientation for firing projectiles. Cone will fire arrows in a cone centered on your reticle. Horizontal cone does the same as cone, just locked to the XZ axis (parallel to the ground). Rain drops the projectiles from above the target. For firing one arrow straight, use "Cone"',
    ),
  );
  component.data.push(
    new AttributeValue('Amount', 'amount', 1, 0).setTooltip('The number of projectiles to fire'),
  );
  component.data.push(
    new AttributeValue('Velocity', 'velocity', 3, 0).setTooltip(
      'How fast the projectile is launched. A negative value fires it in the opposite direction.',
    ),
  );

  // Cone values
  component.data.push(
    new AttributeValue('Angle', 'angle', 30, 0)
      .requireValue('spread', ['Cone', 'Horizontal Cone'])
      .setTooltip(
        'The angle in degrees of the cone arc to spread projectiles over. If you are only firing one projectile, this does not matter.',
      ),
  );
  component.data.push(
    new DoubleValue('Position', 'position', 0, 0)
      .requireValue('spread', ['Cone', 'Horizontal Cone'])
      .setTooltip('The height from the ground to start the projectile'),
  );

  // Rain values
  component.data.push(
    new AttributeValue('Height', 'height', 8, 0)
      .requireValue('spread', ['Rain'])
      .setTooltip('The distance in blocks over the target to rain the projectiles from'),
  );
  component.data.push(
    new AttributeValue('Radius', 'rain-radius', 2, 0)
      .requireValue('spread', ['Rain'])
      .setTooltip('The radius of the rain emission area in blocks'),
  );

  // Offsets
  component.data.push(
    new AttributeValue('Forward Offset', 'forward', 0, 0).setTooltip(
      'How far forward in front of the target the projectile should fire from in blocks. A negative value will put it behind.',
    ),
  );
  component.data.push(
    new AttributeValue('Upward Offset', 'upward', 0, 0).setTooltip(
      'How far above the target the projectile should fire from in blocks. A negative value will put it below.',
    ),
  );
  component.data.push(
    new AttributeValue('Right Offset', 'right', 0, 0).setTooltip(
      'How far to the right of the target the projectile should fire from. A negative value will put it to the left.',
    ),
  );
};

/**
 * Adds the options for particle effects to the components
 *
 * @param {Component} component - the component to add to
 */
const addParticleOptions = (component) => {
  component.data.push(
    new ListValue('Particle', 'particle', getParticles, getParticles()[0]).setTooltip(
      'The type of particle to display. Particle effects that show the DX, DY, and DZ options are not compatible with Cauldron',
    ),
  );

  component.data.push(
    new ListValue('Material', 'material', getMaterials, getMaterials()[0])
      .requireValue('particle', ['Block Crack', 'Icon Crack'])
      .setTooltip('The material to use for the Block Crack or Icon Crack particles'),
  );
  component.data.push(
    new IntValue('Type', 'type', 0)
      .requireValue('particle', ['Block Crack', 'Icon Crack'])
      .setTooltip('The material data value to se for the Block Crack or Icon Crack particles'),
  );

  component.data.push(
    new ListValue(
      'Arrangement',
      'arrangement',
      ['Circle', 'Hemisphere', 'Sphere'],
      'Circle',
    ).setTooltip(
      'The arrangement to use for the particles. Circle is a 2D circle, Hemisphere is half a 3D sphere, and Sphere is a 3D sphere',
    ),
  );
  component.data.push(
    new AttributeValue('Radius', 'radius', 4, 0).setTooltip(
      'The radius of the arrangement in blocks',
    ),
  );
  component.data.push(
    new AttributeValue('Particles', 'particles', 20, 0).setTooltip(
      'The amount of particles to play',
    ),
  );

  // Circle arrangement direction
  component.data.push(
    new ListValue('Circle Direction', 'direction', ['XY', 'XZ', 'YZ'], 'XZ')
      .requireValue('arrangement', ['Circle'])
      .setTooltip(
        'The orientation of the circle. XY and YZ are vertical circles while XZ is a horizontal circle.',
      ),
  );

  // Bukkit particle data value
  component.data.push(
    new IntValue('Data', 'data', 0)
      .requireValue('particle', ['Smoke', 'Ender Signal', 'Mobspawner Flames', 'Potion Break'])
      .setTooltip(
        'The data value to use for the particle. The effect changes between particles such as the orientation for smoke particles or the color for potion break',
      ),
  );

  // Reflection particle data
  // Note: Some of the particles are not in / not matching the original SkillAPI's REFLECT_PARTICLES map in ParticleHelper.java
  // However, they are still usable because all the map does is to convert their names to the enum names (in the latest version)
  // I thought "reflection" here means the particle is sent by a packet using Reflection, while the other particles
  // are sent by Spigot API. However, SkillAPI actually uses Reflection to send packets for ALL particles types.
  // Maybe Eniripsa didn't cleanup the code? I don't know. I don't want to bother digging its history.
  // And in the editor, only the reflection particles can have dx, dy, dz, speed, amount and visible-radius options.
  // It's very confusing. I haven't verfied and tested them, but I know visible-radius and amount must be valid for all particles.
  // However, speed, dx, dy, dz are only useful for certain types. I'm assuming the types in the
  // list below are the ones that support them (speed, dx, dy, dz).
  // FIXME: Verify and test the dx, dy, dz options for all particles.
  const reflectList = [
    'Villager Angry',
    'Water Bubble',
    'Cloud',
    'Crit',
    'Damage Indicator',
    'Suspended Depth',
    'Dragon Breath',
    'Drip Lava',
    'Drip Water',
    'Enchantment Table',
    'End Rod',
    'Explosion Normal',
    'Fireworks Spark',
    'Flame',
    'Footstep',
    'Villager Happy',
    'Heart',
    'Explosion Huge',
    'Spell Instant',
    'Explosion Large',
    'Smoke Large',
    'Lava',
    'Crit Magic',
    'Spell Mob',
    'Spell Mob Ambient',
    'Note',
    'Portal',
    'Redstone',
    'Slime',
    'Snowball',
    'Snow Shovel',
    'Spell',
    'Water Splash',
    'Suspended',
    'Sweep Attack',
    'Town Aura',
    'Water Drop',
    'Water Wake',
    'Spell Witch',
  ];
  component.data.push(
    new IntValue('Visible Radius', 'visible-radius', 25).setTooltip(
      'How far away players can see the particles from in blocks',
    ),
  );
  component.data.push(
    new DoubleValue('DX', 'dx', 0)
      .requireValue('particle', reflectList)
      .setTooltip(
        'A packet variable that varies between particles. It generally is used for how far from the position a particle can move in the X direction.',
      ),
  );
  component.data.push(
    new DoubleValue('DY', 'dy', 0)
      .requireValue('particle', reflectList)
      .setTooltip(
        'A packet variable that varies between particles. It generally is used for how far from the position a particle can move in the Y direction.',
      ),
  );
  component.data.push(
    new DoubleValue('DZ', 'dz', 0)
      .requireValue('particle', reflectList)
      .setTooltip(
        'A packet variable that varies between particles. It generally is used for how far from the position a particle can move in the Z direction.',
      ),
  );
  component.data.push(
    new DoubleValue('Particle Speed', 'speed', 1)
      .requireValue('particle', reflectList)
      .setTooltip(
        'A packet variable that varies between particles. It generally controlls the color or velocity of the particle.',
      ),
  );
  component.data.push(
    new DoubleValue('Packet Amount', 'amount', 1).setTooltip(
      'A packet variable that varies between particles. Setting this to 0 lets you control the color of some particles.',
    ),
  );
};

const addEffectOptions = (component, optional) => {
  let opt = appendNone;
  if (optional) {
    opt = appendOptional;

    component.data.push(
      new ListValue('Use Effect', 'use-effect', ['True', 'False'], 'False').setTooltip(
        'Whether or not to use the premium particle effects.',
      ),
    );
  }

  component.data.push(
    opt(
      new StringValue('Effect Key', 'effect-key', 'default').setTooltip(
        'The key to refer to the effect by. Only one effect of each key can be active at a time.',
      ),
    ),
  );
  component.data.push(
    opt(
      new AttributeValue('Duration', 'duration', 1, 0).setTooltip(
        'The time to play the effect for in seconds',
      ),
    ),
  );

  component.data.push(
    opt(
      new StringValue('Shape', '-shape', 'hexagon').setTooltip(
        'Key of a formula for deciding where particles are played each iteration. View "effects.yml" for a list of defined formulas and their keys.',
      ),
    ),
  );
  component.data.push(
    opt(
      new ListValue('Shape Direction', '-shape-dir', ['XY', 'YZ', 'XZ'], 'XY').setTooltip(
        'The plane the shape formula applies to. XZ would be flat, the other two are vertical.',
      ),
    ),
  );
  component.data.push(
    opt(
      new StringValue('Shape Size', '-shape-size', '1').setTooltip(
        'Formula for deciding the size of the shape. This can be any sort of formula using the operations defined in the wiki.',
      ),
    ),
  );
  component.data.push(
    opt(
      new StringValue('Animation', '-animation', 'one-circle').setTooltip(
        'Key of a formula for deciding where the particle effect moves relative to the target. View "effects.yml" for a list of defined formulas and their keys.',
      ),
    ),
  );
  component.data.push(
    opt(
      new ListValue('Animation Direction', '-anim-dir', ['XY', 'YZ', 'XZ'], 'XZ').setTooltip(
        'The plane the animation motion moves through. XZ wold be flat, the other two are vertical.',
      ),
    ),
  );
  component.data.push(
    opt(
      new StringValue('Animation Size', '-anim-size', '1').setTooltip(
        'Formula for deciding the multiplier of the animation distance. This can be any sort of formula using the operations defined in the wiki.',
      ),
    ),
  );
  component.data.push(
    opt(
      new IntValue('Interval', '-interval', 1).setTooltip(
        'Number of ticks between playing particles.',
      ),
    ),
  );
  component.data.push(
    opt(
      new IntValue('View Range', '-view-range', 25).setTooltip(
        'How far away the effect can be seen from',
      ),
    ),
  );

  component.data.push(
    opt(
      new ListValue(
        'Particle Type',
        '-particle-type',
        getParticles(),
        getParticles()[0],
      ).setTooltip('The type of particle to use'),
    ),
  );
  component.data.push(
    opt(
      new ListValue('Particle Material', '-particle-material', getMaterials, 'Wood')
        .requireValue('-particle-type', ['Block Crack', 'Icon Crack'])
        .setTooltip('The material to use for the particle'),
    ),
  );
  component.data.push(
    opt(
      new IntValue('Particle Data', '-particle-data', 0)
        .requireValue('-particle-type', ['Block Crack', 'Icon Crack'])
        .setTooltip('The data value for the material used by the particle'),
    ),
  );
  component.data.push(
    opt(
      new IntValue('Particle Num', '-particle-amount', 0).setTooltip(
        'The integer data for the particle, often labeled as "amount"',
      ),
    ),
  );
  component.data.push(
    opt(
      new DoubleValue('DX', '-particle-dx', 0).setTooltip(
        'Particle DX value, often used for color',
      ),
    ),
  );
  component.data.push(
    opt(
      new DoubleValue('DY', '-particle-dy', 0).setTooltip(
        'Particle DY value, often used for color',
      ),
    ),
  );
  component.data.push(
    opt(
      new DoubleValue('DZ', '-particle-dz', 0).setTooltip(
        'Particle DZ value, often used for color',
      ),
    ),
  );
  component.data.push(
    opt(
      new DoubleValue('Speed', '-particle-speed', 1).setTooltip(
        'Speed value for the particle, sometimes relating to velocity',
      ),
    ),
  );
};

export { addItemOptions, addProjectileOptions, addParticleOptions, addEffectOptions };
