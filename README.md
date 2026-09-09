# DAV Newsletter Editor

Visueller Newsletter-Editor für den Deutschen Asphaltverband – Vanilla HTML/CSS/JS, keine Frameworks.

## Starten

**Option 1: Direkt im Browser (einfach)**

`index.html` im Browser öffnen. Fertig. Benцtigt Internetverbindung für CDN-Ressourcen (Tailwind CSS, Sortable.js).

**Option 2: Lokaler Server (optional)**

```
cd dist
python server.py              # Port 8081, öffnet Browser automatisch
python server.py --port 9090  # Anderer Port
```

## Bedienung

- **Blöcke hinzufügen:** Linkspalette – Block anklicken oder in den Editor-Bereich ziehen

- **Block bearbeiten:** Klick auf einen Block im "Aktive Blцcke"-Panel öffnet den Editor-Dialog

- **Reihenfolge ändern:** Drag & Drop im "Aktive Blöcke"-Panel

- **Speichern / Laden:** Burger-Menю (dreipunkt-Symbol oben rechts) → Entw黵fe werden im Browser (localStorage) gespeichert

## Mail vorbereiten

1. Burger-Menю → "Mail цфffnen"

2. ① Newsletter-HTML in Zwischenablage kopieren

3. E-Mail-Empf鋘ger eingeben oder CSV hochladen

4. ② Mail-Client цфffnen – HTML manuell im Editor einf체gen

## Windows EXE bauen

```
pip install pyinstaller
pyinstaller NewsletterEditor-win.spec
# → dist/NewsletterEditor.exe
```

