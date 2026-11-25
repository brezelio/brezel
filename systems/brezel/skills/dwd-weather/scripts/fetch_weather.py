#!/usr/bin/env python3
"""Fetch hourly DWD weather forecasts and alerts via the Bright Sky API."""

import argparse
import datetime as dt
import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

BRIGHTSKY_BASE = "https://api.brightsky.dev"
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
USER_AGENT = "dwd-weather-agent-skill/1.0"

HOURLY_FIELDS = (
    "timestamp",
    "condition",
    "temperature",
    "dew_point",
    "relative_humidity",
    "precipitation",
    "precipitation_probability",
    "wind_speed",
    "wind_gust_speed",
    "wind_direction",
    "visibility",
    "cloud_cover",
    "sunshine",
)

ALERT_FIELDS = (
    "event_de",
    "severity",
    "urgency",
    "headline_de",
    "description_de",
    "instruction_de",
    "onset",
    "expires",
)


def http_get_json(url: str, timeout: int = 15) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def parse_coords(value: str):
    parts = [p.strip() for p in value.split(",")]
    if len(parts) != 2:
        return None
    try:
        lat, lon = float(parts[0]), float(parts[1])
    except ValueError:
        return None
    if -90.0 <= lat <= 90.0 and -180.0 <= lon <= 180.0:
        return lat, lon
    return None


def resolve_location(value: str, geocode_delay: bool = False) -> dict:
    coords = parse_coords(value)
    if coords is not None:
        return {"label": value, "lat": coords[0], "lon": coords[1]}

    if geocode_delay:
        time.sleep(1.0)

    params = urllib.parse.urlencode({"q": value, "format": "json", "limit": 1})
    data = http_get_json(f"{NOMINATIM_URL}?{params}")
    if not data:
        raise ValueError(f"Location not found: {value}")

    hit = data[0]
    return {
        "label": value,
        "resolved_name": hit.get("display_name"),
        "lat": float(hit["lat"]),
        "lon": float(hit["lon"]),
    }


def interpolate_route(points: list, intermediate: int) -> list:
    if intermediate <= 0 or len(points) < 2:
        return points

    result = []
    for idx in range(len(points) - 1):
        start = points[idx]
        end = points[idx + 1]
        result.append(start)
        for step in range(1, intermediate + 1):
            frac = step / (intermediate + 1)
            lat = round(start["lat"] + (end["lat"] - start["lat"]) * frac, 5)
            lon = round(start["lon"] + (end["lon"] - start["lon"]) * frac, 5)
            result.append(
                {
                    "label": f"waypoint_{idx + 1}_{step}",
                    "lat": lat,
                    "lon": lon,
                }
            )
    result.append(points[-1])
    return result


def parse_hhmm(value: str) -> dt.time:
    return dt.datetime.strptime(value, "%H:%M").time()


def filter_hourly(records: list, time_from: dt.time | None, time_to: dt.time | None) -> list:
    filtered = []
    for rec in records:
        ts_str = rec.get("timestamp")
        if not ts_str:
            continue
        ts_time = dt.datetime.fromisoformat(ts_str).time()
        if time_from is not None and ts_time < time_from:
            continue
        if time_to is not None and ts_time > time_to:
            continue
        filtered.append({k: rec.get(k) for k in HOURLY_FIELDS if rec.get(k) is not None})
    return filtered


def fetch_weather(lat: float, lon: float, start_date: str, days: int, tz: str) -> list:
    params = {
        "lat": f"{lat:.5f}",
        "lon": f"{lon:.5f}",
        "date": start_date,
        "tz": tz,
        "units": "dwd",
    }
    if days > 1:
        end_dt = dt.date.fromisoformat(start_date) + dt.timedelta(days=days - 1)
        params["last_date"] = f"{end_dt.isoformat()}T23:59"

    url = f"{BRIGHTSKY_BASE}/weather?{urllib.parse.urlencode(params)}"
    data = http_get_json(url)
    return data.get("weather", [])


def fetch_alerts(lat: float, lon: float, tz: str) -> list:
    params = urllib.parse.urlencode({"lat": f"{lat:.5f}", "lon": f"{lon:.5f}", "tz": tz})
    data = http_get_json(f"{BRIGHTSKY_BASE}/alerts?{params}")
    alerts = []
    for alert in data.get("alerts", []):
        alerts.append({k: alert.get(k) for k in ALERT_FIELDS if alert.get(k) is not None})
    return alerts


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Fetch DWD hourly weather and alerts via Bright Sky."
    )
    parser.add_argument(
        "--location",
        action="append",
        default=[],
        help="Location name or 'lat,lon' (can be specified multiple times).",
    )
    parser.add_argument(
        "--route",
        nargs="+",
        default=[],
        help="Ordered list of route waypoints (names or 'lat,lon').",
    )
    parser.add_argument(
        "--intermediate",
        type=int,
        default=0,
        help="Number of interpolated waypoints between each pair of --route points.",
    )
    parser.add_argument(
        "--date",
        default=dt.date.today().isoformat(),
        help="Start date in YYYY-MM-DD (default: today).",
    )
    parser.add_argument(
        "--days",
        type=int,
        default=1,
        help="Number of days to fetch starting from --date (default: 1).",
    )
    parser.add_argument(
        "--from",
        dest="time_from",
        default=None,
        help="Filter hourly data starting at HH:MM (inclusive).",
    )
    parser.add_argument(
        "--to",
        dest="time_to",
        default=None,
        help="Filter hourly data ending at HH:MM (inclusive).",
    )
    parser.add_argument(
        "--tz",
        default="Europe/Berlin",
        help="Timezone for timestamps (default: Europe/Berlin).",
    )
    parser.add_argument(
        "--no-alerts",
        action="store_true",
        help="Skip fetching official DWD weather alerts.",
    )
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    if not args.location and not args.route:
        parser.error("Provide at least one --location or --route.")

    try:
        dt.date.fromisoformat(args.date)
        time_from = parse_hhmm(args.time_from) if args.time_from else None
        time_to = parse_hhmm(args.time_to) if args.time_to else None
    except ValueError as exc:
        print(json.dumps({"error": f"Invalid date/time format: {exc}"}, ensure_ascii=False))
        return 1

    raw_targets = []
    if args.route:
        raw_targets.extend(args.route)
    if args.location:
        raw_targets.extend(args.location)

    resolved_points = []
    geocoded_count = 0
    try:
        for target in raw_targets:
            needs_geocode = parse_coords(target) is None
            point = resolve_location(target, geocode_delay=(needs_geocode and geocoded_count > 0))
            if needs_geocode:
                geocoded_count += 1
            resolved_points.append(point)
    except (ValueError, urllib.error.URLError) as exc:
        print(json.dumps({"error": str(exc)}, ensure_ascii=False))
        return 1

    if args.route and args.intermediate > 0:
        route_count = len(args.route)
        route_points = interpolate_route(resolved_points[:route_count], args.intermediate)
        resolved_points = route_points + resolved_points[route_count:]

    results = []
    for pt in resolved_points:
        entry = {
            "label": pt["label"],
            "lat": pt["lat"],
            "lon": pt["lon"],
        }
        if pt.get("resolved_name"):
            entry["resolved_name"] = pt["resolved_name"]
        try:
            raw_hourly = fetch_weather(pt["lat"], pt["lon"], args.date, args.days, args.tz)
            entry["hourly"] = filter_hourly(raw_hourly, time_from, time_to)
            if not args.no_alerts:
                entry["alerts"] = fetch_alerts(pt["lat"], pt["lon"], args.tz)
        except urllib.error.URLError as exc:
            entry["error"] = f"API request failed: {exc}"
        results.append(entry)

    output = {
        "query": {
            "date": args.date,
            "days": args.days,
            "time_from": args.time_from,
            "time_to": args.time_to,
            "tz": args.tz,
        },
        "locations": results,
    }
    print(json.dumps(output, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
