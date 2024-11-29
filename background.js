chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'download') {
        request.urls.forEach((url, index) => {
            chrome.downloads.download({
                url: url,
                filename: `threads_media_${index + 1}`,
                saveAs: false
            });
        });
    }
});