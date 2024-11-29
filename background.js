chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'download') {
        request.urls.forEach((url, index) => {
            const urlParts = url.split('.');
            const extension = urlParts[urlParts.length - 1].split('?')[0] || 'jpg';
            const filename = `threads_media_${index + 1}.${extension}`;
            chrome.downloads.download({
                url: url,
                filename: filename,
                saveAs: false
            });
        });
    }
});