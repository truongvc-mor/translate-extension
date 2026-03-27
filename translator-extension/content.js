// Bottom overlay disabled — subtitles are now shown inside the popup panel.
// Keeping this listener as a no-op so background.js messages don't cause errors.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "showSubtitle") {
        // Overlay disabled: content is displayed in the popup instead.
    }
});
