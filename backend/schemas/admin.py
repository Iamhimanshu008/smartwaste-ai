from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class DashboardStats(BaseModel):
    total_plastic_kg: float = 0.0
    fuel_saved_liters: float = 0.0
    co2_saved_kg: float = 0.0
    active_bins: int = 0
    pending_reports: int = 0
    total_users: int = 0
    collections_today: int = 0


class AdminSettings(BaseModel):
    geofence_radius_meters: float = 500.0
    ai_confidence_threshold: float = 0.7
    bin_collection_threshold_percent: int = 75
    spam_window_minutes: int = 30
    default_truck_capacity_kg: float = 500.0


class AnalyticsData(BaseModel):
    daily_collections: List[Dict[str, Any]] = []
    zone_wise: List[Dict[str, Any]] = []
    bin_status_distribution: List[Dict[str, Any]] = []
