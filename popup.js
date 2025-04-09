// popup.js

const contextSizeInput = document.getElementById('contextSize');
const saveButton = document.getElementById('saveButton');
const statusDiv = document.getElementById('status');

const STORAGE_KEY = 'totalContextSize';
const DEFAULT_CONTEXT_SIZE = 4096; // Default if nothing is saved

// Function to display status messages
function showStatus(message, isError = false) {
    statusDiv.textContent = message;
    statusDiv.style.color = isError ? 'red' : 'green';
    setTimeout(() => {
        statusDiv.textContent = ''; // Clear status after a few seconds
    }, 3000);
}

// Load the saved context size when the popup opens
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get([STORAGE_KEY], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error loading context size:", chrome.runtime.lastError);
            showStatus("Error loading setting!", true);
            contextSizeInput.value = DEFAULT_CONTEXT_SIZE; // Use default on error
        } else {
            const savedSize = result[STORAGE_KEY];
            contextSizeInput.value = savedSize !== undefined ? savedSize : DEFAULT_CONTEXT_SIZE;
            console.log("Loaded context size:", contextSizeInput.value);
        }
    });
});

// Save the context size when the button is clicked
saveButton.addEventListener('click', () => {
    const newSize = parseInt(contextSizeInput.value, 10);

    if (isNaN(newSize) || newSize <= 0) {
        showStatus("Please enter a valid positive number.", true);
        return;
    }

    chrome.storage.sync.set({ [STORAGE_KEY]: newSize }, () => {
        if (chrome.runtime.lastError) {
             console.error("Error saving context size:", chrome.runtime.lastError);
            showStatus("Error saving setting!", true);
        } else {
            console.log("Context size saved:", newSize);
            showStatus("Settings saved!");
             // Optional: Close the popup after saving
             // window.close();
        }
    });
});