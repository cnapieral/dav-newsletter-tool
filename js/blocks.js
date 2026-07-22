/**
 * blocks.js – Block-System für den Newsletter Editor
 *
 * Definiert alle verfügbaren Block-Typen und deren Struktur.
 */

const Blocks = (function() {
    'use strict';

    // Block-Typen Definition
    const BLOCK_TYPES = {
        freitext: {
            id: 'freitext',
            label: 'Freitext',
            icon: '📝',
            defaultData: {
                content: '',
                showTitle: false,
                title: ''
            },
            createBlockElement: function(id, data) {
                return createTextBlock(id, 'freitext', data);
            }
        },
        artikel: {
            id: 'artikel',
            label: 'Artikel-Link',
            icon: '📰',
            defaultData: {
                url: '',
                title: '',
                teaserLength: 160,
                showImage: true
            },
            createBlockElement: function(id, data) {
                return createTextBlock(id, 'artikel', data);
            }
        },
        termin: {
            id: 'termin',
            label: 'Termin-Liste',
            icon: '📅',
            defaultData: {
                events: [
                    { date: '', title: '', link: '' }
                ]
            },
            createBlockElement: function(id, data) {
                return createTerminBlock(id, data);
            }
        },
        divider: {
            id: 'divider',
            label: 'Trennlinie',
            icon: '➖',
            defaultData: {
                style: 'solid', // solid, dashed, dotted
                color: '#E5E7EB'
            },
            createBlockElement: function(id, data) {
                return createDividerBlock(id, data);
            }
        },
        social: {
            id: 'social',
            label: 'Social-Media',
            icon: '🌐',
            defaultData: {
                links: [
                    { name: 'LinkedIn', url: '' },
                    { name: 'asphalt.de', url: '' }
                ]
            },
            createBlockElement: function(id, data) {
                return createSocialBlock(id, data);
            }
        },
        image: {
            id: 'image',
            label: 'Bild',
            icon: '🖼️',
            defaultData: {
                url: '',
                alt: '',
                align: 'center', // left, center, right
                width: 600,
                caption: ''
            },
            createBlockElement: function(id, data) {
                return createImageBlock(id, data);
            }
        },
        hero: {
            id: 'hero',
            label: 'Hero Section',
            icon: '🎯',
            defaultData: {
                title: 'Aus der Verbandswelt',
                subtitle: 'LCA-Ergebnisse, neue Stellen &amp; wichtige Klärungen<br />Das sind die aktuellen Meldungen vom DAV.'
            },
            createBlockElement: function(id, data) {
                return createHeroBlock(id, data);
            }
        },
        intro: {
            id: 'intro',
            label: 'Einleitung',
            icon: '✉️',
            defaultData: {
                content: '<strong>Liebe Kolleginnen und Kollegen,</strong><br /><br />die letzten Wochen haben im DAV viel bewegt — von neuen LCA-Ergebnissen für polymermodifiziertes Bitumen bis hin zur endgültigen Klärung der EBV-Frage. In dieser Ausgabe bringen wir Sie auf den neuesten Stand und informieren Sie außerdem über unser Wachstum: Wir stellen ein!'
            },
            createBlockElement: function(id, data) {
                return createIntroBlock(id, data);
            }
        },
        // --- Themenfeld-Blöcke (fixe Optionen) ---
        'maschinen-umwelt': {
            id: 'maschinen-umwelt',
            label: 'Maschinen und Umwelt',
            icon: '🔖',
            defaultData: { title: 'Maschinen und Umwelt' },
            createBlockElement: function(id, data) { return createSectionHeaderBlock(id, data); }
        },
        'asphalttechnik': {
            id: 'asphalttechnik',
            label: 'Asphalttechnik',
            icon: '🔖',
            defaultData: { title: 'Asphalttechnik' },
            createBlockElement: function(id, data) { return createSectionHeaderBlock(id, data); }
        },
        'wirtschaft-recht': {
            id: 'wirtschaft-recht',
            label: 'Wirtschaft und Recht',
            icon: '🔖',
            defaultData: { title: 'Wirtschaft und Recht' },
            createBlockElement: function(id, data) { return createSectionHeaderBlock(id, data); }
        },
        'dav-dai': {
            id: 'dav-dai',
            label: 'DAV / DAI',
            icon: '🔖',
            defaultData: { title: 'DAV / DAI' },
            createBlockElement: function(id, data) { return createSectionHeaderBlock(id, data); }
        },
        'allgemeines': {
            id: 'allgemeines',
            label: 'Allgemeines',
            icon: '🔖',
            defaultData: { title: 'ALLGEMEINES' },
            createBlockElement: function(id, data) { return createSectionHeaderBlock(id, data); }
        }
    };

    /**
     * Generiert eine eindeutige ID für Blöcke
     */
    let blockIdCounter = 0;
    function generateBlockId() {
        return 'block_' + Date.now() + '_' + (++blockIdCounter);
    }

    /**
     * Erstellt einen neuen Block mit Standardwerten
     */
    function createBlock(type) {
        const blockType = BLOCK_TYPES[type];
        if (!blockType) {
            throw new Error('Unbekannter Block-Typ: ' + type);
        }

        return {
            id: generateBlockId(),
            type: type,
            data: JSON.parse(JSON.stringify(blockType.defaultData))
        };
    }

    /**
     * Erstellt das DOM-Element für einen Block (Editor-Ansicht)
     */
    function createBlockElement(block) {
        const blockType = BLOCK_TYPES[block.type];
        if (!blockType) return null;

        return blockType.createBlockElement(block.id, block.data);
    }

    // ========== Block Elementerstellung ==========

    /**
     * Text-Block (Freitext/Artikel)
     */
    function createTextBlock(id, type, data) {
        const wrapper = document.createElement('div');
        wrapper.className = 'block-item block-' + type;
        wrapper.setAttribute('data-block-id', id);
        wrapper.setAttribute('draggable', 'true');

        const title = type === 'freitext' ? (data.showTitle ? data.title : 'Freitext') :
                      type === 'artikel' ? (data.title || 'Artikel-Link') : 'Text';

        wrapper.innerHTML = `
            <div class="block-header">
                <span class="block-title">${title}</span>
                <div class="block-actions">
                    <button class="block-action-btn btn-edit" title="Bearbeiten">✏️</button>
                    <button class="block-action-btn btn-delete" title="Löschen">🗑️</button>
                </div>
            </div>
            <div class="block-content text-sm text-gray-600">
                ${type === 'artikel' && data.url ? 'URL: ' + truncate(data.url, 40) : ''}
                ${data.content ? truncate(data.content, 100) : ''}
            </div>
        `;

        return wrapper;
    }

    /**
     * Termin-Block
     */
    function createTerminBlock(id, data) {
        const wrapper = document.createElement('div');
        wrapper.className = 'block-item block-termin';
        wrapper.setAttribute('data-block-id', id);
        wrapper.setAttribute('draggable', 'true');

        const eventCount = (data.events || []).filter(e => e.title).length;
        const previewText = eventCount > 0
            ? data.events.slice(0, 2).map(e => `${e.date} ${e.title}`).join('<br>')
            : 'Keine Termine';

        wrapper.innerHTML = `
            <div class="block-header">
                <span class="block-title">Termin-Liste</span>
                <div class="block-actions">
                    <button class="block-action-btn btn-edit" title="Bearbeiten">✏️</button>
                    <button class="block-action-btn btn-delete" title="Löschen">🗑️</button>
                </div>
            </div>
            <div class="block-content text-sm text-gray-600">
                ${previewText}
            </div>
        `;

        return wrapper;
    }

    /**
     * Trennlinien-Block
     */
    function createDividerBlock(id, data) {
        const wrapper = document.createElement('div');
        wrapper.className = 'block-item block-divider';
        wrapper.setAttribute('data-block-id', id);
        wrapper.setAttribute('draggable', 'true');

        wrapper.innerHTML = `
            <div class="block-header">
                <span class="block-title">Trennlinie</span>
                <div class="block-actions">
                    <button class="block-action-btn btn-edit" title="Bearbeiten">✏️</button>
                    <button class="block-action-btn btn-delete" title="Löschen">🗑️</button>
                </div>
            </div>
            <div class="block-content text-sm text-gray-600">
                —————————————
            </div>
        `;

        return wrapper;
    }

    /**
     * Social-Media-Block
     */
    function createSocialBlock(id, data) {
        const wrapper = document.createElement('div');
        wrapper.className = 'block-item block-social';
        wrapper.setAttribute('data-block-id', id);
        wrapper.setAttribute('draggable', 'true');

        const linkCount = (data.links || []).filter(l => l.name).length;
        const previewText = (data.links || []).slice(0, 2).map(l => l.name).join(', ');

        wrapper.innerHTML = `
            <div class="block-header">
                <span class="block-title">Social-Media</span>
                <div class="block-actions">
                    <button class="block-action-btn btn-edit" title="Bearbeiten">✏️</button>
                    <button class="block-action-btn btn-delete" title="Löschen">🗑️</button>
                </div>
            </div>
            <div class="block-content text-sm text-gray-600">
                ${previewText || 'Keine Social-Media Links'}
            </div>
        `;

        return wrapper;
    }

    /**
     * Bild-Block
     */
    function createImageBlock(id, data) {
        const wrapper = document.createElement('div');
        wrapper.className = 'block-item block-image';
        wrapper.setAttribute('data-block-id', id);
        wrapper.setAttribute('draggable', 'true');

        const urlPreview = data.url ? truncate(data.url, 35) : 'Keine URL';

        wrapper.innerHTML = `
            <div class="block-header">
                <span class="block-title">Bild</span>
                <div class="block-actions">
                    <button class="block-action-btn btn-edit" title="Bearbeiten">✏️</button>
                    <button class="block-action-btn btn-delete" title="Löschen">🗑️</button>
                </div>
            </div>
            <div class="block-content text-sm text-gray-600">
                ${urlPreview}
            </div>
        `;

        return wrapper;
    }

    /**
     * Hero-Block
     */
    function createHeroBlock(id, data) {
        const wrapper = document.createElement('div');
        wrapper.className = 'block-item block-hero';
        wrapper.setAttribute('data-block-id', id);
        wrapper.setAttribute('draggable', 'true');

        wrapper.innerHTML = `
            <div class="block-header">
                <span class="block-title">Hero Section</span>
                <div class="block-actions">
                    <button class="block-action-btn btn-edit" title="Bearbeiten">✏️</button>
                    <button class="block-action-btn btn-delete" title="Löschen">🗑️</button>
                </div>
            </div>
            <div class="block-content text-sm text-gray-600">
                ${truncate(data.title || '', 80)}<br/>${truncate((data.subtitle || '').replace(/<[^>]*>/g, ''), 80)}
            </div>
        `;

        return wrapper;
    }

    /**
     * Intro-Block (Einleitung)
     */
    function createIntroBlock(id, data) {
        const wrapper = document.createElement('div');
        wrapper.className = 'block-item block-intro';
        wrapper.setAttribute('data-block-id', id);
        wrapper.setAttribute('draggable', 'true');

        var previewText = (data.content || '').replace(/<[^>]*>/g, '');

        wrapper.innerHTML = `
            <div class="block-header">
                <span class="block-title">Einleitung</span>
                <div class="block-actions">
                    <button class="block-action-btn btn-edit" title="Bearbeiten">✏️</button>
                    <button class="block-action-btn btn-delete" title="Löschen">🗑️</button>
                </div>
            </div>
            <div class="block-content text-sm text-gray-600">
                ${truncate(previewText, 100)}
            </div>
        `;

        return wrapper;
    }

    /**
     * Themenfeld-Block (Sektions-Titel, keine Bearbeitung nötig)
     */
    function createSectionHeaderBlock(id, data) {
        const wrapper = document.createElement('div');
        wrapper.className = 'block-item block-section-header';
        wrapper.setAttribute('data-block-id', id);
        wrapper.setAttribute('draggable', 'true');

        var title = data.title || '';

        wrapper.innerHTML = `
            <div class="block-header">
                <span class="block-title">🔖 ${escapeHtml(title)}</span>
                <div class="block-actions">
                    <button class="block-action-btn btn-delete" title="Löschen">🗑️</button>
                </div>
            </div>
            <div class="block-content text-sm text-gray-600">
                Themenfeld: ${escapeHtml(title)}
            </div>
        `;

        return wrapper;
    }

    // Hilfsfunktionen
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function truncate(str, maxLength) {
        if (!str) return '';
        if (str.length <= maxLength) return str;
        return str.substring(0, maxLength) + '...';
    }

    // Öffentliche API
    return {
        BLOCK_TYPES,
        createBlock,
        createBlockElement,
        hasType: function(type) {
            return typeof BLOCK_TYPES[type] !== 'undefined';
        },
        BLOCK_ID_COUNTER: () => blockIdCounter
    };

})();
