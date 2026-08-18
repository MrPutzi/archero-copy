import React, { useState } from 'react';
import { Check, Copy, Download, FileCode, X } from 'lucide-react';

interface StandaloneExportModalProps {
  onClose: () => void;
}

export const StandaloneExportModal: React.FC<StandaloneExportModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);

  const standaloneHtmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Archero Roguelite Prototype (Phaser 3)</title>
  <!-- Phaser 3 CDN -->
  <script src="https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
    body { background-color: #090d16; overflow: hidden; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: system-ui, -apple-system, sans-serif; }
    #game-container { position: relative; width: 100%; max-width: 540px; height: 100vh; max-height: 960px; }
    #skill-modal { display: none; position: absolute; inset: 0; background: rgba(9, 13, 22, 0.88); backdrop-filter: blur(8px); z-index: 50; flex-direction: column; align-items: center; justify-content: center; padding: 20px; }
    .skill-card { background: #1e293b; border: 2px solid #334155; border-radius: 16px; padding: 16px; margin: 8px 0; width: 100%; max-width: 380px; cursor: pointer; transition: all 0.2s; color: white; }
    .skill-card:hover { transform: translateY(-3px); border-color: #10b981; background: #0f172a; }
  </style>
</head>
<body>
  <div id="game-container">
    <div id="skill-modal">
      <h2 style="color: #38bdf8; font-size: 24px; font-weight: bold; margin-bottom: 6px;">LEVEL UP!</h2>
      <p style="color: #94a3b8; font-size: 14px; margin-bottom: 16px;">Choose one ability to reinforce your hero:</p>
      <div id="skills-list" style="width: 100%; display: flex; flex-direction: column; align-items: center;"></div>
    </div>
  </div>

  <script>
    // --- Web Audio Synthesizer ---
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;
    function playSfx(type) {
      try {
        if (!audioCtx) audioCtx = new AudioCtx();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const t = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        if (type === 'shoot') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(500, t);
          osc.frequency.exponentialRampToValueAtTime(150, t + 0.1);
          gain.gain.setValueAtTime(0.2, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
          osc.connect(gain); gain.connect(audioCtx.destination);
          osc.start(t); osc.stop(t + 0.11);
        } else if (type === 'hit') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(200, t);
          osc.frequency.exponentialRampToValueAtTime(50, t + 0.08);
          gain.gain.setValueAtTime(0.25, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
          osc.connect(gain); gain.connect(audioCtx.destination);
          osc.start(t); osc.stop(t + 0.09);
        } else if (type === 'levelup') {
          [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
            const o = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            o.type = 'triangle'; o.frequency.setValueAtTime(f, t + idx * 0.08);
            g.gain.setValueAtTime(0.2, t + idx * 0.08);
            g.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.08 + 0.15);
            o.connect(g); g.connect(audioCtx.destination);
            o.start(t + idx * 0.08); o.stop(t + idx * 0.08 + 0.16);
          });
        }
      } catch(e){}
    }

    // --- Main Game Scene ---
    class GameScene extends Phaser.Scene {
      constructor() { super('GameScene'); }

      create() {
        this.generateTextures();
        this.playerStats = {
          maxHp: 600, currentHp: 600, baseAttack: 45, attackSpeed: 1.3,
          moveSpeed: 240, critChance: 0.15, critDamage: 2.0,
          frontArrows: 1, multishot: 0, diagonal: false, ricochet: 0, pierce: 0,
          level: 1, exp: 0, nextExp: 80, room: 1
        };

        this.player = this.physics.add.sprite(270, 750, 'player');
        this.player.setCollideWorldBounds(true);
        this.player.body.setSize(28, 28);
        this.player.setDepth(20);

        this.aimLine = this.add.graphics().setDepth(15);
        this.enemies = [];
        this.projectiles = [];
        this.expGems = [];
        this.attackTimer = 0;
        this.inputVector = new Phaser.Math.Vector2(0, 0);

        // Virtual Touch Joystick Handlers
        this.input.on('pointerdown', (p) => { this.touchStart = { x: p.x, y: p.y }; });
        this.input.on('pointermove', (p) => {
          if (this.touchStart && p.isDown) {
            const dx = p.x - this.touchStart.x;
            const dy = p.y - this.touchStart.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 10) {
              const clamped = Math.min(dist, 60) / 60;
              this.inputVector.set((dx / dist) * clamped, (dy / dist) * clamped);
            }
          }
        });
        this.input.on('pointerup', () => { this.touchStart = null; this.inputVector.set(0, 0); });

        // HUD Text
        this.hudText = this.add.text(16, 16, '', { font: '16px monospace', fill: '#38bdf8' }).setDepth(30);

        this.spawnEnemies();
      }

      generateTextures() {
        const g = this.make.graphics();
        // Player
        g.fillStyle(0x16a34a, 1); g.fillRoundedRect(4, 4, 32, 32, 8);
        g.fillStyle(0xfde047, 1); g.fillCircle(20, 14, 8);
        g.generateTexture('player', 40, 40); g.clear();
        // Stalker Enemy
        g.fillStyle(0xef4444, 1); g.fillCircle(18, 18, 16);
        g.fillStyle(0xfde047, 1); g.fillCircle(14, 14, 3); g.fillCircle(22, 14, 3);
        g.generateTexture('stalker', 36, 36); g.clear();
        // Arrow
        g.fillStyle(0xfde047, 1); g.fillRect(0, 3, 20, 4);
        g.fillStyle(0xffffff, 1); g.fillTriangle(20, 0, 28, 5, 20, 10);
        g.generateTexture('arrow', 28, 10); g.clear();
        // EXP Gem
        g.fillStyle(0x38bdf8, 1); g.fillTriangle(8, 0, 16, 8, 0, 8);
        g.fillTriangle(8, 16, 16, 8, 0, 8);
        g.generateTexture('gem', 16, 16); g.destroy();
      }

      spawnEnemies() {
        for (let i = 0; i < 4; i++) {
          const ex = Phaser.Math.Between(80, 460);
          const ey = Phaser.Math.Between(150, 450);
          const sprite = this.physics.add.sprite(ex, ey, 'stalker');
          sprite.setCollideWorldBounds(true);
          this.enemies.push({ sprite, hp: 120, maxHp: 120, speed: 90, damage: 20 });
        }
      }

      update(time, delta) {
        // 1. Locomotion vs Attack-on-Stand
        let kx = 0, ky = 0;
        const cursors = this.input.keyboard.createCursorKeys();
        if (cursors.left.isDown) kx--;
        if (cursors.right.isDown) kx++;
        if (cursors.up.isDown) ky--;
        if (cursors.down.isDown) ky++;

        let move = new Phaser.Math.Vector2(kx, ky);
        if (this.inputVector.length() > 0.1) move = this.inputVector.clone();
        if (move.length() > 0) move.normalize();

        if (move.length() > 0.1) {
          this.player.setVelocity(move.x * this.playerStats.moveSpeed, move.y * this.playerStats.moveSpeed);
          this.aimLine.clear();
        } else {
          this.player.setVelocity(0, 0);
          this.handleAutoAttack(delta);
        }

        // 2. Enemies AI
        this.enemies.forEach(e => {
          if (!e.sprite.active || e.hp <= 0) return;
          const angle = Phaser.Math.Angle.Between(e.sprite.x, e.sprite.y, this.player.x, this.player.y);
          e.sprite.setVelocity(Math.cos(angle) * e.speed, Math.sin(angle) * e.speed);

          // Contact Damage
          if (Phaser.Math.Distance.Between(e.sprite.x, e.sprite.y, this.player.x, this.player.y) < 30) {
            this.damagePlayer(e.damage);
          }
        });

        // 3. Projectiles & Collision
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
          const p = this.projectiles[i];
          if (!p.sprite.active) continue;

          for (const e of this.enemies) {
            if (!e.sprite.active || e.hp <= 0) continue;
            if (Phaser.Math.Distance.Between(p.sprite.x, p.sprite.y, e.sprite.x, e.sprite.y) < 26) {
              e.hp -= p.damage;
              playSfx('hit');
              this.spawnFloat(e.sprite.x, e.sprite.y, \`\${p.damage}\`, p.isCrit ? '#ef4444' : '#fff');
              if (e.hp <= 0) {
                e.sprite.destroy();
                this.spawnGem(e.sprite.x, e.sprite.y);
              }
              p.sprite.destroy();
              this.projectiles.splice(i, 1);
              break;
            }
          }
        }

        // 4. EXP Gems Magnet
        for (let i = this.expGems.length - 1; i >= 0; i--) {
          const gem = this.expGems[i];
          const dist = Phaser.Math.Distance.Between(gem.x, gem.y, this.player.x, this.player.y);
          if (dist < 140) {
            const ang = Phaser.Math.Angle.Between(gem.x, gem.y, this.player.x, this.player.y);
            gem.setVelocity(Math.cos(ang) * 350, Math.sin(ang) * 350);
          }
          if (dist < 24) {
            gem.destroy();
            this.expGems.splice(i, 1);
            this.addExp(30);
          }
        }

        this.hudText.setText(\`ROOM: \${this.playerStats.room} | LVL: \${this.playerStats.level} | HP: \${this.playerStats.currentHp}/\${this.playerStats.maxHp} | EXP: \${this.playerStats.exp}/\${this.playerStats.nextExp}\`);
      }

      handleAutoAttack(delta) {
        this.attackTimer += delta;
        const cooldown = (1 / this.playerStats.attackSpeed) * 1000;

        let target = null, minDist = 450;
        this.enemies.forEach(e => {
          if (!e.sprite.active || e.hp <= 0) return;
          const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, e.sprite.x, e.sprite.y);
          if (d < minDist) { minDist = d; target = e; }
        });

        if (target) {
          const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.sprite.x, target.sprite.y);
          this.aimLine.clear().lineStyle(1.5, 0xef4444, 0.4).lineBetween(this.player.x, this.player.y, target.sprite.x, target.sprite.y);

          if (this.attackTimer >= cooldown) {
            this.attackTimer = 0;
            this.fireArrows(angle);
          }
        } else {
          this.aimLine.clear();
        }
      }

      fireArrows(baseAngle) {
        playSfx('shoot');
        const isCrit = Math.random() < this.playerStats.critChance;
        const dmg = Math.round(this.playerStats.baseAttack * (isCrit ? this.playerStats.critDamage : 1.0));

        for (let i = 0; i < this.playerStats.frontArrows; i++) {
          const offset = this.playerStats.frontArrows > 1 ? (i - (this.playerStats.frontArrows - 1) / 2) * 0.12 : 0;
          this.createArrow(baseAngle + offset, dmg, isCrit);
        }
        if (this.playerStats.diagonal) {
          this.createArrow(baseAngle + 0.78, dmg, isCrit);
          this.createArrow(baseAngle - 0.78, dmg, isCrit);
        }
      }

      createArrow(angle, damage, isCrit) {
        const arrow = this.physics.add.sprite(this.player.x, this.player.y, 'arrow');
        arrow.setRotation(angle);
        arrow.setVelocity(Math.cos(angle) * 700, Math.sin(angle) * 700);
        this.projectiles.push({ sprite: arrow, damage, isCrit });
      }

      damagePlayer(amount) {
        this.playerStats.currentHp = Math.max(0, this.playerStats.currentHp - amount);
        this.cameras.main.shake(150, 0.01);
        if (this.playerStats.currentHp <= 0) {
          alert('GAME OVER! Refresh to restart.');
          location.reload();
        }
      }

      addExp(amount) {
        this.playerStats.exp += amount;
        if (this.playerStats.exp >= this.playerStats.nextExp) {
          this.playerStats.exp -= this.playerStats.nextExp;
          this.playerStats.level++;
          this.playerStats.nextExp = Math.round(this.playerStats.nextExp * 1.4);
          this.openSkillModal();
        }
      }

      openSkillModal() {
        this.scene.pause();
        playSfx('levelup');
        const modal = document.getElementById('skill-modal');
        const list = document.getElementById('skills-list');
        list.innerHTML = '';

        const skills = [
          { name: 'Multishot', desc: '+1 Front Arrow, -10% Damage, -15% Attack Speed', apply: () => { this.playerStats.frontArrows++; this.playerStats.baseAttack = Math.round(this.playerStats.baseAttack * 0.9); } },
          { name: 'Diagonal Arrows', desc: 'Fires 2 additional arrows at 45° angles', apply: () => { this.playerStats.diagonal = true; } },
          { name: 'Attack Boost', desc: '+25% Base Projectile Damage', apply: () => { this.playerStats.baseAttack = Math.round(this.playerStats.baseAttack * 1.25); } },
          { name: 'HP Boost', desc: '+25% Max HP and instant heal', apply: () => { this.playerStats.maxHp += 150; this.playerStats.currentHp += 150; } }
        ].sort(() => 0.5 - Math.random()).slice(0, 3);

        skills.forEach(s => {
          const card = document.createElement('div');
          card.className = 'skill-card';
          card.innerHTML = \`<div style="font-weight:bold; font-size:16px; color:#38bdf8; margin-bottom:4px;">\${s.name}</div><div style="font-size:13px; color:#cbd5e1;">\${s.desc}</div>\`;
          card.onclick = () => {
            s.apply();
            modal.style.display = 'none';
            this.scene.resume();
          };
          list.appendChild(card);
        });
        modal.style.display = 'flex';
      }

      spawnGem(x, y) {
        const gem = this.physics.add.sprite(x, y, 'gem');
        this.expGems.push(gem);
      }

      spawnFloat(x, y, text, color) {
        const t = this.add.text(x, y - 16, text, { font: 'bold 15px monospace', fill: color });
        this.tweens.add({ targets: t, y: y - 40, alpha: 0, duration: 600, onComplete: () => t.destroy() });
      }
    }

    // --- Phaser Game Config ---
    const config = {
      type: Phaser.AUTO,
      parent: 'game-container',
      width: 540,
      height: 960,
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
      scene: [GameScene]
    };
    new Phaser.Game(config);
  </script>
</body>
</html>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(standaloneHtmlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([standaloneHtmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'archero-roguelite-standalone.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-lg">
              <FileCode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Standalone Single-File HTML5 Prototype</h2>
              <p className="text-xs text-slate-400">Self-contained production prototype with Phaser 3 CDN embed</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-300">
            This standalone HTML5 bundle requires <strong>zero npm dependencies or local web servers</strong>. It runs anywhere directly inside any browser tab with full physics, touch joystick, sound synthesis, procedural graphics, and 3-card skill deck progression.
          </p>

          <div className="relative">
            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-400 h-64 overflow-y-auto">
              {standaloneHtmlCode}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex justify-between items-center">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy HTML Code'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-medium transition shadow-lg shadow-sky-900/30"
          >
            <Download className="w-4 h-4" />
            <span>Download .html File</span>
          </button>
        </div>
      </div>
    </div>
  );
};
