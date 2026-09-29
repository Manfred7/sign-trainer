import { useCallback, useState } from 'react';
import type { Figure } from './data/types';
import { type Deck, DECKS, buildInputFor, deckById, isAvailable, modeDirections, withUnlocks } from './logic/decks';
import {
  EMPTY_PROGRESS,
  type Progress,
  loadProgress,
  mastery,
  recordAnswer,
  saveProgress,
  levelOf,
} from './logic/progress';
import { type Answer, DIRECTIONS } from './logic/quiz';
import { type BuildInput, type Mode, type Settings, loadSettings, saveSettings } from './logic/settings';
import { ComposeScreen } from './screens/ComposeScreen';
import { LineBuilderScreen } from './screens/LineBuilderScreen';
import { type QuizConfig, QuizScreen } from './screens/QuizScreen';
import { ResultScreen, type SessionSummary } from './screens/ResultScreen';
import { StartScreen } from './screens/StartScreen';
import { StudyScreen } from './screens/StudyScreen';
import { TableFindScreen, TableReferenceScreen } from './screens/TableScreen';

interface SessionStart {
  mode: Mode;
  buildInput: BuildInput;
  deck: Deck;
  masteryBefore: number;
  unlockedBefore: string[];
}

type Screen =
  | { name: 'start' }
  | { name: 'study'; deck: Deck }
  | { name: 'table' }
  | { name: 'quiz'; config: QuizConfig; run: number; session: SessionStart }
  | { name: 'result'; answers: Answer[]; summary: SessionSummary };

export default function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [screen, setScreen] = useState<Screen>({ name: 'start' });

  const selectedDirections = DIRECTIONS.filter((d) => settings.directionIds.includes(d.id));
  const available = (d: Deck) => isAvailable(d, settings.mode, progress, settings.unlockAll);
  const selected = deckById(settings.deckId);
  // Если выбранная колода недоступна в текущем режиме — берём первую доступную
  const deck = available(selected) ? selected : DECKS.find(available)!;
  const buildInput = buildInputFor(deck, settings.buildInput);
  const directions = modeDirections(settings.mode, selectedDirections, buildInput);

  const updateSettings = (s: Settings) => {
    setSettings(s);
    saveSettings(s);
  };

  const updateProgress = (p: Progress) => {
    setProgress(p);
    saveProgress(p);
  };

  const onAnswer = useCallback(
    (a: Answer) =>
      setProgress((p) => {
        const next = withUnlocks(
          recordAnswer(p, a),
          DIRECTIONS.filter((d) => settings.directionIds.includes(d.id)),
        );
        saveProgress(next);
        return next;
      }),
    [settings.directionIds],
  );

  const level = useCallback(
    (figureId: string, directionId: string) => levelOf(progress, figureId, directionId),
    [progress],
  );

  const startQuiz = (pool: Figure[], length: number) =>
    setScreen({
      name: 'quiz',
      config: { pool, all: deck.figures, directions, length },
      run: Date.now(),
      session: {
        mode: settings.mode,
        buildInput,
        deck,
        masteryBefore: mastery(progress, deck.figures, directions),
        unlockedBefore: progress.unlocked,
      },
    });

  const startDeck = () => {
    if (settings.mode === 'study') setScreen({ name: 'study', deck });
    else if (settings.mode === 'table' && settings.tableView === 'reference') setScreen({ name: 'table' });
    else startQuiz(deck.figures, settings.length);
  };

  const retryMistakes = (figures: Figure[]) =>
    startQuiz(figures, Math.min(settings.length, Math.max(5, figures.length * 3)));

  const finish = (answers: Answer[], session: SessionStart) =>
    setScreen({
      name: 'result',
      answers,
      summary: {
        deckTitle: session.deck.title,
        masteryBefore: session.masteryBefore,
        masteryAfter: mastery(progress, session.deck.figures, directions),
        newlyUnlocked: DECKS.filter(
          (d) => progress.unlocked.includes(d.id) && !session.unlockedBefore.includes(d.id),
        ).map((d) => d.title),
      },
    });

  switch (screen.name) {
    case 'start':
      return (
        <StartScreen
          settings={settings}
          progress={progress}
          deck={deck}
          onChange={updateSettings}
          onResetProgress={() => updateProgress(EMPTY_PROGRESS)}
          onStart={startDeck}
        />
      );
    case 'study':
      return <StudyScreen deck={screen.deck} onExit={() => setScreen({ name: 'start' })} />;
    case 'table':
      return <TableReferenceScreen onExit={() => setScreen({ name: 'start' })} />;
    case 'quiz': {
      const { mode, buildInput: input } = screen.session;
      const props = {
        config: screen.config,
        levelOf: level,
        onAnswer,
        onFinish: (answers: Answer[]) => finish(answers, screen.session),
        onExit: () => setScreen({ name: 'start' }),
      };
      if (mode === 'table') return <TableFindScreen key={screen.run} {...props} />;
      if (mode === 'compose') return <ComposeScreen key={screen.run} variant="compose" {...props} />;
      if (mode === 'build') {
        return input === 'lines' ? (
          <LineBuilderScreen key={screen.run} {...props} />
        ) : (
          <ComposeScreen key={screen.run} variant="build" {...props} />
        );
      }
      return <QuizScreen key={screen.run} {...props} />;
    }
    case 'result':
      return (
        <ResultScreen
          answers={screen.answers}
          summary={screen.summary}
          onRetryMistakes={retryMistakes}
          onRestart={startDeck}
          onMenu={() => setScreen({ name: 'start' })}
        />
      );
  }
}
