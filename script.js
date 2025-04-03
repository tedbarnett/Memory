document.addEventListener('DOMContentLoaded', () => {
    // Get references to HTML elements
    const countInput = document.getElementById('count');
    const delayInput = document.getElementById('delay');
    const startButton = document.getElementById('startButton');
    const statusPara = document.getElementById('status');

    // State variables
    let allNouns = []; // To store nouns loaded from file
    let nounsLoaded = false;
    let isSpeaking = false;

    // --- Check for Speech Synthesis Support ---
    if (!('speechSynthesis' in window)) {
        statusPara.textContent = 'Error: Browser does not support text-to-speech.';
        startButton.disabled = true; // Keep disabled
        return;
    }

    // --- Function to Load Nouns from File ---
    async function loadNouns() {
        statusPara.textContent = 'Loading nouns from nouns.txt...';
        startButton.disabled = true; // Ensure button is disabled during load

        try {
            const response = await fetch('nouns.txt');
            if (!response.ok) {
                // Handle file not found or other HTTP errors
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const text = await response.text();
            allNouns = text.trim().split('\n')
                           .map(n => n.trim())      // Remove whitespace around each noun
                           .filter(n => n !== '');  // Remove any empty lines

            if (allNouns.length === 0) {
                throw new Error('nouns.txt is empty or contains no valid nouns.');
            }

            nounsLoaded = true;
            statusPara.textContent = `Ready (${allNouns.length} nouns loaded). Adjust settings and click Start.`;
            startButton.disabled = false; // Enable button ONLY if load succeeds

        } catch (error) {
            console.error('Error loading nouns.txt:', error);
            statusPara.textContent = `Error loading nouns: ${error.message}. Please check nouns.txt.`;
            allNouns = [];
            nounsLoaded = false;
            startButton.disabled = true; // Keep disabled on error
        }
    }

    // --- Event Listener for Start Button ---
    startButton.addEventListener('click', async () => {
        if (isSpeaking) return; // Prevent starting again if already running
        if (!nounsLoaded || allNouns.length === 0) {
            statusPara.textContent = 'Error: Nouns not loaded or list is empty.';
            // Optionally try reloading here: await loadNouns(); if (!nounsLoaded) return;
            return;
        }

        // 1. Get Settings
        const count = parseInt(countInput.value, 10);
        const delaySeconds = parseFloat(delayInput.value);

        // 2. Validate Settings
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

        try {
            await speakNounsWithDelay(selectedNouns, delaySeconds * 1000); // Convert seconds to ms
            statusPara.textContent = 'Finished!';
        } catch (error) {
            console.error("Speech error:", error);
            statusPara.textContent = 'An error occurred during speech.';
        } finally {
            // 5. Cleanup
            isSpeaking = false;
            // Only re-enable if nouns are still considered loaded
            startButton.disabled = !nounsLoaded;
        }
    });

    // --- Helper Functions ---

    function selectRandomNouns(list, count) {
        // Fisher-Yates (Knuth) Shuffle algorithm for better randomness
        let shuffled = list.slice(); // Create a copy
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
        }
        return shuffled.slice(0, count); // Return the first 'count' elements
    }

    async function speakNounsWithDelay(nouns, delayMs) {
        for (let i = 0; i < nouns.length; i++) {
            const noun = nouns[i];
            // Update status before speaking
            statusPara.textContent = `Speaking (${i + 1}/${nouns.length}): ${noun}`;

            const utterance = new SpeechSynthesisUtterance(noun);
            // You can configure voice, rate, pitch here if needed:
            // utterance.rate = 1.0; // Default is 1
            // utterance.pitch = 1.0; // Default is 1
            // Find and set a specific voice:
            // const voices = window.speechSynthesis.getVoices();
            // utterance.voice = voices.find(v => v.lang === 'en-US'); // Example

            await speakAndWait(utterance); // Speak and wait for completion

            // Wait for the specified delay (if not the last noun)
            if (i < nouns.length - 1) {
                await wait(delayMs);
            }
        }
    }

    // Promisified speech synthesis speak function
    function speakAndWait(utterance) {
        return new Promise((resolve, reject) => {
            utterance.onend = resolve;
            utterance.onerror = (event) => {
                console.error("SpeechSynthesisUtterance.onerror", event);
                reject(new Error(`Speech error: ${event.error}`)); // Reject promise on error
            };
            window.speechSynthesis.speak(utterance);
        });
    }

    // Promisified setTimeout function
    function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // --- Initial Load ---
    loadNouns(); // Start loading nouns when the script runs

}); // End DOMContentLoaded
