# Agent-Antworten melden und in der Console analysieren

Stand: 12.11.2026. **Implementierung lokal in Arbeit; noch nicht veröffentlicht oder ausgerollt.**

## Ziel

Nutzer sollen eine problematische Agent-Antwort direkt melden können. Brezel-Admins erhalten die Meldung samt
verfügbarem Diagnosekontext in der Cloud Console, um Fehlverhalten zu verstehen und Verbesserungen abzuleiten –
auch mithilfe anderer Agenten. Dafür müssen sie sich nicht in die Kundeninstanz einloggen.

**KISS: native Chatfunktion im Framework; Console mit Brezel-Modulen, Workflows, Rollen, Layouts und Widgets.** Keine eigene Ticket-Plattform,
kein Live-Supportzugang und kein umfangreiches Freigabemanagement.

## Festgelegter Umfang

- **Nur in der Console ein Meldungs-Modul.** Kein zusätzliches Meldungs-Modul in Kundeninstanzen.
- Instanzen sammeln den Kontext und senden einen Snapshot an die Console. Normale Workflow-Ausführungen,
  technische Logs und notwendige Verarbeitung in der Instanz sind erlaubt. Kein Verbot lokaler Persistierung als
  technische Nebenbedingung; es geht darum, keine zweite fachliche Meldungsverwaltung zu bauen.
- Nutzer bestätigen ausdrücklich, dass die Meldung und der dazugehörige Diagnosekontext an Brezel-Admins gehen.
- **Vorerst keine Rücknahmefunktion und keine automatische Löschung nach X Tagen.** Die Meldungen bleiben für
  die Analyse verfügbar. Aufbewahrung vor breiterem Produktivbetrieb neu bewerten; kein entsprechender Zusatz im Hinweistext.
- Verfügbare Daten verwenden. Fehlende oder nicht übertragbare Teile kennzeichnen, statt den ganzen Report zu blockieren.
- Keine Originaldateien, vollständigen Repositories oder Instanz-/Datenbankexporte im ersten Umfang.
- Keine automatische Fehlerbehebung, Wiederholung von Toolcalls oder Änderung der Kundeninstanz durch eine Meldung.

## Kunden-UX

### Aktion an der Antwort

Kleines Warndreieck (`mdi:alert-outline`) in der vorhandenen Footer-Zeile neben Zeit, Details und Kopieren:

- Tooltip und `aria-label`: **„Antwort melden“**.
- Auch mobil und per Tastatur bedienbar, ausreichende Touchfläche.
- An gespeicherten Agent-Antworten einschließlich Fehlerantworten, nicht an menschlichen Nachrichten oder
  Thinking-Bubbles ohne Server-ID.
- Nur anbieten, wenn die Instanz den Meldeweg unterstützt.

### Nativer Popconfirm

Klick öffnet einen Ant-`a-popconfirm` am Auslöser, mit optionalem Kommentarfeld:

> **Antwort an Brezel melden?**
>
> Mit Ihrer Bestätigung senden Sie diese Antwort und den zugehörigen Diagnosekontext an die Brezel-Admins.
> Dazu gehören der relevante Chatverlauf, verfügbare Modellanfragen sowie Werkzeugaufrufe und Ergebnisse.
> Der Kontext kann persönliche oder geschäftliche Informationen enthalten, auch aus Daten, auf die der Agent
> zugegriffen hat. Die Meldung wird bei Brezel zur Fehleranalyse gespeichert und kann dort auch mit
> KI-Unterstützung ausgewertet werden.
> Es entsteht kein allgemeiner Zugang zu Ihrer Instanz.

Darunter **„Was war falsch? (optional)“**. Aktionen: **„Abbrechen“** / **„An Brezel senden“**.
Bei Bedarf mobil einen breiteren Popconfirm verwenden, keinen zusätzlichen mehrstufigen Freigabeassistenten.

- Vor Bestätigung keine Diagnoseinhalte an die Console senden.
- Während des Versands Doppelklick verhindern.
- Nach zentraler Empfangsbestätigung: **„Meldung gesendet · <Report-ID>“**.
- Bei Fehler nicht „gemeldet“ behaupten, sondern Wiederholen anbieten. Bei verlorener Empfangsbestätigung ist
  der Status zunächst unbekannt; erneuter Versand mit gleicher ID wird zentral dedupliziert.
- Kein dauerhaftes lokales Meldungsregister oder Statusmanagement nötig. Ein UI-Hinweis nach erfolgreichem Versand reicht.

## Welche Daten werden übertragen?

Ausgangspunkt ist die gemeldete Nachricht. Das Backend löst zugehörige Session, Unterhaltung und Run selbst auf;
der Browser übermittelt keine beliebige Liste exportierbarer Run-/Datei-IDs.

| Bereich | Inhalt |
|---|---|
| Meldung | Stabile Report-ID, Zeitpunkt, Instanzreferenz, Zielnachricht, Melderreferenz, optionaler Kommentar, Version des bestätigten Hinweises |
| Gespräch | Gemeldete Antwort und bis zu 20 vorherige, für den Melder sichtbare Nachrichten derselben Session; keine späteren Nachrichten |
| Auftrag | Run-Auftrag, Trigger, damaliger Arbeitskontext und verfügbare Kontext-Snapshots |
| Modellrunden | Verfügbare historische Provider-Anfragen mit Instruktionen, Nachrichten, Tool-Schemas, Modell und API-Modus; gespeicherte Antworten/Zwischentexte soweit vorhanden |
| Werkzeuge | Name, Call-ID, Inputs, Ergebnisse, Fehler, Start/Ende und verfügbare Änderungsquittungen |
| Modellansicht | Bei gekürzten Tool-Ergebnissen zusätzlich die tatsächlich ans Modell gelieferte Ansicht, getrennt vom gespeicherten vollständigen Ergebnis |
| Delegation | Zugehörige Unterläufe mit Auftrag, Ergebnissen und verfügbarer Timeline; keine anderen Chats desselben Agenten |
| Rückfragen | Freigabe-/Rückfrageereignisse und Entscheidungen, ohne aktive Resume-Objekte oder Tokens |
| Diagnose | API-/SPA-/Release-Versionen, Status, Fehler, Abbruch, Laufzeit, Tokens, bekannte Kosten und Hinweise auf Kontextverdichtung |
| Anhänge | Metadaten und Referenzbeschreibung, keine Originaldateien oder nutzbaren Download-URLs |
| Lücken | Welche Belege nicht vorhanden, bereinigt oder ausgelassen sind; Trunkierungen ausdrücklich markieren |

Die 20 Nachrichten begrenzen nur den dargestellten Chat-Ausschnitt. Historische Modellanfragen können ältere
Zusammenfassungen, Erinnerungen oder weitere vom Agenten gelesene Daten enthalten. Genau deshalb nennt der Hinweis
ausdrücklich den **zugehörigen Diagnosekontext**, nicht nur „diese Antwort“.

### Backendrechte und Nachladen

Das native Backend kann interne Run-Daten und zugehörige Diagnosebelege laden, die nicht über die normale Chat-API
zugänglich sind. Dafür ist kein erhöhter Workflow-Kontext oder Instanzworkflow mehr erforderlich.

- Zugriff auf Session und Zielnachricht für den Melder prüfen. Eine erratene Nachrichten-ID ist keine Berechtigung.
- **Backendrechte sind nicht automatisch eine Freigabe für beliebige fremde Daten.** Nur Belege aus dem
  gemeldeten Run und dessen tatsächlichem Kontext sammeln, die für die Supportfreigabe zulässig sind.
- Private Chats anderer Personen und sachfremde Datensätze nicht nachladen. Nicht sicher freigebbare Teile auslassen;
  dafür keinen universellen historischen Rechte-/Provenienzdienst als Voraussetzung für das MVP bauen.
- Historisch gespeicherte Belege bevorzugen. Falls aktuelle Werte für die Diagnose nachgeladen werden, deren
  Quelle und Abrufzeit kennzeichnen: heutiger Zustand ist kein Nachweis des damaligen Zustands.
- Fehlende Daten als Lücke melden. Keine Vollständigkeit garantieren und keine alte Modellanfrage aus heutigen
  Prompts als vermeintlichen Originalbeleg rekonstruieren.

### Geheimnisse und Reasoning

- Vorhandene Maskierung wiederverwenden. Keine Zugangsdaten, Passwort-Hashes, Cookies, Private Keys,
  Secret-Werte/-Handles oder aktiven Datei-/Provider-Tokens übertragen. Auch JSON-Strings, URLs und Tooltexte beachten.
- Keine Aussage „vollständig anonymisiert“: personenbezogene und geschäftliche Inhalte sind Teil des freigegebenen Kontexts.
- Keine Kopie beliebiger Environment-, Header- oder Metadatenobjekte ohne Auswahl/Bereinigung.
- **Kein vollständiger interner „Thought Process“ versprechbar.** Verfügbare Provider-Reasoning-Zusammenfassungen
  können enthalten sein; sie sind keine vollständige Erklärung interner Modellentscheidungen. Reasoning-Tokens
  sind nur Nutzungszahlen. Opaque/verschlüsselte Fortsetzungsartefakte sind kein lesbarer Diagnosebeleg.

## Brezel-native Umsetzung

### Instanz

1. SPA-Aktion an `ChatMessageItem` ruft nach Bestätigung den nativen Endpunkt
   `POST /chat/sessions/<session>/messages/<message>/report` auf.
2. `brezel/api` prüft Melder/Zielnachricht und sammelt den Kontext mit `AgentDiagnosticSnapshot`.
3. `AgentDiagnosticSanitizer` bereinigt das Paket; `AgentReportSender` sendet an den festen HTTPS-Empfänger.
4. Nur eine erfolgreiche Empfangsquittung mit passender Report-ID wird als Erfolg an die UI zurückgegeben.

**Kein Instanz-Meldungs-Modul und kein Instanz-Meldeworkflow.** Normale technische Logs sind erlaubt. Zugangsdaten dürfen trotzdem nicht in Logs landen;
Paketinhalte nicht unnötig mehrfach loggen. Keine eigene Entwurfsverwaltung, signierte Vorschau-Revisionen oder
lokale Report-Outbox für den ersten Umfang nötig.

Frameworkkonfiguration: `AGENT_REPORT_URL`, optional `AGENT_REPORT_AUTH_HEADER` (Standard `Authorization`) und
`AGENT_REPORT_AUTH_VALUE` (vollständiger Headerwert). Prozessdefaults können systembezogen über
`BREZEL_SYSTEM_<identifier>_AGENT_REPORT_*` überschrieben werden. Ohne Ziel ist Reporting deaktiviert.
SPA erhält nur `reportable`, keine Adresse oder Credentials. Andere Projekte konfigurieren ihren eigenen Empfänger.
Der frühere Recipe-/Workflow-Sendeweg wird entfernt, nicht parallel weiterbetrieben.
Generisches Protokoll und Konfiguration: `../api/docs/agent-answer-reporting.md`.

### Transport und Console-Eingang

- Vorhandene Brezel-API-Key-Authentisierung und authentifizierte Workflow-Webhooks bevorzugen.
- Instanzgebundene, eng berechtigte Senderidentität: nur eigene Meldungen einreichen, keine anderen Console-Daten
  lesen/ändern. Kein globales Console→Operator-Token in Kundeninstanzen und kein Token im Browser.
- Authentifizierte Identität bestimmt die Instanzzuordnung, nicht eine frei gesendete Instanz-ID.
- Feste Zieladresse, TLS, begrenzte Paketgröße und Rate. Keine frei wählbaren Callback-URLs; HTTP-Redirects deaktivieren.
- Stabile Report-ID pro Sendeversuch einschließlich Wiederholungen; zentrale eindeutige Zuordnung verhindert Duplikate.
- Eingang validiert ein versioniertes JSON-Paket und legt die Meldung an. Erfolg erst nach dauerhafter zentraler
  Speicherung quittieren. Kein offen zugänglicher `public`-Webhook als Ersatz für Authentisierung.
- Falls existierende API-Key-Scopes die Eingrenzung nicht zuverlässig ermöglichen, diese konkrete Lücke schließen;
  kein neuer Gateway-Dienst ohne belegten Bedarf.

### Provisionierung der Reporter-Identität

**Kein Kunden-Secret-Manager.** Das Übertragungscredential ist interne Plattformkonfiguration und wird nicht als
kundenseitiger Secret-Datensatz angelegt. Der technische Benutzer gehört **in die Console**, denn dort muss sein
API-Key gültig sein; ein Benutzer in der Kundeninstanz würde dafür nicht helfen.

Vorgeschlagener Ablauf:

1. Der Console-Provisionierungsworkflow legt je Instanz einen technischen Reporter-Benutzer mit stabiler
   Instanzzuordnung und eigener minimaler Rolle an bzw. verwendet den vorhandenen wieder.
2. Die Console erstellt für diesen Benutzer einen Brezel-API-Key. Dafür existieren `action/generateApiKey`
   (Elementklasse `WorkflowActionGenerateApiKey`) und `ApiKeyRepository::create()`. Keine Kunden-/Adminrolle zuweisen, keine Agent-Provisionierung oder
   Einladung für diesen technischen Benutzer auslösen. Login-/Resetwege und die tatsächlich nötigen Key-/Rollenrechte prüfen.
3. Der Key wird über die authentifizierte Console→Operator-Verbindung übergeben. Der Operator legt ihn im
   Kubernetes-Runtime-Secret der jeweiligen Instanz ab und stellt ihn nur dem Backend bereit, z. B. als
   systembezogene `AGENT_REPORT_AUTH_VALUE`, `AGENT_REPORT_AUTH_HEADER=X-API-Key` und `AGENT_REPORT_URL`.
   Kein Repository-, Frontend- oder Kundenmodul-Feld.
4. Der native Sender nutzt `X-API-Key` für den Console-Eingang. Die Console ermittelt die Herkunft über die
   feste Zuordnung des technischen Benutzers zur Instanz, nicht aus dem gesendeten Paket.

Der Operator verwaltet Runtime-Secrets und deren Bereitstellung als ENV. Er übernimmt die Reporter-Konfiguration
über Provisionierung oder Backfill-Endpunkt; er braucht keinen direkten Zugriff auf die Console-Datenbank oder Console-Root-Key.
Bei wiederholter Provisionierung keinen neuen Benutzer/Key erzeugen. Zustellfehler wiederholen, ohne den Key in
Responses/Logs offenzulegen; bestehende Instanzen nachrüsten. Rotation/Sperrung und Widerruf bei endgültiger
Instanzlöschung im selben Lifecycle berücksichtigen.

**Produktgrenze:** `brezel/api` liefert die vollständige generische Chat-Meldefunktion einschließlich Versand.
Cloud-Zieladresse, Reporterrolle, Empfangsworkflow und Provisionierung gehören ausschließlich in Console und Operator.
Das Runtime-Template benötigt keine Reporting-Ressourcen. In anderen Brezel-Projekten bleibt die Aktion deaktiviert oder nutzt deren eigenen konfigurierten
Meldeweg. Keine hart codierten Cloud-Adressen oder versteckte universelle Supportidentität im Framework.

### Automatisches Nachrüsten bestehender Instanzen

- `SyncInstanceReporting` prüft jede Minute im globalen Console-Client bestehende nicht mehr im Entwurf befindliche
  Instanzen. Fehlender Reporter/Key oder eine andere bzw. noch nicht übergebene Zieladresse löst die Einrichtung aus.
- Jede Instanz wird als unabhängiger Workflowjob bearbeitet; ein Fehler blockiert die übrigen nicht.
- `ConfigureInstanceReporting` sperrt den kurzen Konfigurationszweig, lädt den Zustand neu und verwendet den
  vorhandenen Reporter/Key. Überlappende Cronläufe prüfen unter der Sperre erneut, ob noch Arbeit nötig ist.
- Erst nach explizitem `accepted: true` des Operators wird `reporting_url` als übergebener Stand gespeichert.
  Bei Fehlern bleibt die Instanz pending und wird im nächsten Schedulerlauf wieder versucht.
- `accepted` heißt dauerhaft an den Operator übergeben, nicht schon in laufenden Pods aktiv. Der Operator übernimmt
  das Übergabe-Secret über seinen eigenen wiederholbaren Abgleich und rollt die Pods per vorhandenem Secret-Hash.
- Der Admin-Button bleibt als erzwungene Wiederholung bestehen. Keine Plan-/Trialänderung, kein manueller Schritt
  pro Instanz erforderlich. Voraussetzung: einmalig korrekte Empfangsadresse, Scheduler und Worker der Console.

**Sichtbarkeit:** Nicht im normalen Kunden-UI verfügbar heißt nicht vor einem technisch privilegierten
Instanzbetreiber geheim. Root-/Shell-Agenten, veränderbare Workflows oder Backendzugriff können ENV-Credentials
unter Umständen auslesen. Keine absolute Unsichtbarkeit versprechen. Deshalb darf der Key selbst bei Offenlegung
nur Meldungen dieser einen Instanz einreichen und niemals zentrale Daten lesen oder Adminzugriff gewähren.

### Console-Meldungs-Modul

Arbeitsname **`agent_reports`**, vollständig als Brezel-Modul mit Layouts, Rollen, Übersetzungen und Workflows.

Wesentliche Felder:

- Report-ID, Instanzrelation, Eingangszeitpunkt und Melderreferenz.
- Kommentar, gemeldete Antwort und Nachrichten-/Run-Referenzen.
- Bearbeitungsstatus: `new`, `investigating`, `resolved`, `closed`; optional Zuständiger und interne Notiz.
- Versioniertes Diagnosepaket oder geschützte Artefaktreferenz; Größe, Vollständigkeit und fehlende Belege.
- Hinweisversion und Bestätigungszeitpunkt als Nachweis der erfolgten Supportfreigabe.

Kleine Pakete in einem geschützten JSON-Feld sind eine Option; große Pakete gegebenenfalls in bestehender privater
Dateiablage mit Referenz speichern. Entscheidung anhand realer Paketgrößen und vorhandener Brezel-Grenzen treffen,
nicht vorsorglich ein separates Artefaktverwaltungssystem bauen. Payload muss dauerhaft zum Metadatensatz passen.

Zugriff zunächst für Plattform-Admins, serverseitig über Brezel-Rechte abgesichert, nicht nur im Menü verborgen.
Keine Kundenleserechte auf fremde Meldungen oder generisch erreichbare Reportdateien. Benachrichtigungen nennen
Report-ID und Console-Link statt vollständigen Chatinhalt.

## Analyse in der Console

Normale Indexansicht mit Instanz, Zeitpunkt, Kommentar/Kurzbeschreibung, Agent/Modell und Status. Detail-Layout mit
einem registrierten Vue-Widget, soweit die Standardkomponenten für technische Inhalte nicht ausreichen:

1. **Überblick:** gemeldete Antwort, Kommentar, Herkunft und offensichtliche Lücken.
2. **Gespräch:** relevanter Verlauf mit markierter Zielantwort.
3. **Timeline:** Modellrunden, Tools, Unterläufe, Rückfragen, Fehler und Abbrüche.
4. **Details:** historische Requests, Tool-Inputs und -Outputs; volle Ausgabe und Modellansicht unterscheidbar.
5. **Diagnose:** Versionen, Nutzungsdaten und fehlende/gekürzte Belege.

Reportinhalt ist untrusted data: HTML sicher darstellen, keine Toolcalls oder Workflows aus dem Paket ausführen,
keine darin enthaltenen URLs automatisch mit privilegierten Credentials abrufen.

### Analyse durch andere Agenten

Das Paket soll direkt als Kontext für einen **ausdrücklich gestarteten Analyseauftrag** an einen berechtigten
Console-Agenten dienen können. Keine automatische neue Analyse bei jedem Eingang im ersten Umfang erforderlich.

- Analyseagent darf den ausgewählten Report lesen, aber erhält dadurch keinen Zugang zur Kundeninstanz.
- Auftrag: belegtes Fehlverhalten, mögliche Ursache, fehlende Belege und konkrete Fix-/Testvorschläge herausarbeiten.
- Reporttexte und Toolausgaben als Daten behandeln, nicht deren eingebetteten Anweisungen folgen.
- Analyseergebnis als interne Notiz/Ergebnis zum Report speichern, vom ursprünglichen Beleg getrennt.
- Kein automatisches Deployment, Replay, Kunden-Datenänderung oder öffentliches Issue mit Reportinhalt.
- Hinweis in der Kundenfreigabe deckt KI-unterstützte Fehleranalyse ab. Provider-/Datenschutzvorgaben beachten;
  daraus folgt keine Freigabe für beliebige externe Dienste oder Modelltraining.

## Vorhandene Grundlagen

Im aktuellen Code geprüft:

- `../spa/src/components/chat/ChatMessageItem.vue`: vorhandene Footer-Zeile.
- `../api/app/Chat/Support/ChatAgentResponder.php`: Antwortmetadaten verknüpfen Nachricht, Unterhaltung und Run.
- `../api/app/AI/Agent/{AgentRun,AgentRunEvent,AgentConversationMessage}.php`: Lauf, Ereignisse und Gesprächsbelege.
- `../api/app/AI/Agent/ToolOutput/{ToolOutputManager,ToolOutputStore}.php`: vollständiges Ergebnis vs. Modellansicht;
  teilweise prozesslokal bzw. aus Gesprächsnachrichten rekonstruierbar, nicht für jeden alten Lauf vollständig.
- `../api/app/AI/Agent/{AgentBudgetRecorder.php,Neuron/ProviderRequestSnapshotStore.php}`: gespeicherte Provider-
  Anfragen, soweit vorhanden. Bestehende Bereinigung ist Grundlage, kein Beweis vollständiger Geheimnisentfernung.
- `../api/app/AI/Agent/Diagnostics/{AgentDiagnosticSnapshot,AgentReportSender}.php`: native Kontextsammlung und Versand.
- `../api/app/Workflow/Elements/{Event/WorkflowEventWebhook,Api/WorkflowApiHttp}.php`: Console-Eingang und Operator-Konfiguration.
- `../api/app/Auth/Guards/ApiKey/`: vorhandene API-Key-Authentisierung mit Benutzerbindung/Scopes.
- `../console/systems/console/`: deklarative Module, Rollen, Layouts und Workflows.

## Umsetzungsplan

- [x] Bereinigtes Diagnosepaket mit synthetischen Run-/Provider-/Toolbelegen erzeugen und testen.
- [x] Engen Senderzugang zur Console mit Brezel-Rolle und auf den Eingangswebhook beschränktem API-Key ergänzen.
- [x] Console-Modul und Eingangsworkflow samt serverseitigen Rechten und Duplikatschutz anlegen.
- [x] Vollständige native Kontextsammlung und Versand im API-Paket; Instanzworkflow/Recipe-Schnittstelle entfernt.
- [x] Warndreieck, Popconfirm, Kommentar und Versandquittung in der SPA ergänzen.
- [x] Console-Detailansicht und explizite werkzeuglose KI-Analyse ergänzen; Analyse mit Mock geprüft.
- [x] Reporting-Ressourcen aus Runtime-Template und lokalem System entfernt; keine Installation pro System nötig.
- [x] Automatischen Console-Abgleich für bestehende Instanzen mit Wiederholung und übersprungenen Erfolgsfällen ergänzen.
- [ ] Einen echten Pilotreport zwischen laufender Instanz und Console nach Release prüfen.

### Implementierter Zuschnitt

- Core: `AgentDiagnosticSnapshot` hinter dem nativen Chat-Endpunkt mit Session-/Privatsichtbarkeitsprüfung,
  historischen Providerbelegen, Run-Events, Ergebnis-/Modellansicht, Kind-Runs und benannten Lücken.
- Neue Gesprächsnachrichten bekommen eine Run-Referenz. Alte nicht zuordenbare Nachrichten werden nicht durch
  einen pauschalen Export der gesamten Agentunterhaltung ersetzt.
- Konservative Grenze: vollständiger Run-Kontext nur für Runs des Melders; bei fremden/Background-Runs bleibt
  die Chatmeldung möglich, fehlender technischer Kontext wird ausgewiesen. Keine historische Rechteprovenienz erfunden.
- 8-MiB-Paketgrenze; lange Texte markiert gekürzt, bei Übergröße ganze benannte Diagnosekategorien ausgelassen.
  Maximal 20 Runs, 100 Modellrunden und 1.000 Events je Run. Originaldateien/Medienreferenzen nicht enthalten.
- Reporter-Key mit `webhooks-only` und `webhook:receiveAgentReport`; Middleware erlaubt nur POST auf den globalen
  freigegebenen Webhook, keine anderen API-/Modul-/Ressourcenrouten. Limit: 30 Aufrufe pro Minute je Key.
- `flow/lock` serialisiert kurze synchrone Lookup/Create-Zweige für Reporter-Provisionierung und Report-Deduplizierung.
  Gemeinsamer lockfähiger Cache der Console-Worker erforderlich, kein Array-Cache im Deployment.
- Operator nimmt Keys über den privilegierten Provisionierungspfad oder den engen Backfill-Endpunkt entgegen,
  überträgt sie aus einem Übergabe-Secret ins instanzbezogene Runtime-Secret und entfernt das Übergabe-Secret.
- Automatisches Nachrüsten bestehender Instanzen plus Console-Adminaktion ohne Plan-/Trialänderung; Reporter-Keys werden bei
  Console-Instanzlöschung deaktiviert. Keine Kundenansicht für Reporter-Key oder Reportverwaltung.
- Kleine Core-Ergänzungen bleiben generisch: Chat-Reporting-API und Sender, optionale Webhook-Keybeschränkung,
  `action/revokeApiKeys` und `flow/lock`. Cloud-Adressen/-Rollen/-Workflows liegen in Produktressourcen.

### Verifikation und verbleibende Grenzen

- Snapshot-/Privatsichtbarkeits-/Secret-Tests, echte API-Routen für beschränkte Keys, native Report-Route mit HTTP-Fake,
  Reporter-Wiederverwendung/Backfill/Sperrung und Analyseworkflow mit Modell-Mock werden lokal geprüft.
- Browserprüfung des echten Ant-Popconfirms bei 320/390/1280 px mit simulierter Zustellung: kein horizontaler
  Überlauf, kein Versand vor Bestätigung oder bei Abbrechen, genau ein Versand nach Bestätigung.
- Console-Produktionsbuild wird mit der lokalen SPA gebaut. Keine echten Kundendaten oder bezahlten Modellaufrufe
  für diese Prüfungen. Noch kein laufender Cluster-/Console-Pilot, keine Zusage universeller Geheimniserkennung.
- Historische Requests können fehlen oder bereits reduziert sein. Provider-Inputs mit erkanntem Secret-Reveal
  werden ausgelassen. Bereinigung erkennt Struktur und bekannte Muster, nicht jeden beliebigen Geheimniswert im Freitext.
- Die einfache KI-Analyse ist ein expliziter `ai/chatBot`-Aufruf ohne Tools; keine vollwertige autonome Agentpipeline.
  Sie kann auf Provider-/Kontextgrenzen scheitern und wird nicht automatisch beim Reporteingang ausgeführt.
- Lokaler Prüfstand nach nativem Umbau: 469 Backendtests ohne Fehlschläge (zwei Deprecations, 43 PHPUnit-Hinweise),
  271 SPA-Unit- und 287 Komponententests grün, Console-Suite 34 Fälle/67 Prüfungen grün, Operator `go test ./...`
  grün, PHPStan für betroffene Backendpfade ohne Fehler. Console-Produktionsbuild erfolgreich mit bestehenden
  Drittanbieter-/CSS-Warnungen in der ersten Implementierung; UI-Änderung im Umbau betrifft nur die native Route und
  das `reportable`-Flag. Der lokale Workflow-Loader lädt keine Reporting-Datei mehr.
- Automatischer Abgleich mit echtem Workflowparser getestet: eigene Identität je Instanz, keine wiederholte
  Übergabe erfolgreicher Fälle, erneutes Lesen unter der Sperre bei bereits wartenden Jobs, Wiederholung bei
  negativer Operatorquittung und Netzwerkfehler. Jeder Instanzjob ist unabhängig; der Scheduler benötigt keinen Nutzer.
- Test-Datenbank und erzeugte Runtime-Test-/Baseline-Systeme entfernt, Browser-Preview gestoppt und entfernt.

## Wesentliche Tests

- Abbrechen sendet nichts; erfolgreicher Versand erscheint im Console-Modul mit passender Quittung.
- Kommentar, Zielantwort, Run, Tool-Inputs/-Outputs und historische Requests sind richtig zugeordnet.
- Fremde Nachrichten-IDs und falsche Instanzcredentials werden abgewiesen; Empfänger vertraut keiner freien Instanz-ID.
- Fehlende Runs/Requests/Ergebnisse verhindern die Meldung nicht, werden aber klar als fehlend ausgewiesen.
- Bekannte Geheimnisse in strukturierten Daten, JSON-Strings, Freitext und URLs werden nicht exportiert.
- Wiederholung nach Netzfehler erzeugt keine doppelte Meldung; zentraler Speicherfehler liefert keinen Erfolg.
- Kundenrollen können zentrale Meldungen/Dateien nicht auslesen; Adminzugriff und Analyseagent haben gezielte Rechte.
- Reportinhalte führen keine Aktionen aus, auch nicht bei einer KI-Analyse mit manipulativen Anweisungen im Report.
- Popconfirm und Kommentarfeld funktionieren mobil bei 320/390 px sowie mit Tastatur.

## Noch technisch zu klären, keine zusätzlichen Produktblocker

1. Welche Diagnosebelege sind nach Worker-Neustart/bei alten Runs tatsächlich noch vorhanden?
2. Wie eng lassen sich vorhandene Brezel-API-Keys für den Console-Eingang einschränken?
3. Welche vorhandene private Ablage eignet sich für reale Paketgrößen am einfachsten?
4. Welche minimale Core-Operation fehlt für sichere Kontextsammlung/Bereinigung tatsächlich?

Diese Punkte beim Implementieren gezielt prüfen. Kein eigener Infrastruktur-Prototyp oder vollständiges
Compliance-/Widerrufssystem als Vorbedingung für den ersten Testumfang.

## Konfidenz

- **Hoch:** Brezel-Modul ausschließlich in der Console, nativer generischer Sendeweg und vorhandene Run-/Tool-Belege
  passen zum Ziel und zur bestehenden Architektur.
- **Mittel:** Vollständigkeit historischer Daten, Rechteumfang des Eingangs und optimale Paketablage müssen am
  konkreten Implementierungspfad geprüft werden. Mit synthetischem Ende-zu-Ende-Test und Secret-/Rechtenegativtests absichern.
