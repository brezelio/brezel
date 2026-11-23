# Gruppenchats

Stand: 23.11.2026. **Erste Version umgesetzt (API und SPA), lokal getestet; noch nicht ausgerollt.**

## Ziel

Gruppenchats wie in WhatsApp, Telegram oder Slack: Ein oder mehrere Admins verwalten die Mitglieder – Menschen und
Agenten. Agenten verhalten sich wie in Kontext-Chats und antworten nur auf @Erwähnung.

**KISS:** Gruppen sind ein weiterer Chat-Typ und nutzen dieselben Bausteine wie Kontext-Chats (Nachrichten,
Erwähnungen, Agentenläufe, Pushes, Live-Updates). Keine eigene Rechte- oder Sichtbarkeitslogik je Betrachter.

## Entscheidungen (23.11.2026)

- **Jeder Mensch darf Gruppen erstellen** und ist darin Admin. Es gibt immer mindestens einen Admin.
- **Admins** fügen Menschen und Agenten hinzu, entfernen sie, machen andere zu Admins (und nehmen das wieder) und
  ändern den Gruppennamen. **Jedes Mitglied** kann die Gruppe verlassen; der letzte Admin nur, wenn er zuvor einen
  anderen Admin bestimmt hat oder sonst niemand mehr in der Gruppe ist.
- **Agenten antworten nur auf @Erwähnung.** Erwähnbar sind **nur aufgenommene Agenten und der eigene Proxy**.
- **Sichtbarkeit wie im Kontext-Chat:** Fragen an Agenten und ihre Antworten sind für alle Mitglieder sichtbar,
  auch beim eigenen Proxy. **Keine Sichtbarkeit nach Organigramm.** Das Organigramm prüft wie überall nur, ob der
  Fragende den Agenten nutzen darf.
- **Zugriff nur für Mitglieder** (nicht über einen Datensatz wie Kontext-Chats), wie bei Direkt-Chats; Root
  behält wie dort Lesezugriff.
- **Organigramm beim Aufnehmen (23.11.2026):**
  - Agenten nimmt man nur auf, wenn man sie laut Organigramm selbst nutzen darf (gleiche Prüfung wie beim Start
    eines Agenten-Chats). Niemand holt sich so den Assistenten der Geschäftsführung in die Gruppe.
  - Menschen erreicht man selbst nur in der **eigenen Einheit und darunter**, nie Vorgesetzte (auch nicht, wenn sie
    zur selben Einheit gehören) und keine Nachbar-Abteilungen. **Das gilt auch für Direkt-Chats** und das Verzeichnis.
    Wer darüber steht, erreicht einen dagegen: Seine Chats und Gruppen stehen einem als Mitglied offen.
  - Organisations-Overrides entscheiden zuerst; ohne Organigramm und für Root keine Einschränkung.
  - Umgesetzt als `OrganizationHierarchy::reaches()`, genutzt von `ChatVisiblePeople` (Verzeichnis, Direkt-Chat,
    Gruppen).
- **Erste Version klein:** Name, Mitglieder, Admins, Verlassen. Keine Einladungslinks, keine Beschreibung, kein
  „nur Admins schreiben“, kein eigenes Gruppenbild (Avatar aus Farbe und Initialen).

## Umsetzung

### Daten (brezel/api)

- `chat_sessions.type = 'group'`, `context_key = 'group:<uuid>'`, Titel = Gruppenname (`title_source = 'manual'`).
- `chat_session_memberships.role` (`admin` | `member`, Standard `member`). Das vorhandene `source` taugt nicht als
  Rolle: es wird beim Lesen und Schreiben überschrieben.
- Neue Tabelle `chat_session_agents` (`session_id`, `agent_identifier`, `added_by_user_id`, Zeitstempel, eindeutig je
  Gruppe und Agent). Agenten haben nicht verlässlich einen eigenen Nutzer; die Nutzer-Mitgliedschaften gehen überall
  von Menschen aus (Pushes, Live-Updates, ungelesen).

### API

- `POST chat/groups` `{title, user_ids[], agent_identifiers[]}`: legt die Gruppe an, Ersteller ist Admin.
- `GET chat/sessions/{session}/members`: Menschen (mit Rolle, Bild, Verfügbarkeit) und Agenten.
- `PUT chat/sessions/{session}/members` `{user_ids_add, user_ids_remove, agents_add, agents_remove, admins_add, admins_remove}`
  nur für Admins; `PUT …/title` für Gruppen nur für Admins; `POST …/leave` für jedes Mitglied.
- Hinzufügbar sind Menschen aus dem Chat-Verzeichnis (dieselbe Sichtbarkeit wie beim Start eines Direkt-Chats) und
  aktive, nicht-proxy Agenten.
- Änderungen erscheinen als Systemhinweis im Verlauf („Anna hat Ben hinzugefügt“) und als Live-Update der Sitzung.
- Zugriff (`ChatAccessService`): `group` wie `direct` – nur Mitglieder.
- Erwähnungen: in Gruppen nur aufgenommene Agenten und Proxy-Aliasse (`@proxy`, `@agent`); andere werden als normaler
  Text behandelt. Menschen-Erwähnungen wie im Kontext-Chat, aber nur Mitglieder.
- Sichtbarkeit: `agentVisibility` behandelt `group` wie `entity` → öffentlich.
- Agentenkontext: Hinweis, dass in einer Gruppe geantwortet wird und alle Mitglieder mitlesen; Transkript wie im
  Kontext-Chat.

### SPA

- „Neue Gruppe“ im Chat-Start: Name, Menschen und Agenten auswählen.
- Chatliste: Gruppen-Eintrag mit Avatar (Initialen in Farbe), Vorschau mit Absendername.
- Kopfzeile: Gruppenname, Untertitel mit Mitgliederzahl; Menüpunkt „Mitglieder“ öffnet die Mitgliederansicht.
- Mitgliederansicht: Menschen mit Rolle und Status-Punkt, Agenten; Admins können hinzufügen, entfernen, zu Admins
  machen und den Namen ändern; jeder kann die Gruppe verlassen.
- Composer: in Gruppen nur aufgenommene Agenten und der eigene Proxy als @-Vorschläge, Menschen nur Mitglieder.

### Nebenbei behobene Fehler

- Der Proxy einer anderen Person war über seinen Bezeichner erwähnbar; der Lauf scheiterte am Organigramm und die
  Fehlermeldung landete öffentlich im Chat.
- Eine Reaktion auf die Proxy-Antwort einer anderen Person startete den Agenten für den Falschen (gleicher Fehler).
- Die SPA verwarf das Feld `internal` der Agenten aus dem Verzeichnis; interne Agenten wurden deshalb nicht
  eingeklappt (ADR 0005) und landeten auch in Auswahllisten.

### Bewusst offen

- Ändert sich eine Gruppe (Mitglieder entfernt), sehen Entfernte den Eintrag bis zum nächsten Laden noch in ihrer
  Liste; Öffnen scheitert dann am Zugriff.
- Hinweise („Anna hat Ben hinzugefügt“) entstehen in der Sprache dessen, der die Änderung macht.
