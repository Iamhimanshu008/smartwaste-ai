from math import radians, sin, cos, sqrt, atan2

def haversine_distance(lat1, lon1, lat2, lon2) -> float:
    """Returns distance in meters between two GPS coordinates"""
    R = 6371000
    phi1, phi2 = radians(lat1), radians(lat2)
    dphi = radians(lat2 - lat1)
    dlambda = radians(lon2 - lon1)
    a = sin(dphi/2)**2 + cos(phi1)*cos(phi2)*sin(dlambda/2)**2
    return R * 2 * atan2(sqrt(a), sqrt(1-a))

def is_within_radius(user_lat, user_lng, bin_lat, bin_lng, radius_m=50) -> bool:
    """Returns True if user is within radius_m meters of the bin"""
    return haversine_distance(user_lat, user_lng, bin_lat, bin_lng) <= radius_m
