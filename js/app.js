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
        btnNew: document.getElementById('btn-new'),
        btnSave: document.getElementById('btn-save'),
        btnDuplicate: document.getElementById('btn-duplicate'),
        btnMailto: document.getElementById('btn-mailto'),
        btnExport: document.getElementById('btn-export'),
        paletteItems: document.querySelectorAll('.palette-item'),
            mailtoModal: document.getElementById('mailto-modal'),
        btnMailtoClose: document.getElementById('mailto-close-btn'),
        btnMailtoCancel: document.getElementById('mailto-cancel-btn'),
        btnMailtoSend: document.getElementById('mailto-send-btn'),
        btnMailtoCopyHtml: document.getElementById('mailto-copy-html-btn'),
        inputMailtoCsv: document.getElementById('mailto-csv-input'),
       btnToggleDrafts: document.getElementById('btn-toggle-drafts'),
        draftsSection: document.getElementById('drafts-section'),
        draftsList: document.getElementById('drafts-list'),
        blockEditorModal: document.getElementById('block-editor-modal'),
        modalTitle: document.getElementById('modal-title'),
        modalFormFields: document.getElementById('modal-form-fields'),
        modalForm: document.getElementById('modal-form'),
        modalCloseBtn: document.getElementById('modal-close-btn'),
        modalCancelBtn: document.getElementById('modal-cancel-btn'),
        modalSaveBtn: document.getElementById('modal-save-btn'),
        btnToggleSettings: document.getElementById('btn-toggle-settings'),
        settingsSection: document.getElementById('settings-section'),
        settingsMonth: document.getElementById('settings-month'),
        settingsYear: document.getElementById('settings-year'),
        settingsRedaktion: document.getElementById('settings-redaktion')
    };

    // Toast notification system — replaces alert() for non-blocking feedback
    function showToast(message, type) {
        var colors = { success: 'bg-green-600', error: 'bg-red-600', info: 'bg-blue-600' };
        var t = document.createElement('div');
        t.className = 'fixed top-4 right-4 ' + (colors[type] || colors.info) + ' text-white px-4 py-2 rounded-md shadow-lg z-[999] transition-opacity duration-300';
        t.textContent = message;
        document.body.appendChild(t);
        setTimeout(function() { t.style.opacity = '0'; }, 2800);
        setTimeout(function() { t.remove(); }, 3100);
    }

    const APP_VERSION = 'v0.9.0-beta';
    const SPLIT_WIDTH_KEY = 'dav_newsletter_split_width';

    // Track which block is being edited
    let editingBlockId = null;

    var mailtoModalOpen = false;
    let blocks = [];
    let currentDraftName = '';
    let isMobileView = false;
    const DARK_MODE_KEY = 'dav_newsletter_dark_mode';
    var isDarkMode = localStorage.getItem(DARK_MODE_KEY) === 'true';

    /**
     * Dark Mode: Toggle + Persistenz in localStorage.
     * scoped auf <main> via data-theme — Preview bleibt unverändert.
     */
    function initDarkMode() {
        if (isDarkMode) {
            document.querySelector('main').setAttribute('data-theme', 'dark');
        }
        var icon = document.getElementById('dark-mode-icon');
        if (icon) icon.textContent = isDarkMode ? '☀️' : '🌙';

        document.getElementById('dark-mode-toggle').addEventListener('click', function() {
            isDarkMode = !isDarkMode;
            localStorage.setItem(DARK_MODE_KEY, String(isDarkMode));
            var mainEl = document.querySelector('main');
            if (isDarkMode) {
                mainEl.setAttribute('data-theme', 'dark');
            } else {
                mainEl.removeAttribute('data-theme');
            }
            icon.textContent = isDarkMode ? '☀️' : '🌙';
        });
    }

    // ========== Initialisierung ==========

    function init() {
        // Sortable.js für Block-Liste initialisieren
        initSortable();

        // Resizable split pane initialisieren
        initResizableSplit();

        // Preview responsiv anpassen bei Fenster-Resize
        window.addEventListener('resize', function() {
            var previewContainer = document.getElementById('preview-container');
            if (previewContainer && !previewContainer.classList.contains('preview-mobile')) {
                previewContainer.style.width = '';
            }
        });

        // Event Listeners hinzufügen
        setupEventListeners();

        // Ersten Entwurf laden oder leeren Start
        if (!loadLatestDraft()) {
            // Keine Entwürfe → Standard-Hero + Intro anlegen
            seedDefaultBlocks();
        }

        // Initiale Vorschau rendern
        updatePreview();

        // Versionsanzeige einblenden
        initVersionBadge();

        // Dark Mode Initialisierung
        initDarkMode();
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
        elements.btnMailto.addEventListener('click', () => openMailModal());
        elements.btnExport.addEventListener('click', () => exportHTML());

        // Drafts Popover Toggle
        elements.btnToggleDrafts.addEventListener('click', (e) => {
            e.stopPropagation();
            renderDraftsList();
            const isHidden = elements.draftsSection.classList.contains('hidden');
            hidePopovers();
            if (!isHidden) {
                // If it was visible, toggle keeps it hidden — now it's hidden via hidePopovers()
            } else {
                elements.draftsSection.classList.remove('hidden');
            }
        });

        // Settings Toggle (Date Popover)
        elements.btnToggleSettings.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = elements.settingsSection.classList.contains('hidden');
            hidePopovers();
            if (!isHidden) {
                // was visible → stays hidden
            } else {
                elements.settingsSection.classList.remove('hidden');
            }
        });

        // Prevent popover clicks from closing via document click handler
        elements.draftsSection.addEventListener('click', (e) => e.stopPropagation());
        elements.settingsSection.addEventListener('click', (e) => e.stopPropagation());

        // View Mode Toggle
        elements.toggleViewMode.addEventListener('click', toggleViewMode);

       // Bottom-Bar: Close popovers when clicking outside
        document.addEventListener('click', (e) => {
            const toolbar = document.getElementById('bottom-toolbar');
            if (!toolbar.contains(e.target)) {
                // Close drafts popover
                elements.draftsSection.classList.add('hidden');
                // Close settings popover
                elements.settingsSection.classList.add('hidden');
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

        // Date settings inputs – update preview on change
        elements.settingsMonth.addEventListener('input', applyDateSettings);
        elements.settingsYear.addEventListener('input', applyDateSettings);

        // Redaktion input – update preview on change
        elements.settingsRedaktion.addEventListener('input', function() {
            var name = elements.settingsRedaktion.value.trim();
            Preview.setRedaktion(name);
            updatePreview();
        });

    // Mailto Modal: close, cancel, backdrop click, send, CSV upload
        elements.btnMailtoClose.addEventListener('click', closeMailModal);
        elements.btnMailtoCancel.addEventListener('click', closeMailModal);
        elements.btnMailtoSend.addEventListener('click', handleMailSend);
        elements.btnMailtoCopyHtml.addEventListener('click', handleCopyHtml);
        elements.mailtoModal.addEventListener('click', (e) => {
            if (e.target === elements.mailtoModal) closeMailModal();
        });
        elements.inputMailtoCsv.addEventListener('change', handleCSVUpload);

        // Prevent clicks inside mailto modal from closing the menu
        elements.mailtoModal.addEventListener('click', (e) => e.stopPropagation());

        // Prevent clicks inside settings section from closing the menu
        elements.settingsSection.addEventListener('click', (e) => e.stopPropagation());
    }

    /**
     * Close all bottom-bar popovers
     */
    function hidePopovers() {
        elements.draftsSection.classList.add('hidden');
        elements.settingsSection.classList.add('hidden');
    }

    /**
     * Apply date settings from month/year inputs to preview
     */
    function applyDateSettings() {
        var month = elements.settingsMonth.value.trim();
        var year = elements.settingsYear.value.trim();
        var parts = [];
        if (month) parts.push(month);
        if (year) parts.push(year);

        // Restore the previous value if a field was cleared
        if (!parts.length && lastDateStr) {
            Preview.setDate(lastDateStr);
        } else {
            Preview.setDate(parts.join(' '));
        }

        lastDateStr = parts.length ? parts.join(' ') : '';
        updatePreview();
    }

    // Store current combined date string for restore on clear
    var lastDateStr = '';

    function initSortable() {
        new Sortable(elements.blockList, {
            animation: 200,
            handle: '.block-header',
            ghostClass: 'sortable-ghost',
            dragClass: 'sortable-drag',
            chosenClass: 'sortable-chosen',
            onEnd: function(event) {
                // Blocks neu ordnen (nur Preview aktualisieren, nicht full DOM rebuild)
                reorderBlocks(event.oldIndex, event.newIndex);
            }
        });
    }

    // ========== Block Operationen ==========

   function addBlock(type) {
        // Singleton check: hero und intro d黵fen nur einmal vorkommen
        if (type === 'hero' || type === 'intro') {
            const exists = blocks.some(b => b.type === type);
            if (exists) {
                showToast('Dieser Block existiert bereits — bearbeite ihn stattdessen.', 'info');
                return;
            }
        }

        const block = Blocks.createBlock(type);
        blocks.push(block);

        renderBlockList();
        updatePreview();
        updatePaletteButtons();

        console.log('Block hinzugef黦t:', type);
    }


    // ========== Resizable Split Pane ==========

    function initResizableSplit() {
        var resizer = document.getElementById('split-resizer');
        var blocksPanel = document.getElementById('blocks-panel');
        var previewPanel = document.getElementById('preview-panel');
        var mainEl = document.querySelector('main');
        var isResizing = false;

        if (!resizer || !blocksPanel) return;

        // Gespeicherte Split-Pane-Breite aus localStorage wiederherstellen
        try {
            var savedWidth = localStorage.getItem(SPLIT_WIDTH_KEY);
            if (savedWidth) {
                var parsed = parseInt(savedWidth, 10);
                var mainRect = mainEl.getBoundingClientRect();
                var sidebarWidth = mainEl.querySelector('aside').getBoundingClientRect().width;
                var availableWidth = mainRect.width - sidebarWidth - 6;
                if (!isNaN(parsed)) {
                    blocksPanel.style.width = Math.max(180, Math.min(availableWidth - 250, parsed)) + 'px';
                    blocksPanel.style.flexGrow = '0';
                    blocksPanel.style.flexShrink = '0';
                }
            }
        } catch (e) { /* ignorieren */ }

        resizer.addEventListener('mousedown', function(e) {
            isResizing = true;
            resizer.classList.add('active');
            e.preventDefault();
        });

        document.addEventListener('mousemove', function(e) {
            if (!isResizing) return;

            var mainRect = mainEl.getBoundingClientRect();
            var sidebarWidth = mainEl.querySelector('aside').getBoundingClientRect().width;
            var resizerWidth = 6;
            var offsetX = e.clientX - mainRect.left - sidebarWidth;
            var availableWidth = mainRect.width - sidebarWidth - resizerWidth;

            // Clamp: minimum 180px for blocks panel, minimum 250px for preview
            var newBlocksWidth = Math.max(180, Math.min(availableWidth - 250, offsetX));

            // Blocks-Panel bekommt die neue feste Breite, Preview füllt den Rest via flex-grow:1
            blocksPanel.style.width = newBlocksWidth + 'px';
            blocksPanel.style.flexGrow = '0';
            blocksPanel.style.flexShrink = '0';

            // Preview container passt sich responsiv an (CSS max-width: 600px)
            var previewContainer = document.getElementById('preview-container');
            if (previewContainer && !previewContainer.classList.contains('preview-mobile')) {
                previewContainer.style.width = '';
            }
        });

        document.addEventListener('mouseup', function() {
            if (isResizing) {
                isResizing = false;
                resizer.classList.remove('active');
                // Breite persistent speichern
                try {
                    var currentWidth = blocksPanel.style.width || '48%';
                    if (currentWidth && currentWidth !== '48%') {
                        localStorage.setItem(SPLIT_WIDTH_KEY, currentWidth);
                    }
                } catch (e) { /* ignorieren */ }
            }
        });
    }


    function deleteBlock(id) {
        const index = blocks.findIndex(b => b.id === id);
        if (index > -1) {
            blocks.splice(index, 1);
            renderBlockList();
            updatePreview();
            updatePaletteButtons();
        }
    }

    function reorderBlocks(fromIndex, toIndex) {
        const [removed] = blocks.splice(fromIndex, 1);
        blocks.splice(toIndex, 0, removed);
        // Sortable.js hat die DOM-Elemente bereits bewegt — nur Preview aktualisieren
        updatePreview();
    }

    function initVersionBadge() {
        var badge = document.getElementById('version-badge');
        if (badge) {
            badge.className = 'version-badge';
            badge.textContent = APP_VERSION;
        }
    }

    /**
     * Deaktiviert Palette-Buttons fuer hero/intro wenn Block vorhanden ist
     */
    function updatePaletteButtons() {
        elements.paletteItems.forEach(function(btn) {
            var type = btn.dataset.blockType;
            if (type === 'hero' || type === 'intro') {
                var exists = blocks.some(b => b.type === type);
                btn.disabled = exists;
                btn.style.opacity = exists ? '0.4' : '1';
                btn.style.pointerEvents = exists ? 'none' : 'auto';
            }
        });
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

            // Event Listeners für Bearbeiten/Löschen (nur falls vorhanden)
            var editBtn = el.querySelector('.btn-edit');
            if (editBtn) {
                editBtn.addEventListener('click', () => editBlock(block.id));
            }

            var deleteBtn = el.querySelector('.btn-delete');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    if (confirm('Möchten Sie diesen Block wirklich löschen?')) {
                        deleteBlock(block.id);
                    }
                });
            }

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

    function seedDefaultBlocks() {
        blocks.push(Blocks.createBlock('hero'));
        blocks.push(Blocks.createBlock('intro'));
        renderBlockList();
        updatePreview();
        updatePaletteButtons();
    }

    function createNewDraft() {
        if (blocks.length > 0 && !confirm('Der aktuelle Entwurf wird verworfen. Fortfahren?')) {
            return;
        }

        blocks = [];
        currentDraftName = '';

        // Standard-Hero + Intro anlegen
        seedDefaultBlocks();
    }

    function saveCurrentDraft() {
        if (!currentDraftName) {
            currentDraftName = prompt('Bitte geben Sie einen Namen für den Entwurf ein:', 'Mein Newsletter ' + new Date().toLocaleDateString());
            if (!currentDraftName) return;
        }

        const draftData = {
            blocks: blocks,
            date: Preview.getSettings().date || '',
            redaktion: Preview.getSettings().redaktion || 'Deutscher Asphaltverband'
        };
        const result = Storage.saveDraft(currentDraftName, draftData);

        if (result.success) {
            showToast('Entwurf "' + currentDraftName + '" gespeichert!', 'success');
        } else {
            showToast('Fehler beim Speichern: ' + result.error, 'error');
        }
    }

    function duplicateCurrentDraft() {
        if (!currentDraftName || blocks.length === 0) {
            showToast('Kein zu duplizierender Entwurf vorhanden.', 'info');
            return;
        }

        const newName = prompt('Neuer Name für die Kopie:', currentDraftName + ' (Kopie)');
        if (!newName) return;

        const result = Storage.duplicateDraft(currentDraftName, newName);

        if (result.success) {
            showToast('Entwurf "' + newName + '" dupliziert!', 'success');
            loadLatestDraft();
        } else {
            showToast('Fehler beim Duplizieren: ' + result.error, 'error');
        }
    }

   function openMailModal() {
        var settings = Preview.getSettings();
        var dateStr = settings.date || '';
        var subjectDefault = 'DAV Newsletter' + (dateStr ? ' – ' + dateStr : '');

        var mailtoRecipients = document.getElementById('mailto-recipients');
        var mailtoSubject = document.getElementById('mailto-subject');

        if (mailtoRecipients) mailtoRecipients.value = '';
        if (mailtoSubject) mailtoSubject.value = subjectDefault;

        elements.mailtoModal.classList.remove('hidden');
        hidePopovers();
    }

    function closeMailModal() {
        elements.mailtoModal.classList.add('hidden');
    }

    /**
     * Parse email addresses from a string that may be separated by ; , or newlines
     */
    function parseRecipients(text) {
        var emails = [];
        if (!text) return emails;
        var parts = text.split(/[;,;\n\r]+/);
        for (var i = 0; i < parts.length; i++) {
            var trimmed = parts[i].trim();
            if (trimmed && trimmed.indexOf('@') > -1) {
                // Deduplicate
                if (emails.indexOf(trimmed.toLowerCase()) === -1) {
                    emails.push(trimmed);
                }
            }
        }
        return emails;
    }

 
    function handleMailSend() {
        var recipientsText = document.getElementById('mailto-recipients').value || '';
        var subjectValue = document.getElementById('mailto-subject').value || 'DAV Newsletter';
        var emails = parseRecipients(recipientsText);

        if (!emails.length) {
            showToast('Bitte mindestens eine Empfänger-E-Mail eingeben.', 'error');
            return;
        }

       // mailto URL — recipients as BCC, kein HTML-Body (siehe "HTML kopieren")
        var mailtoUrl = 'mailto:' +
            '?bcc=' + encodeURIComponent(emails.join(',')) +
            '&subject=' + encodeURIComponent(subjectValue);

        window.location.href = mailtoUrl;
        closeMailModal();
       showToast('Mail-Programm wird geoeffnet (' + emails.length + ' Empf' + (emails.length > 1 ? 'a' : '') + 'nger)...', 'success');
    }

    /**
     * Kopiert den vollständigen Newsletter-HTML in die Zwischenablage
     */
    function handleCopyHtml() {
        var html = Preview.createPreviewHTML(blocks);

        // Versuche modern Clipboard API – funktioniert nur über HTTPS / localhost
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(html).then(function() {
                showToast('✓ HTML in Zwischenablage kopiert!', 'success');
            }).catch(function() {
                fallbackCopy(html);
            });
        } else {
            // Fallback: execCommand über temporären Textarea
            fallbackCopy(html);
        }
    }

    function fallbackCopy(text) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) { /* ignore */ }
        document.body.removeChild(ta);
        showToast('✓ HTML in Zwischenablage kopiert!', 'success');
    }

  function handleCSVUpload(e) {
        var fileInput = e.target;
        var file = fileInput.files && fileInput.files[0];
        if (!file) return;

        var reader = new FileReader();
        reader.onload = function(ev) {
            var text = ev.target.result || '';
            var lines = text.split(/\r?\n/);
            var emails = [];
            for (var i = 0; i < lines.length; i++) {
                // Split by comma or semicolon, take first column that looks like an email
                var parts = lines[i].split(/[,;]/);
                for (var j = 0; j < parts.length; j++) {
                    var trimmed = parts[j].trim();
                    if (trimmed.indexOf('@') > -1) {
                        emails.push(trimmed);
                        break; // take first email-like column per row
                    }
                }
            }
            var recipientsTextarea = document.getElementById('mailto-recipients');
            if (recipientsTextarea && emails.length) {
                var existing = recipientsTextarea.value || '';
                var toAppend = emails.join('; ') + '; ';
                if (!existing) {
                    recipientsTextarea.value = toAppend;
                } else {
                    // Avoid double semicolons at boundary
                    var existingTrimmed = existing.trimEnd();
                    if (existingTrimmed[existingTrimmed.length - 1] !== ';' && existingTrimmed[existingTrimmed.length - 1] !== ',') {
                        recipientsTextarea.value += '; ' + toAppend;
                    } else {
                        recipientsTextarea.value += toAppend;
                    }
                }
                showToast(emails.length + ' E-Mail-Adresse(n) aus CSV importiert.', 'success');
            } else if (!emails.length) {
                showToast('Keine gültigen E-Mail-Adressen in der Datei gefunden.', 'error');
            }
        };
        reader.readAsText(file);
        fileInput.value = ''; // Reset so same file can be re-uploaded
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

        showToast('HTML exportiert!', 'success');
    }

    function loadLatestDraft() {
        const drafts = Storage.getSavedDrafts();

        if (drafts.length === 0) {
            // Keine Entwürfe vorhanden
            return false;
        }

        // Neuesten Entwurf laden
        const latestName = drafts[0];
        const result = Storage.loadDraft(latestName);

        if (result.success) {
            currentDraftName = result.name;
            var draftData = result.data;
            // Backward compat: alte Entwürfe speichern nur ein Array
            if (Array.isArray(draftData)) {
                blocks = draftData;
            } else {
                blocks = draftData.blocks || [];
                Preview.setDate(draftData.date || '');
                Preview.setRedaktion(draftData.redaktion || 'Deutscher Asphaltverband');
                // Inputs füllen
                if (draftData.date) {
                    var parts = (draftData.date || '').split(' ');
                    elements.settingsMonth.value = parts[0] || '';
                    elements.settingsYear.value = parts[1] || '';
                }
                if (draftData.redaktion) {
                    elements.settingsRedaktion.value = draftData.redaktion;
                }
            }
            renderBlockList();
            updatePreview();
            updatePaletteButtons();
            return true;
        }
        return false;
    }

    // ========== Drafts Menu ==========

    function renderDraftsList() {
        const drafts = Storage.getSavedDrafts();
        elements.draftsList.innerHTML = '';

        if (drafts.length === 0) {
            elements.draftsList.innerHTML = '<p class="text-xs text-gray-400 italic px-3 py-2">Keine gespeicherten Entwürfe</p>';
            return;
        }

        drafts.forEach(name => {
            const isCurrent = name === currentDraftName;
            const row = document.createElement('div');
            row.className = 'draft-row' + (isCurrent ? ' is-current' : '');

            row.innerHTML = `
                <button class="text-xs text-left flex-1 truncate font-medium ${isCurrent ? 'text-blue-700' : 'text-gray-700'}" data-name="${escapeAttr(name)}">
                    ${isCurrent ? '● ' : ''}${truncateText(name, 25)}
                </button>
                <button class="text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition px-1 ml-1" data-name="${escapeAttr(name)}" title="Löschen">✕</button>
            `;

            // Make the row a group for hover effect on delete button
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            row.style.justifyContent = 'space-between';
            row.style.gap = '4px';
            row.style.position = 'relative';
            row.onmouseenter = () => {
                const delBtn = row.querySelector('[title="Löschen"]');
                if (delBtn) delBtn.style.opacity = '1';
            };
            row.onmouseleave = () => {
                const delBtn = row.querySelector('[title="Löschen"]');
                if (delBtn && !row.matches(':hover')) delBtn.style.opacity = '0';
            };

            elements.draftsList.appendChild(row);
        });

        // Event Listeners — wrap in a container div for proper click handling
        const listContainer = elements.draftsList;

        listContainer.querySelectorAll('.draft-row').forEach(row => {
            const loadBtn = row.querySelector('[data-name]:first-child');
            const deleteBtn = row.querySelectorAll('[data-name]')[1];

            if (loadBtn) {
                loadBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    loadSpecificDraft(loadBtn.dataset.name);
                    elements.draftsSection.classList.add('hidden');
                });
            }

            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteDraftFromMenu(deleteBtn.dataset.name);
                });
            }
        });
    }

    function loadSpecificDraft(name) {
        const result = Storage.loadDraft(name);
        if (result.success) {
            currentDraftName = result.name;
            var draftData = result.data;
            // Backward compat: alte Entwürfe speichern nur ein Array
            if (Array.isArray(draftData)) {
                blocks = draftData;
            } else {
                blocks = draftData.blocks || [];
                Preview.setDate(draftData.date || '');
                Preview.setRedaktion(draftData.redaktion || 'Deutscher Asphaltverband');
                // Inputs füllen
                if (draftData.date) {
                    var parts = (draftData.date || '').split(' ');
                    elements.settingsMonth.value = parts[0] || '';
                    elements.settingsYear.value = parts[1] || '';
                }
                if (draftData.redaktion) {
                    elements.settingsRedaktion.value = draftData.redaktion;
                }
            }
            renderBlockList();
            updatePreview();
            updatePaletteButtons();
            renderDraftsList();
            console.log('Entwurf geladen:', name);
        } else {
            showToast('Fehler beim Laden: ' + result.error, 'error');
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
            updatePaletteButtons();
            renderDraftsList();
            showToast('Entwurf "' + name + '" gelöscht.', 'info');
        } else {
            showToast('Fehler beim Löschen: ' + result.error, 'error');
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
                html += `
                    <div class="block-form">
                        <label>Artikel-Titel <span class="text-red-500">*</span></label>
                        <input type="text" name="title" value="${escapeAttr(data.title || '')}" required
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>`;
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

            case 'hero':
                html += createTextField('title', 'Titel', data.title || '', 'text');
                html += createTextAreaField('subtitle', 'Untertitel (HTML erlaubt: &lt;br&gt;, &amp;)', data.subtitle || '');
                break;

            case 'intro':
                html += createTextAreaField('content', 'Einleitungstext (HTML erlaubt: &lt;strong&gt;, &lt;br/&gt;)', data.content || '');
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
            showToast('Bitte zuerst eine URL eingeben.', 'info');
            return;
        }

        console.group('[Teaser] Start für:', url);

        fetchBtn.textContent = '⏳ Laden...';
        fetchBtn.disabled = true;
        showToast('Teaser wird geladen...', 'info');

        var success = false;

        function onLoaded(html) {
            if (success) return;
            console.log('[Teaser] HTML empfangen, Länge:', html.length);

            // Show first 300 chars for debugging
            console.log('[Teaser] HTML-Vorschau (erste 300 Zeichen):', html.substring(0, 300));

            success = true;
            try {
                var text = extractTeaserFromHTML(html);
                console.log('[Teaser] Extrahierter Teaser:', text);
                if (contentArea) contentArea.value = text;
                fetchBtn.textContent = '✅ Geladen';
                showToast('Teaser geladen!', 'success');
                console.groupEnd();
            } catch (err) {
                console.error('[Teaser] Fehler bei extractTeaserFromHTML:', err);
                onError(err.message || String(err));
            }
        }

        function onError(msg) {
            if (success) return;
            success = true;
            fetchBtn.textContent = '🔗 Teaser laden';
            fetchBtn.disabled = false;
            console.error('[Teaser] Fehler:', msg);
            showToast('Fehler: ' + (msg || 'Seite nicht erreichbar.'), 'error');
            console.groupEnd();
        }

        // Try multiple CORS proxies in sequence
        var proxyNames = ['allorigins.win', 'corsproxy.io'];
        var proxyUrls = [
            function(targetUrl) { return 'https://api.allorigins.win/raw?url=' + encodeURIComponent(targetUrl); },
            function(targetUrl) { return 'https://corsproxy.io/?' + encodeURIComponent(targetUrl); },
        ];

        function tryNext(index) {
            if (index >= proxyUrls.length) { onError('Alle Proxies fehlgeschlagen'); return; }

            var name = proxyNames[index];
            var proxyUrl = proxyUrls[index](url);
            console.log('[Teaser] Versuche Proxy ' + (index + 1) + '/' + proxyUrls.length + ':', name, '(' + proxyUrl + ')');

            fetch(proxyUrl)
                .then(function(response) {
                    console.log('[Teaser]', name + ' Status:', response.status);
                    if (!response.ok) throw new Error('HTTP ' + response.status);
                    return response.text();
                })
                .then(onLoaded)
                .catch(function(err) {
                    console.warn('[Teaser]', name + ' fehlgeschlagen:', err.message || err);
                    tryNext(index + 1);
                });
        }

        tryNext(0);
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
                const artikelTitle = (getFormValue('title') || '').trim();
                if (!artikelTitle) {
                    alert('Bitte gib einen Artikel-Titel ein. Dieses Feld ist Pflicht.');
                    return null;
                }
                return {
                    url: getFormValue('url') || '',
                    title: artikelTitle,
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
            case 'hero': {
                return {
                    title: getFormValue('title') || '',
                    subtitle: getFormValue('subtitle') || ''
                };
            }
            case 'intro': {
                return {
                    content: getFormValue('content') || ''
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
