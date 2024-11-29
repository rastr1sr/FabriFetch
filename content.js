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
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.padding = '20px';
    overlay.style.boxSizing = 'border-box';
    overlay.style.overflowY = 'auto';
    const modal = document.createElement('div');
    modal.style.backgroundColor = '#fff';
    modal.style.borderRadius = '10px';
    modal.style.width = '90%';
    modal.style.maxWidth = '800px';
    modal.style.maxHeight = '80%';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';
    modal.style.padding = '20px';
    modal.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '15px';
    const title = document.createElement('h2');
    title.textContent = 'Select Media to Download';
    title.style.margin = '0';
    const controls = document.createElement('div');
    controls.style.display = 'flex';
    controls.style.alignItems = 'center';
    const selectAllCheckbox = document.createElement('input');
    selectAllCheckbox.type = 'checkbox';
    selectAllCheckbox.style.marginRight = '10px';
    selectAllCheckbox.addEventListener('change', () => {
        const checkboxes = mediaGrid.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach((checkbox) => {
            checkbox.checked = selectAllCheckbox.checked;
            const wrapper = checkbox.parentElement;
            wrapper.style.borderColor = checkbox.checked ? '#007bff' : 'transparent';
        });
    });
    const selectAllLabel = document.createElement('label');
    selectAllLabel.textContent = 'Select All';
    selectAllLabel.style.cursor = 'pointer';
    controls.appendChild(selectAllCheckbox);
    controls.appendChild(selectAllLabel);
    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    closeButton.style.background = 'none';
    closeButton.style.color = 'black';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '24px';
    closeButton.style.cursor = 'pointer';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
    });
    header.appendChild(title);
    header.appendChild(controls);
    header.appendChild(closeButton);
    const mediaGrid = document.createElement('div');
    mediaGrid.style.display = 'grid';
    mediaGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))';
    mediaGrid.style.gap = '15px';
    mediaGrid.style.overflowY = 'auto';
    mediaGrid.style.maxHeight = '500px';
    const downloadButton = document.createElement('button');
    downloadButton.textContent = 'Download Selected';
    downloadButton.style.marginTop = '15px';
    downloadButton.style.padding = '10px 20px';
    downloadButton.style.backgroundColor = '#007bff';
    downloadButton.style.color = 'white';
    downloadButton.style.border = 'none';
    downloadButton.style.borderRadius = '5px';
    downloadButton.style.cursor = 'pointer';
    media.forEach((item, index) => {
        const mediaWrapper = document.createElement('div');
        mediaWrapper.style.position = 'relative';
        mediaWrapper.style.border = '2px solid transparent';
        mediaWrapper.style.borderRadius = '5px';
        mediaWrapper.style.transition = 'border-color 0.3s';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.style.position = 'absolute';
        checkbox.style.top = '10px';
        checkbox.style.left = '10px';
        checkbox.style.zIndex = '1';
        let preview;
        if (item.type === 'image') {
            preview = document.createElement('img');
            preview.src = item.src;
        } else if (item.type === 'video') {
            preview = document.createElement('video');
            preview.src = item.src;
            preview.style.width = '100%';
            preview.style.height = '200px';
            preview.style.objectFit = 'cover';
            preview.preload = 'metadata';
        }
        preview.style.width = '100%';
        preview.style.height = '200px';
        preview.style.objectFit = 'cover';
        preview.style.borderRadius = '5px';
        preview.style.cursor = 'pointer';
        mediaWrapper.addEventListener('click', () => {
            checkbox.checked = !checkbox.checked;
            mediaWrapper.style.borderColor = checkbox.checked ? '#007bff' : 'transparent';
        });
        checkbox.addEventListener('change', () => {
            mediaWrapper.style.borderColor = checkbox.checked ? '#007bff' : 'transparent';
        });
        mediaWrapper.appendChild(checkbox);
        mediaWrapper.appendChild(preview);
        mediaGrid.appendChild(mediaWrapper);
    });
    downloadButton.addEventListener('click', () => {
        const selectedMediaItems = Array.from(mediaGrid.querySelectorAll('input[type="checkbox"]:checked'));
        if (selectedMediaItems.length === 0) {
            alert('Please select at least one media item to download.');
            return;
        }
        const urls = selectedMediaItems.map((checkbox) => {
            const mediaItem = media[Array.from(mediaGrid.children)
                .indexOf(checkbox.parentElement)];
            return mediaItem.src;
        });
        chrome.runtime.sendMessage({
            action: 'download',
            urls
        });
        document.body.removeChild(overlay);
    });
    modal.appendChild(header);
    modal.appendChild(mediaGrid);
    modal.appendChild(downloadButton);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            document.body.removeChild(overlay);
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
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