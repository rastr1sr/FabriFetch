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
        const src = video.src || video.querySelector('source')?.src;
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
    overlay.classList.add('media-selection-overlay');
    
    const modal = document.createElement('div');
    modal.classList.add('media-selection-modal');
    
    const header = document.createElement('div');
    header.classList.add('media-selection-header');
    
    const title = document.createElement('h2');
    title.textContent = 'Select Media to Download';
    
    const controls = document.createElement('div');
    controls.classList.add('media-selection-controls');
    
    const selectAllCheckbox = document.createElement('input');
    selectAllCheckbox.type = 'checkbox';
    selectAllCheckbox.id = 'select-all-media';
    
    const selectAllLabel = document.createElement('label');
    selectAllLabel.setAttribute('for', 'select-all-media');
    selectAllLabel.textContent = 'Select All';
    
    const closeButton = document.createElement('button');
    closeButton.classList.add('media-selection-close');
    closeButton.textContent = 'X';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
    });
    
    const mediaGrid = document.createElement('div');
    mediaGrid.classList.add('media-selection-grid');
    
    const downloadButton = document.createElement('button');
    downloadButton.classList.add('media-selection-download');
    downloadButton.textContent = 'Download Selected';
    
    selectAllCheckbox.addEventListener('change', () => {
        const checkboxes = mediaGrid.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach((checkbox) => {
            checkbox.checked = selectAllCheckbox.checked;
            const wrapper = checkbox.closest('.media-wrapper');
            wrapper.classList.toggle('selected', checkbox.checked);
        });
    });
    
    media.forEach((item, index) => {
        const mediaWrapper = document.createElement('div');
        mediaWrapper.classList.add('media-wrapper');
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        
        let preview;
        if (item.type === 'image') {
            preview = document.createElement('img');
            preview.src = item.src;
        } else if (item.type === 'video') {
            preview = document.createElement('video');
            preview.src = item.src;
            preview.preload = 'metadata';
        }
        preview.classList.add('media-preview');
        
        mediaWrapper.addEventListener('click', () => {
            checkbox.checked = !checkbox.checked;
            mediaWrapper.classList.toggle('selected', checkbox.checked);
        });
        
        checkbox.addEventListener('change', () => {
            mediaWrapper.classList.toggle('selected', checkbox.checked);
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
    
    controls.appendChild(selectAllCheckbox);
    controls.appendChild(selectAllLabel);
    
    header.appendChild(title);
    header.appendChild(controls);
    header.appendChild(closeButton);
    
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
    const contextMenus = document.querySelectorAll('div.x4vbgl9.xp7jhwk.x1k70j0n');
    contextMenus.forEach((menu) => {
        if (!menu.querySelector('.download-icon')) {
            const downloadButton = document.createElement('button');
            downloadButton.classList.add('download-icon');
            
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
                const postContainer = downloadButton.parentElement?.parentElement.querySelector('div[class="x1xmf6yo"]');
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
