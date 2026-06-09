/**
 * app.js – Hauptanwendung für den Newsletter Editor
 *
 * Steuert alle Interaktionen, Initialisierung und Verknüpfung der Module.
 */

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // DOM-Elemente
    const elements = {
        blockList: document.getElementById('block-list'),
        previewContent: document.getElementById('preview-content'),
        toggleViewMode: document.getElementById('toggle-view-mode'),
        burgerMenuBtn: document.getElementById('burger-menu-btn'),
        burgerMenu: document.getElementById('burger-menu'),
        btnNew: document.getElementById('btn-new'),
        btnSave: document.getElementById('btn-save'),
        btnDuplicate: document.getElementById('btn-duplicate'),
        btnExport: document.getElementById('btn-export'),
        paletteItems: document.querySelectorAll('.palette-item'),
       btnToggleDrafts: document.getElementById('btn-toggle-drafts'),
        draftsSection: document.getElementById('drafts-section'),
        draftsList: document.getElementById('drafts-list'),
        blockEditorModal: document.getElementById('block-editor-modal'),
        modalTitle: document.getElementById('modal-title'),
        modalFormFields: document.getElementById('modal-form-fields'),
        modalForm: document.getElementById('modal-form'),
        modalCloseBtn: document.getElementById('modal-close-btn'),
        modalCancelBtn: document.getElementById('modal-cancel-btn'),
        modalSaveBtn: document.getElementById('modal-save-btn')
    };

    // Track which block is being edited
    let editingBlockId = null;

    // Anwendungsstatus
    let blocks = [];
    let currentDraftName = '';
    let isMobileView = false;

    // ========== Initialisierung ==========

    function init() {
        // Sortable.js für Block-Liste initialisieren
        initSortable();

        // Event Listeners hinzufügen
        setupEventListeners();

        // Ersten Entwurf laden oder leeren Start
        loadLatestDraft();

        // Initiale Vorschau rendern
        updatePreview();
    }

    function setupEventListeners() {
        // Block-Palette Klicks
        elements.paletteItems.forEach(button => {
            button.addEventListener('click', function() {
                const blockType = this.dataset.blockType;
                addBlock(blockType);
            });
        });

        // Action Buttons
        elements.btnNew.addEventListener('click', () => createNewDraft());
        elements.btnSave.addEventListener('click', () => saveCurrentDraft());
        elements.btnDuplicate.addEventListener('click', () => duplicateCurrentDraft());
        elements.btnExport.addEventListener('click', () => exportHTML());

        // Drafts Menu Toggle
        elements.btnToggleDrafts.addEventListener('click', (e) => {
            e.stopPropagation();
            renderDraftsList();
            elements.draftsSection.classList.toggle('hidden');
        });

        // View Mode Toggle
        elements.toggleViewMode.addEventListener('click', toggleViewMode);

       // Burger Menu Toggle
        elements.burgerMenuBtn.addEventListener('click', toggleBurgerMenu);
        document.addEventListener('click', (e) => {
            if (!elements.burgerMenu.contains(e.target) && !elements.burgerMenuBtn.contains(e.target)) {
                hideBurgerMenu();
            }
            // Close drafts section when clicking outside burger menu
            if (!elements.draftsSection.contains(e.target) && !elements.btnToggleDrafts.contains(e.target)) {
                elements.draftsSection.classList.add('hidden');
            }
        });

        // Prevent clicks inside drafts list from closing the menu
        elements.draftsList.addEventListener('click', (e) => e.stopPropagation());

        // Modal: close & cancel
        elements.modalCloseBtn.addEventListener('click', closeModal);
        elements.modalCancelBtn.addEventListener('click', closeModal);

        // Modal: save on form submit
        elements.modalForm.addEventListener('submit', handleModalSave);

        // Close modal on backdrop click
        elements.blockEditorModal.addEventListener('click', (e) => {
            if (e.target === elements.blockEditorModal) closeModal();
        });

        // Auto-teaser fetch button (added dynamically for artikel blocks)
        document.addEventListener('click', handleTeaserFetch);
    }

    function toggleBurgerMenu() {
        elements.burgerMenu.classList.toggle('hidden');
    }

    function hideBurgerMenu() {
        elements.burgerMenu.classList.add('hidden');
    }

    function initSortable() {
        new Sortable(elements.blockList, {
            animation: 150,
            handle: '.block-header',
            ghostClass: 'sortable-ghost',
            dragClass: 'sortable-drag',
            onEnd: function(event) {
                // Blocks neu ordnen
                reorderBlocks(event.oldIndex, event.newIndex);
            }
        });
    }

    // ========== Block Operationen ==========

    function addBlock(type) {
        const block = Blocks.createBlock(type);
        blocks.push(block);

        renderBlockList();
        updatePreview();

        console.log('Block hinzugefügt:', type);
    }

    function deleteBlock(id) {
        const index = blocks.findIndex(b => b.id === id);
        if (index > -1) {
            blocks.splice(index, 1);
            renderBlockList();
            updatePreview();
            console.log('Block gelöscht:', id);
        }
    }

    function reorderBlocks(fromIndex, toIndex) {
        const [removed] = blocks.splice(fromIndex, 1);
        blocks.splice(toIndex, 0, removed);
        renderBlockList();
        // Preview wird durch renderBlockList nicht aktualisiert
        updatePreview();
        console.log('Block verschoben:', fromIndex, '->', toIndex);
    }

    function editBlock(id) {
        const block = blocks.find(b => b.id === id);
        if (!block) return;

        editingBlockId = id;
        openModal(block);
    }

    // ========== UI Rendering ==========

    function renderBlockList() {
        elements.blockList.innerHTML = '';

        blocks.forEach((block, index) => {
            const el = Blocks.createBlockElement(block);

            // Event Listeners für Bearbeiten/Löschen
            el.querySelector('.btn-edit').addEventListener('click', () => editBlock(block.id));
            el.querySelector('.btn-delete').addEventListener('click', () => {
                if (confirm('Möchten Sie diesen Block wirklich löschen?')) {
                    deleteBlock(block.id);
                }
            });

            elements.blockList.appendChild(el);
        });
    }

    function updatePreview() {
        const html = Preview.createPreviewHTML(blocks);
        elements.previewContent.innerHTML = html;
    }

    function toggleViewMode() {
        isMobileView = !isMobileView;
        const container = document.getElementById('preview-container');

        if (isMobileView) {
            container.classList.add('preview-mobile');
            container.classList.remove('preview-desktop');
            elements.toggleViewMode.textContent = '💻 Desktop';
        } else {
            container.classList.add('preview-desktop');
            container.classList.remove('preview-mobile');
            elements.toggleViewMode.textContent = '📱 Mobile';
        }
    }

    // ========== Draft Management ==========

    function createNewDraft() {
        if (blocks.length > 0 && !confirm('Der aktuelle Entwurf wird verworfen. Fortfahren?')) {
            return;
        }

        blocks = [];
        currentDraftName = '';
        renderBlockList();
        updatePreview();

        // Leere Vorschau anzeigen
        elements.previewContent.innerHTML = `
            <div class="text-center text-gray-400 py-20">
                <p>Neuer Newsletter - füge Blöcke hinzu!</p>
            </div>
        `;
    }

    function saveCurrentDraft() {
        if (!currentDraftName) {
            currentDraftName = prompt('Bitte geben Sie einen Namen für den Entwurf ein:', 'Mein Newsletter ' + new Date().toLocaleDateString());
            if (!currentDraftName) return;
        }

        const result = Storage.saveDraft(currentDraftName, blocks);

        if (result.success) {
            alert(`Entwurf "${currentDraftName}" gespeichert!`);
        } else {
            alert('Fehler beim Speichern: ' + result.error);
        }
    }

    function duplicateCurrentDraft() {
        if (!currentDraftName || blocks.length === 0) {
            alert('Kein zu duplizierender Entwurf vorhanden.');
            return;
        }

        const newName = prompt('Neuer Name für die Kopie:', currentDraftName + ' (Kopie)');
        if (!newName) return;

        const result = Storage.duplicateDraft(currentDraftName, newName);

        if (result.success) {
            alert(`Entwurf "${newName}" erfolgreich dupliziert!`);
            loadLatestDraft();
        } else {
            alert('Fehler beim Duplizieren: ' + result.error);
        }
    }

    function exportHTML() {
        const html = Preview.createPreviewHTML(blocks);

        // Download erstellen
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = `newsletter-dav-${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('HTML exportiert');
    }

    function loadLatestDraft() {
        const drafts = Storage.getSavedDrafts();

        if (drafts.length === 0) {
            // Keine Entwürfe vorhanden
            return;
        }

        // Neuesten Entwurf laden
        const latestName = drafts[0];
        const result = Storage.loadDraft(latestName);

        if (result.success) {
            currentDraftName = result.name;
            blocks = result.data;
            renderBlockList();
            updatePreview();
        }
    }

    // ========== Drafts Menu ==========

    function renderDraftsList() {
        const drafts = Storage.getSavedDrafts();
        elements.draftsList.innerHTML = '';

        if (drafts.length === 0) {
            elements.draftsList.innerHTML = '<p class="text-xs text-gray-400 italic px-2 py-1">Keine gespeicherten Entwürfe</p>';
            return;
        }

        drafts.forEach(name => {
            const row = document.createElement('div');
            row.className = 'flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-100 group';

            const isCurrent = name === currentDraftName;
            if (isCurrent) {
                row.classList.add('bg-blue-50');
            }

            row.innerHTML = `
                <button class="draft-load-btn text-xs text-left flex-1 truncate font-medium ${isCurrent ? 'text-blue-700' : 'text-gray-700'}" data-name="${escapeAttr(name)}">
                    ${isCurrent ? '● ' : ''}${truncateText(name, 25)}
                </button>
                <button class="draft-delete-btn text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition px-1" data-name="${escapeAttr(name)}" title="Löschen">✕</button>
            `;
            elements.draftsList.appendChild(row);
        });

        // Event Listeners
        elements.draftsList.querySelectorAll('.draft-load-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                loadSpecificDraft(e.target.dataset.name);
            });
        });

        elements.draftsList.querySelectorAll('.draft-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteDraftFromMenu(e.target.dataset.name);
            });
        });
    }

    function loadSpecificDraft(name) {
        const result = Storage.loadDraft(name);
        if (result.success) {
            currentDraftName = result.name;
            blocks = result.data || [];
            renderBlockList();
            updatePreview();
            renderDraftsList();
            console.log('Entwurf geladen:', name);
        } else {
            alert('Fehler beim Laden: ' + result.error);
        }
    }

    function deleteDraftFromMenu(name) {
        if (!confirm(`Entwurf "${name}" wirklich löschen?`)) return;

        const result = Storage.deleteDraft(name);
        if (result.success) {
            if (currentDraftName === name) {
                currentDraftName = '';
                blocks = [];
                renderBlockList();
                updatePreview();
            }
            renderDraftsList();
            console.log('Entwurf gelöscht:', name);
        } else {
            alert('Fehler beim Löschen: ' + result.error);
        }
    }

    function escapeAttr(str) {
        return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function truncateText(str, maxLen) {
        if (!str) return '';
        return str.length <= maxLen ? str : str.substring(0, maxLen) + '…';
    }

    // ========== Modal Block Editor ==========

    function openModal(block) {
        const blockType = Blocks.BLOCK_TYPES[block.type];
        elements.modalTitle.textContent = (blockType ? blockType.label : 'Block') + ' bearbeiten';
        renderFormFields(block);
        elements.blockEditorModal.classList.remove('hidden');
    }

    function closeModal() {
        elements.blockEditorModal.classList.add('hidden');
        editingBlockId = null;
    }

    function renderFormFields(block) {
        const data = block.data || {};
        let html = '';

        switch (block.type) {
            case 'freitext':
                html += createCheckboxField('showTitle', 'Titel anzeigen', data.showTitle || false);
                html += `<div id="field-title-wrap">${createTextField('title', 'Titel', data.title || '', 'text')}</div>`;
                html += createTextAreaField('content', 'Inhalt', data.content || '');
                break;

            case 'artikel':
                html += `
                    <div class="block-form" id="artikel-url-field">
                        <label>URL</label>
                        <div class="flex gap-2">
                            <input type="url" name="url" value="${escapeAttr(data.url || '')}" class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://beispiel.de/artikel">
                            <button type="button" id="fetch-teaser-btn" class="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition whitespace-nowrap" title="Teaser automatisch laden">🔗 Teaser laden</button>
                        </div>
                    </div>`;
                html += createTextField('title', 'Artikel-Titel', data.title || '', 'text');
                html += createNumberField('teaserLength', 'Teaser-Länge (Zeichen)', data.teaserLength || 160);
                html += `<p class="text-xs text-gray-400">Klicke auf "Teaser laden" um den Text automatisch aus der URL zu extrahieren.</p>`;
                html += createTextAreaField('content', 'Teaser-Text (wird automatisch gefüllt)', data.content || '');
                break;

            case 'termin':
                html += '<div id="events-container">';
                (data.events || []).forEach((ev, i) => {
                    html += renderEventRow(ev, i);
                });
                if (!(data.events || []).length) {
                    html += renderEventRow({ date: '', title: '', link: '' }, 0);
                }
                html += '</div>';
                html += '<button type="button" id="add-event-btn" class="text-sm text-blue-600 hover:text-blue-700 font-medium">+ Termin hinzufügen</button>';
                break;

            case 'divider':
                html += createSelectField('style', 'Stil', data.style || 'solid', ['solid', 'dashed', 'dotted']);
                html += createTextField('color', 'Farbe', data.color || '#E5E7EB', 'color');
                break;

            case 'social':
                html += '<div id="social-links-container">';
                (data.links || []).forEach((link, i) => {
                    html += renderSocialRow(link, i);
                });
                if (!(data.links || []).length) {
                    html += renderSocialRow({ name: '', url: '' }, 0);
                }
                html += '</div>';
                html += '<button type="button" id="add-social-btn" class="text-sm text-blue-600 hover:text-blue-700 font-medium">+ Link hinzufügen</button>';
                break;

            case 'image':
                html += createTextField('url', 'Bild-URL', data.url || '', 'url');
                html += createTextField('alt', 'Alt-Text', data.alt || '', 'text');
                html += createSelectField('align', 'Ausrichtung', data.align || 'center', ['left', 'center', 'right']);
                html += createNumberField('width', 'Breite (px)', data.width || 600);
                html += createTextField('caption', 'Bildunterschrift', data.caption || '', 'text');
                break;

            default:
                html = '<p class="text-sm text-gray-400">Keine Bearbeitungsmöglichkeiten für diesen Block-Typ.</p>';
        }

        elements.modalFormFields.innerHTML = html;
        attachFormFieldListeners(block);
    }

    function renderEventRow(ev, index) {
        return `
            <div class="flex gap-2 items-start event-row" data-index="${index}">
                <input type="text" name="event_date_${index}" value="${escapeAttr(ev.date || '')}" placeholder="Datum (z.B. 15.07.)" class="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <input type="text" name="event_title_${index}" value="${escapeAttr(ev.title || '')}" placeholder="Titel" class="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <input type="url" name="event_link_${index}" value="${escapeAttr(ev.link || '')}" placeholder="Link (optional)" class="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <button type="button" class="remove-event-btn text-red-400 hover:text-red-600 p-1" data-index="${index}">✕</button>
            </div>`;
    }

    function renderSocialRow(link, index) {
        return `
            <div class="flex gap-2 items-start social-row" data-index="${index}">
                <input type="text" name="social_name_${index}" value="${escapeAttr(link.name || '')}" placeholder="Name (z.B. LinkedIn)" class="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <input type="url" name="social_url_${index}" value="${escapeAttr(link.url || '')}" placeholder="URL" class="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <button type="button" class="remove-social-btn text-red-400 hover:text-red-600 p-1" data-index="${index}">✕</button>
            </div>`;
    }

    function attachFormFieldListeners(block) {
        // Toggle title visibility for freitext
        const showTitleCheckbox = elements.modalFormFields.querySelector('[name="showTitle"]');
        if (showTitleCheckbox) {
            const titleWrap = document.getElementById('field-title-wrap');
            const toggleTitleVisibility = () => {
                titleWrap.style.display = showTitleCheckbox.checked ? 'block' : 'none';
            };
            showTitleCheckbox.addEventListener('change', toggleTitleVisibility);
            toggleTitleVisibility();
        }

        // Add event row button
        const addEventBtn = document.getElementById('add-event-btn');
        if (addEventBtn) {
            addEventBtn.addEventListener('click', () => {
                const container = document.getElementById('events-container');
                const index = container.children.length;
                const div = document.createElement('div');
                div.innerHTML = renderEventRow({ date: '', title: '', link: '' }, index);
                container.appendChild(div.firstElementChild);
                attachEventRemoveListeners();
            });
        }
        attachEventRemoveListeners();

        // Add social row button
        const addSocialBtn = document.getElementById('add-social-btn');
        if (addSocialBtn) {
            addSocialBtn.addEventListener('click', () => {
                const container = document.getElementById('social-links-container');
                const index = container.children.length;
                const div = document.createElement('div');
                div.innerHTML = renderSocialRow({ name: '', url: '' }, index);
                container.appendChild(div.firstElementChild);
                attachSocialRemoveListeners();
            });
        }
        attachSocialRemoveListeners();

        // Teaser fetch button for artikel blocks
        const fetchTeaserBtn = document.getElementById('fetch-teaser-btn');
        if (fetchTeaserBtn) {
            fetchTeaserBtn.addEventListener('click', handleFetchTeaser);
        }
    }

    function attachEventRemoveListeners() {
        document.querySelectorAll('.remove-event-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const row = btn.closest('.event-row');
                if (row) row.remove();
            });
        });
    }

    function attachSocialRemoveListeners() {
        document.querySelectorAll('.remove-social-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const row = btn.closest('.social-row');
                if (row) row.remove();
            });
        });
    }

    function handleFetchTeaser(e) {
        e.preventDefault();
        const urlInput = elements.modalFormFields.querySelector('[name="url"]');
        const contentArea = elements.modalFormFields.querySelector('[name="content"]');
        const fetchBtn = document.getElementById('fetch-teaser-btn');
        const url = urlInput ? urlInput.value.trim() : '';

        if (!url) {
            alert('Bitte zuerst eine URL eingeben.');
            return;
        }

        fetchBtn.textContent = '⏳ Laden...';
        fetchBtn.disabled = true;

        // Try direct fetch first, fallback to CORS proxy
        const tryFetchWithProxy = (proxyUrl) => {
            fetch(proxyUrl + encodeURIComponent(url))
                .then(res => res.text())
                .then(html => extractTeaserFromHTML(html))
                .then(teaserText => {
                    if (contentArea) contentArea.value = teaserText;
                    fetchBtn.textContent = '✅ Geladen';
                })
                .catch(() => {
                    alert('Fehler beim Laden des Teasers. Die Seite könnte CORS-blockieren oder nicht erreichbar sein.');
                    fetchBtn.textContent = '🔗 Teaser laden';
                })
                .finally(() => { fetchBtn.disabled = false; });
        };

        fetch(url)
            .then(res => res.text())
            .then(html => extractTeaserFromHTML(html))
            .then(teaserText => {
                if (contentArea) contentArea.value = teaserText;
                fetchBtn.textContent = '✅ Geladen';
                fetchBtn.disabled = false;
            })
            .catch(() => tryFetchWithProxy('https://api.allorigins.win/raw?url='))
            .finally(() => { if (fetchBtn.disabled === false) {/* already handled */ } });
    }

    function extractTeaserFromHTML(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Try meta description first
        const metaDesc = doc.querySelector('meta[name="description"]');
        if (metaDesc && metaDesc.content) return metaDesc.content.substring(0, 300);

        // Try <p> tags from main content
        const selectors = ['article p', '.post-content p', '.entry-content p', 'main p', 'body > p'];
        let paragraphs = [];
        for (const sel of selectors) {
            paragraphs = Array.from(doc.querySelectorAll(sel));
            if (paragraphs.length > 0) break;
        }
        if (paragraphs.length === 0) {
            paragraphs = Array.from(doc.querySelectorAll('p'));
        }

        const text = paragraphs.slice(0, 3).map(p => p.textContent.replace(/\s+/g, ' ').trim()).join(' ').replace(/\s+/g, ' ');
        return text.substring(0, 300) || 'Inhalt konnte nicht extrahiert werden.';
    }

    function handleModalSave(e) {
        e.preventDefault();
        if (!editingBlockId) return;

        const block = blocks.find(b => b.id === editingBlockId);
        if (!block) return;

        const newData = collectFormData(block.type);
        if (newData) {
            block.data = newData;
            renderBlockList();
            updatePreview();
            closeModal();
        }
    }

    function collectFormData(type) {
        switch (type) {
            case 'freitext': {
                return {
                    content: getFormValue('content') || '',
                    showTitle: document.querySelector('[name="showTitle"]')?.checked || false,
                    title: getFormValue('title') || ''
                };
            }
            case 'artikel': {
                return {
                    url: getFormValue('url') || '',
                    title: getFormValue('title') || '',
                    teaserLength: parseInt(getFormValue('teaserLength')) || 160,
                    showImage: true,
                    content: getFormValue('content') || ''
                };
            }
            case 'termin': {
                const rows = document.querySelectorAll('.event-row');
                const events = [];
                rows.forEach(row => {
                    const dateInput = row.querySelector('[name^="event_date_"]');
                    const titleInput = row.querySelector('[name^="event_title_"]');
                    const linkInput = row.querySelector('[name^="event_link_"]');
                    if (dateInput || titleInput) {
                        events.push({
                            date: dateInput ? dateInput.value.trim() : '',
                            title: titleInput ? titleInput.value.trim() : '',
                            link: linkInput ? linkInput.value.trim() : ''
                        });
                    }
                });
                return { events };
            }
            case 'divider': {
                return {
                    style: getFormValue('style') || 'solid',
                    color: getFormValue('color') || '#E5E7EB'
                };
            }
            case 'social': {
                const socialRows = document.querySelectorAll('.social-row');
                const links = [];
                socialRows.forEach(row => {
                    const nameInput = row.querySelector('[name^="social_name_"]');
                    const urlInput = row.querySelector('[name^="social_url_"]');
                    if (nameInput || urlInput) {
                        links.push({
                            name: nameInput ? nameInput.value.trim() : '',
                            url: urlInput ? urlInput.value.trim() : ''
                        });
                    }
                });
                return { links };
            }
            case 'image': {
                return {
                    url: getFormValue('url') || '',
                    alt: getFormValue('alt') || '',
                    align: getFormValue('align') || 'center',
                    width: parseInt(getFormValue('width')) || 600,
                    caption: getFormValue('caption') || ''
                };
            }
            default:
                return null;
        }
    }

    function handleTeaserFetch(e) {
        if (e.target.id === 'fetch-teaser-btn' || e.target.closest('#fetch-teaser-btn')) {
            handleFetchTeaser(e);
        }
    }

    // ========== Helper Functions for Modal Forms ==========

    function createTextField(name, label, value, type) {
        return `
            <div class="block-form">
                <label>${label}</label>
                <input type="${type || 'text'}" name="${name}" value="${escapeAttr(value || '')}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>`;
    }

    function createTextAreaField(name, label, value) {
        return `
            <div class="block-form">
                <label>${label}</label>
                <textarea name="${name}" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y">${escapeAttr(value || '')}</textarea>
            </div>`;
    }

    function createNumberField(name, label, value) {
        return `
            <div class="block-form">
                <label>${label}</label>
                <input type="number" name="${name}" value="${value || 0}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>`;
    }

    function createCheckboxField(name, label, checked) {
        return `
            <label class="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                <input type="checkbox" name="${name}" ${checked ? 'checked' : ''} class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                ${label}
            </label>`;
    }

    function createSelectField(name, label, value, options) {
        const optionHtml = options.map(opt => `<option value="${opt}" ${opt === value ? 'selected' : ''}>${opt}</option>`).join('');
        return `
            <div class="block-form">
                <label>${label}</label>
                <select name="${name}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">${optionHtml}</select>
            </div>`;
    }

    function getFormValue(name) {
        const el = elements.modalFormFields.querySelector(`[name="${name}"]`);
        return el ? el.value : '';
    }

    // Helper already defined above: escapeAttr, truncateText

    // ========== Start ==========
    init();
});
