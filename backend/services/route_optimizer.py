"""
Route optimization service using OR-Tools VRP solver.
Uses Haversine formula for all distance calculations.
"""
import math
from datetime import date
from typing import List, Dict, Any, Optional

from ortools.constraint_solver import routing_enums_pb2, pywrapcp
from sqlalchemy.orm import Session

from config import settings
from models.bin import Bin
from models.route import Route, RouteStop, RouteStatus
from models.user import User, UserRole
from models.zone import Zone


def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate distance between two GPS points in meters using Haversine formula."""
    R = 6371000  # Earth's radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lng2 - lng1)

    a = (
        math.sin(delta_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def build_distance_matrix(locations: List[Dict[str, float]]) -> List[List[int]]:
    """Build a Haversine distance matrix (in meters) for all locations."""
    n = len(locations)
    matrix = [[0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            if i != j:
                matrix[i][j] = int(
                    haversine_distance(
                        locations[i]["lat"], locations[i]["lng"],
                        locations[j]["lat"], locations[j]["lng"],
                    )
                )
    return matrix


def optimize_routes(
    bins_data: List[Dict[str, Any]],
    truck_capacity_kg: Optional[float] = None,
    depot_lat: Optional[float] = None,
    depot_lng: Optional[float] = None,
    collection_threshold_percent: Optional[int] = None,
    force_include_bin_ids: Optional[List[int]] = None,
) -> Dict[str, Any]:
    """
    Optimize collection routes using OR-Tools VRP.

    Args:
        bins_data: List of dicts with keys:
            id, lat, lng, fill_level, capacity_kg, status, label
        truck_capacity_kg: Max truck capacity (default from settings)
        depot_lat/lng: Starting location (default: centroid of bins)

    Returns:
        {
            "route": [ordered list of bin dicts],
            "total_distance_km": float,
            "estimated_duration_min": float,
            "bins_count": int
        }
    """
    if truck_capacity_kg is None:
        truck_capacity_kg = settings.DEFAULT_TRUCK_CAPACITY_KG

    threshold = (
        collection_threshold_percent
        if collection_threshold_percent is not None
        else settings.BIN_COLLECTION_THRESHOLD_PERCENT
    )
    force_include_ids = set(force_include_bin_ids or [])

    # Filter bins that need collection
    eligible_bins = [
        b for b in bins_data
        if b.get("fill_level", 0) >= threshold
        or b.get("status") in ("full", "overflow", "critical")
        or b.get("urgency") in ("high", "critical")
        or b.get("id") in force_include_ids
    ]

    if not eligible_bins:
        return {
            "route": [],
            "total_distance_km": 0.0,
            "estimated_duration_min": 0.0,
            "bins_count": 0,
        }

    # Use centroid as depot if not provided
    if depot_lat is None or depot_lng is None:
        depot_lat = sum(b["lat"] for b in eligible_bins) / len(eligible_bins)
        depot_lng = sum(b["lng"] for b in eligible_bins) / len(eligible_bins)

    # Build locations list: depot at index 0, then bins
    locations = [{"lat": depot_lat, "lng": depot_lng}]
    for b in eligible_bins:
        locations.append({"lat": b["lat"], "lng": b["lng"]})

    distance_matrix = build_distance_matrix(locations)

    # Estimate waste weight at each stop
    demands = [0]  # depot has 0 demand
    for b in eligible_bins:
        weight = b.get("capacity_kg", 50.0) * b.get("fill_level", 50) / 100.0
        demands.append(int(weight))

    # Identify urgent bins (full/overflow) — high penalty for dropping
    urgent_indices = set()
    for i, b in enumerate(eligible_bins):
        if (
            b.get("status") in ("full", "overflow", "critical")
            or b.get("urgency") in ("high", "critical")
            or b.get("id") in force_include_ids
        ):
            urgent_indices.add(i + 1)  # +1 because depot is index 0

    num_locations = len(locations)
    num_vehicles = 1

    # ── OR-Tools VRP Setup ────────────────────────────────────
    manager = pywrapcp.RoutingIndexManager(num_locations, num_vehicles, 0)
    routing = pywrapcp.RoutingModel(manager)

    # Distance callback
    def distance_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return distance_matrix[from_node][to_node]

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    # Capacity constraint
    def demand_callback(from_index):
        from_node = manager.IndexToNode(from_index)
        return demands[from_node]

    demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
    routing.AddDimensionWithVehicleCapacity(
        demand_callback_index,
        0,  # no slack
        [int(truck_capacity_kg)],  # vehicle capacities
        True,  # start cumul at zero
        "Capacity",
    )

    # Penalty for dropping non-urgent nodes (allow skipping low-priority)
    # Urgent bins get very high penalty (must visit)
    for node in range(1, num_locations):
        index = manager.NodeToIndex(node)
        if node in urgent_indices:
            routing.AddDisjunction([index], 1_000_000)  # Very high penalty
        else:
            routing.AddDisjunction([index], 10_000)  # Lower penalty

    # Search parameters
    search_params = pywrapcp.DefaultRoutingSearchParameters()
    search_params.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )
    search_params.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    )
    search_params.time_limit.seconds = 10

    # ── Solve ─────────────────────────────────────────────────
    solution = routing.SolveWithParameters(search_params)

    if not solution:
        # Fallback: return bins sorted by fill level descending
        sorted_bins = sorted(eligible_bins, key=lambda x: x.get("fill_level", 0), reverse=True)
        total_dist = 0
        for i in range(len(sorted_bins) - 1):
            total_dist += haversine_distance(
                sorted_bins[i]["lat"], sorted_bins[i]["lng"],
                sorted_bins[i + 1]["lat"], sorted_bins[i + 1]["lng"],
            )
        return {
            "route": sorted_bins,
            "total_distance_km": round(total_dist / 1000, 2),
            "estimated_duration_min": round(len(sorted_bins) * 10, 1),
            "bins_count": len(sorted_bins),
        }

    # Extract solution route
    route_order = []
    total_distance = 0
    index = routing.Start(0)

    while not routing.IsEnd(index):
        node = manager.IndexToNode(index)
        if node > 0:  # Skip depot
            route_order.append(eligible_bins[node - 1])
        previous_index = index
        index = solution.Value(routing.NextVar(index))
        total_distance += routing.GetArcCostForVehicle(previous_index, index, 0)

    total_distance_km = round(total_distance / 1000, 2)
    # Estimate: ~20 km/h average in urban Raipur + 5 min per stop
    estimated_duration = round((total_distance_km / 20) * 60 + len(route_order) * 5, 1)

    return {
        "route": route_order,
        "total_distance_km": total_distance_km,
        "estimated_duration_min": estimated_duration,
        "bins_count": len(route_order),
    }


def create_route_for_zone(
    db: Session,
    zone_id: int,
    *,
    collection_threshold_percent: int = 60,
    force_include_bin_ids: Optional[List[int]] = None,
    route_name_prefix: str = "AI Route",
) -> Dict[str, Any]:
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        raise ValueError("Zone not found")

    collector = (
        db.query(User)
        .filter(
            User.role == UserRole.collector,
            User.zone_id == zone_id,
            User.is_active.is_(True),
        )
        .order_by(User.id.asc())
        .first()
    )
    if not collector:
        return {
            "route_optimized": False,
            "route_id": None,
            "zone_name": zone.name,
            "stops_count": 0,
            "message": "No active collector assigned to this zone.",
        }

    bins = db.query(Bin).filter(Bin.zone_id == zone_id).all()
    bins_data = [
        {
            "id": bin_obj.id,
            "lat": bin_obj.latitude,
            "lng": bin_obj.longitude,
            "fill_level": bin_obj.fill_level,
            "capacity_kg": bin_obj.capacity_kg,
            "status": getattr(bin_obj.status, "value", bin_obj.status),
            "label": bin_obj.label,
        }
        for bin_obj in bins
    ]

    result = optimize_routes(
        bins_data,
        collection_threshold_percent=collection_threshold_percent,
        force_include_bin_ids=force_include_bin_ids,
    )
    if not result["route"]:
        return {
            "route_optimized": False,
            "route_id": None,
            "zone_name": zone.name,
            "stops_count": 0,
            "message": "No bins currently require collection in this zone.",
        }

    today = date.today()
    route = (
        db.query(Route)
        .filter(
            Route.zone_id == zone_id,
            Route.collector_id == collector.id,
            Route.date == today,
        )
        .first()
    )

    if route:
        db.query(RouteStop).filter(RouteStop.route_id == route.id).delete()
        route.name = f"{route_name_prefix} - {zone.name} - {today.isoformat()}"
        route.status = RouteStatus.planned
        route.total_distance_km = result["total_distance_km"]
        route.estimated_duration_min = result["estimated_duration_min"]
        route.optimized = True
    else:
        route = Route(
            name=f"{route_name_prefix} - {zone.name} - {today.isoformat()}",
            collector_id=collector.id,
            zone_id=zone_id,
            date=today,
            status=RouteStatus.planned,
            total_distance_km=result["total_distance_km"],
            estimated_duration_min=result["estimated_duration_min"],
            optimized=True,
        )
        db.add(route)
        db.flush()

    for sequence, bin_data in enumerate(result["route"], start=1):
        db.add(
            RouteStop(
                route_id=route.id,
                bin_id=bin_data["id"],
                sequence=sequence,
                status="pending",
            )
        )

    db.flush()
    return {
        "route_optimized": True,
        "route_id": route.id,
        "route_name": route.name,
        "zone_name": zone.name,
        "stops_count": result["bins_count"],
        "total_distance_km": result["total_distance_km"],
        "estimated_minutes": result["estimated_duration_min"],
        "message": "Route optimized successfully.",
    }
