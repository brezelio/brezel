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
- [ ] Optional nach Freigabe: kostenpflichtige A/B-Evals und echte Cache-/Kostenmessung; kein Teil der Mock-Tests.

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
