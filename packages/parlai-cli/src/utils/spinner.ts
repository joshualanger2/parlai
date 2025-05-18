import ora from 'ora';

const translationPhrases = [
  "🇬🇧 translating...",
  "🇫🇷 en train de traduire...",
  "🇪🇸 traduciendo...",
  "🇩🇪 übersetzen...",
  "🇮🇹 traducendo...",
  "🇯🇵 翻訳中...",
  "🇨🇳 翻译中...",
  "🤖 *beep boop* converting human speech...",
  "📚 consulting my multilingual dictionary...",
  "🧠 neural networks firing...",
  "🌍 going global...",
  "💭 thinking in multiple languages...",
  "🎯 finding the perfect words...",
  "🔄 converting thoughts across cultures...",
  "📝 scribbling in foreign languages...",
  "🎭 performing linguistic acrobatics...",
  "🌈 spreading linguistic diversity...",
  "🎨 painting with words in different hues...",
  "🎵 composing a multilingual symphony...",
  "🧩 solving the language puzzle..."
];

export function createSpinner() {
  let currentPhraseIndex = 0;
  const spinner = ora({
    text: translationPhrases[0],
    spinner: 'dots',
    color: 'cyan'
  });

  // Update the spinner text every 2 seconds with a new phrase
  const intervalId = setInterval(() => {
    currentPhraseIndex = (currentPhraseIndex + 1) % translationPhrases.length;
    spinner.text = translationPhrases[currentPhraseIndex];
  }, 2000);

  // Return both the spinner and a cleanup function
  return {
    spinner,
    stop: () => {
      clearInterval(intervalId);
      spinner.stop();
    }
  };
} 