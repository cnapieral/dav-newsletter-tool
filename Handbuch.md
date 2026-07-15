# DAV Newsletter Editor – Benutzerhandbuch

## Übersicht

Der Newsletter Editor ist ein webbasiertes Werkzeug zum Erstellen von DAV-Newslettern per Drag & Drop. Keine Installation nötig – einfach die `index.html` im Browser öffnen.

**Voraussetzung:** Internetverbindung (für Tailwind CSS und Sortable.js aus dem CDN).

---

## Erste Schritte

### Starten

Die Datei **`index.html`** mit einem beliebigen Browser öffnen (Chrome, Firefox, Edge empfohlen).

Der Editor besteht nach dem Start aus drei Bereichen:

| Bereich | Beschreibung |
|---------|-------------|
| **Linkspalette** | Verfügbare Block-Typen zum Hinzufügen |
| **Aktive Blöcke** | Deine aktuellen Newsletter-Blöcke (mit Drag & Drop) |
| **Live-Vorschau** | Echtzeit-Ansicht des fertigen Newsletters |

---

## Blöcke verwalten

### Block hinzufügen

Einen Block-Typ aus der Linkspalette anklicken. Der Block erscheint unten im „Aktive Blöcke"-Panel.

> **Hinweis:** Hero Section und Einleitung sind Singleton-Blöcke – es kann jeweils nur einen davon geben. Sie werden beim Start automatisch angelegt.

### Block bearbeiten

Auf den ✏️-Bearbeiten-Button neben einem Block klicken. Es öffnet sich ein Dialog mit allen editierbaren Feldern dieses Blocks. Änderungen werden sofort in der Vorschau übernommen.

> **Ausnahme:** Rubrik-Blöcke (🔖) haben keinen Bearbeiten-Button – ihre Themen sind fest vorgegeben.

### Block löschen

🗑️-Button neben dem Block klicken. Der Block wird entfernt.

### Reihenfolge ändern (Drag & Drop)

Einen Block im „Aktive Blöcke"-Panel ergreifen und an die gewünschte Position ziehen. Die Vorschau aktualisiert sich in Echtzeit.

---

## Block-Typen im Detail

### 🎯 Hero Section

Der Header-Banner des Newsletters – dunkler Hintergrund mit Titel und Untertitel.

| Feld | Beschreibung |
|------|-------------|
| **Titel** | Großer Überschriftentext (z. B. „Aus der Verbandswelt") |
| **Untertitel** | Kurzer Beschreibungstext darunter |

### ✉️ Einleitung

Personalisierter Begrüßungstext nach dem Hero-Banner.

| Feld | Beschreibung |
|------|-------------|
| **Inhalt** | Freitext mit HTML-Unterstützung (`<strong>`, `<br />`, `<em>` usw.) |

### 📝 Freitext

Freier Textblock mit optionalem Titel.

| Feld | Beschreibung |
|------|-------------|
| **Titel anzeigen** | Haken setzen, um eine Überschrift über den Text zu zeigen |
| **Titel** | Überschriftentitel (wenn aktiviert) |
| **Inhalt** | Freier Text, Zeilenumbrüche werden automatisch erkannt |

### 📰 Artikel-Link

Ein Artikel mit Titel, Teaser-Text und „Zum Artikel"-Button.

| Feld | Beschreibung |
|------|-------------|
| **Titel** | Artikeltitel (Pflichtfeld – darf nicht leer sein) |
| **URL** | Ziel-URL des Artikels |
| **Inhalt** | Kurzer Teaser-Text (1–3 Sätze) |

### 📅 Termin-Liste

Event-Kalender-Sektion mit einem oder mehreren Terminen.

| Feld pro Termin | Beschreibung |
|-----------------|-------------|
| **Datum** | Datum des Events (z. B. „15.07.2026") |
| **Titel** | Event-Titel |
| **Link** | Optional: URL für mehr Informationen |

Termine können beliebig hinzugefügt oder entfernt werden. Leere Termine werden in der Vorschau nicht angezeigt.

### ➖ Trennlinie

Einfache horizontale Linie zur optischen Trennung von Bereichen. Keine Bearbeitung nötig.

### 🌐 Social-Media

Links zu Social-Media-Profilen als Buttons.

| Feld | Beschreibung |
|------|-------------|
| **Name** | Anzeigetext (z. B. „LinkedIn") |
| **URL** | Ziel-URL des Profils |

Mehrere Links können hinzugefügt werden. Leere Einträge werden ausgeblendet.

### 🖼️ Bild

Einzelnes Bild mit URL, Alternativtext und optionaler Beschriftung.

| Feld | Beschreibung |
|------|-------------|
| **Bild-URL** | Vollständige URL zum Bild (z. B. von asphalt.de oder einem CDN) |
| **Alternativtext** | Kurzbeschreibung für Barrierefreiheit |
| **Ausrichtung** | Links, Zentriert oder Rechts |
| **Beschriftung** | Optionaler Bildunterschrift-Text |

---

## Rubrik-Blöcke (Themenfelder)

Die vier Rubrik-Blöcke markieren thematische Sektionen im Newsletter. Sie erscheinen in der Linkspalette unter dem Abschnitt **„Rubriken"**.

| Block | Vorschau-Anzeige |
|-------|----------------|
| 🔖 Wirtschaft und Recht | **WIRTSCHAFT UND RECHT** (fett, rot) |
| 🔖 DAV \| DAI | **DAV \| DAI** (fett, rot) |
| 🔖 Maschinen und Umwelt | **MASCHINEN UND UMWELT** (fett, rot) |
| 🔖 Asphaltakademie | **ASPHALTAKADEMIE** (fett, rot) |

Diese Blöcke sind **fest vorgegeben** – sie können nicht bearbeitet oder umbenannt werden. Einfach anklicken zum Hinzufügen und bei Bedarf mit 🗑️ löschen.

> **Tipp:** Kombiniere Rubrik-Blöcke mit Trennlinien für eine klare optische Struktur: Trennlinie → Rubrik → Inhalt → Trennlinie → nächste Rubrik.

---

## Einstellungen (⚙️)

Über den **„Einstellungen"**-Button in der unteren Leiste erreichst du globale Newsletter-Einstellungen:

### Datum (Header & Footer)

Freitext-Feld für das Erscheinungsdatum – beliebiger Text möglich.

| Beispiel | Anzeige im Header |
|----------|-------------------|
| `Juni 2026` | Juni 2026 |
| `15. Juli 2026` | 15. Juli 2026 |
| `Sommerausgabe 2026` | Sommerausgabe 2026 |

Das Datum erscheint **rechts im Header** neben dem DAV-Logo.

### Redaktion (Footer)

Name der redaktionellen Einheit – wird im Footer angezeigt.

| Standardwert | `Deutscher Asphaltverband` |
|---|---|

Beispiel-Footer: `Juni 2026 \| Redaktion: Deutscher Asphaltverband`

> **Hinweis:** Beide Einstellungen werden automatisch mit dem Entwurf gespeichert und beim Laden wiederhergestellt.

---

## Entwurf speichern und laden

Alle Entwürfe werden im Browser (localStorage) gespeichert.

### Speichern

Burger-Menü ☰ → **„Speichern"** klicken. Der aktuelle Stand wird unter dem aktuellen Namen gespeichert (inklusive Datum und Redaktion).

### Neuen Entwurf anlegen

Burger-Menü → **„Neu"** klicken. Alle Blöcke werden zurückgesetzt auf den Standardzustand (Hero + Einleitung). Der vorherige Entwurf bleibt erhalten und kann geladen werden.

### Entwurf duplizieren

Burger-Menü → **„Duplizieren"**. Eine Kopie des aktuellen Newsletters wird erstellt, die du unabhängig bearbeiten kannst.

### Gespeicherte Entwürfe laden

Burger-Menü → **„Entwürfe laden"** → Aus der Liste den gewünschten Entwurf auswählen.

> **Wichtig:** Entwürfe sind an den Browser und das Gerät gebunden. Ein Wechsel des Browsers oder ein Cache-Löschen entfernt gespeicherte Entwürfe.

---

## Mail vorbereiten & Versenden

Der Editor unterstützt kein direktes Versenden, aber den kompletten Workflow der E-Mail-Vorbereitung.

### Schritt-für-Schritt

**① HTML kopieren**
- Burger-Menü → **„Mail öffnen"**
- Klick auf „① 📋 HTML kopieren"
- Der komplette Newsletter-HTML-Code wird in die Zwischenablage kopiert (Bestätigungsnachricht erscheint)

**② Empfänger eingeben**
- E-Mail-Adressen direkt in das Empfängerfeld eingeben, getrennt durch Semikolon `;`, Komma `,` oder Zeilenumbruch
- Oder eine **CSV-Datei hochladen**, die E-Mail-Adressen in der ersten Spalte enthält

**③ Mail öffnen**
- Klick auf „② 📧 Mail öffnen"
- Dein E-Mail-Programm (Outlook, Thunderbird etc.) öffnet sich mit BCC-Empfängern und Betreff vorbelegt
- Den kopierten HTML-Inhalt manuell in den Mail-Body einfügen

> **Tipp:** In Outlook: Nachrichtenfenster öffnen → „HTML-Quellcode" oder direkt pasten. Die meisten Clients rendern den HTML-Code automatisch korrekt.

---

## HTML Export

Burger-Menü → **„HTML Export"** lädt eine vollständige, responsive HTML-Datei des Newsletters herunter. Diese kann als Archiv gespeichert oder an Dritte weitergegeben werden.

---

## Live-Vorschau umschalten

Oben rechts in der Vorschau:
- **„📱 Mobile"** – Vorschau im Smartphone-Format (375px Breite)
- Wiederholen für Desktop-Ansicht zurückwechseln

---

## Split-Pane anpassen

Den vertikalen Trenner zwischen „Aktive Blöcke" und „Live-Vorschau" ziehen, um die Breite beider Bereiche anzupassen. Die Einstellung wird automatisch gespeichert und beim nächsten Start wiederhergestellt.

---

## Header & Footer im Überblick

| Element | Position | Konfigurierbar über |
|---------|----------|---------------------|
| DAV-Logo (lokal) | Links oben | – (fest, `images/dav-logo.png`) |
| Datum | Rechts oben | Einstellungen → Datum |
| Redaktion | Unten (Footer) | Einstellungen → Redaktion |

---

## Häufige Fragen

**Wo werden meine Entwürfe gespeichert?**
Im Browser-LocalStorage. Sie bleiben erhalten, solange du denselben Browser und dasselbe Gerät verwendest. Cache löschen entfernt sie.

**Kann ich Bilder direkt hochladen?**
Nein – Bilder werden nur per URL eingebettet. Nutze Links von asphalt.de, einem CDN oder einem Bilderdienst wie imgur.com.

**Warum muss ich den HTML-Code manuell in die Mail einfügen?**
E-Mail-Clients unterstützen keinen HTML-Body über `mailto:`-Links. Der Kopier-Schritt umgeht diese Beschränkung sauber und gibt volle Kontrolle über das Ergebnis.

**Kann ich den Editor offline nutzen?**
Nein – Tailwind CSS und Sortable.js werden von einem CDN geladen. Ohne Internet sind die Styles und Drag & Drop nicht verfügbar. Das DAV-Logo wird jedoch lokal aus `images/dav-logo.png` geladen.

**Wie ändere ich das DAV-Logo im Header?**
Die Datei `images/dav-logo.png` durch ein eigenes Bild ersetzen (gleicher Dateiname, Format PNG). Die Vorschau aktualisiert sich beim Neuladen der Seite.

---

## Menü-Übersicht (Burger-Menü ☰)

| Aktion | Beschreibung |
|--------|-------------|
| 📝 Neu | Leeren Newsletter erstellen |
| 💾 Speichern | Aktuellen Entwurf speichern |
| 📋 Duplizieren | Kopie des aktuellen Entwurfs erstellen |
| 📂 Entwürfe laden | Gespeicherte Entwürfe anzeigen und laden |
| ⚙️ Einstellungen | Datum & Redaktion konfigurieren |
| 📧 Mail öffnen | HTML kopieren + E-Mail-Clients vorbereiten |
| 📄 HTML Export | Vollständigen Newsletter als HTML-Datei herunterladen |
