import Phaser from 'phaser';

export function createProceduralTextures(scene: Phaser.Scene) {
  const gfx = scene.make.graphics({ x: 0, y: 0 });

  // 1. Player Sprite (48x48)
  if (!scene.textures.exists('player')) {
    gfx.clear();
    // Shadow
    gfx.fillStyle(0x000000, 0.3);
    gfx.fillEllipse(24, 42, 28, 12);
    // Body & Cloak
    gfx.fillStyle(0x16a34a, 1); // Emerald tunic
    gfx.fillRoundedRect(14, 18, 20, 22, 6);
    // Belt & Quiver
    gfx.fillStyle(0x78350f, 1);
    gfx.fillRect(14, 28, 20, 4);
    gfx.fillRect(28, 12, 6, 16);
    // Head / Face
    gfx.fillStyle(0xfde047, 1); // Blonde hair
    gfx.fillCircle(24, 14, 10);
    gfx.fillStyle(0xfbcfe8, 1); // Face skin
    gfx.fillCircle(24, 15, 8);
    // Eyes
    gfx.fillStyle(0x1e293b, 1);
    gfx.fillCircle(22, 14, 1.5);
    gfx.fillCircle(26, 14, 1.5);
    // Archer Feather Hat
    gfx.fillStyle(0x15803d, 1);
    gfx.fillTriangle(14, 10, 34, 10, 24, 2);
    gfx.fillStyle(0xef4444, 1); // Red feather
    gfx.fillTriangle(26, 6, 32, 2, 28, 10);
    // Bow in hand
    gfx.lineStyle(2.5, 0xb45309, 1);
    gfx.beginPath();
    gfx.arc(34, 22, 10, -Math.PI / 2, Math.PI / 2, false);
    gfx.strokePath();
    gfx.lineStyle(1, 0xffffff, 0.8);
    gfx.lineBetween(34, 12, 34, 32);

    gfx.generateTexture('player', 48, 48);
  }

  // 2. Melee Stalker (44x44) - Green/Brown Goblin/Slime
  if (!scene.textures.exists('stalker')) {
    gfx.clear();
    gfx.fillStyle(0x000000, 0.3);
    gfx.fillEllipse(22, 38, 24, 10);
    // Slime body
    gfx.fillStyle(0x22c55e, 1);
    gfx.fillCircle(22, 22, 16);
    // Spikes/Horns
    gfx.fillStyle(0x15803d, 1);
    gfx.fillTriangle(10, 14, 6, 4, 16, 10);
    gfx.fillTriangle(34, 14, 38, 4, 28, 10);
    // Angry Eyes
    gfx.fillStyle(0xfef08a, 1);
    gfx.fillCircle(17, 20, 4);
    gfx.fillCircle(27, 20, 4);
    gfx.fillStyle(0xdc2626, 1);
    gfx.fillCircle(18, 20, 2);
    gfx.fillCircle(26, 20, 2);
    // Mouth
    gfx.fillStyle(0x0f172a, 1);
    gfx.fillTriangle(18, 28, 26, 28, 22, 32);

    gfx.generateTexture('stalker', 44, 44);
  }

  // 3. Ranged Sniper (44x44) - Purple Necro / Archer
  if (!scene.textures.exists('sniper')) {
    gfx.clear();
    gfx.fillStyle(0x000000, 0.3);
    gfx.fillEllipse(22, 38, 24, 10);
    // Cloak
    gfx.fillStyle(0x7c3aed, 1);
    gfx.fillTriangle(8, 38, 36, 38, 22, 12);
    // Hood & Skull Face
    gfx.fillStyle(0x5b21b6, 1);
    gfx.fillCircle(22, 16, 10);
    gfx.fillStyle(0xf1f5f9, 1);
    gfx.fillCircle(22, 17, 7);
    // Glowing Cyan Eyes
    gfx.fillStyle(0x06b6d4, 1);
    gfx.fillCircle(19, 16, 2);
    gfx.fillCircle(25, 16, 2);
    // Dark Staff
    gfx.lineStyle(3, 0x334155, 1);
    gfx.lineBetween(32, 6, 32, 38);
    gfx.fillStyle(0xa855f7, 1);
    gfx.fillCircle(32, 6, 5);

    gfx.generateTexture('sniper', 44, 44);
  }

  // 4. Charger/Dasher (50x50) - Armored Red Minotaur/Boar
  if (!scene.textures.exists('charger')) {
    gfx.clear();
    gfx.fillStyle(0x000000, 0.3);
    gfx.fillEllipse(25, 42, 30, 12);
    // Muscular body
    gfx.fillStyle(0xb91c1c, 1);
    gfx.fillRoundedRect(10, 14, 30, 26, 8);
    // Big Golden Horns
    gfx.fillStyle(0xf59e0b, 1);
    gfx.fillTriangle(8, 18, 0, 4, 18, 12);
    gfx.fillTriangle(42, 18, 50, 4, 32, 12);
    // Face & Snout
    gfx.fillStyle(0x991b1b, 1);
    gfx.fillCircle(25, 20, 11);
    gfx.fillStyle(0xfca5a5, 1);
    gfx.fillRoundedRect(18, 22, 14, 8, 3);
    // Piercing Red Eyes
    gfx.fillStyle(0xffffff, 1);
    gfx.fillCircle(21, 16, 2.5);
    gfx.fillCircle(29, 16, 2.5);
    gfx.fillStyle(0x450a0a, 1);
    gfx.fillCircle(21, 16, 1.2);
    gfx.fillCircle(29, 16, 1.2);

    gfx.generateTexture('charger', 50, 50);
  }

  // 5. Boss Minotaur Lord (90x90)
  if (!scene.textures.exists('boss_minotaur')) {
    gfx.clear();
    gfx.fillStyle(0x000000, 0.4);
    gfx.fillEllipse(45, 80, 60, 18);
    // Massive Body Armor
    gfx.fillStyle(0x7f1d1d, 1);
    gfx.fillRoundedRect(20, 25, 50, 50, 14);
    gfx.fillStyle(0xd97706, 1); // Gold Chestplate
    gfx.fillRoundedRect(26, 32, 38, 30, 8);
    // Giant Curved Horns
    gfx.fillStyle(0xfbbf24, 1);
    gfx.fillTriangle(18, 30, 2, 6, 32, 22);
    gfx.fillTriangle(72, 30, 88, 6, 58, 22);
    // Fierce Head
    gfx.fillStyle(0x991b1b, 1);
    gfx.fillCircle(45, 28, 18);
    // Glowing Fiery Eyes
    gfx.fillStyle(0xfef08a, 1);
    gfx.fillCircle(38, 24, 4);
    gfx.fillCircle(52, 24, 4);
    gfx.fillStyle(0xdc2626, 1);
    gfx.fillCircle(38, 24, 2);
    gfx.fillCircle(52, 24, 2);
    // Giant War Axe
    gfx.lineStyle(5, 0x475569, 1);
    gfx.lineBetween(74, 10, 74, 78);
    gfx.fillStyle(0x94a3b8, 1);
    gfx.fillTriangle(74, 12, 88, 2, 88, 28);
    gfx.fillTriangle(74, 12, 60, 2, 60, 28);

    gfx.generateTexture('boss_minotaur', 90, 90);
  }

  // 6. Boss Dragon / Void Wyrm (96x96)
  if (!scene.textures.exists('boss_dragon')) {
    gfx.clear();
    gfx.fillStyle(0x000000, 0.4);
    gfx.fillEllipse(48, 84, 70, 20);
    // Dragon Wings
    gfx.fillStyle(0x4338ca, 1);
    gfx.fillTriangle(8, 48, 48, 30, 16, 12);
    gfx.fillTriangle(88, 48, 48, 30, 80, 12);
    // Dragon Body & Scales
    gfx.fillStyle(0x3730a3, 1);
    gfx.fillCircle(48, 48, 26);
    gfx.fillStyle(0x6366f1, 1);
    gfx.fillCircle(48, 32, 18);
    // Spines along spine
    gfx.fillStyle(0x06b6d4, 1);
    gfx.fillTriangle(48, 10, 44, 20, 52, 20);
    gfx.fillTriangle(48, 24, 43, 34, 53, 34);
    // Glowing Arcane Eyes
    gfx.fillStyle(0x22d3ee, 1);
    gfx.fillCircle(41, 30, 4);
    gfx.fillCircle(55, 30, 4);
    gfx.fillStyle(0xffffff, 1);
    gfx.fillCircle(41, 30, 1.5);
    gfx.fillCircle(55, 30, 1.5);

    gfx.generateTexture('boss_dragon', 96, 96);
  }

  // 7. Player Arrow (28x10)
  if (!scene.textures.exists('arrow')) {
    gfx.clear();
    // Arrow Shaft
    gfx.lineStyle(2.5, 0xfde047, 1);
    gfx.lineBetween(2, 5, 20, 5);
    // Arrow Head
    gfx.fillStyle(0xffffff, 1);
    gfx.fillTriangle(20, 1, 28, 5, 20, 9);
    // Fletching (Feathers)
    gfx.fillStyle(0x38bdf8, 1);
    gfx.fillTriangle(0, 2, 6, 5, 0, 5);
    gfx.fillTriangle(0, 8, 6, 5, 0, 5);

    gfx.generateTexture('arrow', 28, 10);
  }

  // 8. Enemy Projectile (16x16)
  if (!scene.textures.exists('enemy_bullet')) {
    gfx.clear();
    gfx.fillStyle(0xef4444, 0.4);
    gfx.fillCircle(8, 8, 8);
    gfx.fillStyle(0xdc2626, 1);
    gfx.fillCircle(8, 8, 5);
    gfx.fillStyle(0xfef08a, 1);
    gfx.fillCircle(8, 8, 2.5);

    gfx.generateTexture('enemy_bullet', 16, 16);
  }

  // 9. Boss Magma Orb (24x24)
  if (!scene.textures.exists('boss_orb')) {
    gfx.clear();
    gfx.fillStyle(0xf97316, 0.35);
    gfx.fillCircle(12, 12, 12);
    gfx.fillStyle(0xea580c, 0.8);
    gfx.fillCircle(12, 12, 8);
    gfx.fillStyle(0xfef08a, 1);
    gfx.fillCircle(12, 12, 4);

    gfx.generateTexture('boss_orb', 24, 24);
  }

  // 10. EXP Gem (20x20)
  if (!scene.textures.exists('gem_exp')) {
    gfx.clear();
    gfx.fillStyle(0x38bdf8, 0.3);
    gfx.fillCircle(10, 10, 9);
    gfx.fillStyle(0x0284c7, 1);
    gfx.fillTriangle(10, 2, 18, 10, 2, 10);
    gfx.fillStyle(0x38bdf8, 1);
    gfx.fillTriangle(10, 18, 18, 10, 2, 10);
    gfx.fillStyle(0xffffff, 0.8);
    gfx.fillCircle(8, 7, 2);

    gfx.generateTexture('gem_exp', 20, 20);
  }

  // 11. Gold Coin (20x20)
  if (!scene.textures.exists('coin')) {
    gfx.clear();
    gfx.fillStyle(0xf59e0b, 1);
    gfx.fillCircle(10, 10, 8);
    gfx.fillStyle(0xfef08a, 1);
    gfx.fillCircle(10, 10, 6);
    gfx.fillStyle(0xd97706, 1);
    gfx.fillRect(8.5, 6, 3, 8);

    gfx.generateTexture('coin', 20, 20);
  }

  // 12. Heart Pickup (22x20)
  if (!scene.textures.exists('heart')) {
    gfx.clear();
    gfx.fillStyle(0xef4444, 1);
    gfx.fillCircle(7, 7, 6);
    gfx.fillCircle(15, 7, 6);
    gfx.fillTriangle(1, 8, 21, 8, 11, 19);
    gfx.fillStyle(0xffffff, 0.6);
    gfx.fillCircle(6, 5, 2);

    gfx.generateTexture('heart', 22, 20);
  }

  // 13. Obstacle Rock (40x40)
  if (!scene.textures.exists('obstacle_rock')) {
    gfx.clear();
    gfx.fillStyle(0x000000, 0.3);
    gfx.fillEllipse(20, 34, 28, 10);
    gfx.fillStyle(0x475569, 1);
    gfx.fillRoundedRect(4, 8, 32, 26, 8);
    gfx.fillStyle(0x64748b, 1);
    gfx.fillRoundedRect(8, 10, 24, 18, 4);
    gfx.fillStyle(0x94a3b8, 1);
    gfx.fillCircle(14, 14, 4);

    gfx.generateTexture('obstacle_rock', 40, 40);
  }

  // 14. Obstacle Pillar (40x54)
  if (!scene.textures.exists('obstacle_pillar')) {
    gfx.clear();
    gfx.fillStyle(0x000000, 0.3);
    gfx.fillEllipse(20, 48, 28, 10);
    // Base & Capital
    gfx.fillStyle(0x334155, 1);
    gfx.fillRect(4, 40, 32, 10);
    gfx.fillRect(4, 4, 32, 8);
    // Shaft
    gfx.fillStyle(0x475569, 1);
    gfx.fillRect(8, 12, 24, 28);
    // Runes / Highlight
    gfx.fillStyle(0x38bdf8, 0.8);
    gfx.fillRect(16, 20, 8, 3);
    gfx.fillRect(16, 28, 8, 3);

    gfx.generateTexture('obstacle_pillar', 40, 54);
  }

  // 15. Spike Trap (36x36)
  if (!scene.textures.exists('spike_trap')) {
    gfx.clear();
    gfx.fillStyle(0x1e293b, 1);
    gfx.fillRoundedRect(2, 2, 32, 32, 4);
    gfx.fillStyle(0x94a3b8, 1);
    // 4 metal spikes
    gfx.fillTriangle(6, 16, 12, 4, 18, 16);
    gfx.fillTriangle(18, 16, 24, 4, 30, 16);
    gfx.fillTriangle(6, 32, 12, 20, 18, 32);
    gfx.fillTriangle(18, 32, 24, 20, 30, 32);

    gfx.generateTexture('spike_trap', 36, 36);
  }

  // 16. Dungeon Exit Door (64x64)
  if (!scene.textures.exists('door_portal')) {
    gfx.clear();
    // Portal Arch
    gfx.fillStyle(0x1e293b, 1);
    gfx.fillRoundedRect(6, 4, 52, 56, 10);
    // Glowing Void
    gfx.fillStyle(0x38bdf8, 0.8);
    gfx.fillCircle(32, 32, 20);
    gfx.fillStyle(0xffffff, 0.9);
    gfx.fillCircle(32, 32, 10);
    // Runes
    gfx.fillStyle(0xfbbf24, 1);
    gfx.fillCircle(32, 12, 4);
    gfx.fillCircle(14, 32, 3);
    gfx.fillCircle(50, 32, 3);

    gfx.generateTexture('door_portal', 64, 64);
  }

  // 17. Angel Sprite (60x60)
  if (!scene.textures.exists('angel')) {
    gfx.clear();
    // Radiant halo
    gfx.lineStyle(3, 0xfde047, 1);
    gfx.strokeCircle(30, 12, 8);
    // Wings
    gfx.fillStyle(0xffffff, 0.9);
    gfx.fillTriangle(6, 34, 30, 24, 14, 10);
    gfx.fillTriangle(54, 34, 30, 24, 46, 10);
    // Robe
    gfx.fillStyle(0xf0fdf4, 1);
    gfx.fillTriangle(14, 56, 46, 56, 30, 20);
    // Head
    gfx.fillStyle(0xfbcfe8, 1);
    gfx.fillCircle(30, 20, 7);
    gfx.fillStyle(0xfde047, 1);
    gfx.fillCircle(30, 16, 5);

    gfx.generateTexture('angel', 60, 60);
  }

  // 18. Shield Orb (18x18)
  if (!scene.textures.exists('shield_orb')) {
    gfx.clear();
    gfx.fillStyle(0x06b6d4, 0.4);
    gfx.fillCircle(9, 9, 8);
    gfx.fillStyle(0x22d3ee, 1);
    gfx.fillCircle(9, 9, 5);
    gfx.fillStyle(0xffffff, 0.9);
    gfx.fillCircle(9, 9, 2);

    gfx.generateTexture('shield_orb', 18, 18);
  }

  // 19. Dungeon Tile (40x40)
  if (!scene.textures.exists('floor_tile')) {
    gfx.clear();
    gfx.fillStyle(0x0f172a, 1); // Dark slate base
    gfx.fillRect(0, 0, 40, 40);
    gfx.fillStyle(0x1e293b, 1);
    gfx.fillRect(1, 1, 38, 38);
    gfx.fillStyle(0x334155, 0.2);
    gfx.fillRect(2, 2, 18, 18);
    gfx.fillRect(22, 22, 16, 16);

    gfx.generateTexture('floor_tile', 40, 40);
  }

  gfx.destroy();
}
