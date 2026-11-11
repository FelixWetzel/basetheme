# BüroBüro Basis-Theme

Neutrale Shopify-Theme-Basis, entstanden aus dem Herrrichter-Shop. Für einen
neuen Shop diesen Stand kopieren und dann in den Theme-Einstellungen anpassen.

## Einrichten für einen neuen Shop

**Theme-Einstellungen → Logo**
- **Logo**: Header. SVG oder PNG mit transparentem Hintergrund, eng auf die Buchstaben zugeschnitten.
- **Großes Logo**: bildschirmbreit in Footer, Logo-Intro, Screensaver und Passwortseite (leer = Header-Logo).
- **Signet**: Kurzform; im Header beim Scrollen und optional auf Hero-Bannern (leer = Logo bleibt stehen).
- **Logo einfärben**: an für einfarbige Logos (nehmen automatisch hell/dunkel an), aus für mehrfarbige.
- **Favicon**: quadratisch, mind. 180 × 180 px (leer = Signet).

Ohne hochgeladenes Logo wird der Shopname als Text angezeigt.

**Theme-Einstellungen → Typografie**
- Schrift aus der Shopify-Schriftbibliothek wählen, oder
- „Eigene Schriftdatei“: `.woff2` in `assets/` legen (oder unter Inhalte → Dateien hochladen
  und die URL eintragen) und Namen + Dateiname eintragen.
  Beispiel Herrrichter: Name `Denim INK`, Datei `DenimINK-Regular.woff2`, OpenType-Features `"ss02" 1`,
  im Menü `"ss02" 1, "case" 1, "ss04" 1`.

**Inhalte**
- Alle Texte in `templates/*.json`, `sections/header-group.json` und `sections/footer-group.json`
  sind Platzhalter („Überschrift“, „Platzhaltertext …“, „Frage 1?“), Bilder und Produkte sind leer.
- Impressum, Kontakt, Versand und AGB unbedingt mit den echten Angaben des Shops füllen.
- Copyright im Footer: `{{ shop }} ©{{ year }}` aus `locales/de.default.json` (Shopname und Jahr automatisch).

## Lokal entwickeln

```
shopify theme dev --store=<shop>.myshopify.com
```
