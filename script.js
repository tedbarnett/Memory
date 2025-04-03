document.addEventListener('DOMContentLoaded', () => {
    const wordList = document.getElementById('wordList');
    const showWordsButton = document.getElementById('showWordsButton');
    const startButton = document.getElementById('startButton');
    const textElement = document.getElementById('text');
    const statusElement = document.getElementById('status');
    const wordCountInput = document.getElementById('wordCountInput');
    const delayInput = document.getElementById('delayInput');

    let allWords = [];
    let currentIndex = 0;
    let randomizedWords = [];

    fetch('nouns.txt')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load nouns.txt');
            return response.text();
        })
        .then(data => {
            allWords = data.split(/\r?\n/).filter(Boolean);
            wordCountInput.max = allWords.length;
            wordCountInput.value = Math.min(3, allWords.length); // Default to 3 or max available words
            startButton.disabled = false;
            statusElement.textContent = 'Ready';
        })
        .catch(error => {
            console.error(error);
            statusElement.textContent = 'Error loading nouns.txt.';
        });

    startButton.addEventListener('click', () => {
        let wordCount = parseInt(wordCountInput.value, 10);
        wordList.innerHTML = '';
        textElement.textContent = '';
        showWordsButton.textContent = 'Show Word List'; // Reset the button label
        wordList.style.display = 'none'; // Ensure the word list is hidden

        if (isNaN(wordCount) || wordCount < 1 || wordCount > allWords.length) {
            alert(`Enter a number between 1 and ${allWords.length}.`);
            return;
        }

        randomizedWords = shuffleArray(allWords).slice(0, wordCount);
        currentIndex = 0;
        startButton.disabled = true;
        showWordsButton.disabled = true;
        statusElement.textContent = 'Session in progress...';

        // Change the label to "New Session" after the first click
        startButton.textContent = 'New Session';

        displayAndSpeakNextWord();
    });

    showWordsButton.addEventListener('click', () => {
        if (wordList.style.display === 'none' || wordList.style.display === '') {
            displayWordList();
            wordList.style.display = 'block';
            showWordsButton.textContent = 'Hide Word List';
        } else {
            wordList.style.display = 'none';
            showWordsButton.textContent = 'Show Word List';
        }
    });

    function displayWordList() {
        wordList.innerHTML = randomizedWords.map(word => `<li>${word}</li>`).join('');
    }

    function displayAndSpeakNextWord() {
        if (currentIndex >= randomizedWords.length) {
            statusElement.textContent = 'Session complete!';
            textElement.textContent = ''; // Clear the last word from the screen
            startButton.disabled = false;
            showWordsButton.disabled = false;
            return; // Exit the function if all words are displayed
        }

        const word = randomizedWords[currentIndex];
        textElement.textContent = word;

        // Use speech synthesis to speak the word
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.onend = () => {
            // Wait for the speech to finish before proceeding to the next word
            currentIndex++;
            if (currentIndex < randomizedWords.length) {
                setTimeout(displayAndSpeakNextWord, parseInt(delayInput.value, 10) * 1000);
            } else {
                statusElement.textContent = 'Session complete!';
                textElement.textContent = ''; // Clear the last word from the screen
                startButton.disabled = false;
                showWordsButton.disabled = false;
            }
        };

        speechSynthesis.speak(utterance);
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
});