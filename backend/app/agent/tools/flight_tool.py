from typing import Dict, Any
from app.models.schemas import FlightSearchData, FlightOption, FlightSegment


def search_flights(origin: str = "Dhaka", destination: str = "Tokyo", departure_date: str = "2026-12-15") -> Dict[str, Any]:
    """Search flights between cities with prices, airlines, and schedules."""
    
    origin_codes = {
        "dhaka": ("Hazrat Shahjalal Intl", "DAC"),
        "tokyo": ("Narita International", "NRT"),
        "london": ("Heathrow", "LHR"),
        "dubai": ("Dubai International", "DXB"),
        "new york": ("JFK International", "JFK"),
        "singapore": ("Changi", "SIN"),
        "bangkok": ("Suvarnabhumi", "BKK"),
        "istanbul": ("Istanbul Airport", "IST"),
        "kolkata": ("Netaji Subhas Chandra Bose", "CCU"),
    }

    o_lower = origin.lower()
    d_lower = destination.lower()
    o_name, o_code = origin_codes.get(o_lower, (f"{origin} Airport", origin[:3].upper()))
    d_name, d_code = origin_codes.get(d_lower, (f"{destination} Airport", destination[:3].upper()))

    flights = [
        FlightOption(
            id="fl-001",
            price=485.00,
            currency="USD",
            trip_type="One Way",
            outbound=FlightSegment(
                airline="Singapore Airlines",
                airline_logo="https://upload.wikimedia.org/wikipedia/en/thumb/6/6b/Singapore_Airlines_Logo_2.svg/250px-Singapore_Airlines_Logo_2.svg.png",
                flight_number="SQ 437",
                departure_airport=o_name,
                departure_code=o_code,
                departure_time="08:30",
                arrival_airport=d_name,
                arrival_code=d_code,
                arrival_time="18:45",
                duration="7h 15m",
                aircraft="Airbus A350-900",
                cabin_class="Economy",
                stops=1,
                stop_cities=["Singapore (SIN)"],
            ),
            baggage="23kg checked + 7kg cabin",
            refundable=True,
            score=96,
            badge="Best Value",
        ),
        FlightOption(
            id="fl-002",
            price=612.00,
            currency="USD",
            trip_type="One Way",
            outbound=FlightSegment(
                airline="Emirates",
                airline_logo="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Emirates_logo.svg/300px-Emirates_logo.svg.png",
                flight_number="EK 585",
                departure_airport=o_name,
                departure_code=o_code,
                departure_time="22:10",
                arrival_airport=d_name,
                arrival_code=d_code,
                arrival_time="14:20+1",
                duration="9h 10m",
                aircraft="Boeing 777-300ER",
                cabin_class="Economy",
                stops=1,
                stop_cities=["Dubai (DXB)"],
            ),
            baggage="30kg checked + 7kg cabin",
            refundable=True,
            score=92,
            badge="Premium Service",
        ),
        FlightOption(
            id="fl-003",
            price=398.00,
            currency="USD",
            trip_type="One Way",
            outbound=FlightSegment(
                airline="AirAsia X",
                airline_logo="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/AirAsia_New_Logo.svg/200px-AirAsia_New_Logo.svg.png",
                flight_number="D7 521",
                departure_airport=o_name,
                departure_code=o_code,
                departure_time="01:45",
                arrival_airport=d_name,
                arrival_code=d_code,
                arrival_time="13:30",
                duration="8h 45m",
                aircraft="Airbus A330-300",
                cabin_class="Economy",
                stops=1,
                stop_cities=["Kuala Lumpur (KUL)"],
            ),
            baggage="20kg checked",
            refundable=False,
            score=88,
            badge="Cheapest",
        ),
    ]

    data = FlightSearchData(
        origin=origin.title(),
        origin_code=o_code,
        destination=destination.title(),
        destination_code=d_code,
        departure_date=departure_date,
        return_date=None,
        passengers=1,
        cabin_class="Economy",
        total_results=len(flights),
        flights=flights,
    )
    return data.model_dump()
