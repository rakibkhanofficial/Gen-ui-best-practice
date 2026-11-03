from typing import Dict, Any
from app.models.schemas import RouteDistanceData, TravelModeOption, RouteWaypoint, NavigationStep


def calculate_route_distance(origin: str = "San Francisco, CA", destination: str = "Lake Tahoe, CA") -> Dict[str, Any]:
    """Calculates route distance, travel modes, waypoints, and navigation instructions between two locations.
    
    Args:
        origin: Starting address or city (e.g. 'San Francisco, CA').
        destination: Destination address or city (e.g. 'Lake Tahoe, CA').
    """
    route = RouteDistanceData(
        origin=origin,
        destination=destination,
        recommended_mode="driving",
        options=[
            TravelModeOption(
                mode="driving",
                duration_text="3 hr 42 min",
                distance_km=315.4,
                distance_miles=196.0,
                estimated_cost="$35 - $45 (Fuel)",
                carbon_kg=48.2,
                is_recommended=True
            ),
            TravelModeOption(
                mode="transit",
                duration_text="5 hr 15 min",
                distance_km=332.0,
                distance_miles=206.3,
                estimated_cost="$48 - $65 (Amtrak / Bus)",
                carbon_kg=18.5,
                is_recommended=False
            ),
            TravelModeOption(
                mode="flying",
                duration_text="1 hr 10 min (+ airport time)",
                distance_km=280.0,
                distance_miles=174.0,
                estimated_cost="$180 - $260",
                carbon_kg=74.0,
                is_recommended=False
            )
        ],
        waypoints=[
            RouteWaypoint(name="San Francisco Bay Bridge", distance_from_start_km=8.2, note="Expect light bridge traffic"),
            RouteWaypoint(name="Sacramento I-80 Junction", distance_from_start_km=142.0, note="Ideal charging & rest stop"),
            RouteWaypoint(name="Donner Summit Pass (7,239 ft)", distance_from_start_km=278.5, note="Scenic alpine elevation"),
            RouteWaypoint(name="Lake Tahoe Shoreline", distance_from_start_km=315.4, note="Arrival destination")
        ],
        steps=[
            NavigationStep(step_number=1, instruction="Take I-80 East across San Francisco-Oakland Bay Bridge", distance="12.4 mi", duration="18 min"),
            NavigationStep(step_number=2, instruction="Continue on I-80 E through Vallejo and Sacramento", distance="84.2 mi", duration="1 hr 15 min"),
            NavigationStep(step_number=3, instruction="Follow I-80 E / US-50 towards South Lake Tahoe", distance="72.1 mi", duration="1 hr 20 min"),
            NavigationStep(step_number=4, instruction="Merge onto Lake Tahoe Blvd to destination", distance="27.3 mi", duration="49 min")
        ],
        map_summary=f"Scenic mountain route from {origin} to {destination} primarily via I-80 E and US-50. Clear mountain highway pass with 196 total miles."
    )
    return route.model_dump()

