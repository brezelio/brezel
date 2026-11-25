---
name: dwd-weather
description: Ruft stündliche Wettervorhersagen und amtliche DWD-Unwetterwarnungen (via Bright Sky API) für einzelne Orte, mehrere Orte oder Strecken in bestimmten Zeitfenstern ab. Liefert ausschließlich strukturierte Wetterdaten als JSON.
---

# DWD Weather Skill

Dieser Skill dient ausschließlich dem Abruf von Wetterdaten und amtlichen Warnungen des Deutschen Wetterdienstes (DWD) über die kostenlose Bright-Sky-API (`api.brightsky.dev`, kein API-Key erforderlich).

## Voraussetzungen
- Python 3 (nur Standardbibliothek, keine externen Pakete nötig)
- Internetzugang zu `api.brightsky.dev` und (bei Ortsnamen) `nominatim.openstreetmap.org`

## Verwendung

Führe `scripts/fetch_weather.py` aus. Das Skript gibt kompaktes JSON auf `stdout` aus.

### 1. Einzelner Ort (heute, ganzer Tag)
```bash
python3 scripts/fetch_weather.py --location "Köln"
```
Koordinaten (`lat,lon`) vermeiden den Geocoding-Aufruf und sind schneller/präziser:
```bash
python3 scripts/fetch_weather.py --location "50.9375,6.9603"
```

### 2. Bestimmtes Datum und Zeitfenster
```bash
python3 scripts/fetch_weather.py --location "Gummersbach" --date 2026-11-26 --from 07:00 --to 09:00
```

### 3. Mehrere Orte oder Strecke (Route)
Mit `--route` lassen sich Start, Zwischenstopps und Ziel in Reihenfolge abfragen:
```bash
python3 scripts/fetch_weather.py --route "Gummersbach" "Overath" "Köln" --from 07:00 --to 09:00
```
Wenn nur Start und Ziel angegeben werden, erzeugt `--intermediate N` automatisch `N` gleichmäßig verteilte Zwischenpunkte auf der Luftlinie:
```bash
python3 scripts/fetch_weather.py --route "51.0281,7.5653" "50.9375,6.9603" --intermediate 2 --from 07:00 --to 09:00
```

### Alle CLI-Parameter
- `--location <ORT_ODER_LAT,LON>`: Ein oder mehrere unabhängige Orte (mehrfach angebbar).
- `--route <ORT1> <ORT2> [...]`: Geordnete Wegpunkte einer Strecke.
- `--intermediate <N>`: Anzahl interpolierter Zwischenpunkte zwischen jeweils zwei `--route`-Punkten (Standard: `0`).
- `--date <YYYY-MM-DD>`: Startdatum (Standard: heute).
- `--days <N>`: Anzahl Tage ab `--date` (Standard: `1`).
- `--from <HH:MM>`: Untere Grenze für stündliche Werte (inklusive).
- `--to <HH:MM>`: Obere Grenze für stündliche Werte (inklusive).
- `--tz <TIMEZONE>`: Zeitzone für Bright Sky (Standard: `Europe/Berlin`).
- `--no-alerts`: Überspringt den Abruf amtlicher DWD-Warnungen.

## Ausgabeformat (JSON)

Das Skript liefert ein JSON-Objekt mit:
- `query`: Verwendete Parameter (`date`, `days`, `time_from`, `time_to`, `tz`).
- `locations`: Liste der abgefragten Orte bzw. Wegpunkte, jeweils mit:
  - `label`, `lat`, `lon`
  - `alerts`: Aktive amtliche DWD-Warnungen (`event_de`, `severity`, `headline_de`, `description_de`, `instruction_de`, `onset`, `expires`)
  - `hourly`: Gefilterte Stundenwerte:
    - `timestamp`: ISO-8601 Zeitstempel
    - `condition`: Wetterzustand (`dry`, `fog`, `rain`, `sleet`, `snow`, `hail`, `thunderstorm`)
    - `temperature`: Lufttemperatur in °C
    - `dew_point`: Taupunkt in °C
    - `relative_humidity`: Relative Luftfeuchtigkeit in %
    - `precipitation`: Niederschlag in mm/h
    - `precipitation_probability`: Regenwahrscheinlichkeit in %
    - `wind_speed`: Windgeschwindigkeit in km/h
    - `wind_gust_speed`: Windböen in km/h
    - `wind_direction`: Windrichtung in Grad
    - `visibility`: Sichtweite in Metern
    - `cloud_cover`: Bewölkung in %
    - `sunshine`: Sonnenscheindauer in Minuten/Stunde

## Hinweise
- Bright Sky deckt Deutschland und grenznahe Regionen über DWD-Stationen/MOSMIX ab.
- Bei Ortsnamen nutzt das Skript OpenStreetMap Nominatim (max. 1 Anfrage/Sekunde beachten). Für wiederkehrende Abfragen nach Möglichkeit Koordinaten verwenden.
