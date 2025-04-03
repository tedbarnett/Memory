document.addEventListener('DOMContentLoaded', () => {
    const textElement = document.getElementById('text');
    const startButton = document.getElementById('startButton');
    const showWordsButton = document.getElementById('showWordsButton');
    const wordCountInput = document.getElementById('wordCountInput');
    const delayInput = document.getElementById('delayInput');
    const statusElement = document.getElementById('status');
    const wordList = document.getElementById('wordList');

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
            wordCountInput.value = Math.min(10, allWords.length);
            startButton.disabled = false;
            statusElement.textContent = 'Ready.';
        })
        .catch(error => {
            console.error(error);
            statusElement.textContent = 'Error loading nouns.txt.';
        });

    startButton.addEventListener('click', () => {
        let wordCount = parseInt(wordCountInput.value, 10);
        wordList.innerHTML = '';
        textElement.textContent = '';

        if (isNaN(wordCount) || wordCount < 1 || wordCount > allWords.length) {
            alert(`Enter a number between 1 and ${allWords.length}.`);
            return;
        }

        randomizedWords = shuffleArray(allWords).slice(0, wordCount);
        currentIndex = 0;
        startButton.disabled = true;
        showWordsButton.disabled = true;
        statusElement.textContent = 'Practicing...';
        displayAndSpeakNextWord();
    });

    showWordsButton.addEventListener('click', () => {
        displayWordList();
    });

    function displayAndSpeakNextWord() {
        if (currentIndex < randomizedWords.length) {
            const word = randomizedWords[currentIndex];
            textElement.textContent = word;
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.onend = () => {
                currentIndex++;
                setTimeout(displayAndSpeakNextWord, parseInt(delayInput.value, 10) * 1000);
            };
            window.speechSynthesis.speak(utterance);
        } else {
            textElement.textContent = 'Done!';
            startButton.disabled = false;
            showWordsButton.disabled = false;
            statusElement.textContent = 'Ready.';
        }
    }

    function displayWordList() {
        wordList.innerHTML = '';
        randomizedWords.forEach(word => {
            const li = document.createElement('li');
            li.textContent = word;
            wordList.appendChild(li);
        });
    }

    function shuffleArray(array) {
        let newArr = array.slice();
        for (let i = newArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
        }
        return newArr;
    }
});
