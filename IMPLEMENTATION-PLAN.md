# IMPLEMENTATION PLAN – Lean Newsletter Editor (Vanilla JS)

**Single Source of Truth**  
**Stand:** 05. Juni 2026  
**Technische Basis:** Sehr schlankes Projekt mit Vanilla HTML + CSS + JavaScript + Tailwind via CDN + Sortable.js (nur für Drag & Drop). Keine schweren Frameworks, kein Next.js, kein MJML im MVP. Responsives HTML als Output.

**Goal:** Ein einfaches Tool, bei dem der Nutzer links Blöcke zusammenstellt (Editor) und rechts eine Live-Vorschau sieht. Header und Footer sind fix, Inhaltsblöcke sind verschiebbar. Entwürfe werden in localStorage gespeichert und können dupliziert werden.

**Projektstruktur:**
```
dev/newsletter-editor/
├── index.html
├── styles.css
├── app.js
├── blocks.js
├── storage.js
├── preview.js
├── monitor-system.sh
├── start-openclaude-screen.sh
├── PROMPT-FOR-OPENCLAUDE.md
└── IMPLEMENTATION-PLAN.md
```

**Block-Typen:**
- Freitext (mit normalen Links)
- Artikel-Link (URL + Teaser-Länge → Auto-Teaser)
- Termin-Liste / Event-Kalender
- Trennlinie
- Social-Media-Links
- Bild (per URL, frei positionierbar im Block)

**Constraints:**
- Design strikt fix (Farben, Schriften, Abstände)
- Header + Footer fest (aus newsletter_dav.html)
- Geteilte Ansicht: Editor links, Preview rechts (mit Mobile-Toggle)
- Speichern/Duplizieren via localStorage + JSON

**Nicht im MVP:** Direktes Versenden, Templates.

---

## Tasks

**Task 0.1: Basis-HTML + Layout**
- Erstelle `index.html` mit Tailwind CDN, geteilter Ansicht (left: Editor, right: Preview)
- Füge Toggle für Mobile-Desktop hinzu
- Grundstruktur für Block-Liste und Preview-Bereich

**Task 0.2: Storage (localStorage)**
- `storage.js`: save, load, duplicate von Entwürfen als JSON

**Task 1.1: Block-System**
- `blocks.js`: Alle Block-Typen als JS-Objekte
- Add, delete, move (Sortable.js)

**Task 1.2: Freitext + Artikel-Link Block**
- Eingabe-Felder, Auto-Teaser bei Artikel-Links

**Task 2.1: Live-Preview**
- `preview.js`: Echtzeit-Update der Vorschau, responsive Toggle

**Task 2.2: HTML Export**
- Button zum Download der fertigen HTML-Datei (mit fixem Header/Footer)

**Task 3: Restliche Blöcke + Polish**
- Termin-Liste, Divider, Social-Links, Bild-Positionierung
- Design-Feinschliff (exakt nach Beispiel)
- Finaler Test + Dokumentation

Arbeite Task für Task. Jede Task klein halten, Code sauber kommentieren, häufig committen. Halte alles minimal.

Beginne jetzt mit Task 0.1.