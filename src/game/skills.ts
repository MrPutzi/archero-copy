import { PlayerStats, SkillDefinition } from '../types/game';

export const ALL_SKILLS: SkillDefinition[] = [
  {
    id: 'multishot',
    name: 'Multishot',
    description: 'Fires an extra consecutive arrow volley. Individual arrow dmg -10%, Attack speed -15%.',
    icon: '⚡',
    rarity: 'epic',
    stackable: true,
    apply: (stats: PlayerStats): PlayerStats => {
      return {
        ...stats,
        multishot: stats.multishot + 1,
        baseAttack: Math.max(1, Math.round(stats.baseAttack * 0.9)),
        attackSpeed: Number((stats.attackSpeed * 0.85).toFixed(2)),
      };
    },
  },
  {
    id: 'front_arrow',
    name: 'Front Arrow +1',
    description: 'Fires an extra parallel front arrow. Individual arrow dmg -15%.',
    icon: '🏹',
    rarity: 'epic',
    stackable: true,
    apply: (stats: PlayerStats): PlayerStats => {
      return {
        ...stats,
        frontArrows: stats.frontArrows + 1,
        baseAttack: Math.max(1, Math.round(stats.baseAttack * 0.85)),
      };
    },
  },
  {
    id: 'diagonal_arrows',
    name: 'Diagonal Arrows',
    description: 'Fires 2 additional arrows at +45° and -45° angles with full damage.',
    icon: '↗️',
    rarity: 'rare',
    stackable: false,
    apply: (stats: PlayerStats): PlayerStats => {
      return {
        ...stats,
        diagonalArrows: true,
      };
    },
  },
  {
    id: 'side_arrows',
    name: 'Side Arrows',
    description: 'Fires 2 additional arrows laterally (+90° and -90°).',
    icon: '↔️',
    rarity: 'common',
    stackable: false,
    apply: (stats: PlayerStats): PlayerStats => {
      return {
        ...stats,
        sideArrows: true,
      };
    },
  },
  {
    id: 'rear_arrow',
    name: 'Rear Arrow',
    description: 'Fires 1 additional arrow directly behind you (180°).',
    icon: '⬇️',
    rarity: 'common',
    stackable: false,
    apply: (stats: PlayerStats): PlayerStats => {
      return {
        ...stats,
        rearArrow: true,
      };
    },
  },
  {
    id: 'ricochet',
    name: 'Ricochet',
    description: 'Arrows bounce between up to 3 nearby enemies within 200px.',
    icon: '💫',
    rarity: 'legendary',
    stackable: false,
    apply: (stats: PlayerStats): PlayerStats => {
      return {
        ...stats,
        ricochetBounces: stats.ricochetBounces + 3,
      };
    },
  },
  {
    id: 'piercing_shot',
    name: 'Piercing Shot',
    description: 'Arrows pierce through targets up to 2 times (-33% dmg per passthrough).',
    icon: '🗡️',
    rarity: 'rare',
    stackable: false,
    apply: (stats: PlayerStats): PlayerStats => {
      return {
        ...stats,
        piercingCount: stats.piercingCount + 2,
      };
    },
  },
  {
    id: 'bouncy_wall',
    name: 'Bouncy Wall',
    description: 'Arrows bounce off room walls up to 2 times without dissipating.',
    icon: '🧱',
    rarity: 'epic',
    stackable: false,
    apply: (stats: PlayerStats): PlayerStats => {
      return {
        ...stats,
        bouncyWall: true,
      };
    },
  },
  {
    id: 'blaze',
    name: 'Blaze Strike',
    description: 'Arrows ignite foes, dealing rapid fire burn damage over 2 seconds.',
    icon: '🔥',
    rarity: 'rare',
    stackable: false,
    apply: (stats: PlayerStats): PlayerStats => {
      const elements = stats.elements.includes('blaze') ? stats.elements : [...stats.elements, 'blaze' as const];
      return { ...stats, elements };
    },
  },
  {
    id: 'poison',
    name: 'Toxic Venom',
    description: 'Infects targets with lingering poison that ticks until defeated.',
    icon: '🧪',
    rarity: 'rare',
    stackable: false,
    apply: (stats: PlayerStats): PlayerStats => {
      const elements = stats.elements.includes('poison') ? stats.elements : [...stats.elements, 'poison' as const];
      return { ...stats, elements };
    },
  },
  {
    id: 'freeze',
    name: 'Frostbite',
    description: 'Chills targets, slowing movement by 50% with occasional freeze proc.',
    icon: '❄️',
    rarity: 'rare',
    stackable: false,
    apply: (stats: PlayerStats): PlayerStats => {
      const elements = stats.elements.includes('freeze') ? stats.elements : [...stats.elements, 'freeze' as const];
      return { ...stats, elements };
    },
  },
  {
    id: 'lightning',
    name: 'Bolt Strike',
    description: 'Strikes chain lightning to all adjacent enemies on hit.',
    icon: '⚡',
    rarity: 'rare',
    stackable: false,
    apply: (stats: PlayerStats): PlayerStats => {
      const elements = stats.elements.includes('lightning') ? stats.elements : [...stats.elements, 'lightning' as const];
      return { ...stats, elements };
    },
  },
  {
    id: 'attack_boost',
    name: 'Attack Boost',
    description: 'Increases all base projectile damage by +25%.',
    icon: '⚔️',
    rarity: 'common',
    stackable: true,
    apply: (stats: PlayerStats): PlayerStats => {
      return {
        ...stats,
        baseAttack: Math.round(stats.baseAttack * 1.25),
      };
    },
  },
  {
    id: 'atk_speed_boost',
    name: 'Attack Speed +',
    description: 'Increases attack frequency by +25%.',
    icon: '💨',
    rarity: 'common',
    stackable: true,
    apply: (stats: PlayerStats): PlayerStats => {
      return {
        ...stats,
        attackSpeed: Number((stats.attackSpeed * 1.25).toFixed(2)),
      };
    },
  },
  {
    id: 'hp_boost',
    name: 'Max HP Boost',
    description: 'Increases Max HP by +25% and heals for the amount gained.',
    icon: '❤️',
    rarity: 'common',
    stackable: true,
    apply: (stats: PlayerStats): PlayerStats => {
      const hpGain = Math.round(stats.maxHp * 0.25);
      return {
        ...stats,
        maxHp: stats.maxHp + hpGain,
        currentHp: stats.currentHp + hpGain,
      };
    },
  },
  {
    id: 'crit_master',
    name: 'Crit Master',
    description: 'Increases Critical Hit Chance by +15% and Crit Multiplier by +0.5x.',
    icon: '🎯',
    rarity: 'epic',
    stackable: true,
    apply: (stats: PlayerStats): PlayerStats => {
      return {
        ...stats,
        critChance: Math.min(0.85, Number((stats.critChance + 0.15).toFixed(2))),
        critDamage: Number((stats.critDamage + 0.5).toFixed(2)),
      };
    },
  },
  {
    id: 'bloodthirst',
    name: 'Bloodthirst',
    description: 'Restores 2% of your Max HP whenever you defeat an enemy.',
    icon: '🩸',
    rarity: 'rare',
    stackable: false,
    apply: (stats: PlayerStats): PlayerStats => {
      return {
        ...stats,
        bloodthirst: true,
      };
    },
  },
  {
    id: 'shield_guard',
    name: 'Rotating Shield',
    description: 'Summons 2 orbiting energy orbs that block incoming enemy projectiles.',
    icon: '🛡️',
    rarity: 'epic',
    stackable: true,
    apply: (stats: PlayerStats): PlayerStats => {
      return {
        ...stats,
        shieldOrbs: (stats.shieldOrbs || 0) + 2,
      };
    },
  },
  {
    id: 'agility',
    name: 'Agility & Dodge',
    description: 'Increases movement speed by +15% and grants 10% damage reduction.',
    icon: '👟',
    rarity: 'common',
    stackable: true,
    apply: (stats: PlayerStats): PlayerStats => {
      return {
        ...stats,
        moveSpeed: Math.round(stats.moveSpeed * 1.15),
        damageReduction: Math.min(0.5, Number((stats.damageReduction + 0.1).toFixed(2))),
      };
    },
  },
];

export function getRandomSkills(count: number, currentStats: PlayerStats, chosenSkillIds: string[]): SkillDefinition[] {
  // Filter out non-stackable skills that have already been chosen
  const pool = ALL_SKILLS.filter(skill => {
    if (!skill.stackable && chosenSkillIds.includes(skill.id)) {
      return false;
    }
    return true;
  });

  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
