/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameContainer } from './components/GameContainer';
import { MainMenu } from './components/MainMenu';
import { StandaloneExportModal } from './components/StandaloneExportModal';
import { TechSpecModal } from './components/TechSpecModal';

export default function App() {
  const [gameState, setGameState] = useState<'menu' | 'playing'>('menu');
  const [runConfig, setRunConfig] = useState<{ chapterId: number; mode: 'normal' | 'hero' }>({
    chapterId: 5,
    mode: 'normal',
  });
  const [showTechSpec, setShowTechSpec] = useState(false);
  const [showExporter, setShowExporter] = useState(false);

  const handleStartGame = (chapterId: number = 5, mode: 'normal' | 'hero' = 'normal') => {
    setRunConfig({ chapterId, mode });
    setGameState('playing');
  };

  return (
    <main id="app-root" className="w-full h-screen bg-slate-950 flex flex-col items-center justify-center select-none overflow-hidden font-sans">
      {gameState === 'menu' ? (
        <MainMenu
          onStartGame={handleStartGame}
          onOpenTechSpec={() => setShowTechSpec(true)}
          onOpenStandaloneExport={() => setShowExporter(true)}
        />
      ) : (
        <GameContainer
          chapterId={runConfig.chapterId}
          gameMode={runConfig.mode}
          onReturnToMenu={() => setGameState('menu')}
        />
      )}

      {/* Technical Specification Blueprint Modal */}
      {showTechSpec && <TechSpecModal onClose={() => setShowTechSpec(false)} />}

      {/* Standalone Single-File Prototype Exporter Modal */}
      {showExporter && <StandaloneExportModal onClose={() => setShowExporter(false)} />}
    </main>
  );
}
