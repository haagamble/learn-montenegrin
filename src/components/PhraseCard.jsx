import './PhraseCard.css';

function PhraseCard({ item, promptSide, isRevealed, onFlip }) {
  const frontLanguage = promptSide === 'english' ? 'English' : 'Montenegrin';
  const backLanguage = promptSide === 'english' ? 'Montenegrin' : 'English';
  const frontText = promptSide === 'english' ? item.english : item.montenegrin;
  const backText = promptSide === 'english' ? item.montenegrin : item.english;
  const frontSupport =
    promptSide === 'montenegrin'
      ? item.phonetic
      : `Think of the ${backLanguage.toLowerCase()} answer.`;
  const backSupport = promptSide === 'english' ? item.phonetic : 'Check your English recall.';

  return (
    <button
      type="button"
      className={`phrase-card ${isRevealed ? 'is-revealed' : ''}`}
      onClick={onFlip}
      aria-pressed={isRevealed}
    >
      {!isRevealed ? (
        <span className="phrase-card-face">
          <span className="phrase-label">{frontLanguage}</span>
          <span className="phrase-prompt">{frontText}</span>
          <span className="phrase-support">{frontSupport}</span>
        </span>
      ) : (
        <span className="phrase-card-face">
          <span className="phrase-label">{backLanguage}</span>
          <span className="phrase-answer">{backText}</span>
          <span className="phrase-support">{backSupport}</span>
        </span>
      )}
    </button>
  );
}

export default PhraseCard;
