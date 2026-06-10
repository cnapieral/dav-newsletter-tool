# PROMPT FOR OPENCLAUDE – Newsletter Editor (Lean Vanilla JS)

Du bist ein erfahrener Frontend-Entwickler, der extrem schlanke, wartbare Lösungen bevorzugt. Deine Aufgabe ist es, ein einfaches Newsletter-Editor-Tool zu bauen.

## Projektkontext & Anforderungen (Single Source of Truth)

**Technische Basis (strikt einzuhalten):**
- Nur Vanilla HTML + CSS + JavaScript
- Tailwind CSS per CDN (kein Build-Prozess im MVP)
- Sortable.js ausschließlich für Drag & Drop der Blöcke
- Keine schweren Frameworks (kein React, kein Next.js, kein Vue)
- Responsives HTML als Ausgabe (kein MJML im MVP)
- Speicherung ausschließlich über localStorage + JSON
- Projektstruktur soll sehr übersichtlich und flach bleiben

**Funktionale Anforderungen:**
- Geteilte Ansicht: Links der Editor (Baukasten), rechts die Live-Vorschau
- In der Vorschau muss ein Toggle zwischen Desktop- und Mobile-Ansicht möglich sein
- Header und Footer sind fix (exakt aus der Datei `newsletter_dav.html` im Parent-Ordner übernehmen)
- Der Nutzer kann beliebig viele Blöcke hinzufügen, löschen und per Drag & Drop verschieben
- Pro Block hat der Nutzer die Wahl zwischen:
  - Freitext-Modus (freies Schreiben + normale Links)
  - Artikel-Link-Modus (gibt URL + Anzahl Teaser-Zeichen ein → Tool generiert automatisch die ersten X Zeichen als Teaser)
- Weitere Pflicht-Blöcke: Termin-Liste/Event-Kalender, Trennlinie (Divider), Social-Media-Links
- Bilder werden nur per URL eingefügt und können innerhalb eines Artikelfelds frei positioniert werden
- Das gesamte Design (Farben, Schriften, Abstände, Typografie) ist streng fix – außer der Bild-Positionierung darf nichts vom vorgegebenen Stil abweichen
- Entwürfe müssen gespeichert, geladen und dupliziert werden können (localStorage)

**Nicht im MVP:**
- Direktes Versenden von Mails
- Templates
- Komplexe Backend-Logik

## Umsetzungsplan

Folge exakt dem Plan unter `IMPLEMENTATION-PLAN.md` im selben Ordner. Arbeite Task für Task ab. Jede Task soll klein, testbar und übersichtlich sein. Verwende häufige Commits mit klaren Nachrichten.

Beginne mit Task 0.1 (Ordnerstruktur + Basis-HTML mit geteilter Ansicht).

Halte den Code sauber, kommentiere gut und achte auf gute Trennung der Verantwortlichkeiten (z. B. separate Dateien für storage, blocks, preview).

## Deine Arbeitsweise

- Arbeite schrittweise und zeige mir nach jeder größeren Task den aktuellen Stand.
- Halte das Projekt extrem schlank und übersichtlich.
- Wenn du Entscheidungen treffen musst, bevorzuge Einfachheit und Wartbarkeit.
- Frage nach, falls etwas unklar ist.

Beginne jetzt mit der Umsetzung des Plans.

---
**Dieser Prompt ist die offizielle Übergabe an OpenClaude.**  
Er wurde gemeinsam mit Hermes erarbeitet und enthält alle finalen Anforderungen.