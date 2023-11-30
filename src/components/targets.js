/* eslint-disable max-classes-per-file */

import { ListValue, AttributeValue, StringValue } from '../input.js';
import { Component, Type } from './component.js';

class TargetArea extends Component {
  constructor() {
    super('Area', Type.TARGET, true);

    this.description =
      'Targets all units in a radius from the current target (the casting player is the default target).';

    this.data.push(
      new AttributeValue('Radius', 'radius', 3, 0).setTooltip(
        'The radius of the area to target in blocks',
      ),
    );
    this.data.push(
      new ListValue('Group', 'group', ['Ally', 'Enemy', 'Both'], 'Enemy').setTooltip(
        'The alignment of targets to get',
      ),
    );
    this.data.push(
      new ListValue('Through Wall', 'wall', ['True', 'False'], 'False').setTooltip(
        'Whether or not to allow targets to be on the other side of a wall',
      ),
    );
    this.data.push(
      new ListValue('Include Caster', 'caster', ['True', 'False'], 'False').setTooltip(
        'Whether or not to include the caster in the target list',
      ),
    );
    this.data.push(
      new AttributeValue('Max Targets', 'max', 99, 0).setTooltip(
        'The max amount of targets to apply children to',
      ),
    );
    this.data.push(
      new ListValue('Random', 'random', ['True', 'False'], 'False').setTooltip(
        'Whether or not to randomize the targets selected',
      ),
    );
  }
}

class TargetCone extends Component {
  constructor() {
    super('Cone', Type.TARGET, true);

    this.description =
      'Targets all units in a line in front of the current target (the casting player is the default target). If you include the caster, that counts towards the max amount.';

    this.data.push(
      new AttributeValue('Range', 'range', 5, 0).setTooltip(
        'The max distance away any target can be in blocks',
      ),
    );
    this.data.push(
      new AttributeValue('Angle', 'angle', 90, 0).setTooltip(
        'The angle of the cone arc in degrees',
      ),
    );
    this.data.push(
      new ListValue('Group', 'group', ['Ally', 'Enemy', 'Both'], 'Enemy').setTooltip(
        'The alignment of targets to get',
      ),
    );
    this.data.push(
      new ListValue('Through Wall', 'wall', ['True', 'False'], 'False').setTooltip(
        'Whether or not to allow targets to be on the other side of a wall',
      ),
    );
    this.data.push(
      new ListValue('Include Caster', 'caster', ['True', 'False'], 'False').setTooltip(
        'Whether or not to include the caster in the target list',
      ),
    );
    this.data.push(
      new AttributeValue('Max Targets', 'max', 99, 0).setTooltip(
        'The max amount of targets to apply children to',
      ),
    );
  }
}

class TargetLinear extends Component {
  constructor() {
    super('Linear', Type.TARGET, true);

    this.description =
      'Targets all units in a line in front of the current target (the casting player is the default target).';

    this.data.push(
      new AttributeValue('Range', 'range', 5, 0).setTooltip(
        'The max distance away any target can be in blocks',
      ),
    );
    this.data.push(
      new AttributeValue('Tolerance', 'tolerance', 4, 0).setTooltip(
        'How lenient the targeting is. Larger numbers allow easier targeting. It is essentially how wide a cone is which is where you are targeting.',
      ),
    );
    this.data.push(
      new ListValue('Group', 'group', ['Ally', 'Enemy', 'Both'], 'Enemy').setTooltip(
        'The alignment of targets to get',
      ),
    );
    this.data.push(
      new ListValue('Through Wall', 'wall', ['True', 'False'], 'False').setTooltip(
        'Whether or not to allow targets to be on the other side of a wall',
      ),
    );
    this.data.push(
      new ListValue('Include Caster', 'caster', ['True', 'False'], 'False').setTooltip(
        'Whether or not to include the caster in the target list',
      ),
    );
    this.data.push(
      new AttributeValue('Max Targets', 'max', 99, 0).setTooltip(
        'The max amount of targets to apply children to',
      ),
    );
  }
}

class TargetLocation extends Component {
  constructor() {
    super('Location', Type.TARGET, true);

    this.description =
      'Targets the reticle location of the target or caster. Combine this with another targeting type for ranged area effects.';

    this.data.push(
      new AttributeValue('Range', 'range', 5, 0).setTooltip('The max distance the location can be'),
    );
    this.data.push(
      new ListValue('Ground Only', 'ground', ['True', 'False'], 'True').setTooltip(
        'Whether or not a player is only allowed to target the ground or other units',
      ),
    );
  }
}

class TargetNearest extends Component {
  constructor() {
    super('Nearest', Type.TARGET, true);

    this.description =
      'Targets the closest unit(s) in a radius from the current target (the casting player is the default target). If you include the caster, that counts towards the max number.';

    this.data.push(
      new AttributeValue('Radius', 'radius', 3, 0).setTooltip(
        'The radius of the area to target in blocks',
      ),
    );
    this.data.push(
      new ListValue('Group', 'group', ['Ally', 'Enemy', 'Both'], 'Enemy').setTooltip(
        'The alignment of targets to get',
      ),
    );
    this.data.push(
      new ListValue('Through Wall', 'wall', ['True', 'False'], 'False').setTooltip(
        'Whether or not to allow targets to be on the other side of a wall',
      ),
    );
    this.data.push(
      new ListValue('Include Caster', 'caster', ['True', 'False'], 'False').setTooltip(
        'Whether or not to include the caster in the target list',
      ),
    );
    this.data.push(
      new AttributeValue('Max Targets', 'max', 1, 0).setTooltip(
        'The max amount of targets to apply children to',
      ),
    );
  }
}

class TargetOffset extends Component {
  constructor() {
    super('Offset', Type.TARGET, true);

    this.description = 'Targets a location that is the given offset away from each target.';

    this.data.push(
      new AttributeValue('Forward', 'forward', 0, 0).setTooltip(
        'The offset from the target in the direction they are facing. Negative numbers go backwards.',
      ),
    );
    this.data.push(
      new AttributeValue('Upward', 'upward', 2, 0.5).setTooltip(
        'The offset from the target upwards. Negative numbers go below them.',
      ),
    );
    this.data.push(
      new AttributeValue('Right', 'right', 0, 0).setTooltip(
        'The offset from the target to their right. Negative numbers go to the left.',
      ),
    );
  }
}

class TargetRemember extends Component {
  constructor() {
    super('Remember', Type.TARGET, true);

    this.description =
      'Targets entities stored using the "Remember Targets" mechanic for the matching key. If it was never set, this will fail.';

    this.data.push(
      new StringValue('Key', 'key', 'target').setTooltip(
        'The unique key for the target group that should match that used by the "Remember Targets" skill',
      ),
    );
  }
}

class TargetSelf extends Component {
  constructor() {
    super('Self', Type.TARGET, true);

    this.description = 'Returns the current target back to the caster.';
  }
}

class TargetSingle extends Component {
  constructor() {
    super('Single', Type.TARGET, true);

    this.description =
      'Targets a single unit in front of the current target (the casting player is the default target).';

    this.data.push(
      new AttributeValue('Range', 'range', 5, 0).setTooltip(
        'The max distance away any target can be in blocks',
      ),
    );
    this.data.push(
      new AttributeValue('Tolerance', 'tolerance', 4, 0).setTooltip(
        'How lenient the targeting is. Larger numbers allow easier targeting. It is essentially how wide a cone is which is where you are targeting.',
      ),
    );
    this.data.push(
      new ListValue('Group', 'group', ['Ally', 'Enemy', 'Both'], 'Enemy').setTooltip(
        'The alignment of targets to get',
      ),
    );
    this.data.push(
      new ListValue('Through Wall', 'wall', ['True', 'False'], 'False').setTooltip(
        'Whether or not to allow targets to be on the other side of a wall',
      ),
    );
  }
}

export {
  TargetArea,
  TargetCone,
  TargetLinear,
  TargetLocation,
  TargetNearest,
  TargetOffset,
  TargetRemember,
  TargetSelf,
  TargetSingle,
};
