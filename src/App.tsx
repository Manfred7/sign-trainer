import { useState } from 'react';
import { TRIGRAMS } from './data/trigrams';
import type { Figure } from './data/types';
import { type Answer, DIRECTIONS } from './logic/quiz';
import { type Settings, loadSettings, saveSettings } from './logic/settings';
import { type QuizConfig, QuizScreen } from './screens/QuizScreen';
import { ResultScreen } from './screens/ResultScreen';
import { StartScreen } from './screens/StartScreen';

type Screen =
  | { name: 'start' }
  | { name: 'quiz'; config: QuizConfig; run: number }
  | { name: 'result'; answers: Answer[]; config: QuizConfig };

export default function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [screen, setScreen] = useState<Screen>({ name: 'start' });

  const updateSettings = (s: Settings) => {
    setSettings(s);
    saveSettings(s);
  };

  const baseConfig = (): QuizConfig => ({
    pool: TRIGRAMS,
    all: TRIGRAMS,
    directions: DIRECTIONS.filter((d) => settings.directionIds.includes(d.id)),
    length: settings.length,
  });

  const startQuiz = (config: QuizConfig) => setScreen({ name: 'quiz', config, run: Date.now() });

  const retryMistakes = (figures: Figure[]) =>
    startQuiz({ ...baseConfig(), pool: figures, length: Math.min(settings.length, Math.max(5, figures.length * 3)) });

  switch (screen.name) {
    case 'start':
      return <StartScreen settings={settings} onChange={updateSettings} onStart={() => startQuiz(baseConfig())} />;
    case 'quiz':
      return (
        <QuizScreen
          key={screen.run}
          config={screen.config}
          onFinish={(answers) => setScreen({ name: 'result', answers, config: screen.config })}
          onExit={() => setScreen({ name: 'start' })}
        />
      );
    case 'result':
      return (
        <ResultScreen
          answers={screen.answers}
          onRetryMistakes={retryMistakes}
          onRestart={() => startQuiz(baseConfig())}
          onMenu={() => setScreen({ name: 'start' })}
        />
      );
  }
}
