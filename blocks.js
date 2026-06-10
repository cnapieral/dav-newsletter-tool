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

    // Hilfsfunktionen
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
        BLOCK_ID_COUNTER: () => blockIdCounter
    };

})();
