document.addEventListener('DOMContentLoaded', function () {
    const textElement = document.getElementById('text');
    const startButton = document.getElementById('startButton');
    const inputContainer = document.getElementById('inputContainer');
    const wordCountInput = document.getElementById('wordCountInput');

    let words = [];
    let currentIndex = 0;
    let displayInterval = 2000; // Default display interval in milliseconds

    // Fetch the list of nouns from nouns.txt
    fetch('nouns.txt')
        .then(response => response.text())
        .then(data => {
            words = data.split(/\r?\n/).filter(word => word.trim() !== '');
            inputContainer.style.display = 'block'; // Show the input container
        })
        .catch(error => {
            console.error('Error loading nouns:', error);
            textElement.textContent = 'Failed to load words.';
        });

    startButton.addEventListener('click', function () {
        const wordCount = parseInt(wordCountInput.value, 10);

        if (isNaN(wordCount) || wordCount < 1 || wordCount > words.length) {
            alert(`Please enter a number between 1 and ${words.length}.`);
            return;
        }

        inputContainer.style.display = 'none'; // Hide input during display
        currentIndex = 0;
        displayWords(wordCount);
    });

    function displayWords(wordCount) {
        if (currentIndex < wordCount) {
            textElement.textContent = words[currentIndex];
            currentIndex++;
            setTimeout(() => displayWords(wordCount), displayInterval);
        } else {
            textElement.textContent = 'Done!';
            inputContainer.style.display = 'block'; // Show input after display
        }
    }
});