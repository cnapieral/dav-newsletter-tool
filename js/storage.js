/**
 * storage.js – Speicherverwaltung für Newsletter-Entwürfe
 *
 * Speichert/lädt/dupliziert Entwürfe im localStorage als JSON.
 */

const Storage = (function() {
    'use strict';

    const STORAGE_KEY_PREFIX = 'dav_newsletter_';
    const MAX_SAVED_COUNT = 20;

    /**
     * Holt alle gespeicherten Newsletter-Namen
     */
    function getSavedDrafts() {
        try {
            const drafts = localStorage.getItem('dav_newsletter_drafts');
            return drafts ? JSON.parse(drafts) : [];
        } catch (e) {
            console.error('Fehler beim Laden der Entwürfe:', e);
            return [];
        }
    }

    /**
     * Speichert eine Liste aller Entwurf-Namen
     */
    function saveDraftNames(names) {
        try {
            localStorage.setItem('dav_newsletter_drafts', JSON.stringify(names));
        } catch (e) {
            console.error('Fehler beim Speichern der Entwürfe:', e);
        }
    }

    /**
     * Generiert einen eindeutigen Key für einen Entwurf
     */
    function getDraftKey(name) {
        // Sanitize name: lowercase, replace spaces with underscores, remove special chars
        const sanitized = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
        return STORAGE_KEY_PREFIX + sanitized;
    }

    /**
     * Speichert einen Newsletter-Entwurf
     * @param {string} name – Name des Entwurfs
     * @param {object} data – Newsletter-Daten (blocks array)
     */
    function saveDraft(name, data) {
        try {
            const key = getDraftKey(name);
            localStorage.setItem(key, JSON.stringify({
                name: name,
                data: data,
                savedAt: new Date().toISOString()
            }));

            // Entwurf-Namen aktualisieren
            updateDraftNamesList(name);

            return { success: true };
        } catch (e) {
            console.error('Fehler beim Speichern:', e);
            return { success: false, error: e.message };
        }
    }

    /**
     * Lädt einen Newsletter-Entwurf
     * @param {string} name – Name des zu ladenden Entwurfs
     */
    function loadDraft(name) {
        try {
            const key = getDraftKey(name);
            const stored = localStorage.getItem(key);

            if (!stored) {
                return { success: false, error: 'Entwurf nicht gefunden' };
            }

            const parsed = JSON.parse(stored);
            return { success: true, data: parsed.data, name: parsed.name };
        } catch (e) {
            console.error('Fehler beim Laden:', e);
            return { success: false, error: e.message };
        }
    }

    /**
     * Dupliziert einen Entwurf mit neuem Namen
     * @param {string} originalName – Name des Originals
     * @param {string} newName – Neuer Name für die Kopie
     */
    function duplicateDraft(originalName, newName) {
        try {
            const result = loadDraft(originalName);

            if (!result.success) {
                return { success: false, error: result.error };
            }

            // Neue Name im neuen Key speichern
            const newKey = getDraftKey(newName);
            localStorage.setItem(newKey, JSON.stringify({
                name: newName,
                data: result.data,
                savedAt: new Date().toISOString(),
                duplicatedFrom: originalName
            }));

            updateDraftNamesList(newName);

            return { success: true };
        } catch (e) {
            console.error('Fehler beim Duplizieren:', e);
            return { success: false, error: e.message };
        }
    }

    /**
     * Aktualisiert die Liste der Entwurf-Namen
     */
    function updateDraftNamesList(name) {
        let drafts = getSavedDrafts();

        // Wenn name noch nicht dabei ist, hinzufügen (an erster Stelle)
        if (!drafts.includes(name)) {
            drafts.unshift(name);
            // Maximalanzahl beachten
            while (drafts.length > MAX_SAVED_COUNT) {
                drafts.pop();
            }
            saveDraftNames(drafts);
        }
    }

    /**
     * Löscht einen Entwurf
     * @param {string} name – Name des zu löschenden Entwurfs
     */
    function deleteDraft(name) {
        try {
            const key = getDraftKey(name);
            localStorage.removeItem(key);

            // Aus Namenliste entfernen
            let drafts = getSavedDrafts();
            drafts = drafts.filter(n => n !== name);
            saveDraftNames(drafts);

            return { success: true };
        } catch (e) {
            console.error('Fehler beim Löschen:', e);
            return { success: false, error: e.message };
        }
    }

    /**
     * Gibt true zurück, wenn der Storage voll ist
     */
    function isStorageFull() {
        try {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return false;
        } catch (e) {
            return true;
        }
    }

    // Öffentliche API
    return {
        getSavedDrafts,
        saveDraft,
        loadDraft,
        duplicateDraft,
        deleteDraft,
        isStorageFull,
        STORAGE_KEY_PREFIX
    };

})();
