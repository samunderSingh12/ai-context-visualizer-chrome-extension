# AI Context Visualizer (Chrome Extension)

A simple Chrome extension that estimates and visualizes the context usage (based on visible text) for AI chat websites like Janitor AI. Helps users get a rough idea of how much of the assumed context window is filled.

**Note:** This extension relies on reading the structure (HTML elements) of the target website. Websites change often, which **will break** the extension's ability to find the text. Users **must manually update the CSS Selectors** in `content.js` when this happens.

## Features

*   Estimates token count based on visible chat messages (and optionally character info).
*   Dynamically updates the estimate as new messages appear.
*   Displays the estimate as `~CurrentTokens / TotalTokens (Percentage%)`.
*   Visual progress bar indicates context fullness.
*   User-configurable **Total Context Token** limit via the extension popup.
*   Basic styling for clear visibility.

## Installation

1.  **Download:**
    *   **Option A (Zip):** Click the green "Code" button on this GitHub repository page and select "Download ZIP". Unzip the downloaded file.
    *   **Option B (Git):** Clone the repository using Git:
        ```bash
        git clone https://github.com/samunderSingh12/ai-context-visualizer-chrome-extension.git
        ```
2.  **Open Chrome Extensions:** Open Google Chrome, type `chrome://extensions` in the address bar, and press Enter.
3.  **Enable Developer Mode:** Find the "Developer mode" toggle switch (usually in the top-right) and turn it **ON**.
4.  **Load Unpacked:** Click the "Load unpacked" button.
5.  **Select Folder:** Navigate to and select the folder containing the extension files (the `AI_Context_Extension` folder you unzipped or cloned - the one with `manifest.json` inside). Click "Select Folder".
6.  The extension should now appear in your list and be active!

## Usage

1.  **Pin the Icon:** Click the puzzle piece icon (🧩) in your Chrome toolbar, find "AI Context Visualizer", and click the pin icon (📌) next to it.
2.  **Configure Total Context:** Click the extension's icon in your toolbar. A popup will appear. Enter the **Total Context Token** size you believe the AI model is using (e.g., 4096, 8192, 16384) and click **Save**.
3.  **Visit Target Site:** Navigate to the AI chat website (e.g., Janitor AI) that you have configured in the `manifest.json` `host_permissions`.
4.  **Refresh the Page:** **Important:** After changing the context size or loading the extension for the first time on a site, **refresh the page** (Ctrl+R / Cmd+R).
5.  **Observe:** The visualizer should appear (usually bottom-right) showing the estimated context usage. It will update automatically as you chat.
6.  **(Debug):** If needed, you can open the developer console (F12 -> Console) on the AI chat page and type `refreshContextEstimate()` and press Enter to manually trigger a recalculation.

## ⚠️ IMPORTANT: Updating Selectors ⚠️

This extension **will stop working** when the target website (e.g., Janitor AI) updates its HTML structure. When the visualizer shows "0" or errors appear related to not finding elements, you need to update the CSS selectors:

1.  **Inspect Element:** On the AI chat page, right-click the chat messages (or the container area around them) and choose "Inspect".
2.  **Find New Selectors:** Examine the HTML to find the best, most stable-looking CSS selectors for:
    *   The main container holding all messages (`MESSAGE_CONTAINER_SELECTOR` in `content.js`).
    *   The individual elements containing the message text (`CHAT_MESSAGES_SELECTOR` in `content.js`).
    *   *(Optional)* The element with character info (`CHARACTER_INFO_SELECTOR` in `content.js`).
    *   *Avoid relying solely on classes like `css-xxxxx` if possible*, look for `data-testid`, `id`, `role`, or more stable-looking class names.
3.  **Edit `content.js`:** Open the `content.js` file in the extension's folder and update the selector constants near the top with the new ones you found.
4.  **Reload Extension:** Go back to `chrome://extensions` and click the reload icon (🔄) on the AI Context Visualizer card.
5.  **Refresh Target Site:** Hard refresh the AI chat page (Ctrl+F5 / Cmd+Shift+R).

## Limitations

*   **Accuracy:** The token count is a **rough estimate** based on character count, not precise tokenization.
*   **Hidden Context:** The extension cannot see hidden prompts, persona info, world info, or summaries that might be part of the actual context sent to the AI.
*   **Total Size:** The "Total Tokens" is based on the user's setting in the popup, which might not match the actual server-side limit.
*   **Selector Fragility:** Relies on CSS selectors that are prone to breaking when websites update.

## License

*(Optional: Choose a license if you want, e.g., MIT)*
This project is licensed under the MIT License - see the LICENSE.md file for details (if you add one).
