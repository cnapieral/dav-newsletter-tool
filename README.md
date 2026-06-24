# DAV Newsletter Editor

Visueller Newsletter-Editor f黵 den Deutschen Asphaltverband – Vanilla HTML/CSS/JS, keine Frameworks.

## Starten

**Option 1: Direkt im Browser (einfach)**

`index.html` im Browser цфffnen. Fertig. Benцtigt Internetverbindung f黵 CDN-Ressourcen (Tailwind CSS, Sortable.js).

**Option 2: Lokaler Server (optional)**

```bash
cd dist
python server.py              # Port 8081, цфffnet Browser automatisch
python server.py --port 9090  # Anderer Port
```

## Bedienung

- **Blцcke hinzuf黦en:** Linkspalette – Block anklicken oder in den Editor-Bereich ziehen
- **Block bearbeiten:** Klick auf einen Block im "Aktive Blцcke"-Panel цфffnet den Editor-Dialog
- **Reihenfolge 鋘dern:** Drag & Drop im "Aktive Blцcke"-Panel
- **Speichern / Laden:** Burger-Menю (dreipunkt-Symbol oben rechts) → Entw黵fe werden im Browser (localStorage) gespeichert

## Mail vorbereiten

1. Burger-Menю → "Mail цфffnen"
2. ① Newsletter-HTML in Zwischenablage kopieren
3. E-Mail-Empf鋘ger eingeben oder CSV hochladen
4. ② Mail-Client цфffnen – HTML manuell im Editor einf체gen

## Windows EXE bauen

```bash
pip install pyinstaller
pyinstaller NewsletterEditor-win.spec
# → dist/NewsletterEditor.exe
```
