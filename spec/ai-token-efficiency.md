# AI-Kosten und Token-Effizienz in Brezel

Stand: 2026-11-12. In Arbeit. Änderungen lokal committen, gemeinsam später pushen.

## Ziel und Grenzen

Weniger Kosten pro erfolgreich erledigter Aufgabe bei mindestens gleicher Qualität. Eine höhere Cache-Quote allein
ist kein Erfolg. Keine zusätzlichen Rechte, keine Wiederholung alter Werkzeugaktionen und keine Preisannahmen für
unbekannte Modelle/Gateways. Keine kostenpflichtigen Modellversuche oder Produktionsänderungen ohne Freigabe.

## Befund

- Innerhalb eines Laufs bleiben Modellnachrichten und Werkzeugresultate erhalten. Zwischen Läufen rekonstruiert
  `NeuronConversationMapper` bisher überwiegend Nutzer-/Antworttexte. Das verliert Kontext und mögliche Cache-Präfixe.
- Werkzeuge werden bereits stabil angeboten; Provider-Anfragen und Nutzungsdaten werden erfasst. Diese Mechanismen
  sowie Prompt-Snapshots, Schema-Budgets und Agent-Evals wiederverwenden.
- Persönliche Erinnerungen stehen vor weiteren statischen Instruktionen. Änderungen dort können den gemeinsamen
  Präfix verkürzen.
- Werkzeug- und Gesprächsverdichtung existieren bewusst nach unterschiedlichen Budgets (ADRs 0023/0026/0033/0038).
  ADR 0033 belegt Cache-Brüche und erneutes Lesen an echten Runs. Keanus Hinweis: Endnutzer-Sessions sind oft kalt;
  deshalb nicht aus Cache-Präfix-Stabilität allein auf niedrigere Gesamtkosten schließen. Providerabhängige
  Cache-Laufzeiten erlauben keinen universellen Warm-/Kalt-Zeitwert.
- Lokale Kostenschätzungen kennen normale Eingabe, Cache-Lesen und Ausgabe, aber keine gesonderten Cache-Schreibkosten.
- Abbruch wurde zuvor ergänzt. Der nachfolgende Lauf bekommt jetzt einen maskierten Textbeleg mit Eingaben und
  Ergebnissen der unterbrochenen Werkzeuge (API `71567af46`). Das ist noch kein identischer Modell-Verlauf.

## Arbeitspakete

### 1. Messbasis und reproduzierbare Prüfungen

- [ ] Provider-Anfragen vor/nach einem Laufwechsel auf Präfix-Gleichheit prüfen, einschließlich Runtime-Kontext,
      Werkzeugaufrufen und Bildern. Ohne echten Provider-Aufruf reproduzieren.
- [x] Vorhandene Nutzungs-/Kostenmessung auf fehlende Cache-Schreibkosten und Gateway-Abweichungen prüfen.
      Cache-Schreibwerte werden erfasst; ihre lokalen Preise und echte Gateway-Weitergabe sind noch offen.
- [ ] Ergebnisse getrennt nach Cache-Wiederverwendung, Kontextgröße, Modellrunden und Qualität dokumentieren.

### 2. Modell-Verlauf zwischen Läufen erhalten

- [x] Installierte Neuron-Version, Nachrichtenformate, Persistence und Provider-Mapper untersuchen.
- [x] Vorhandene Ablage nutzen, kompatiblen Text-/Werkzeugverlauf speichern und wiederherstellen. Alte Unterhaltungen müssen weiter
      funktionieren. Werkzeugdefinitionen/-aufrufe aus der Historie niemals ausführen.
- [x] Geheimnisse maskieren, Medienrechte und Provider-Wechsel berücksichtigen; Provider-Artefakte nicht blind replayen.
      Medien und einmalig sensible Werkzeugresultate deaktivieren den Checkpoint vorerst ganz.
- [ ] Abbruch, Neustart, Rückfragen, Werkzeugfehler und unterbrochene Werkzeugpaare testen.
- [x] Zeitpläne mit 0/N früheren Ergebnissen unverändert respektieren.

### 3. Stabiles Prompt-Präfix

- [x] Statische Instruktionen von Erinnerungen, Laufzeitdaten und veränderlichen Hinweisen trennen, ohne Instruktionsrang
      oder Sicherheitsregeln zu ändern.
- [ ] Cache-Keys und providerabhängige Cache-Optionen anhand der tatsächlich unterstützten APIs prüfen.
- [x] Präfix-/Snapshot-Tests und Schema-Budgets aktualisieren; keine Trefferquote ohne Messung versprechen.

### 4. Kontext und Modellrunden

- [ ] Bestehende Verdichtung mit dem fortsetzbaren Verlauf abstimmen. Stabil zwischen Verdichtungen, passend zum
      tatsächlichen Kontextfenster inklusive Instruktionen/Werkzeugen/Ausgabereserve.
- [ ] Große Ausgaben und wiederholte Aufrufe anhand vorhandener Tests/Metriken untersuchen; keine neue pauschale Kürzung.
- [ ] Kleine Modelle für klar begrenzte Aufgaben und Hilfsagenten-Kosten prüfen. Änderungen nur mit Qualitätsnachweis.

### 5. Abschluss und Bewertung

- [x] Relevante API-Tests, PHPStan und geänderte Prompt-Snapshots für den ersten Implementierungsabschnitt prüfen.
      Keine SPA-Codeänderungen in diesem Abschnitt.
- [ ] Änderungen, offene Grenzen und Messresultate hier dokumentieren und lokal committen.
- [x] Nach Freigabe kleiner kostenpflichtiger A/B-Test durchgeführt; kein Teil der Mock-Tests. Siehe Ergebnisbericht.

## Verifikation

- Provider-Requests aus Mock-HTTP-Tests sind der Nachweis für tatsächliche Payloads; gespeicherte Daten allein genügen
  nicht. Prüfen, wo der erste Unterschied zwischen zwei Anfragen liegt.
- Regressionstests müssen auf dem alten Verhalten scheitern und danach bestehen.
- Modellqualität wird durch Mock-Tests nicht nachgewiesen. Echte Evaluation ausdrücklich getrennt ausweisen.

## Fortschritt

- Präfix-Regressionstest: Auf dem alten Stand fehlen Runtime-Kontext und Werkzeugpaare nach dem Laufwechsel. Im Modus
  `preserve` bleibt das tatsächliche Provider-Input-Array über drei Turns ein identischer Präfix. Das beweist keine
  Cache-Trefferquote und keine monetäre Einsparung.
- Ein ersetzbarer JSON-Checkpoint je Unterhaltung statt einer vollständigen Kopie pro Turn. 2-MB-Speicherschutz,
  Provider-/Endpoint-/Modell-/API-Bindung, keine ausführbaren Objekte. Zusammenfassen und Leeren invalidieren ihn.
- Nach Keanus Hinweis: `compact` bleibt Standard. `preserve` ist explizit zuschaltbar über
  `AI_AGENT_CONVERSATION_HISTORY=preserve`. Die bestehenden 40k/12k- und 64k/24k-Budgets bleiben unverändert.
- Erinnerungen/Skill-Verzeichnis stehen hinter den gemeinsamen Instruktionen. Vier Golden-Snapshots ändern nur die
  Position des Skill-Verzeichnisses.
- Provider-gemeldete Cache-Schreibtokens samt TTL-Aufteilung werden in vorhandenen Budget-Metadaten erfasst. Keine
  neuen Preisannahmen, Gateway-Abrechnung bleibt maßgeblich.
- Breiter Backend-Teststand vor Einführung des expliziten Modus: 685 Tests, dieselben drei bekannten Chat-/Transkriptions-
  Fehler wie zuvor, keine zusätzlichen Fehler. Abschließend mit explizitem Modus: 67 gezielte Tests / 957 Assertions
  erfolgreich, PHPStan ohne Fehler. Bestehende PHPUnit-Hinweise und zwei Deprecations bleiben.
- Der kompakte Standard ist eigens getestet: keine Checkpoint-Ablage, kein vollständiger Werkzeug-Replay im Folgeturn.
  Tests des Preserve-Modus optieren ausdrücklich ein. Keine Einstellungen in Cloud/Runtime umgestellt.

## Nächste Entscheidungen und offene Arbeit

- Beide Modi mit direkter Folgefrage, kaltem Neustart und langem Werkzeuglauf vergleichen. Echter Modelltest nur nach
  Freigabe. Erst dann über Standard oder automatische Strategie entscheiden.
- Medien-Replay braucht stabile Referenzen und frische Rechteprüfung; keine Base64-Ablage als schnelle Abkürzung.
- Ein abgebrochener Turn erhält weiterhin seine konkrete Textübergabe, nicht automatisch ein repariertes vollständiges
  Werkzeugpaar. Erhaltung aller parallelen/unterbrochenen Provider-Artefakte separat untersuchen.
- Kostenberechnung für Cache-Schreibvorgänge erst umstellen, wenn Preise/Token-Semantik des konkreten Providers oder
  Gateways feststehen. Bisher nur Rohwerte zusätzlich erfasst.

## Automatischer A/B-Versuch (2026-11-12)

Vom Nutzer für echte Modellaufrufe freigegeben. Abgeschlossen; Bericht und bereinigte Messdaten unter
`spec/ai-token-efficiency-eval-2026-11-12.{md,json}`.

- Vorhandenen `AgentEvalRunner`/`AgentEvalRuntimeEnvironment` verwenden. Je Unterhaltung ein frisches Wegwerf-System
  auf einer eigens gestarteten MariaDB mit temporärem Dateisystem; keine Kundendaten und keine Änderung am Standardmodus.
- Modell: lokal konfiguriertes `brezel-mid` über das vorhandene Gateway. Tatsächlich gemeldetes Upstream-Modell und
  Gateway-Kosten je HTTP-Antwort aufzeichnen. Die bestehende Eval-Kostenschätzung für diesen Alias ergibt 0 und darf
  nicht als tatsächlicher Preis ausgegeben werden.
- Szenario 1: vorhandenes `chat-follow-up-first-one`, zwei aufeinanderfolgende Nachrichten mit Bezug auf das erste
  Ergebnis. Bestehende deterministische Checks auf Inhalt, fehlende Änderungen und wiederholte Leseaufrufe.
- Szenario 2: Seed aus `bulk-update-tasks`; zuerst zehn Umzugsaufgaben abschließen, danach nur fünf Büro-Aufgaben
  wieder öffnen. Prüfen: fünf offen, fünf erledigt, zwei fremde Aufgaben unverändert, Gesamtzahl zwölf, keine
  Tool-Fehler und abgeschlossene Läufe.
- Beide Szenarien nur mit Werkzeugen für lokale Datensätze; keine Shell, Websuche, Authoring, Bildgenerierung oder
  Delegation. Testet den Verlauf zwischen Runs, nicht die Leistung eines Coding-Agenten mit sehr langen Werkzeugläufen.
- Je zwei Wiederholungen pro Modus: Reihenfolge `compact → preserve`, anschließend `preserve → compact`.
  Insgesamt acht Unterhaltungen / sechzehn Nutzernachrichten. Unterschiedliche System-/Run-IDs sind wie im Betrieb
  unvermeidbar; kein Anspruch auf einen erzwungen kalten oder warmen Provider-Cache.
- Maximal zwölf Provider-Anfragen pro Unterhaltung und 96 insgesamt, 2500 Ausgabe-Tokens pro Anfrage. Ab 3 USD
  gateway-gemeldeten Gesamtkosten startet keine weitere Anfrage; eine bereits laufende Anfrage kann die Grenze
  überschreiten. Fehlende Gateway-Kosten getrennt kenntlich machen, nicht als kostenlos werten.
- Infrastrukturfehler oder fehlgeschlagene Bereinigung stoppen weitere Testunterhaltungen. Ergebnisse nach jeder
  Unterhaltung sichern, einschließlich Checks, Traces, Tokens, tatsächlicher Gateway-Kosten und HTTP-Latenzen.
- Laufharness und Rohdaten liegen während des Versuchs unter `/tmp/opencode/history-ab*`; nach Abschluss die
  bereinigte Zusammenfassung im Repository dokumentieren. Keine Zugangsdaten in Berichte übernehmen.

### Ergebnis

- Acht Unterhaltungen, 59 echte Provider-Aufrufe, 0,1151998 USD vom Gateway gemeldet, Modell `gpt-6.1-terra`.
  Alle acht Systeme bereinigt, separate Datenbank entfernt. Keine Produktion oder Defaults verändert.
- Gesamt Compact 0,0443766 USD, Preserve 0,0708232 USD. Die ersten Turns streuen bereits ohne History-Replay;
  diese Differenz nicht als kausale 59,6-%-Verteuerung durch Preserve verkaufen.
- Direkte lesende Folgefragen: Preserve spart je einen Modellaufruf, keine erneute Modulbeschreibung. Folge-Turns
  zusammen 12,1 % günstiger. Bei Datenkorrekturen spart es Modullesen, nicht Modellrunden, und ist 45,8 % teurer.
- Alle vier Datenkorrekturen korrekt. Ein Preserve-Inhaltscheck der lesenden Folgefrage scheitert an der mehrdeutigen
  Erstfrage (Kunde vs. Kundenbereich); Antwortprüfung im Bericht dokumentiert, Originalscore bleibt unverändert.
- Konsequenz: Compact bleibt Standard, keine automatische Situationswahl. Für belastbarere Schlüsse wären mehr
  Wiederholungen und ein gepaarter Vergleich ab identischem ersten Turn nötig. Keine weiteren bezahlten Läufe gestartet.
