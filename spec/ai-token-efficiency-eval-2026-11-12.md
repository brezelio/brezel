# Vergleich kompakter und erhaltener Modellhistorie

Datum: 2026-11-12. Status: abgeschlossen. Messdaten: `ai-token-efficiency-eval-2026-11-12.json`.

## Versuchsaufbau

- API-Stand: `9c864288f`; keine Änderungen am produktiven Standard `compact`.
- Zwei Modi: `compact`, `preserve`. Identische Instruktionen, Werkzeuge, Seeds und Nutzernachrichten innerhalb eines
  Szenarios. Einziger geplanter Unterschied ist `ai.agent.conversation_history`.
- Zwei Szenarien mit je zwei Wiederholungen pro Modus, abwechselnde Reihenfolge AB/BA. Acht isolierte
  Wegwerf-Unterhaltungen, zwei Nachrichten je Unterhaltung.
- Szenario „Folgefrage“: `chat-follow-up-first-one` aus dem API-Paket. Nach einer Übersicht über Kundenbereiche bezieht
  sich die Folgefrage auf den zuerst genannten Bereich. Checks prüfen unter anderem passende Details und wiederholte
  Leseaufrufe.
- Szenario „Korrektur“: Seed von `bulk-update-tasks`, danach zweite Nachricht: Nur die fünf Büro-Aufgaben des Umzugs
  wieder öffnen. Werkstatt-Aufgaben bleiben erledigt, die zwei Aufgaben zur Messe bleiben unverändert.
- Auf lokale Datensatz-Werkzeuge begrenzt. Keine externen Schreibaktionen, kein Authoring, keine Hilfsagenten.
- Konfigurierter Modell-Alias `brezel-mid` über das lokale Gateway; tatsächlich gemeldetes Modell im Ergebnis ausweisen.
- Schutzgrenzen: zwölf Provider-Anfragen je Unterhaltung, 96 insgesamt, 2500 Ausgabe-Tokens je Anfrage. Bei mindestens
  3 USD gemeldeten Gateway-Gesamtkosten keine weitere Anfrage, kein harter Prepaid-Deckel für die letzte Anfrage.
- Bestehende Eval-Isolation/Bereinigung; separate kurzlebige MariaDB mit temporärem Datenverzeichnis. Keine Kundendaten.

## Auswertung

Das Gateway meldete in allen 59 Antworten Kosten und als Upstream-Modell `gpt-6.1-terra` (angefordert: `brezel-mid`).
Gesamtkosten: **0,1151998 USD**. Keine Infrastrukturfehler, keine fehlgeschlagene Bereinigung. Die vorhandene lokale
Eval-Schätzung blieb wegen fehlender Alias-Preise bei 0; sie wurde nicht für diesen Kostenvergleich verwendet.
Cache-Schreibtokens wurden vom Gateway durchgehend mit 0 gemeldet; über darüber hinausgehende Upstream-Kosten kann
dieser Versuch nichts aussagen.

### Ganze Unterhaltungen (je zwei Wiederholungen)

| Szenario | Modus | Aufrufe | Input-Tokens | Cache-Tokens | Cache-Anteil | Output-Tokens | Gateway-USD | Dauer je Wiederholung |
|---|---|---:|---:|---:|---:|---:|---:|---|
| Folgefrage | compact | 11 | 38.083 | 23.296 | 61,2 % | 812 | 0,0200118 | 24 / 19 s |
| Folgefrage | preserve | 11 | 47.795 | 22.400 | 46,9 % | 1.137 | 0,0322000 | 21 / 26 s |
| Datenkorrektur | compact | 18 | 66.713 | 51.456 | 77,1 % | 1.307 | 0,0243648 | 31 / 34 s |
| Datenkorrektur | preserve | 19 | 80.913 | 51.584 | 63,8 % | 1.343 | 0,0386232 | 36 / 32 s |
| **Gesamt** | **compact** | **29** | **104.796** | **74.752** | **71,3 %** | **2.119** | **0,0443766** | **108 s gesamt** |
| **Gesamt** | **preserve** | **30** | **128.708** | **73.984** | **57,5 %** | **2.480** | **0,0708232** | **115 s gesamt** |

In dieser Stichprobe waren die Preserve-Unterhaltungen insgesamt 59,6 % teurer und enthielten 22,8 % mehr Input.
**Das ist kein isolierter kausaler Effekt der Verlaufserhaltung:** Bereits die ersten Turns unterschieden sich in
Werkzeugwahl und Cache-Treffern. In ihnen gibt es noch keinen früheren Turn wiederherzustellen. Unterschiedliche
Antwortlängen, Lauf-IDs und Provider-Routing verstärken die Streuung.

### Nur die eigentlichen Folge-Turns

| Szenario | Modus | Aufrufe je Folge-Turn | Input gesamt | Gateway-USD gesamt |
|---|---|---|---:|---:|
| Folgefrage | compact | 2 / 2 | 13.319 | 0,0042678 |
| Folgefrage | preserve | 1 / 1 | 13.019 | 0,0037530 |
| Datenkorrektur | compact | 3 / 3 | 24.292 | 0,0105942 |
| Datenkorrektur | preserve | 3 / 3 | 35.248 | 0,0154452 |

- **Lesende Folgefrage:** Beide Preserve-Läufe antworteten ohne weiteren Werkzeugaufruf, während Compact beide Male
  `describe_module` erneut ausführte. Ein Modellaufruf je Folgefrage weniger, in Summe 12,1 % geringere Kosten der
  Folge-Turns. Wegen nur zwei Wiederholungen keine belastbare Effektgröße.
- **Datenkorrektur:** Compact beschrieb das Modul erneut, suchte die aktuellen Aufgaben und änderte sie gesammelt.
  Preserve übersprang die Modulbeschreibung und brauchte trotzdem jeweils drei Modellaufrufe. Es sendete mehr
  Werkzeughistorie; die Folge-Turns waren in Summe 45,8 % teurer. Aktuellen Zustand vor einem erneuten Schreiben zu
  lesen ist hier sinnvoll, kein unnötiger identischer Wiederholungsaufruf.

### Qualität und Checks

- Datenkorrektur: **alle vier Unterhaltungen bestanden sämtliche Checks**, jeweils fünf Büro-Aufgaben offen, fünf
  Werkstatt-Aufgaben erledigt, zwei fremde Aufgaben unverändert. Keine Tool-Fehler.
- Folgefrage Compact: zweimal Score 0,8889. Inhaltliche Checks bestanden; jeweils ein wiederholtes `describe_module`
  verletzte den Check „liest nichts zweimal“.
- Folgefrage Preserve: einmal Score 1, einmal 0,5556. Im zweiten Lauf interpretierte der Agent die erste Frage als
  Übersicht konkreter Kunden und nannte Müller zuerst. Die Folgeantwort beschrieb korrekt Müller samt Vertrag.
  Der deterministische Check erwartet dagegen die Felder des zuerst genannten Kundenbereichs. Der fehlgeschlagene
  Check ist deshalb **kein eindeutiger Qualitätsfehler**; die erste Anfrage („Was haben wir alles zu Kunden im System?“)
  erlaubt beide Deutungen. Nicht nachträglich den Score umdefinieren, sondern Antworten im Messartefakt belassen.
- Die zugeordnete Tool-Liste war für lokale Datensatzarbeit eingeschränkt. Standard-/Suchtools des Frameworks können
  weiterhin angeboten werden; ein Lauf nutzte `tool_search`. Kein externes Authoring-/Shell-/Web-Werkzeug wurde benutzt.

## Entscheidung

**`compact` bleibt Standard.** Der Test zeigt einen konkreten Nutzen der Erhaltung bei direkten lesenden Folgefragen,
aber keinen generellen Kosten-/Qualitätsvorteil. Keanus Trade-off wird bestätigt: Das Vermeiden erneuten Lesens allein
rechtfertigt nicht immer den größeren, möglicherweise ungecachten Verlauf.

Keine automatische Warm-/Kalt-Umschaltung aus dieser Stichprobe ableiten. Nächste belastbarere Untersuchung wäre ein
gepaarter Vergleich ab demselben eingefrorenen ersten Turn, mit eindeutiger Folgefrage, mehreren Wiederholungen und
gezielter Variation des Zeitabstands. Cache-Routing und echte kalte Wiederaufnahme müssen weiterhin getrennt gemessen
werden. Für jetzt ist kein weiterer bezahlter Lauf gestartet.

## Bereinigung

- Eval-Registry nach Abschluss: 0 Systeme mit `agenteval__test__`.
- Separate MariaDB: keine verbliebenen `brt_*`-Datenbanken, anschließend Container gestoppt und automatisch entfernt.
- Temporärer Harness und Rohreport aus dem App-Container entfernt. Bereinigte Ergebnisse liegen im JSON-Artefakt.

## Aussagegrenzen

- Zwei Wiederholungen sind ein kleiner Funktionstest, kein statistisch belastbarer Nachweis.
- Direkt aufeinanderfolgende Nachrichten, keine kontrollierte kalte Wiederaufnahme. Neue System- und Lauf-IDs sind
  unvermeidbar; Routing und Cache-Verfügbarkeit des Providers werden nicht erzwungen.
- Bewertet wird der Verlauf zwischen Nutzernachrichten. Die bestehenden Budgets für sehr lange Werkzeugläufe werden
  nicht erreicht oder verändert.
- Nur der konfigurierte Modellpfad wird geprüft; keine Verallgemeinerung auf alle OpenAI-/Mistral-Modelle.
- Gleicher Teststand für beide Modi: kein Vorher-/Nachher-Vergleich der Prompt-Reihenfolge oder sämtlicher bisherigen
  Änderungen.
