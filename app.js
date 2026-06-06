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
        paletteItems: document.querySelectorAll('.palette-item')
    };

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

        // View Mode Toggle
        elements.toggleViewMode.addEventListener('click', toggleViewMode);

        // Burger Menu Toggle
        elements.burgerMenuBtn.addEventListener('click', toggleBurgerMenu);
        document.addEventListener('click', (e) => {
            if (!elements.burgerMenu.contains(e.target) && !elements.burgerMenuBtn.contains(e.target)) {
                hideBurgerMenu();
            }
        });
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

        const newData = promptForBlockData(block);
        if (newData) {
            block.data = newData;
            renderBlockList();
            updatePreview();
        }
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

        // Vorschau in iframe oder div darstellen
        // Für MVP: Direktes Einbinden der HTML-Inhalte (ohne iframe für einfachere Interaktion)
        elements.previewContent.innerHTML = `
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                ${html.replace(/.*<body[^>]*>([\s\S]*)<\/body>.*/i, '$1')}
            </table>
        `;

        // ODER: Ganze HTML in preview-content (einfacher für MVP)
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

    function promptForBlockData(block) {
        // Einfache Prompt-basierte Bearbeitung für MVP
        const data = block.data;

        switch (block.type) {
            case 'freitext':
                return {
                    content: prompt('Inhalt:', data.content || ''),
                    showTitle: confirm('Titel anzeigen?'),
                    title: prompt('Titel:', data.title || '')
                };

            case 'artikel':
                return {
                    url: prompt('URL:', data.url || ''),
                    title: prompt('Artikel-Titel:', data.title || ''),
                    teaserLength: parseInt(prompt('Teaser-Länge (Zeichen):', String(data.teaserLength))) || 160
                };

            case 'termin':
                const events = JSON.parse(prompt('Termine als JSON:', JSON.stringify(data.events, null, 2)));
                return { events: events };

            case 'image':
                return {
                    url: prompt('Bild-URL:', data.url || ''),
                    alt: prompt('Alt-Text:', data.alt || ''),
                    align: prompt('Ausrichtung (left/center/right):', data.align || 'center')
                };

            default:
                alert('Bearbeitung für diesen Block-Typ nicht implementiert.');
                return null;
        }
    }

    // ========== Start ==========
    init();
});
