from math import radians, sin, cos, sqrt, atan2

from sqlalchemy.orm import Session


def haversine_distance(lat1, lon1, lat2, lon2) -> float:
    """Returns distance in meters between two GPS coordinates"""
    R = 6371000
    phi1, phi2 = radians(lat1), radians(lat2)
    dphi = radians(lat2 - lat1)
    dlambda = radians(lon2 - lon1)
    a = sin(dphi/2)**2 + cos(phi1)*cos(phi2)*sin(dlambda/2)**2
    return R * 2 * atan2(sqrt(a), sqrt(1-a))


def is_within_radius(user_lat, user_lng, bin_lat, bin_lng, radius_m: float) -> bool:
    """Returns True if user is within radius_m meters of the bin.

    radius_m is required — callers should use get_geofence_radius() to
    obtain the admin-configured value.
    """
    return haversine_distance(user_lat, user_lng, bin_lat, bin_lng) <= radius_m


def get_geofence_radius(db: Session) -> float:
    """Read GEOFENCE_RADIUS_METERS from the DB SystemSettings table,
    falling back to the value in config.py if no DB row exists.

    This is the single source of truth for every enforcement point.
    """
    from models.settings import SystemSettings
    from config import settings as app_settings

    row = (
        db.query(SystemSettings)
        .filter(SystemSettings.key == "geofence_radius_meters")
        .first()
    )
    if row is not None:
        try:
            return float(row.value)
        except (TypeError, ValueError):
            pass
    return float(app_settings.GEOFENCE_RADIUS_METERS)
