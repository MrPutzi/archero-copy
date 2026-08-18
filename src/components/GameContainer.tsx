import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Award,
  Coins,
  Flame,
  Heart,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Shield,
  Sparkles,
  Sword,
  Trophy,
  Volume2,
  VolumeX,
} from 'lucide-react';
import Phaser from 'phaser';
import { sound } from '../audio/soundFx';
import { ALL_CHAPTERS } from '../game/chapters';
import { GameScene } from '../game/scenes/GameScene';
import { ALL_SKILLS } from '../game/skills';
import { AngelBlessingType, RoomType, SkillDefinition } from '../types/game';
import { AngelModal } from './AngelModal';
import { SkillPickerModal } from './SkillPickerModal';

interface GameContainerProps {
  chapterId?: number;
  gameMode?: 'normal' | 'hero';
  onReturnToMenu: () => void;
}

export const GameContainer: React.FC<GameContainerProps> = ({
  chapterId = 5,
  gameMode = 'normal',
  onReturnToMenu,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<GameScene | null>(null);

  const activeChapter = ALL_CHAPTERS.find(c => c.id === chapterId) || ALL_CHAPTERS[4];

  // Live HUD States
  const [currentHp, setCurrentHp] = useState(600);
  const [maxHp, setMaxHp] = useState(600);
  const [currentExp, setCurrentExp] = useState(0);
  const [nextExp, setNextExp] = useState(80);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [goldEarned, setGoldEarned] = useState(0);
  const [roomNumber, setRoomNumber] = useState(1);
  const [roomType, setRoomType] = useState<RoomType>('normal');
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [skillsOffered, setSkillsOffered] = useState<SkillDefinition[] | null>(null);
  const [showAngelModal, setShowAngelModal] = useState(false);
  const [gameOverData, setGameOverData] = useState<{ room: number; kills: number; gold: number; won: boolean } | null>(null);

  // Virtual Touch Joystick State
  const [joystickStart, setJoystickStart] = useState<{ x: number; y: number } | null>(null);
  const [joystickCurrent, setJoystickCurrent] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Destroy any existing game
    if (gameRef.current) {
      gameRef.current.destroy(true);
    }

    const scene = new GameScene();
    sceneRef.current = scene;

    // Connect callbacks
    scene.onHpChange = (cur, max) => {
      setCurrentHp(cur);
      setMaxHp(max);
    };

    scene.onExpChange = (exp, next, lvl) => {
      setCurrentExp(exp);
      setNextExp(next);
      setPlayerLevel(lvl);
    };

    scene.onGoldChange = (gold) => {
      setGoldEarned(gold);
    };

    scene.onRoomChange = (room, type) => {
      setRoomNumber(room);
      setRoomType(type);
    };

    scene.onLevelUp = (skills) => {
      scene.scene.pause();
      sound.playLevelUp();
      setSkillsOffered(skills);
    };

    scene.onAngelEncounter = () => {
      scene.scene.pause();
      setShowAngelModal(true);
    };

    scene.onGameOver = (data) => {
      setGameOverData(data);
      if (data.won) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { x: 0.5, y: 0.6 },
        });
      }
    };

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 540,
      height: 960,
      backgroundColor: '#090d16',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scene: [scene],
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    return () => {
      game.destroy(true);
      gameRef.current = null;
      sceneRef.current = null;
    };
  }, []);

  // Handle Touch Joystick Events
  const handleTouchStart = (e: React.TouchEvent) => {
    if (skillsOffered || showAngelModal || gameOverData || isPaused) return;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    setJoystickStart({ x, y });
    setJoystickCurrent({ x, y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!joystickStart) return;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const curX = touch.clientX - rect.left;
    const curY = touch.clientY - rect.top;

    setJoystickCurrent({ x: curX, y: curY });

    const dx = curX - joystickStart.x;
    const dy = curY - joystickStart.y;
    const dist = Math.hypot(dx, dy);
    const maxRadius = 50;

    if (dist > 8) {
      const normalizedMagnitude = Math.min(dist, maxRadius) / maxRadius;
      const angle = Math.atan2(dy, dx);
      const vx = Math.cos(angle) * normalizedMagnitude;
      const vy = Math.sin(angle) * normalizedMagnitude;

      sceneRef.current?.setVirtualJoystick({ x: vx, y: vy });
    } else {
      sceneRef.current?.setVirtualJoystick({ x: 0, y: 0 });
    }
  };

  const handleTouchEnd = () => {
    setJoystickStart(null);
    setJoystickCurrent(null);
    sceneRef.current?.setVirtualJoystick({ x: 0, y: 0 });
  };

  const handleSelectSkill = (skillId: string) => {
    if (sceneRef.current) {
      sceneRef.current.applySkillSelection(skillId);
      sceneRef.current.scene.resume();
    }
    setSkillsOffered(null);
  };

  const handleSelectAngelBlessing = (blessing: AngelBlessingType) => {
    if (sceneRef.current) {
      sceneRef.current.applyAngelBlessing(blessing);
      sceneRef.current.scene.resume();
    }
    setShowAngelModal(false);
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sound.setMuted(nextMuted);
  };

  const togglePause = () => {
    if (!sceneRef.current) return;
    if (isPaused) {
      sceneRef.current.scene.resume();
      setIsPaused(false);
    } else {
      sceneRef.current.scene.pause();
      setIsPaused(true);
    }
  };

  const handleRestart = () => {
    setGameOverData(null);
    if (sceneRef.current) {
      sceneRef.current.init();
      sceneRef.current.loadRoom(1);
      if (sceneRef.current.scene.isPaused()) {
        sceneRef.current.scene.resume();
      }
    }
  };

  const hpRatio = Math.max(0, Math.min(1, currentHp / Math.max(1, maxHp)));
  const expRatio = Math.max(0, Math.min(1, currentExp / Math.max(1, nextExp)));

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950 select-none overflow-hidden">
      {/* Top Game HUD Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex flex-col px-4 py-2.5 bg-gradient-to-b from-slate-950/95 via-slate-950/85 to-transparent backdrop-blur-xs max-w-lg mx-auto">
        <div className="flex items-center justify-between gap-3 text-xs">
          {/* Chapter & Stage Indicator */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-white font-black flex items-center gap-1.5 shadow">
              <span>{activeChapter.icon}</span>
              <span className="font-mono">{activeChapter.numberPrefix} - {roomNumber} / {activeChapter.stagesCount}</span>
            </span>
            {gameMode === 'hero' && (
              <span className="px-2 py-0.5 rounded-full bg-rose-600/30 border border-rose-500/50 text-rose-300 font-bold text-[9px] uppercase tracking-wider animate-pulse">
                👹 Hero
              </span>
            )}
            {roomType === 'boss' && (
              <span className="px-2 py-0.5 rounded-full bg-rose-600/30 border border-rose-500/40 text-rose-300 font-bold text-[10px] animate-pulse">
                BOSS
              </span>
            )}
            {roomType === 'angel' && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/30 border border-amber-400/40 text-amber-300 font-bold text-[10px]">
                ANGEL
              </span>
            )}
          </div>

          {/* Gold & Quick Actions */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 text-amber-400 font-bold px-2 py-1 bg-amber-500/10 rounded-xl border border-amber-500/30 font-mono">
              <Coins className="w-3.5 h-3.5" />
              <span>{goldEarned}</span>
            </div>

            <button
              onClick={toggleMute}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              onClick={togglePause}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
              title="Pause"
            >
              {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
            </button>

            <button
              onClick={onReturnToMenu}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
              title="Back to Menu"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Health & EXP Bars */}
        <div className="mt-2 space-y-1">
          {/* Health Bar */}
          <div className="flex items-center gap-2">
            <Heart className="w-3.5 h-3.5 text-rose-400 shrink-0 fill-rose-500/40" />
            <div className="relative flex-1 h-3.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700/80">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-150"
                style={{ width: `${hpRatio * 100}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-bold text-white drop-shadow">
                {currentHp} / {maxHp}
              </span>
            </div>
          </div>

          {/* EXP Bar */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-sky-400 shrink-0 font-mono">Lv.{playerLevel}</span>
            <div className="relative flex-1 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-indigo-400 transition-all duration-150"
                style={{ width: `${expRatio * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Phaser Canvas Container with Touch Listeners */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="w-full h-full max-w-[540px] max-h-[960px] relative flex items-center justify-center cursor-crosshair overflow-hidden touch-none"
      >
        {/* Virtual Dynamic Touch Joystick Visual */}
        {joystickStart && joystickCurrent && (
          <div
            className="absolute pointer-events-none z-40 transition-opacity"
            style={{
              left: `${joystickStart.x}px`,
              top: `${joystickStart.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Outer Base Ring */}
            <div className="w-24 h-24 rounded-full border-2 border-emerald-400/40 bg-emerald-950/20 backdrop-blur-xs flex items-center justify-center">
              {/* Inner Thumb Knob */}
              <div
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-300 shadow-lg shadow-emerald-500/40"
                style={{
                  transform: `translate(${Math.max(
                    -40,
                    Math.min(40, joystickCurrent.x - joystickStart.x)
                  )}px, ${Math.max(-40, Math.min(40, joystickCurrent.y - joystickStart.y))}px)`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* PAUSE OVERLAY */}
      {isPaused && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-xs text-center space-y-5 shadow-2xl">
            <h2 className="text-xl font-black text-white uppercase tracking-wider">Game Paused</h2>

            <div className="space-y-2 text-xs text-slate-400 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex justify-between">
                <span>Current Stage:</span>
                <strong className="text-white">Room {roomNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span>Gold Collected:</span>
                <strong className="text-amber-400">{goldEarned}</strong>
              </div>
              <div className="flex justify-between">
                <span>Character Level:</span>
                <strong className="text-sky-400">Lv.{playerLevel}</strong>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={togglePause}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition cursor-pointer"
              >
                Resume Battle
              </button>
              <button
                onClick={onReturnToMenu}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs transition cursor-pointer"
              >
                Exit to Main Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SKILL PICKER MODAL (3-Card Choice on Level-Up) */}
      {skillsOffered && (
        <SkillPickerModal skills={skillsOffered} onSelectSkill={handleSelectSkill} />
      )}

      {/* ANGEL ENCOUNTER MODAL */}
      {showAngelModal && (
        <AngelModal onSelectBlessing={handleSelectAngelBlessing} />
      )}

      {/* GAME OVER / VICTORY OVERLAY */}
      {gameOverData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in zoom-in-95 duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-sm text-center space-y-5 shadow-2xl">
            <div className="flex flex-col items-center space-y-2">
              <div className="text-4xl p-3 bg-slate-800 rounded-2xl border border-slate-700 shadow-inner">
                {gameOverData.won ? '🏆' : '💀'}
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                {gameOverData.won ? 'Chapter Victory!' : 'Hero Defeated'}
              </h2>
              <p className="text-xs text-slate-400">
                {gameOverData.won
                  ? 'You have conquered the Dungeon Depths!'
                  : 'Your valor shall echo through eternity.'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-center">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-medium">Stage</div>
                <div className="text-sm font-black text-white">{gameOverData.room}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-medium">Enemies</div>
                <div className="text-sm font-black text-rose-400">{gameOverData.kills}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-medium">Gold</div>
                <div className="text-sm font-black text-amber-400">+{gameOverData.gold}</div>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={handleRestart}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-sm transition shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Again</span>
              </button>

              <button
                onClick={onReturnToMenu}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs transition cursor-pointer"
              >
                Return to Main Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
