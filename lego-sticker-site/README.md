# Kopfsache – Marketing-Testseite für Gesichtssticker für Minifiguren

Landingpage für einen **Smoke-Test**: Gibt es genug Menschen, die Gesichtssticker aus ihrem eigenen Foto für
Minifiguren kaufen würden, *bevor* das Produkt gebaut wird? Echtes Foto (natürlich oder mit Filter) oder illustriert.

Besucher:innen können

- mit einem eigenen Foto eine **Live-Vorschau** ausprobieren: als echtes Foto mit Filtern (Original, Leuchtend, Warm,
  S/W, Vintage, Gelb) samt Filterstärke oder illustriert (Klassik, Comic, Pop-Art). Läuft komplett im Browser, nichts
  wird hochgeladen,
- in der Preistabelle auf **„Vorbestellen“** klicken (Fake-Door: Statt einer Kasse öffnet sich die Warteliste),
- sich in die **Warteliste** eintragen, mit freiwilligen Angaben zu Paket, Anlass und Preisbereitschaft.

Die Anmeldung läuft per **Double-Opt-in über Brevo**. Alle Interesse-Signale landen cookiefrei in einer eigenen
**Auswertung unter `/stats`**.

**Stack:** Vue 3 + Vite (Frontend), Node.js + Express (API), Brevo (`@getbrevo/brevo`) für Kontakte und E-Mails.

---

## Schnellstart

```bash
cd lego-sticker-site
npm install
cp .env.example .env      # optional – ohne Brevo-Daten läuft alles im Dev-Modus
npm run dev               # Vite auf :5173 + API auf :3001
```

Öffne <http://localhost:5173>. Ohne Brevo-Konfiguration wird der Bestätigungslink nach dem Eintragen im Terminal
**und** direkt im Formular angezeigt, sodass du den ganzen Ablauf ohne E-Mail-Versand testen kannst.

Für die Auswertung `STATS_TOKEN=irgendwas` in die `.env` schreiben und <http://localhost:5173/stats> öffnen.

```bash
npm test                  # Backend-Tests (Token, Validierung, Statistik, API-Ablauf mit Brevo-Mock)
npm run build             # Produktions-Build nach dist/
```

## Brevo einrichten

1. **Absender verifizieren:** Brevo → *Absender, Domains & IPs*. Die Absender-Adresse hinzufügen und die Domain
   authentifizieren (DKIM/DMARC), sonst landen die Mails schnell im Spam.
2. **API-Schlüssel erzeugen:** Brevo → *Einstellungen → SMTP & API → API-Schlüssel*.
3. In der `.env` eintragen: `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME`, dazu ein langes `APP_SECRET`
   (Befehl steht in `.env.example`).
4. Einmalig ausführen:

   ```bash
   npm run brevo:setup
   ```

   Das Skript legt die Kontakt-Attribute an (`FIRSTNAME`, `PAKET`, `ANLASS`, `PREIS_SOLO`, `STIL`, `QUELLE`,
   `KAMPAGNE`, `OPT_IN_AM`), erstellt die Liste „Kopfsache – Warteliste“, gibt deren ID aus und prüft den Absender.
5. Die ausgegebene `BREVO_LIST_ID` in die `.env` eintragen und die API neu starten.
6. Optional: `NOTIFY_EMAIL` setzen, dann bekommst du bei jeder bestätigten Anmeldung eine kurze Mail.

### So läuft eine Anmeldung ab

```
Formular ──POST /api/signup──▶ Server signiert die Angaben (HMAC) in einen Link
                                └─▶ Brevo: Bestätigungsmail mit Link (7 Tage gültig)
Klick auf den Link ──GET /api/confirm──▶ Signatur prüfen
                                └─▶ Brevo: Kontakt anlegen/aktualisieren + in die Liste
                                └─▶ Brevo: Willkommensmail (+ optional Info an dich)
                                └─▶ Weiterleitung auf /bestaetigt
```

- Vor der Bestätigung wird **nichts Personenbezogenes gespeichert**: Die Angaben stecken signiert im Link.
- Auf dem eigenen Server landen nur ein Pseudonym (gehashte E-Mail) und die freiwilligen Antworten. Die Adresse
  selbst liegt nur in Brevo.
- In Brevo kannst du danach nach Paket, Anlass, Preisbereitschaft oder Kampagne segmentieren und zum Start eine
  Kampagne an die Liste schicken (mit Abmeldelink, den Brevo automatisch einfügt).
- Spam-Schutz: Honeypot-Feld, Rate-Limit pro IP, Bots werden aus der Statistik gefiltert.

## Kaufinteresse messen

Die Auswertung unter `/stats` (geschützt mit `STATS_TOKEN`) zeigt für 7, 30, 90 oder 365 Tage:

| Kennzahl | Was sie dir sagt |
|---|---|
| **Bestätigte Anmeldungen** und **Anmeldequote** (pro Seitenaufruf) | Das Hauptsignal: Wie viele Besucher:innen wollen das wirklich? |
| **Trichter:** Aufrufe → Formular begonnen → abgeschickt → bestätigt | Wo springen Leute ab? |
| **„Vorbestellen“-Klicks nach Paket** | Welches Paket bzw. welcher Preispunkt zieht? |
| **Preisbereitschaft, Anlass, Look** (aus den Anmeldungen) | Für wen, zu welchem Preis und lieber echtes Foto oder Illustration? |
| **Quelle** (UTM bzw. verweisende Seite) | Welcher Kanal bringt Interessent:innen, nicht nur Klicks? |
| **Vorschau genutzt**, CTA-Klicks, geöffnete FAQ | Wie stark beschäftigen sich Leute mit dem Produkt? |

**Tipp:** Jede Anzeige oder jeder Post bekommt einen eigenen Link mit UTM-Parametern, z. B.
`https://deine-domain.de/?utm_source=instagram&utm_medium=paid&utm_campaign=hochzeit-1`. So kannst du Zielgruppen
und Botschaften gegeneinander testen. Lege dir vorher fest, ab welcher Anmeldequote du weitermachst. Belastbar wird
das erst ab einigen hundert Besucher:innen pro Variante.

Die Rohdaten liegen als JSON-Lines in `data/` (`events.jsonl`, `signups.jsonl`). Es gibt keine Cookies und keine
IP-Adressen, und es wird nichts gespeichert, das einzelne Besucher:innen wiedererkennt.

## Anpassen

Fast alles steht in **`shared/site.config.js`**: Markenname, Startzeitraum, Frühbucher-Rabatt, Pakete und Preise,
Stile, Anlässe und Preisspannen. Frontend, E-Mails und `index.html` lesen die Werte von dort.

| Datei | Inhalt |
|---|---|
| `src/components/` | Abschnitte der Seite (Hero, Ablauf, Vorschau, Anlässe, Preise, FAQ, Formular) |
| `src/lib/stylize.js` | Bildfilter für die Vorschau (Foto-Filter und Illustrationsstile) |
| `src/lib/track.js` | Cookiefreies Event-Tracking |
| `server/mails.js` | Texte der Bestätigungs-, Willkommens- und Info-Mail |
| `server/app.js` | API-Routen |

## Produktivbetrieb

```bash
npm ci && npm run build
NODE_ENV=production npm start     # Express liefert dist/ aus und stellt /api bereit
```

- Läuft auf jedem Node-Host ab Version 22.9, z. B. ein VPS, Render, Railway oder Fly.io. **Nur eine Instanz** betreiben,
  weil Statistik und Rate-Limit lokal gehalten werden.
- `data/` braucht dauerhaften Speicher (Volume), sonst ist die Statistik nach einem Deployment weg. Die Anmeldungen selbst
  sind sicher in Brevo.
- `PUBLIC_URL` auf die echte Domain setzen (wird in E-Mail-Links verwendet). Hinter einem Reverse Proxy zusätzlich
  `TRUST_PROXY=1` setzen.
- In Produktion sind `APP_SECRET` und die Brevo-Daten Pflicht: Ohne sie startet der Server nicht bzw. lehnt Anmeldungen ab.

## Vor dem Livegang

- [ ] **Impressum** und **Datenschutzerklärung** ausfüllen (Platzhalter sind gelb markiert) und rechtlich prüfen lassen.
      Mit Brevo einen Auftragsverarbeitungsvertrag (AVV) abschließen.
- [ ] `contactEmail` in `shared/site.config.js` setzen.
- [ ] **Produktversprechen prüfen:** „wasserfest“, „rückstandsfrei ablösbar“, „passt auf Standard-Minifiguren“,
      Paketinhalte und Preise sind Annahmen für den Test. Nur stehen lassen, was ihr auch liefern wollt.
- [ ] **Markenrecht:** „LEGO“ nur beschreibend verwenden (wie hier mit ®-Hinweis). Nicht im Markennamen, in der Domain
      oder in Anzeigentiteln.
- [ ] Ehrlichkeit beim Fake-Door: Die Seite sagt überall, dass die Bestellung erst später öffnet und der Eintrag
      kostenlos ist. Das sollte so bleiben.
