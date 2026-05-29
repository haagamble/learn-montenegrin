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

const difficultyFilters = [
  { id: 'all', label: 'All levels' },
  { id: '1', label: 'Beginner' },
  { id: '2', label: 'Intermediate' }
];

const conversationScenarios = [
  {
    id: 'cafe',
    name: 'Cafe',
    description: 'Order a drink, ask for the bill, and close politely.',
    itemIds: ['good-day', 'table-for-two', 'i-would-like-coffee', 'bill-please', 'thank-you']
  },
  {
    id: 'hotel',
    name: 'Hotel',
    description: 'Check in, ask about breakfast, and handle a key problem.',
    itemIds: ['i-have-reservation', 'where-is-reception', 'is-breakfast-included', 'key-does-not-work']
  },
  {
    id: 'transport',
    name: 'Transport',
    description: 'Find the station, buy a ticket, and ask about departure.',
    itemIds: ['where-is-bus-station', 'i-need-ticket', 'when-does-bus-leave', 'i-need-taxi']
  },
  {
    id: 'directions-help',
    name: 'Directions and Help',
    description: 'Ask for directions and recover when you do not understand.',
    itemIds: [
      'where-bathroom',
      'go-straight',
      'turn-left',
      'i-do-not-understand',
      'please-speak-slowly',
      'can-you-repeat-that'
    ]
  },
  {
    id: 'meeting-someone',
    name: 'Meeting Someone',
    description: 'Introduce yourself and ask where someone is from.',
    itemIds: [
      'good-day',
      'what-is-your-name',
      'my-name-is-ana',
      'where-are-you-from',
      'i-am-from-the-united-states',
      'nice-to-meet-you'
    ]
  },
  {
    id: 'technology',
    name: 'Technology',
    description: 'Ask about Wi-Fi, passwords, charging, and common device problems.',
    itemIds: [
      'do-you-have-wifi',
      'wifi-password',
      'wifi-does-not-work',
      'need-charger',
      'charge-phone-here',
      'app-does-not-work'
    ]
  }
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

function matchesDifficultyFilter(item, filterId) {
  return filterId === 'all' || item.difficulty === Number(filterId);
}

function matchesSearch(item, searchQuery) {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return [item.english, item.montenegrin, item.phonetic].some((value) =>
    value.toLowerCase().includes(normalizedQuery)
  );
}

function shuffleItems(items) {
  return [...items]
    .map((item) => ({ item, sortValue: Math.random() }))
    .sort((first, second) => first.sortValue - second.sortValue)
    .map(({ item }) => item);
}

function loadReviewState() {
  try {
    return JSON.parse(localStorage.getItem(reviewStorageKey)) ?? {};
  } catch {
    return {};
  }
}

function App() {
  const [activeMode, setActiveMode] = useState('home');
  const [selectedScenarioId, setSelectedScenarioId] = useState(conversationScenarios[0].id);
  const [conversationIndex, setConversationIndex] = useState(0);
  const [isConversationRevealed, setIsConversationRevealed] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [promptSide, setPromptSide] = useState('english');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isDeckComplete, setIsDeckComplete] = useState(false);
  const [studyView, setStudyView] = useState('cards');
  const [typeFilter, setTypeFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [reviewState, setReviewState] = useState(loadReviewState);

  const categoryOptions = [allCategories, practiceCategory, ...categories];
  const selectedCategory =
    categoryOptions.find((category) => category.id === selectedCategoryId) ?? allCategories;
  const learningItemById = useMemo(
    () => new Map(learningItems.map((item) => [item.id, item])),
    []
  );
  const selectedScenario =
    conversationScenarios.find((scenario) => scenario.id === selectedScenarioId) ??
    conversationScenarios[0];
  const conversationItems = useMemo(
    () => selectedScenario.itemIds.map((id) => learningItemById.get(id)).filter(Boolean),
    [learningItemById, selectedScenario]
  );
  const currentConversationItem = conversationItems[conversationIndex] ?? conversationItems[0];
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

    const filteredItems = items.filter(
      (item) =>
        matchesTypeFilter(item, typeFilter) &&
        matchesDifficultyFilter(item, difficultyFilter) &&
        matchesSearch(item, searchQuery)
    );

    if (studyView === 'list') {
      return sortDeck(filteredItems, selectedCategoryId);
    }

    return shuffleItems(filteredItems);
  }, [
    difficultyFilter,
    practiceIds,
    searchQuery,
    selectedCategoryId,
    shuffleSeed,
    studyView,
    typeFilter
  ]);

  const currentItem = deck[currentIndex] ?? deck[0];
  const phraseCount = learningItems.length;
  const practiceCount = practiceIds.size;
  const getCategoryCount = (categoryId) => {
    if (categoryId === 'all') {
      return learningItems.length;
    }

    if (categoryId === 'practice') {
      return practiceCount;
    }

    return learningItems.filter((item) => item.categoryId === categoryId).length;
  };

  useEffect(() => {
    localStorage.setItem(reviewStorageKey, JSON.stringify(reviewState));
  }, [reviewState]);

  useEffect(() => {
    if (deck.length > 0 && currentIndex > deck.length - 1) {
      setCurrentIndex(deck.length - 1);
    }
  }, [currentIndex, deck.length]);

  useEffect(() => {
    if (conversationItems.length > 0 && conversationIndex > conversationItems.length - 1) {
      setConversationIndex(conversationItems.length - 1);
      setIsConversationRevealed(false);
    }
  }, [conversationIndex, conversationItems.length]);

  const resetDeckPosition = () => {
    setCurrentIndex(0);
    setIsRevealed(false);
    setIsDeckComplete(false);
  };

  const chooseCategory = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setShuffleSeed((value) => value + 1);
    resetDeckPosition();
  };

  const choosePromptSide = (side) => {
    setPromptSide(side);
    setIsRevealed(false);
    setIsDeckComplete(false);
  };

  const chooseTypeFilter = (filterId) => {
    setTypeFilter(filterId);
    setShuffleSeed((value) => value + 1);
    resetDeckPosition();
  };

  const chooseDifficultyFilter = (filterId) => {
    setDifficultyFilter(filterId);
    setShuffleSeed((value) => value + 1);
    resetDeckPosition();
  };

  const updateSearchQuery = (event) => {
    setSearchQuery(event.target.value);
    setShuffleSeed((value) => value + 1);
    resetDeckPosition();
  };

  const clearSearchQuery = () => {
    setSearchQuery('');
    setShuffleSeed((value) => value + 1);
    resetDeckPosition();
  };

  const chooseScenario = (scenarioId) => {
    setSelectedScenarioId(scenarioId);
    setConversationIndex(0);
    setIsConversationRevealed(false);
  };

  const moveToConversationLine = (nextIndex) => {
    setConversationIndex(nextIndex);
    setIsConversationRevealed(false);
  };

  const moveNextConversationLine = () => {
    moveToConversationLine(Math.min(conversationItems.length - 1, conversationIndex + 1));
  };

  const movePreviousConversationLine = () => {
    moveToConversationLine(Math.max(0, conversationIndex - 1));
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
          <h1>{activeMode === 'home' ? 'Choose a practice mode' : 'Focused Montenegrin practice'}</h1>
          <p className="hero-copy">
            {activeMode === 'home'
              ? 'Build recall now, with conversation practice ready to grow next.'
              : 'Choose a deck and practice recall from either language.'}
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

      {activeMode === 'home' ? (
        <main className="home-screen">
          <section className="mode-grid" aria-label="Practice modes">
            <button type="button" className="mode-card" onClick={() => setActiveMode('flashcards')}>
              <span className="mode-kicker">Study now</span>
              <strong>Flashcards</strong>
              <span>Practice words, phrases, and sentences by deck.</span>
              <span className="mode-count">{phraseCount} items</span>
            </button>

            <button
              type="button"
              className="mode-card mode-card-secondary"
              onClick={() => setActiveMode('conversation')}
            >
              <span className="mode-kicker">Practice scenes</span>
              <strong>Conversation Practice</strong>
              <span>Practice short real-life scenarios line by line.</span>
              <span className="mode-count">{conversationScenarios.length} scenarios</span>
            </button>
          </section>
        </main>
      ) : activeMode === 'conversation' ? (
        <main className="conversation-layout">
          <aside className="scenario-panel" aria-label="Conversation scenarios">
            <div className="screen-toolbar">
              <button type="button" className="back-button" onClick={() => setActiveMode('home')}>
                Back
              </button>
            </div>
            <div className="panel-heading">
              <h2>Scenarios</h2>
              <p>{selectedScenario.description}</p>
            </div>
            <div className="scenario-list">
              {conversationScenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  type="button"
                  className={scenario.id === selectedScenarioId ? 'is-active' : ''}
                  onClick={() => chooseScenario(scenario.id)}
                >
                  <span>{scenario.name}</span>
                  <strong>{scenario.itemIds.length}</strong>
                </button>
              ))}
            </div>
          </aside>

          <section className="conversation-panel">
            <div className="mobile-deck-picker">
              <label htmlFor="mobile-scenario-select">Scenario</label>
              <select
                id="mobile-scenario-select"
                value={selectedScenarioId}
                onChange={(event) => chooseScenario(event.target.value)}
              >
                {conversationScenarios.map((scenario) => (
                  <option key={scenario.id} value={scenario.id}>
                    {scenario.name} ({scenario.itemIds.length})
                  </option>
                ))}
              </select>
              <p>{selectedScenario.description}</p>
            </div>

            <div className="section-head">
              <div>
                <h2>{selectedScenario.name}</h2>
                <p>Practice one line at a time, then reveal the Montenegrin.</p>
              </div>
              <div className="session-meter" aria-label="Conversation line">
                <span>Line</span>
                <strong>
                  {conversationItems.length > 0 ? conversationIndex + 1 : 0} of{' '}
                  {conversationItems.length}
                </strong>
              </div>
            </div>

            {currentConversationItem ? (
              <>
                <div className="conversation-card">
                  <span className="phrase-label">English</span>
                  <strong>{currentConversationItem.english}</strong>
                  {isConversationRevealed ? (
                    <span className="conversation-answer">
                      <span>{currentConversationItem.montenegrin}</span>
                      <small>{currentConversationItem.phonetic}</small>
                    </span>
                  ) : (
                    <span className="phrase-support">Think of the Montenegrin line.</span>
                  )}
                </div>

                <div className="study-actions">
                  <button
                    type="button"
                    onClick={movePreviousConversationLine}
                    disabled={conversationIndex === 0}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    className="reveal-button"
                    onClick={() => setIsConversationRevealed((value) => !value)}
                  >
                    {isConversationRevealed ? 'Hide answer' : 'Reveal answer'}
                  </button>
                  <button
                    type="button"
                    onClick={moveNextConversationLine}
                    disabled={conversationIndex === conversationItems.length - 1}
                  >
                    Next
                  </button>
                </div>

                <div className="conversation-transcript" aria-label={`${selectedScenario.name} transcript`}>
                  {conversationItems.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      className={index === conversationIndex ? 'is-active' : ''}
                      onClick={() => moveToConversationLine(index)}
                    >
                      <span>{index + 1}</span>
                      <strong>{item.english}</strong>
                      <small>{item.montenegrin}</small>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-practice">
                <h3>No lines in this scenario</h3>
                <p>Choose another scenario.</p>
              </div>
            )}
          </section>
        </main>
      ) : (
        <main className="learning-layout">
        <aside className="category-panel" aria-label="Categories">
          <div className="panel-heading">
            <h2>Study Decks</h2>
            <p>{selectedCategory.description}</p>
          </div>
          <div className="category-list">
            {categoryOptions.map((category) => (
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
                <strong>{getCategoryCount(category.id)}</strong>
              </button>
            ))}
          </div>
        </aside>

        <section className="practice-panel">
          <div className="screen-toolbar">
            <button type="button" className="back-button" onClick={() => setActiveMode('home')}>
              Back
            </button>
          </div>

          <div className="mobile-deck-picker">
            <label htmlFor="mobile-deck-select">Deck</label>
            <select
              id="mobile-deck-select"
              value={selectedCategoryId}
              onChange={(event) => chooseCategory(event.target.value)}
            >
              {categoryOptions.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} ({getCategoryCount(category.id)})
                </option>
              ))}
            </select>
            <p>{selectedCategory.description}</p>
          </div>

          <div className="section-head">
            <div>
              <h2>{studyView === 'cards' ? 'Flashcards' : 'Word List'}</h2>
              <p>
                {selectedCategory.name} deck ·{' '}
                {typeFilters.find((filter) => filter.id === typeFilter)?.label ?? 'All'} ·{' '}
                {difficultyFilters.find((filter) => filter.id === difficultyFilter)?.label ??
                  'All levels'}
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

          <div className="search-box" role="search">
            <label htmlFor="phrase-search">Search phrases</label>
            <div className="search-input-wrap">
              <input
                id="phrase-search"
                type="search"
                value={searchQuery}
                onChange={updateSearchQuery}
                placeholder="Search English, Montenegrin, or phonetic..."
              />
              {searchQuery && (
                <button type="button" onClick={clearSearchQuery}>
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="filter-row">
            <div className="filter-group">
              <span>Type</span>
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
            </div>

            <div className="filter-group">
              <span>Level</span>
              <div className="type-filter" aria-label="Difficulty">
                {difficultyFilters.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    className={difficultyFilter === filter.id ? 'is-active' : ''}
                    onClick={() => chooseDifficultyFilter(filter.id)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
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
                <h3>{searchQuery ? `No matches for "${searchQuery}"` : 'No cards in this deck'}</h3>
                <p>
                  {searchQuery
                    ? 'Try a broader search or adjust the selected filters.'
                    : 'Try a different card type or choose another deck.'}
                </p>
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
              <h3>{searchQuery ? `No matches for "${searchQuery}"` : 'No cards in this deck'}</h3>
              <p>
                {searchQuery
                  ? 'Try a broader search or adjust the selected filters.'
                  : 'Try a different card type or choose another deck.'}
              </p>
            </div>
          )}
        </section>
      </main>
      )}
    </div>
  );
}

export default App;
