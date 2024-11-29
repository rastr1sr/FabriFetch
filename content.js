function extractThreadsMedia(container) {
    const media = [];

    const postImages = container.querySelectorAll('img[alt]:not([alt=""])');
    postImages.forEach((img, index) => {
        media.push({
            type: 'image',
            src: img.src,
            alt: img.alt || `image-${index}`,
            element: img
        });
    });

    const postVideos = container.querySelectorAll('video');
    postVideos.forEach((video, index) => {
        const src = video.src || video.querySelector('source')
            ?.src;
        if (src) {
            media.push({
                type: 'video',
                src: src,
                alt: `video-${index}`,
                element: video
            });
        }
    });

    return media;
}

function createMediaSelectionUI(media) {
    const overlay = document.createElement('div');
    overlay.classList.add('threads-image-downloader-overlay');

    const container = document.createElement('div');
    container.classList.add('media-selection-container');

    const exitButton = document.createElement('button');
    exitButton.textContent = '✕';
    exitButton.classList.add('exit-button');
    exitButton.addEventListener('click', () => {
        overlay.remove();
    });
    container.appendChild(exitButton);

    const title = document.createElement('h2');
    title.textContent = 'Select Media to Download';
    container.appendChild(title);

    const mediaGrid = document.createElement('div');
    mediaGrid.classList.add('media-grid');

    const selectAllWrapper = document.createElement('div');
    selectAllWrapper.classList.add('select-all-wrapper');

    const selectAllCheckbox = document.createElement('input');
    selectAllCheckbox.type = 'checkbox';
    selectAllCheckbox.id = 'select-all';

    const selectAllLabel = document.createElement('label');
    selectAllLabel.htmlFor = 'select-all';
    selectAllLabel.textContent = 'Select All';

    selectAllCheckbox.addEventListener('change', (e) => {
        const checkboxes = document.querySelectorAll('input[name="selected-media"]');
        checkboxes.forEach(cb => {
            cb.checked = e.target.checked;
        });
    });

    selectAllWrapper.appendChild(selectAllCheckbox);
    selectAllWrapper.appendChild(selectAllLabel);
    container.appendChild(selectAllWrapper);

    media.forEach((item, index) => {
        const mediaWrapper = document.createElement('div');
        mediaWrapper.classList.add('media-wrapper');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `media-${index}`;
        checkbox.name = 'selected-media';
        checkbox.value = item.src;

        const label = document.createElement('label');
        label.htmlFor = `media-${index}`;

        if (item.type === 'image') {
            const image = document.createElement('img');
            image.src = item.src;
            image.alt = item.alt;
            label.appendChild(image);
        } else if (item.type === 'video') {
            const video = document.createElement('video');
            video.src = item.src;
            video.controls = true;
            label.appendChild(video);
        }

        mediaWrapper.appendChild(checkbox);
        mediaWrapper.appendChild(label);
        mediaGrid.appendChild(mediaWrapper);
    });

    container.appendChild(mediaGrid);

    const downloadButton = document.createElement('button');
    downloadButton.classList.add('download-button');

    const downloadIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    downloadIcon.setAttribute('viewBox', '0 0 24 24');
    downloadIcon.setAttribute('width', '20');
    downloadIcon.setAttribute('height', '20');
    downloadIcon.setAttribute('fill', 'currentColor');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M3 17v3c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-3M12 15l-5-5h3V4h4v6h3l-5 5z');
    downloadIcon.appendChild(path);
    downloadButton.appendChild(downloadIcon);

    downloadButton.addEventListener('click', () => {
        const selectedMedia = Array.from(
                document.querySelectorAll('input[name="selected-media"]:checked')
            )
            .map(checkbox => checkbox.value);

        chrome.runtime.sendMessage({
            action: 'download',
            urls: selectedMedia
        });

        overlay.remove();
    });

    container.appendChild(downloadButton);

    overlay.appendChild(container);
    document.body.appendChild(overlay);
}

function appendDownloadButtonToContextMenus() {
    const contextMenus = document.querySelectorAll('div[class="x78zum5"]');
    contextMenus.forEach((menu) => {
        if (!menu.querySelector('.download-button')) {
            const downloadButton = document.createElement('button');
            downloadButton.classList.add('download-button');

            const downloadIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            downloadIcon.setAttribute('viewBox', '0 0 24 24');
            downloadIcon.setAttribute('width', '20');
            downloadIcon.setAttribute('height', '20');
            downloadIcon.setAttribute('fill', 'currentColor');
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', 'M3 17v3c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-3M12 15l-5-5h3V4h4v6h3l-5 5z');
            downloadIcon.appendChild(path);
            downloadButton.appendChild(downloadIcon);

            downloadButton.addEventListener('click', (event) => {
                event.stopPropagation();

                const postContainer = downloadButton.parentElement?.parentElement?.parentElement.querySelector('div[class="x1xmf6yo"]');
                if (postContainer) {
                    const media = extractThreadsMedia(postContainer);
                    if (media.length > 0) {
                        createMediaSelectionUI(media);
                    } else {
                        alert('No media found in this post!');
                    }
                } else {
                    alert('Unable to find media for this post.');
                }
            });


            menu.appendChild(downloadButton);
        }
    });
}

window.addEventListener('load', appendDownloadButtonToContextMenus);

const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
            appendDownloadButtonToContextMenus();
        }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});