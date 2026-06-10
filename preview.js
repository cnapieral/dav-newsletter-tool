/**
 * preview.js – Live-Vorschau und HTML-Export
 *
 * Wandelt die Blocks in das finale HTML für die Vorschau um.
 */

const Preview = (function() {
    'use strict';

    // Header/Footer aus newsletter_dav.html (stripped down)
    const HEADER = `<!-- HEADER / LOGO -->
<tr>
  <td class="content-padding" style="padding:28px 32px 20px 32px;background-color:#FFFFFF;text-align:center;border-bottom:1px solid #EEEEEE;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="vertical-align:middle;">
          <img src="https://asphalt.de/wp-content/uploads/2025/03/cropped-DAV_asphalt_Logo.png" alt="DAV Logo" width="200" style="display:block;margin:0 auto;" />
        </td>
        <td align="right" style="vertical-align:middle;font-size:12px;color:#999999;padding-top:8px;">
          Newsletter | {{DATE}}
        </td>
      </tr>
    </table>
  </td>
</tr>

<!-- HERO SECTION -->
<tr>
  <td style="background:linear-gradient(135deg,#2D2D2D 0%,#4A4A4A 100%);padding:48px 32px;text-align:center;">
    <h1 class="hero-title" style="margin:0;font-size:26px;line-height:34px;color:#FFFFFF;font-weight:bold;">
      Aus der Verbandswelt
    </h1>
    <p style="margin:8px 0 0 0;font-size:15px;line-height:22px;color:#CCCCCC;">
      LCA-Ergebnisse, neue Stellen &amp; wichtige Kl&auml;rungen<br />Das sind die aktuellen Meldungen vom DAV.
    </p>
  </td>
</tr>

<!-- EINLEITUNG -->
<tr>
  <td class="content-padding" style="padding:32px 32px 8px 32px;">
    <p style="font-size:15px;line-height:24px;color:#333333;margin:0;">
      <strong>Liebe Kolleginnen und Kollegen,</strong><br /><br />
      die letzten Wochen haben im DAV viel bewegt &mdash; von neuen LCA-Ergebnissen f&uuml;r polymermodifiziertes Bitumen bis hin zur endg&uuml;ltigen Kl&auml;rung der EBV-Frage. In dieser Ausgabe bringen wir Sie auf den neuesten Stand und informieren Sie au&szlig;erdem &uuml;ber unser Wachstum: Wir stellen ein!
    </p>
  </td>
</tr>`;

    const FOOTER = `<!-- DIVIDER -->
<tr>
  <td style="padding:32px 32px 0 32px;">
    <div style="border-top:1px solid #EEEEEE;"></div>
  </td>
</tr>

<!-- FOOTER -->
<tr>
  <td class="content-padding" style="padding:24px 32px 32px 32px;text-align:center;">
    <p style="margin:0 0 8px 0;font-size:16px;font-weight:bold;color:#2D2D2D;">
      Deutscher Asphaltverband e.V.
    </p>
    <p style="margin:0 0 4px 0;font-size:12px;color:#999999;">
      Newsletter | Juni 2026 | Redaktion: Alex Rivera
    </p>
    <p style="margin:0 0 16px 0;font-size:11px;line-height:18px;color:#AAAAAA;">
      Sie erhalten diese E-Mail, weil Sie sich f&uuml;r den DAV-Newsletter angemeldet haben.
    </p>

    <!-- Footer Links -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
      <tr>
        <td style="padding:4px;text-align:center;">
          <a href="https://asphalt.de/impressum/" style="font-size:12px;color:#E30613;text-decoration:none;margin:0 8px;">Impressum</a>
        </td>
        <td style="padding:4px;color:#CCCCCC;text-align:center;">|</td>
        <td style="padding:4px;text-align:center;">
          <a href="https://asphalt.de/direktkontakt/" style="font-size:12px;color:#E30613;text-decoration:none;margin:0 8px;">Kontakt</a>
        </td>
      </tr>
    </table>

    <!-- Social -->
    <p style="margin:16px 0 0 0;font-size:11px;color:#CCCCCC;">
      <a href="https://de.linkedin.com/company/deutscher-asphaltverband-dav-e-v" style="color:#999999;text-decoration:none;">LinkedIn</a> &nbsp;&middot;&nbsp;
      <a href="https://asphalt.de/" style="color:#999999;text-decoration:none;">asphalt.de</a>
    </p>

    <p style="margin:16px 0 0 0;font-size:11px;color:#CCCCCC;">
      &copy; 2026 Deutscher Asphaltverband e.V. | Alle Rechte vorbehalten.
    </p>
  </td>
</tr>`;

    /**
     * Wandelt einen Freitext-Block in HTML um
     */
    function freitextToHTML(data) {
        const content = escapeHtml(data.content || '');
        return `
<tr>
  <td class="content-padding" style="padding:32px 32px 8px 32px;">
    ${data.showTitle ? `<h2 style="margin:0 0 16px 0;font-size:20px;line-height:26px;color:#2D2D2D;font-weight:bold;">${escapeHtml(data.title || '')}</h2>` : ''}
    <p style="font-size:14px;line-height:22px;color:#333333;margin:0;">
      ${content.replace(/\n/g, '<br />')}
    </p>
  </td>
</tr>`;
    }

    /**
     * Wandelt einen Artikel-Link-Block in HTML um
     */
    function artikelToHTML(data) {
        const url = data.url || '#';
        const title = escapeHtml(data.title || 'Artikel');
        const content = escapeHtml(data.content || '');

        return `
<tr>
  <td class="content-padding" style="padding:32px 32px 8px 32px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="border-left:4px solid #E30613;padding-left:16px;">
          <h2 class="article-title" style="margin:0 0 4px 0;font-size:20px;line-height:26px;color:#2D2D2D;font-weight:bold;">
            ${title}
          </h2>
        </td>
      </tr>
    </table>
    ${data.content ? `
    <p class="content-padding" style="padding:0 32px 16px 32px;font-size:14px;line-height:22px;color:#333333;margin:0;">
      ${content.replace(/\n/g, '<br />')}
    </p>` : ''}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="padding-top:12px;">
          <a href="${url}" style="display:inline-block;padding:10px 24px;font-size:13px;font-weight:bold;color:#FFFFFF;text-decoration:none;background-color:#E30613;border-radius:3px;">Zum Artikel &rarr;</a>
        </td>
      </tr>
    </table>
  </td>
</tr>`;
    }

    /**
     * Wandelt einen Termin-Block in HTML um
     */
    function terminToHTML(data) {
        const events = data.events || [];
        if (!events.length) return '';

        let html = `
<tr>
  <td class="content-padding" style="padding:32px 32px 8px 32px;">
    <h2 class="section-title" style="margin:0;font-size:18px;line-height:24px;color:#2D2D2D;font-weight:bold;padding-bottom:16px;border-bottom:2px solid #E30613;">
      Termine & Veranstaltungen
    </h2>
  </td>
</tr>`;

        events.forEach(event => {
            if (event.title) {
                html += `
<tr>
  <td class="content-padding" style="padding:16px 32px 8px 32px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;background-color:#FAFAFA;border-radius:4px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 2px 0;font-size:11px;color:#999999;text-transform:uppercase;">${escapeHtml(event.date || '')}</p>
          <p style="margin:0 0 6px 0;font-size:14px;font-weight:bold;color:#E30613;">${escapeHtml(event.title)}</p>
          ${event.link ? `<a href="${escapeHtml(event.link)}" style="font-size:12px;color:#E30613;text-decoration:none;font-weight:bold;">Weiterlesen &rarr;</a>` : ''}
        </td>
      </tr>
    </table>
  </td>
</tr>`;
            }
        });

        return html;
    }

    /**
     * Wandelt einen Divider-Block in HTML um
     */
    function dividerToHTML(data) {
        const color = data.color || '#E5E7EB';
        return `
<tr>
  <td style="padding:32px 32px 0 32px;">
    <div style="border-top:1px solid ${color};"></div>
  </td>
</tr>`;
    }

    /**
     * Wandelt einen Social-Media-Block in HTML um
     */
    function socialToHTML(data) {
        const links = data.links || [];
        if (!links.length) return '';

        let html = `
<tr>
  <td class="content-padding" style="padding:32px 32px 8px 32px;">
    <h2 class="section-title" style="margin:0;font-size:18px;line-height:24px;color:#2D2D2D;font-weight:bold;padding-bottom:16px;border-bottom:2px solid #E30613;">
      Folgen Sie uns
    </h2>
  </td>
</tr>
<tr>
  <td class="content-padding" style="padding:16px 32px 8px 32px;">`;

        links.forEach(link => {
            if (link.name && link.url) {
                html += `
    <a href="${escapeHtml(link.url)}" style="display:inline-block;padding:8px 16px;font-size:14px;color:#E30613;text-decoration:none;margin:4px;background-color:#FAFAFA;border-radius:3px;">${escapeHtml(link.name)}</a>`;
            }
        });

        html += `
  </td>
</tr>`;

        return html;
    }

    /**
     * Wandelt einen Bild-Block in HTML um
     */
    function imageToHTML(data) {
        const url = data.url || '';
        const alt = escapeHtml(data.alt || 'Bild');
        const caption = data.caption ? `<p style="margin:12px 0 0 0;font-size:12px;color:#999999;">${data.caption}</p>` : '';
        const alignStyle = data.align === 'center' ? 'text-align:center;' :
                           data.align === 'left' ? 'float:left;margin-right:16px;' :
                           data.align === 'right' ? 'float:right;margin-left:16px;' : '';

        return url ? `
<tr>
  <td class="content-padding" style="padding:32px 32px 8px 32px;">
    <div style="${alignStyle}">
      <img src="${url}" alt="${alt}" style="display:block;max-width:100%;border-radius:4px;" width="600">
      ${caption}
    </div>
  </td>
</tr>` : '';
    }

    /**
     * Konvertiert alle Blocks in HTML
     */
    function blocksToHTML(blocks) {
        return blocks.map(block => {
            const data = block.data || {};
            switch (block.type) {
                case 'freitext': return freitextToHTML(data);
                case 'artikel': return artikelToHTML(data);
                case 'termin': return terminToHTML(data);
                case 'divider': return dividerToHTML(data);
                case 'social': return socialToHTML(data);
                case 'image': return imageToHTML(data);
                default: return '';
            }
        }).join('\n');
    }

    /**
     * Newsletter-Einstellungen (global, per Setter konfigurierbar)
     */
    var settings = {
        date: 'Juni 2026'
    };

    /**
     * Setzt den Header-Datumsstring
     */
    function setDate(dateStr) {
        settings.date = dateStr || '';
    }

    /**
     * Gibt die aktuellen Einstellungen zurück
     */
    function getSettings() {
        return settings;
    }

    /**
     * Erstellt das vollständige HTML für die Vorschau
     */
    function createPreviewHTML(blocks) {
        const contentHtml = blocksToHTML(blocks);
        const dateStr = settings.date || '';

        var html = `<!DOCTYPE html>
<html lang="de" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DAV Newsletter – Vorschau</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body { margin: 0; padding: 0; min-width: 100%; background-color: #F4F4F4; }
    .email-container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; }
    table { border-spacing: 0; border-collapse: collapse; }
    td { padding: 0; margin: 0; }
    img { display: block; border: 0; }

    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; }
      .content-padding { padding: 16px !important; }
      .hero-title { font-size: 22px !important; line-height: 28px !important; }
      .article-title { font-size: 18px !important; line-height: 24px !important; }
      .section-title { font-size: 16px !important; line-height: 22px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#F4F4F4;font-family:Inter, Arial, Helvetica, sans-serif;color:#333333;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F4F4F4;">
    <tr>
      <td align="center" style="padding-top:20px;padding-bottom:20px;">
        <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFFFFF;max-width:600px;margin:auto;">
          <!-- Top Accent Bar -->
          <tr>
            <td style="height:5px;background-color:#E30613;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

${HEADER}

${contentHtml}

          ${FOOTER}
        </table>
      </td>
    </tr>
    <tr>
      <td style="height:5px;background-color:#E30613;font-size:0;line-height:0;">&nbsp;</td>
    </tr>
  </table>
</body>
</html>`;

        return html.replace('{{DATE}}', dateStr);
    }

    /**
     * Hilfsfunktion: HTML-Entities escapen
     */
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Öffentliche API
    return {
        createPreviewHTML,
        blocksToHTML,
        escapeHtml,
        setDate,
        getSettings,
        HEADER,
        FOOTER
    };

})();
