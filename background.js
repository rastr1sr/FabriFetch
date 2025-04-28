const runtime = typeof browser !== 'undefined' ? browser : chrome;

runtime.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'download' && Array.isArray(request.urls)) {
        request.urls.forEach((url, index) => {
            if (!url || typeof url !== 'string') {
                 console.warn(`FabriFetch [background]: Skipping invalid URL at index ${index}:`, url);
                 return;
            }

            let filename;
            let derivedExtension = 'jpg';

            try {
                const parsedUrl = new URL(url);
                const pathname = parsedUrl.pathname;

                const pathSegments = pathname.split('/');
                const lastSegment = pathSegments[pathSegments.length - 1];

                if (lastSegment && lastSegment.includes('.')) {
                    const nameParts = lastSegment.split('.');
                    const potentialExt = nameParts[nameParts.length - 1].toLowerCase();
                    if (potentialExt && potentialExt.length > 0 && potentialExt.length <= 5 && /^[a-z0-9]+$/.test(potentialExt)) {
                        derivedExtension = potentialExt;
                    } else {
                        console.warn(`FabriFetch [background]: Ignoring unusual potential extension "${potentialExt}" from path segment "${lastSegment}". Using default "${derivedExtension}".`);
                    }
                } else {
                     console.warn(`FabriFetch [background]: No extension found in path segment "${lastSegment}" for URL: ${url}. Using default "${derivedExtension}".`);
                }

                const timestamp = Date.now();
                filename = `threads_media_${timestamp}_${index + 1}.${derivedExtension}`;

            } catch (e) {
                console.error(`FabriFetch [background]: Failed to parse URL "${url}". Using basic fallback filename.`, e);
                const timestamp = Date.now();
                filename = `threads_media_fallback_${timestamp}_${index + 1}.${derivedExtension}`;
            }

            console.log(`FabriFetch [background]: Initiating download for ${url} as ${filename}`);

            runtime.downloads.download({
                url: url,
                filename: filename,
                saveAs: false
            }, (downloadId) => {
                if (runtime.runtime.lastError) {
                    console.error(`FabriFetch [background]: Download failed for ${url} (${filename}):`, runtime.runtime.lastError.message);
                } else if (downloadId !== undefined) {
                    // Optional: Log success confirmation
                    // console.log(`FabriFetch [background]: Download started for ${filename} with ID: ${downloadId}`);
                }
            });
        });
    }
    return false;
});
