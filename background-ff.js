browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'download') {
        request.urls.forEach((url, index) => {
            const cleanUrl = url.split('?')[0].split('#')[0];
            const urlParts = cleanUrl.split('.');
            const extension = urlParts[urlParts.length - 1].toLowerCase() || 'jpg';
            const filename = `threads_media_${index + 1}.${extension}`;

            browser.downloads.download({
                url: url,
                filename: filename,
                saveAs: false
            });
        });
    }
});
