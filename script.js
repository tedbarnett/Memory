document.addEventListener('DOMContentLoaded', () => {
    // Get references to HTML elements
    const countInput = document.getElementById('count');
    const delayInput = document.getElementById('delay');
    const startButton = document.getElementById('startButton');
    const showWordsButton = document.getElementById('showWordsButton'); // New button
    const statusPara = document.getElementById('status');
    const wordListDisplay = document.getElementById('wordListDisplay'); // New display area

    // State variables
    let allNouns = []; // To store nouns loaded from file
    let nounsLoaded = false;
    let isSpeaking = false;
    let lastSpokenWords = []; // To store the words from the last session

    // --- Check for Speech Synthesis Support ---
    if (!('speechSynthesis' in window)) {
        statusPara.textContent = 'Error: Browser does not support text-to-speech.';
        startButton.disabled = true;
        showWordsButton.disabled = true; // Also disable this button
        return;
    }

    // --- Function to Load Nouns from File ---
    async function loadNouns() {
        statusPara.textContent = 'Loading nouns from nouns.txt...';
        startButton.disabled = true;
        showWordsButton.disabled = true; // Keep disabled

        try {
            const response = await fetch('nouns.txt');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const text = await response.text();
            allNouns = text.trim().split('\n')
                           .map(n => n.trim())
                           .filter(n => n !== '');

            if (allNouns.length === 0) {
                throw new Error('nouns.txt is empty or contains no valid nouns.');
            }

            nounsLoaded = true;
            statusPara.textContent = `Ready (${allNouns.length} nouns loaded). Adjust settings and click Start.`;
            startButton.disabled = false; // Enable Start button ONLY if load succeeds
            // Show Words button remains disabled until a session completes

        } catch (error) {
            console.error('Error loading nouns.txt:', error);
            statusPara.textContent = `Error loading nouns: ${error.message}. Please check nouns.txt.`;
            allNouns = [];
            nounsLoaded = false;
            startButton.disabled = true; // Keep Start disabled on error
            showWordsButton.disabled = true; // Keep Show Words disabled
        }
    }

    // --- Event Listener for Start Button ---
    startButton.addEventListener('click', async () => {
        if (isSpeaking) return;
        if (!nounsLoaded || allNouns.length === 0) {
            statusPara.textContent = 'Error: Nouns not loaded or list is empty.';
            return;
        }

        // Clear previous word list display and disable Show Words button
        wordListDisplay.innerHTML = '';
        showWordsButton.disabled = true;
        lastSpokenWords = []; // Clear previous session words

        // 1. Get Settings
        const count = parseInt(countInput.value, 10);
        const delaySeconds = parseFloat(delayInput.value);

        // 2. Validate Settings (same as before)
        if (isNaN(count) || count < parseInt(countInput.min, 10) || count > parseInt(countInput.max, 10)) {
            statusPara.textContent = `Error: Invalid number of nouns. Must be between ${countInput.min} and ${countInput.max}.`;
            return;
        }
        if (isNaN(delaySeconds) || delaySeconds < parseFloat(delayInput.min)) {
            statusPara.textContent = `Error: Invalid delay. Must be at least ${delayInput.min} seconds.`;
            return;
        }
        if (allNouns.length < count) {
            statusPara.textContent = `Error: Not enough loaded nouns (${allNouns.length}) to select ${count}. Load more nouns in nouns.txt.`;
            return;
        }

        // 3. Select Random Nouns
        const selectedNouns = selectRandomNouns(allNouns, count);

        // 4. Start Speaking Sequence
        isSpeaking = true;
        startButton.disabled = true; // Disable during speech
        statusPara.textContent = 'Starting sequence...';
        window.speechSynthesis.cancel(); // Cancel any leftover speech

        let sessionCompletedSuccessfully = false; // Flag for success
        try {
            await speakNounsWithDelay(selectedNouns, delaySeconds * 1000); // Convert seconds to ms
            statusPara.textContent = 'Finished!';
            lastSpokenWords = selectedNouns; // Store the words AFTER successful completion
            sessionCompletedSuccessfully = true;
        } catch (error) {
            console.error("Speech error:", error);
            statusPara.textContent = 'An error occurred during speech.';
            lastSpokenWords = []; // Clear words if error occurred
        } finally {
            // 5. Cleanup
            isSpeaking = false;
            // Only re-enable Start if nouns are still loaded
            startButton.disabled = !nounsLoaded;
            // Enable Show Words button ONLY if the session completed successfully
            showWordsButton.disabled = !sessionCompletedSuccessfully;
        }
    });

    // --- Event Listener for Show Words Button ---
    showWordsButton.addEventListener('click', () => {
        wordListDisplay.innerHTML = ''; // Clear previous list

        if (lastSpokenWords.length === 0) {
            wordListDisplay.textContent = 'No words from the last session to display.';
            return;
        }

        const ol = document.createElement('ol'); // Create an ordered list

        lastSpokenWords.forEach(word => {
            const li = document.createElement('li');
            li.textContent = word;
            ol.appendChild(li);
        });

        wordListDisplay.appendChild(ol); // Add the list to the display area
    });


    // --- Helper Functions (selectRandomNouns, speakNounsWithDelay, speakAndWait, wait) ---
    // (These functions remain the same as the previous version)

    function selectRandomNouns(list, count) {
        // Fisher-Yates (Knuth) Shuffle algorithm
        let shuffled = list.slice();
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled.slice(0, count);
    }

    async function speakNounsWithDelay(nouns, delayMs) {
        for (let i = 0; i < nouns.length; i++) {
            const noun = nouns[i];
            statusPara.textContent = `Speaking (${i + 1}/${nouns.length}): ${noun}`;
            const utterance = new SpeechSynthesisUtterance(noun);
            // Optional: Configure voice, rate, pitch here
            await speakAndWait(utterance);
            if (i < nouns.length - 1) {
                await wait(delayMs);
            }
        }
    }

    function speakAndWait(utterance) {
        return new Promise((resolve, reject) => {
            utterance.onend = resolve;
            utterance.onerror = (event) => {
                console.error("SpeechSynthesisUtterance.onerror", event);
                reject(new Error(`Speech error: ${event.error}`));
            };
            window.speechSynthesis.speak(utterance);
        });
    }

    function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // --- Initial Load ---
    loadNouns(); // Start loading nouns when the script runs

}); // End DOMContentLoaded
