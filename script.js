document.addEventListener('DOMContentLoaded', () => {
    const wordList = document.getElementById('wordList');
    const showWordsButton = document.getElementById('showWordsButton');
    const startButton = document.getElementById('startButton');
    const textElement = document.getElementById('text');
    const statusElement = document.getElementById('status');
    const wordCountInput = document.getElementById('wordCountInput');
    const delayInput = document.getElementById('delayInput');
    const inputTypeSelect = document.getElementById('inputType');

    let allWords = [];
    let currentIndex = 0;
    let currentItems = [];
    let currentType = 'words';

    fetch('nouns.txt')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load nouns.txt');
            return response.text();
        })
        .then(data => {
            allWords = data.split(/\r?\n/).filter(Boolean);
            updateMaxCount();
            wordCountInput.value = Math.min(10, parseInt(wordCountInput.max, 10));
            startButton.disabled = false;
            statusElement.textContent = 'Ready';
        })
        .catch(error => {
            console.error(error);
            statusElement.textContent = 'Error loading nouns.txt.';
        });

    inputTypeSelect.addEventListener('change', updateMaxCount);
    wordCountInput.addEventListener('change', validateWordCount);

    function updateMaxCount() {
        currentType = inputTypeSelect.value;
        if (currentType === 'words') {
            wordCountInput.max = allWords.length;
        } else {
            wordCountInput.max = 108;
        }
        validateWordCount();
    }

    function validateWordCount() {
        let currentCount = parseInt(wordCountInput.value, 10);
        let maxCount = parseInt(wordCountInput.max, 10);
        if (isNaN(currentCount) || currentCount < 1 || currentCount > maxCount) {
            wordCountInput.value = Math.max(1, Math.min(currentCount, maxCount));
        }
    }

    startButton.addEventListener('click', () => {
        let wordCount = parseInt(wordCountInput.value, 10);
        currentType = inputTypeSelect.value;
        let maxCount = parseInt(wordCountInput.max, 10);

        wordList.innerHTML = '';
        textElement.textContent = '';
        showWordsButton.textContent = 'Show List';
        wordList.style.display = 'none';

        if (isNaN(wordCount) || wordCount < 1 || wordCount > maxCount) {
            alert(`Enter a number between 1 and ${maxCount}.`);
            return;
        }

        if (currentType === 'words') {
            currentItems = shuffleArray(allWords).slice(0, wordCount);
        } else {
            currentItems = generateRandomNumbers(wordCount);
        }

        currentIndex = 0;
        startButton.disabled = true;
        showWordsButton.disabled = true;
        statusElement.textContent = 'Practicing...';
        startButton.textContent = 'New Session';

        displayAndSpeakNextItem();
    });

    showWordsButton.addEventListener('click', () => {
        if (wordList.style.display === 'none' || wordList.style.display === '') {
            displayItemList();
            wordList.style.display = 'block';
            showWordsButton.textContent = 'Hide List';
        } else {
            wordList.style.display = 'none';
            showWordsButton.textContent = 'Show List';
        }
    });

    function displayItemList() {
        wordList.innerHTML = currentItems.map(item => `<li>${item}</li>`).join('');
    }

    function displayAndSpeakNextItem() {
        if (currentIndex >= currentItems.length) {
            statusElement.textContent = 'Session complete!';
            textElement.textContent = '';
            startButton.disabled = false;
            showWordsButton.disabled = false;
            return;
        }

        const item = currentItems[currentIndex];
        textElement.textContent = item;

        const utterance = new SpeechSynthesisUtterance(item);
        speechSynthesis.speak(utterance);

        utterance.onend = () => {
            currentIndex++;
            if (currentIndex < currentItems.length) {
                setTimeout(displayAndSpeakNextItem, parseInt(delayInput.value, 10) * 1000);
            } else {
                statusElement.textContent = 'Session complete!';
                textElement.textContent = '';
                startButton.disabled = false;
                showWordsButton.disabled = false;
            }
        };
    }

    function generateRandomNumbers(count) {
        // Define the full pool of possible number strings
        const numberPool = [];
        // Add single digits 1-9
        for (let i = 1; i <= 9; i++) {
            numberPool.push(String(i));
        }
        // Add double digits 01-09
        for (let i = 1; i <= 9; i++) {
            numberPool.push(String(i).padStart(2, '0'));
        }
        // Add double digits 10-99
        for (let i = 10; i <= 99; i++) {
            numberPool.push(String(i));
        }

        // Shuffle the pool
        const shuffledPool = shuffleArray(numberPool);

        // Take the first 'count' items
        return shuffledPool.slice(0, count);
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
});