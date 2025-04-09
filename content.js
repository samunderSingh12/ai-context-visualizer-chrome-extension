// --- content.js v0.3.0 ---
// Dynamically estimates visible text context usage for AI chat sites.
// Now uses user-configurable total context size from storage.
console.log("AI Context Visualizer script running (v0.3.0)...");

// --- !!! CORE CONFIGURATION - ADJUST THESE !!! ---
const MESSAGE_CONTAINER_SELECTOR = 'div[data-testid="virtuoso-item-list"]';
const CHAT_MESSAGES_SELECTOR = 'p';
const CHARACTER_INFO_SELECTOR = '.character-prompt-does-not-exist';
const CHARS_PER_TOKEN_ESTIMATE = 4;
const DEBOUNCE_DELAY_MS = 600;
const INITIAL_OBSERVER_DELAY_MS = 3000;

// --- Constants for Storage ---
const STORAGE_KEY = 'totalContextSize'; // Same key used in popup.js
const DEFAULT_CONTEXT_SIZE = 4096; // Default if nothing is saved

// --- END CONFIGURATION ---


let visualizerElement = null;
let debounceTimer = null;
let currentObserver = null;

// --- Main Calculation and Display Function ---
// Now marked async to allow 'await' for storage access
async function calculateAndShowEstimate() {
    console.log("Calculating context estimate...");
    let combinedText = '';
    let characterText = '';
    let messageText = '';
    let messageElementCount = 0;

    // --- 0. Get Total Context Size from Storage ---
    let totalTokens = DEFAULT_CONTEXT_SIZE; // Start with default
    try {
        // Use await to get the stored value asynchronously
        const result = await chrome.storage.sync.get([STORAGE_KEY]);
        if (result[STORAGE_KEY] !== undefined) {
            totalTokens = parseInt(result[STORAGE_KEY], 10);
            if (isNaN(totalTokens) || totalTokens <= 0) {
                 console.warn(`Invalid stored context size (${result[STORAGE_KEY]}), using default ${DEFAULT_CONTEXT_SIZE}.`);
                 totalTokens = DEFAULT_CONTEXT_SIZE;
            }
        }
        console.log(`Using total context size: ${totalTokens}`);
    } catch (error) {
        console.error("Error retrieving context size from storage:", error);
        // Keep the default value on error
    }


    // --- 1. Get Character Info Text (Optional) ---
    try {
        // ... (rest of the code for getting character info is the same) ...
        const charInfoElement = document.querySelector(CHARACTER_INFO_SELECTOR);
        if (charInfoElement && charInfoElement.offsetParent !== null) {
            characterText = (charInfoElement.textContent || '').trim();
            if (characterText) {
                combinedText += characterText + " ";
            }
        }
    } catch (error) {
        console.warn(`Error finding character info with selector "${CHARACTER_INFO_SELECTOR}":`, error);
    }

    // --- 2. Get Chat Message Text ---
    try {
       // ... (rest of the code for getting chat messages is the same) ...
        const messageContainer = document.querySelector(MESSAGE_CONTAINER_SELECTOR);
        if (messageContainer) {
            const messageElements = messageContainer.querySelectorAll(CHAT_MESSAGES_SELECTOR);
            messageElementCount = messageElements.length;
            if (messageElementCount > 0) {
                messageElements.forEach(el => {
                    if (el && el.offsetParent !== null) {
                         const msgTxt = (el.textContent || '').trim();
                         if (msgTxt) { messageText += msgTxt + " "; }
                    }
                });
                messageText = messageText.trim();
                if (messageText) { combinedText += messageText; }
            }
        }
    } catch (error) {
        console.error(`Error finding/processing messages:`, error);
    }

    // --- 3. Calculate Tokens and Percentage ---
    combinedText = combinedText.replace(/\s+/g, ' ').trim();
    const estimatedChars = combinedText.length;
    const estimatedTokens = Math.round(estimatedChars / CHARS_PER_TOKEN_ESTIMATE);
    // Use the retrieved totalTokens here
    const percentage = Math.min(100, Math.max(0, Math.round((estimatedTokens / totalTokens) * 100)));

    // --- 4. Update Display ---
    // Pass totalTokens to the display function
    updateVisualizerDisplay(estimatedTokens, percentage, totalTokens);
     console.log(`Calculation complete: Chars=${estimatedChars}, Est. Tokens=${estimatedTokens}, Total=${totalTokens}, Percent=${percentage}%`);
}


// --- Helper to Update the Visualizer DOM ---
// Now accepts totalTokens to display it
function updateVisualizerDisplay(tokens, percent, totalTokens) {
    if (!visualizerElement) {
       // ... (code to create visualizer element is the same) ...
        visualizerElement = document.getElementById('context-visualizer-simple');
        if (!visualizerElement) {
            if (document.body) {
                visualizerElement = document.createElement('div');
                visualizerElement.id = 'context-visualizer-simple';
                document.body.appendChild(visualizerElement);
            } else { return; }
        }
    }
    if (!visualizerElement) { return; }

    // Update inner HTML - Display the totalTokens value from storage
    visualizerElement.innerHTML = `
        <div>Est. Context: ~${tokens} / ${totalTokens} (${percent}%)</div>
        <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: ${percent}%;"></div>
        </div>
        <div class="disclaimer">(Visible Text Estimate)</div>
    `;

    // Update progress bar style based on percentage
    const progressBarFill = visualizerElement.querySelector('.progress-bar-fill');
    if (progressBarFill) {
       // ... (code to update progress bar style is the same) ...
        progressBarFill.classList.remove('warning', 'danger');
        if (percent >= 90) { progressBarFill.classList.add('danger'); }
        else if (percent >= 75) { progressBarFill.classList.add('warning'); }
    }
}


// --- Debounced Calculation Trigger ---
function debouncedCalculate() {
    clearTimeout(debounceTimer);
    // calculateAndShowEstimate is async, but setTimeout doesn't need special handling for it
    debounceTimer = setTimeout(calculateAndShowEstimate, DEBOUNCE_DELAY_MS);
}

// --- MutationObserver Setup ---
// ... (startObserver function remains largely the same, it just calls the async calculateAndShowEstimate) ...
function startObserver() {
    if (currentObserver) { currentObserver.disconnect(); }
    const targetNode = document.querySelector(MESSAGE_CONTAINER_SELECTOR);
    if (!targetNode) {
        console.warn(`Observer target ('${MESSAGE_CONTAINER_SELECTOR}') not found. Retrying...`);
        setTimeout(startObserver, 2000); return;
    }
    console.log("Observer target node found:", targetNode);
    const config = { childList: true, subtree: true, };
    const callback = (mutationsList, observer) => {
        let relevantMutation = false;
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList' && (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)) {
                relevantMutation = true; break;
            }
        }
        if (relevantMutation) { debouncedCalculate(); }
    };
    currentObserver = new MutationObserver(callback);
    currentObserver.observe(targetNode, config);
    console.log("MutationObserver started.");
    setTimeout(calculateAndShowEstimate, 500); // Initial calculation
}


// --- Initialization ---
if ('requestIdleCallback' in window) {
  requestIdleCallback(startObserver, { timeout: INITIAL_OBSERVER_DELAY_MS });
} else {
  setTimeout(startObserver, INITIAL_OBSERVER_DELAY_MS);
}


// --- Manual Refresh Function (for debugging) ---
window.refreshContextEstimate = calculateAndShowEstimate;
console.log("Run 'refreshContextEstimate()' in the console to manually update.");