import React from 'react';
import { BookOpen, CheckCircle, Code, Cpu, Layers, Shield, Sparkles, X, Zap } from 'lucide-react';

interface TechSpecModalProps {
  onClose: () => void;
}

export const TechSpecModal: React.FC<TechSpecModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Technical Specification & Architecture Blueprint</h2>
              <p className="text-xs text-slate-400">Archero 2D Top-Down Action-Roguelite Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-8 text-sm leading-relaxed text-slate-300">
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-base border-b border-slate-800 pb-2">
              <Layers className="w-5 h-5" />
              <span>1. Game Architecture & Technical Stack</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-2">
                <h4 className="font-medium text-white flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" /> Rendering & Resolution
                </h4>
                <p className="text-xs text-slate-400">
                  Phaser 3 WebGL pipeline with standard 9:16 aspect ratio (540x960 base coordinate space) scaled via FIT mode. Smooth responsive letterboxing across mobile viewports and desktop browsers.
                </p>
              </div>
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-2">
                <h4 className="font-medium text-white flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" /> State Machine Architecture
                </h4>
                <p className="text-xs text-slate-400">
                  Modular scenes: <code className="text-emerald-300">BootScene</code> (procedural vector assets & procedural audio init), <code className="text-emerald-300">GameScene</code> (physics loop, AI steering, collision matrix), <code className="text-emerald-300">Overlay Modals</code> (physics freeze & skill deck selection).
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-sky-400 font-semibold text-base border-b border-slate-800 pb-2">
              <Zap className="w-5 h-5" />
              <span>2. Core Gameplay Loop & Attack-on-Stand Mechanics</span>
            </div>
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 space-y-3">
              <p>
                The hallmark mechanic is the strict decoupling of locomotion and projectile fire:
              </p>
              <div className="bg-slate-950 p-3 rounded-lg font-mono text-xs text-slate-300 space-y-1">
                <div>{'// Attack-on-Stand Algorithm'}</div>
                <div>{'if (inputVector.magnitude > 0.05) {'}</div>
                <div className="pl-4">{'playerState = STATE_MOVING;'}</div>
                <div className="pl-4">{'player.setVelocity(inputVector.x * speed, inputVector.y * speed);'}</div>
                <div className="pl-4">{'targetingLaser.clear();'}</div>
                <div>{'} else {'}</div>
                <div className="pl-4">{'playerState = STATE_ATTACKING;'}</div>
                <div className="pl-4">{'player.setVelocity(0, 0);'}</div>
                <div className="pl-4">{'target = findClosestEnemyWithinRange(player.pos, attackRange);'}</div>
                <div className="pl-4">{'if (target && cooldownTimer >= (1 / attackSpeed)) {'}</div>
                <div className="pl-8">{'fireProjectileVolley(angleTo(target));'}</div>
                <div className="pl-4">{'}'}</div>
                <div>{'}'}</div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-base border-b border-slate-800 pb-2">
              <Shield className="w-5 h-5" />
              <span>3. Enemy AI Taxonomy & Multi-Stage Boss FSM</span>
            </div>
            <div className="grid md:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 space-y-1">
                <div className="font-semibold text-emerald-400">Melee Stalker</div>
                <p className="text-slate-400">Direct vector pursuit steering toward player position with contact cooldown collision.</p>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 space-y-1">
                <div className="font-semibold text-purple-400">Ranged Sniper</div>
                <p className="text-slate-400">Maintains standoff ring (200-380px). Telegraphs laser lock for 0.8s, then releases high-velocity bolts.</p>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 space-y-1">
                <div className="font-semibold text-rose-400">Armored Charger</div>
                <p className="text-slate-400">Locks player vector, telegraphs charge with red warning trail for 0.5s, dashes forward at 3.5x speed.</p>
              </div>
            </div>
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 space-y-2">
              <div className="font-medium text-amber-300">Room Boss Finite State Machine</div>
              <p className="text-xs text-slate-400">
                • <strong>Phase 1 (100%-50% HP):</strong> Alternates between 360° radial bullet hell burst (12 orbs) and targeted triple spread leaps.
                <br />
                • <strong>Phase 2 (&lt;50% HP - Enraged):</strong> Aura triggers red glow, +30% attack cadence, 16-orb radial barrages, and summons minion stalkers every 8 seconds.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-base border-b border-slate-800 pb-2">
              <Sparkles className="w-5 h-5" />
              <span>4. Mathematical Skill-Stacking & Progression</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-2">
              <div><strong>• Multishot:</strong> FrontArrowCount += 1, BaseDamage *= 0.90, AttackSpeed *= 0.85</div>
              <div><strong>• Front Arrow +1:</strong> FrontArrowCount += 1, BaseDamage *= 0.85</div>
              <div><strong>• Piercing Shot:</strong> PiercesLeft = 2, DamageModifierPerPierce = -33%</div>
              <div><strong>• Ricochet:</strong> BouncesLeft = 3, SearchRadius = 200px Euclidean</div>
              <div><strong>• Bouncy Wall:</strong> WallBounces = 2 with velocity reflection</div>
              <div><strong>• Elemental Status:</strong> Blaze (high tick/2s), Poison (infinite tick), Frost (50% slow)</div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-semibold text-base border-b border-slate-800 pb-2">
              <Code className="w-5 h-5" />
              <span>5. Web Audio Synthesizer & Zero-Asset Pipeline</span>
            </div>
            <p className="text-xs text-slate-400">
              Zero network image dependencies or external audio assets. All textures are procedurally generated in the HTML5 Canvas graphics layer on boot, and all sound effects (arrow twang, critical strike, monster roar, level-up fanfare, coin chime) are synthesized with low-latency Web Audio API oscillators.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl text-sm transition shadow-lg shadow-emerald-900/30"
          >
            Got It, Return to Game
          </button>
        </div>
      </div>
    </div>
  );
};
