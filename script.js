document.addEventListener('DOMContentLoaded', () => {
    const textElement = document.getElementById('text');
    const startButton = document.getElementById('startButton');
    const showWordsButton = document.getElementById('showWordsButton');
    const wordCountInput = document.getElementById('wordCountInput');
    const delayInput = document.getElementById('delayInput');
    const statusElement = document.getElementById('status');
    const wordList = document.getElementById('wordList');

    let words = [];
    let currentIndex = 0;
    let delay = 3000; // default delay 3 seconds

    fetch('nouns.txt')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load nouns.txt');
            return response.text();
        })
        .then(data => {
            words = data.split(/\r?\n/).filter(Boolean);
            wordCountInput.max = words.length;
            wordCountInput.value = Math.min(10, words.length);
            startButton.disabled = false;
            showWordsButton.disabled = false;
            statusElement.textContent = 'Ready.';
        })
        .catch(error => {
            console.error(error);
            statusElement.textContent = 'Error loading nouns.txt.';
        });

    startButton.addEventListener('click', () => {
        let wordCount = parseInt(wordCountInput.value, 10);
        delay = parseInt(delayInput.value, 10) * 1000;
        wordList.innerHTML = ''; // Clear previous list

        if (isNaN(wordCount) || wordCount < 1 || wordCount > words.length) {
            alert(`Enter a number between 1 and ${words.length}.`);
            return;
        }

        currentIndex = 0;
        startButton.disabled = true;
        showWordsButton.disabled = true;
        statusElement.textContent = 'Practicing...';
        displayWords(wordCount);
    });

    showWordsButton.addEventListener('click', () => {
        let wordCount = parseInt(wordCountInput.value, 10);

        if (isNaN(wordCount) || wordCount < 1 || wordCount > words.length) {
            alert(`Enter a number between 1 and ${words.length}.`);
            return;
        }

        displayWordList(wordCount);
    });

    function displayWords(wordCount) {
        if (currentIndex < wordCount) {
            textElement.textContent = words[currentIndex];
            currentIndex++;
            setTimeout(() => displayWords(wordCount), delay);
        } else {
            textElement.textContent = 'Done!';
            startButton.disabled = false;
            showWordsButton.disabled = false;
            statusElement.textContent = 'Ready.';
        }
    }

    function displayWordList(wordCount) {
        wordList.innerHTML = ''; // Clear existing words
        for (let i = 0; i < wordCount; i++) {
            let li = document.createElement('li');
            li.textContent = words[i];
            wordList.appendChild(li);
        }
    }
});
