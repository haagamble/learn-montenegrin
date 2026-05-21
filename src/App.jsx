import { useEffect, useMemo, useState } from 'react';
import { categories, learningItems } from './data/learningItems.js';
import PhraseCard from './components/PhraseCard.jsx';
import './App.css';

const reviewStorageKey = 'montenegrin-review-state';

const allCategories = {
  id: 'all',
  name: 'All',
  description: 'Review the full starter deck.'
};

const practiceCategory = {
  id: 'practice',
  name: 'Needs Practice',
  description: 'Cards you marked for more review.'
};

const typeFilters = [
  { id: 'all', label: 'All' },
  { id: 'words', label: 'Words' },
  { id: 'phrases', label: 'Phrases' },
  { id: 'sentences', label: 'Sentences' }
];

const numberOrder = new Map(
  [
    'zero',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
    'eleven',
    'twelve',
    'thirteen',
    'fourteen',
    'fifteen',
    'sixteen',
    'seventeen',
    'eighteen',
    'nineteen',
    'twenty',
    'thirty',
    'forty',
    'fifty',
    'sixty',
    'seventy',
    'eighty',
    'ninety',
    'hundred',
    'thousand'
  ].map((id, index) => [id, index])
);

function sortDeck(items, categoryId) {
  if (categoryId !== 'numbers') {
    return items;
  }

  return [...items].sort(
    (first, second) =>
      (numberOrder.get(first.id) ?? Number.MAX_SAFE_INTEGER) -
      (numberOrder.get(second.id) ?? Number.MAX_SAFE_INTEGER)
  );
}

function matchesTypeFilter(item, filterId) {
  if (filterId === 'all') {
    return true;
  }

  if (filterId === 'words') {
    return item.type === 'word' || item.type === 'verb';
  }

  if (filterId === 'phrases') {
    return item.type === 'phrase';
  }

  return item.type === 'sentence';
}

function loadReviewState() {
  try {
    return JSON.parse(localStorage.getItem(reviewStorageKey)) ?? {};
  } catch {
    return {};
  }
}

function App() {
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [promptSide, setPromptSide] = useState('english');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isDeckComplete, setIsDeckComplete] = useState(false);
  const [studyView, setStudyView] = useState('cards');
  const [typeFilter, setTypeFilter] = useState('all');
  const [reviewState, setReviewState] = useState(loadReviewState);

  const categoryOptions = [allCategories, practiceCategory, ...categories];
  const selectedCategory =
    categoryOptions.find((category) => category.id === selectedCategoryId) ?? allCategories;
  const practiceIds = useMemo(
    () =>
      new Set(
        Object.entries(reviewState)
          .filter(([, value]) => value.status === 'practice')
          .map(([id]) => id)
      ),
    [reviewState]
  );

  const deck = useMemo(() => {
    let items;

    if (selectedCategoryId === 'all') {
      items = learningItems;
    } else if (selectedCategoryId === 'practice') {
      items = learningItems.filter((item) => practiceIds.has(item.id));
    } else {
      items = learningItems.filter((item) => item.categoryId === selectedCategoryId);
    }

    return sortDeck(
      items.filter((item) => matchesTypeFilter(item, typeFilter)),
      selectedCategoryId
    );
  }, [practiceIds, selectedCategoryId, typeFilter]);

  const currentItem = deck[currentIndex] ?? deck[0];
  const phraseCount = learningItems.length;
  const practiceCount = practiceIds.size;

  useEffect(() => {
    localStorage.setItem(reviewStorageKey, JSON.stringify(reviewState));
  }, [reviewState]);

  useEffect(() => {
    if (deck.length > 0 && currentIndex > deck.length - 1) {
      setCurrentIndex(deck.length - 1);
    }
  }, [currentIndex, deck.length]);

  const resetDeckPosition = () => {
    setCurrentIndex(0);
    setIsRevealed(false);
    setIsDeckComplete(false);
  };

  const chooseCategory = (categoryId) => {
    setSelectedCategoryId(categoryId);
    resetDeckPosition();
  };

  const choosePromptSide = (side) => {
    setPromptSide(side);
    setIsRevealed(false);
    setIsDeckComplete(false);
  };

  const chooseTypeFilter = (filterId) => {
    setTypeFilter(filterId);
    resetDeckPosition();
  };

  const moveToCard = (nextIndex) => {
    setCurrentIndex(nextIndex);
    setIsRevealed(false);
    setIsDeckComplete(false);
  };

  const moveNext = () => {
    moveToCard(Math.min(deck.length - 1, currentIndex + 1));
  };

  const movePrevious = () => {
    moveToCard(Math.max(0, currentIndex - 1));
  };

  const markCard = (status) => {
    if (!currentItem) {
      return;
    }

    setReviewState((current) => {
      const existing = current[currentItem.id] ?? { correct: 0, missed: 0 };
      const next = {
        ...current,
        [currentItem.id]: {
          status,
          correct: existing.correct + (status === 'known' ? 1 : 0),
          missed: existing.missed + (status === 'practice' ? 1 : 0),
          lastReviewedAt: new Date().toISOString()
        }
      };

      return next;
    });

    if (currentIndex < deck.length - 1) {
      moveToCard(currentIndex + 1);
    } else {
      setIsRevealed(false);
      setIsDeckComplete(true);
    }
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Montenegrin learner</p>
          <h1>Build usable Montenegrin through focused practice</h1>
          <p className="hero-copy">
            Start with a shared vocabulary deck, choose a topic, and practice recall
            from either language.
          </p>
        </div>
        <div className="hero-stats" aria-label="Starter curriculum">
          <span>
            <strong>{phraseCount}</strong>
            words and phrases
          </span>
          <span>
            <strong>{practiceCount}</strong>
            to practice
          </span>
        </div>
      </header>

      <main className="learning-layout">
        <aside className="category-panel" aria-label="Categories">
          <div className="panel-heading">
            <h2>Study Decks</h2>
            <p>{selectedCategory.description}</p>
          </div>
          <div className="category-list">
            {categoryOptions.map((category) => {
              let count = learningItems.filter((item) => item.categoryId === category.id).length;

              if (category.id === 'all') {
                count = learningItems.length;
              }

              if (category.id === 'practice') {
                count = practiceCount;
              }

              return (
                <button
                  key={category.id}
                  type="button"
                  className={[
                    category.id === selectedCategoryId ? 'is-active' : '',
                    category.id === 'practice' ? 'is-practice-deck' : ''
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => chooseCategory(category.id)}
                >
                  <span>{category.name}</span>
                  <strong>{count}</strong>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="practice-panel">
          <div className="section-head">
            <div>
              <h2>{studyView === 'cards' ? 'Flashcards' : 'Word List'}</h2>
              <p>
                {selectedCategory.name} deck ·{' '}
                {typeFilters.find((filter) => filter.id === typeFilter)?.label ?? 'All'}
              </p>
            </div>
            {studyView === 'cards' ? (
              <div className="session-meter" aria-label="Deck position">
                <span>Card</span>
                <strong>{deck.length > 0 ? currentIndex + 1 : 0} of {deck.length}</strong>
              </div>
            ) : (
              <div className="session-meter" aria-label="Deck size">
                <span>Total</span>
                <strong>{deck.length} items</strong>
              </div>
            )}
          </div>

          <div className="study-toolbar" aria-label="Study view">
            <div className="segmented-control">
              <button
                type="button"
                className={studyView === 'cards' ? 'is-active' : ''}
                onClick={() => setStudyView('cards')}
              >
                Cards
              </button>
              <button
                type="button"
                className={studyView === 'list' ? 'is-active' : ''}
                onClick={() => setStudyView('list')}
              >
                List
              </button>
            </div>

            {studyView === 'cards' && (
              <div className="segmented-control" aria-label="Prompt direction">
                <button
                  type="button"
                  className={promptSide === 'english' ? 'is-active' : ''}
                  onClick={() => choosePromptSide('english')}
                >
                  English first
                </button>
                <button
                  type="button"
                  className={promptSide === 'montenegrin' ? 'is-active' : ''}
                  onClick={() => choosePromptSide('montenegrin')}
                >
                  Montenegrin first
                </button>
              </div>
            )}
          </div>

          <div className="type-filter" aria-label="Card type">
            {typeFilters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                className={typeFilter === filter.id ? 'is-active' : ''}
                onClick={() => chooseTypeFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {studyView === 'list' ? (
            deck.length > 0 ? (
              <div className="word-list" aria-label={`${selectedCategory.name} words`}>
                {deck.map((item) => (
                  <article key={item.id} className="word-row">
                    <div>
                      <h3>{item.montenegrin}</h3>
                      <p>{item.phonetic}</p>
                    </div>
                    <div>
                      <strong>{item.english}</strong>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-practice">
                <h3>No cards in this deck</h3>
                <p>Try a different card type or choose another deck.</p>
              </div>
            )
          ) : isDeckComplete ? (
            <div className="deck-complete">
              <span className="complete-kicker">Deck complete</span>
              <h3>Nice work. You reviewed {deck.length} cards.</h3>
              <p>
                {practiceCount > 0
                  ? `${practiceCount} cards are waiting in Needs Practice.`
                  : 'No cards are waiting in Needs Practice.'}
              </p>
              <div className="complete-actions">
                <button type="button" onClick={resetDeckPosition}>
                  Review again
                </button>
                <button
                  type="button"
                  className="practice-button"
                  onClick={() => chooseCategory('practice')}
                  disabled={practiceCount === 0}
                >
                  Practice misses
                </button>
              </div>
            </div>
          ) : currentItem ? (
            <>
              <div className="card-frame">
                <PhraseCard
                  item={currentItem}
                  promptSide={promptSide}
                  isRevealed={isRevealed}
                  onFlip={() => setIsRevealed((value) => !value)}
                />
              </div>

              <div className="study-actions">
                {!isRevealed ? (
                  <>
                    <button type="button" onClick={movePrevious} disabled={currentIndex === 0}>
                      Previous
                    </button>
                    <button
                      type="button"
                      className="reveal-button"
                      onClick={() => setIsRevealed(true)}
                    >
                      Reveal answer
                    </button>
                    <button
                      type="button"
                      onClick={moveNext}
                      disabled={currentIndex === deck.length - 1}
                    >
                      Next
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="practice-button"
                      onClick={() => markCard('practice')}
                    >
                      Need practice
                    </button>
                    <button type="button" className="known-button" onClick={() => markCard('known')}>
                      Know it
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="empty-practice">
              <h3>No cards in this deck</h3>
              <p>Try a different card type or choose another deck.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
