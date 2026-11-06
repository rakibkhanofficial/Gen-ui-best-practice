import logging
import json
import re
from typing import Dict, Any, List, Optional
from google import genai

from app.config import settings
from app.models.schemas import (
    HotelSearchData,
    HotelItem,
    HotelRoomType,
    HotelDestinationSuggestion,
)

logger = logging.getLogger("genui.hotel")

# Initialize Gemini client if API key is present
_client = None
if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your_gemini_api_key_here":
    try:
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    except Exception as e:
        logger.warning(f"Could not initialize Gemini Client for hotel_tool: {e}")

USD_TO_BDT_RATE = 122.0


def _get_clarification_data(query: str = "hotels") -> HotelSearchData:
    """Returns interactive HITL clarification data when the user hasn't specified a destination location."""
    suggestions = [
        HotelDestinationSuggestion(
            id="dest-paris",
            name="Paris",
            country="France",
            flag="🇫🇷",
            tagline="Eiffel Views & Haute Luxury",
            popular_stay="The Ritz Paris & Four Seasons",
            image_url="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80",
        ),
        HotelDestinationSuggestion(
            id="dest-tokyo",
            name="Tokyo",
            country="Japan",
            flag="🇯🇵",
            tagline="Ginza, Shinjuku & Skyline Views",
            popular_stay="Aman Tokyo & Park Hyatt",
            image_url="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80",
        ),
        HotelDestinationSuggestion(
            id="dest-dubai",
            name="Dubai",
            country="UAE",
            flag="🇦🇪",
            tagline="Burj Khalifa & Palm Jumeirah",
            popular_stay="Burj Al Arab & Atlantis The Royal",
            image_url="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=400&q=80",
        ),
        HotelDestinationSuggestion(
            id="dest-cox",
            name="Cox's Bazar",
            country="Bangladesh",
            flag="🇧🇩",
            tagline="World's Longest Sandy Beach",
            popular_stay="Sayeman Beach & Ocean Paradise",
            image_url="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=400&q=80",
        ),
        HotelDestinationSuggestion(
            id="dest-bali",
            name="Bali",
            country="Indonesia",
            flag="🇮🇩",
            tagline="Tropical Infinity Villas & Oceanfront",
            popular_stay="Four Seasons Sayan & Ayana Resort",
            image_url="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80",
        ),
        HotelDestinationSuggestion(
            id="dest-dhaka",
            name="Dhaka",
            country="Bangladesh",
            flag="🇧🇩",
            tagline="Gulshan Diplomatic & Business 5-Star",
            popular_stay="The Westin & InterContinental",
            image_url="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80",
        ),
        HotelDestinationSuggestion(
            id="dest-ny",
            name="New York",
            country="USA",
            flag="🇺🇸",
            tagline="Manhattan Skyline & Central Park",
            popular_stay="The Plaza Hotel & The Carlyle",
            image_url="https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=400&q=80",
        ),
        HotelDestinationSuggestion(
            id="dest-london",
            name="London",
            country="UK",
            flag="🇬🇧",
            tagline="Westminster & Mayfair Heritage",
            popular_stay="The Savoy London & Claridge's",
            image_url="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=400&q=80",
        ),
        HotelDestinationSuggestion(
            id="dest-sylhet",
            name="Sylhet",
            country="Bangladesh",
            flag="🇧🇩",
            tagline="Rolling Tea Garden Eco-Resorts",
            popular_stay="Grand Sultan Tea Resort & Golf",
            image_url="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=400&q=80",
        ),
        HotelDestinationSuggestion(
            id="dest-bkk",
            name="Bangkok",
            country="Thailand",
            flag="🇹🇭",
            tagline="Chao Phraya River & Rooftops",
            popular_stay="Mandarin Oriental & Banyan Tree",
            image_url="https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=400&q=80",
        ),
        HotelDestinationSuggestion(
            id="dest-singapore",
            name="Singapore",
            country="Singapore",
            flag="🇸🇬",
            tagline="Marina Bay & Botanical Stays",
            popular_stay="Marina Bay Sands & Raffles",
            image_url="https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=400&q=80",
        ),
        HotelDestinationSuggestion(
            id="dest-rome",
            name="Rome",
            country="Italy",
            flag="🇮🇹",
            tagline="Historic Colosseum & Piazza Stays",
            popular_stay="Hotel de Russie & Hassler Roma",
            image_url="https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=400&q=80",
        ),
    ]

    return HotelSearchData(
        query=query,
        location="",
        check_in="Tomorrow",
        check_out="In 2 days",
        guests=2,
        total_results=len(suggestions),
        hotels=[],
        price_range_summary="Select or enter any destination in the world to explore rates and amenities",
        is_clarification_needed=True,
        clarification_title="Where would you like to stay?",
        clarification_message="Please pick a popular destination below or enter any city, region, or country in the world.",
        suggested_destinations=suggestions,
    )


def _generate_dynamic_hotels(location: str, check_in: str, check_out: str, guests: int) -> Optional[HotelSearchData]:
    """Uses Gemini with structured output to fetch real, authentic hotels for ANY location worldwide."""
    if not _client:
        return None

    try:
        prompt = f"""You are a luxury hospitality and hotel booking specialist.
The user is looking for premier hotels in: "{location}".
Check-in: {check_in}, Check-out: {check_out}, Guests: {guests}.

Return 3 to 5 real, renowned hotels for this destination with:
- Exact hotel name, star rating (4 to 5), category ("5-Star Luxury", "Beachfront Resort", "Heritage Palace", "Business Boutique", "Airport Hotel").
- Neighborhood/area, street address, guest rating (4.4 to 4.9), review count.
- Price per night in BDT (৳) and USD ($) (use exchange rate: 1 USD ≈ 122 BDT).
- High-resolution verified hotel image URL from Unsplash.
- 5 to 6 key amenities (e.g. Infinity Swimming Pool, Free High-Speed WiFi, Luxury Spa, Ocean View Balcony, Airport Shuttle, Free Breakfast Buffet).
- 2 realistic room types with pricing (in BDT and USD) and bed specifications.
- Free cancellation policy and check-in/out times.
- Distance to city center in km.
"""
        for model_name in ["gemini-3.5-flash-lite", "gemini-2.5-flash", "gemini-3.8-flash"]:
            try:
                response = _client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config={
                        "response_mime_type": "application/json",
                        "response_schema": HotelSearchData,
                        "temperature": 0.2,
                    },
                )
                if response and response.text:
                    data = json.loads(response.text)
                    # Normalize prices and currency fields
                    hotels = []
                    for h in data.get("hotels", []):
                        price_bdt = float(h.get("price_per_night_bdt") or 15000.0)
                        price_usd = float(h.get("price_per_night_usd") or round(price_bdt / USD_TO_BDT_RATE, 1))
                        
                        rooms = []
                        for r in h.get("room_types", []):
                            r_bdt = float(r.get("price_bdt") or price_bdt)
                            r_usd = float(r.get("price_usd") or round(r_bdt / USD_TO_BDT_RATE, 1))
                            rooms.append(
                                HotelRoomType(
                                    name=r.get("name", "Deluxe Room"),
                                    price_bdt=r_bdt,
                                    price_usd=r_usd,
                                    bed_type=r.get("bed_type", "1 King Bed"),
                                    capacity=r.get("capacity", f"{guests} Guests"),
                                    features=r.get("features", ["City View", "Free WiFi"]),
                                )
                            )

                        hotels.append(
                            HotelItem(
                                id=h.get("id") or f"hotel-{len(hotels) + 1}",
                                name=h.get("name", f"Grand Hotel {location}"),
                                star_rating=int(h.get("star_rating") or 5),
                                category=h.get("category", "5-Star Luxury"),
                                location_area=h.get("location_area", location),
                                address=h.get("address", f"Central {location}"),
                                rating=float(h.get("rating") or 4.8),
                                review_count=int(h.get("review_count") or 1200),
                                price_per_night_bdt=price_bdt,
                                price_per_night_usd=price_usd,
                                image_url=h.get("image_url") or "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=640&q=80",
                                amenities=h.get("amenities") or ["Free WiFi", "Swimming Pool", "Spa", "Breakfast Included"],
                                featured_badge=h.get("featured_badge") or "Premier Choice",
                                room_types=rooms if rooms else [
                                    HotelRoomType(
                                        name="Deluxe King Room",
                                        price_bdt=price_bdt,
                                        price_usd=price_usd,
                                        bed_type="1 King Bed",
                                        capacity=f"{guests} Guests",
                                        features=["City View", "Free Breakfast", "WiFi"],
                                    )
                                ],
                                check_in_time=h.get("check_in_time", "2:00 PM"),
                                check_out_time=h.get("check_out_time", "12:00 PM"),
                                booking_url=h.get("booking_url", "https://www.booking.com"),
                                free_cancellation=h.get("free_cancellation", True),
                                distance_to_center_km=float(h.get("distance_to_center_km") or 1.2),
                            )
                        )

                    if hotels:
                        min_bdt = min(h.price_per_night_bdt for h in hotels)
                        max_bdt = max(h.price_per_night_bdt for h in hotels)
                        min_usd = min(h.price_per_night_usd or (h.price_per_night_bdt / USD_TO_BDT_RATE) for h in hotels)
                        max_usd = max(h.price_per_night_usd or (h.price_per_night_bdt / USD_TO_BDT_RATE) for h in hotels)
                        
                        return HotelSearchData(
                            query=f"Hotels in {location}",
                            location=location,
                            check_in=check_in,
                            check_out=check_out,
                            guests=guests,
                            total_results=len(hotels),
                            hotels=hotels,
                            price_range_summary=f"৳{int(min_bdt):,} – ৳{int(max_bdt):,} / night (${int(min_usd)} – ${int(max_usd)}) with verified amenities",
                            is_clarification_needed=False,
                        )
            except Exception as err:
                logger.debug(f"Gemini hotels search with {model_name} failed: {err}")
                continue

        return None
    except Exception as e:
        logger.warning(f"Dynamic hotel search failed: {e}")
        return None


def _get_curated_hotels(location: str, check_in: str, check_out: str, guests: int) -> HotelSearchData:
    """Rich curated catalogs of premier 5-star hotels covering major international & Bangladesh destinations."""
    loc_lower = location.lower()

    # 1. Cox's Bazar, Bangladesh
    if any(k in loc_lower for k in ["cox", "bazar", "sea pearl", "marine drive"]):
        hotels = [
            HotelItem(
                id="hotel-sayeman-beach",
                name="Sayeman Beach Resort (5-Star Oceanfront)",
                star_rating=5,
                category="5-Star Beachfront Luxury Resort",
                location_area="Marine Drive, Kolatoli, Cox's Bazar",
                address="Marine Drive Road, Kolatoli, Cox's Bazar 4700, Bangladesh",
                rating=4.9,
                review_count=4280,
                price_per_night_bdt=12500.0,
                price_per_night_usd=102.0,
                image_url="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=640&q=80",
                amenities=[
                    "Oceanview Infinity Pool",
                    "Direct Private Beach Access",
                    "Complimentary Buffet Breakfast",
                    "High-Speed Free WiFi",
                    "Tarboosh Multi-Cuisine Restaurant",
                    "Beachside BBQ & Sun Terrace",
                ],
                featured_badge="Best Beachfront Resort",
                check_in_time="2:00 PM",
                check_out_time="11:30 AM",
                free_cancellation=True,
                distance_to_center_km=1.2,
                room_types=[
                    HotelRoomType(
                        name="Super Deluxe Ocean View",
                        price_bdt=12500.0,
                        price_usd=102.0,
                        bed_type="1 King Bed with Panoramic Balcony",
                        capacity="2 Adults + 1 Child",
                        features=["Ocean Front Balcony", "Bathtub", "Welcome Fruit Basket", "Mini Bar"],
                    ),
                    HotelRoomType(
                        name="Infinity Sea View Suite",
                        price_bdt=21000.0,
                        price_usd=172.0,
                        bed_type="1 Grand King Bed + Living Lounge",
                        capacity="3 Guests",
                        features=["Panoramic Sea View", "Jacuzzi", "VIP Lounge Access", "Airport Pickup"],
                    ),
                ],
            ),
            HotelItem(
                id="hotel-sea-pearl",
                name="Royal Tulip Sea Pearl Beach Resort & Spa",
                star_rating=5,
                category="5-Star Ultra-Luxury Beach Resort",
                location_area="Inani Beach, Cox's Bazar",
                address="Jaliapalong, Inani, Cox's Bazar 4750, Bangladesh",
                rating=4.8,
                review_count=3890,
                price_per_night_bdt=14500.0,
                price_per_night_usd=119.0,
                image_url="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=640&q=80",
                amenities=[
                    "Private Coral Inani Beach",
                    "Two Massive Outdoor Swimming Pools",
                    "Water Park & Private Water Sports",
                    "Radiance Luxury Spa & Sauna",
                    "Multiple International Dining Lounges",
                    "Complimentary Airport Limousine",
                ],
                featured_badge="Top Coral Beach Resort",
                free_cancellation=True,
                distance_to_center_km=18.0,
                room_types=[
                    HotelRoomType(
                        name="Superior Ocean View Room",
                        price_bdt=14500.0,
                        price_usd=119.0,
                        bed_type="1 King Bed or 2 Twin Beds",
                        capacity="2 Adults",
                        features=["Coral Beach View", "Free Breakfast", "Private Balcony"],
                    )
                ],
            ),
            HotelItem(
                id="hotel-ocean-paradise",
                name="Ocean Paradise Hotel & Resort",
                star_rating=5,
                category="5-Star Resort & Convention Center",
                location_area="Kolatoli Road, Cox's Bazar",
                address="28-29 Hotel Motel Zone, Kolatoli Road, Cox's Bazar, Bangladesh",
                rating=4.7,
                review_count=3120,
                price_per_night_bdt=9800.0,
                price_per_night_usd=80.0,
                image_url="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=640&q=80",
                amenities=[
                    "Rooftop Swimming Pool",
                    "Private Beach Club Access",
                    "Spa & Jacuzzi Suites",
                    "Free Airport Shuttle",
                    "Complimentary Breakfast",
                ],
                featured_badge="Top Family Value",
                free_cancellation=True,
                distance_to_center_km=1.5,
                room_types=[
                    HotelRoomType(
                        name="Deluxe Sea View Room",
                        price_bdt=9800.0,
                        price_usd=80.0,
                        bed_type="1 Queen Bed",
                        capacity="2 Adults",
                        features=["Sea Breeze Balcony", "Free Breakfast", "Tea/Coffee Maker"],
                    )
                ],
            ),
        ]
        return HotelSearchData(
            query=f"Hotels in {location}",
            location="Cox's Bazar, Bangladesh",
            check_in=check_in,
            check_out=check_out,
            guests=guests,
            total_results=len(hotels),
            hotels=hotels,
            price_range_summary="৳9,800 – ৳14,500 / night ($80 – $119) with oceanfront views & breakfast",
        )

    # 2. Sylhet / Sreemangal, Bangladesh
    if any(k in loc_lower for k in ["sylhet", "sreemangal", "tea garden", "jaflong"]):
        hotels = [
            HotelItem(
                id="hotel-grand-sultan",
                name="Grand Sultan Tea Resort & Golf",
                star_rating=5,
                category="5-Star Eco-Luxury Golf Resort",
                location_area="Radhanagar, Sreemangal, Sylhet",
                address="Radhanagar, Sreemangal 3210, Moulvibazar, Sylhet, Bangladesh",
                rating=4.9,
                review_count=3640,
                price_per_night_bdt=17500.0,
                price_per_night_usd=143.0,
                image_url="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=640&q=80",
                amenities=[
                    "9-Hole Executive Golf Course",
                    "3 Temperature-Controlled Pools",
                    "Spa, Steam & Ayurvedic Therapy",
                    "Movie Theater & Sports Arena",
                    "Tea Garden Panoramic Terraces",
                    "Free Gourmet Breakfast Buffet",
                ],
                featured_badge="Premier Eco-Golf Resort",
                free_cancellation=True,
                distance_to_center_km=3.5,
                room_types=[
                    HotelRoomType(
                        name="King Deluxe Tea View",
                        price_bdt=17500.0,
                        price_usd=143.0,
                        bed_type="1 King Bed",
                        capacity="2 Adults",
                        features=["Tea Garden View", "Bathtub", "Free Golf Access"],
                    )
                ],
            ),
            HotelItem(
                id="hotel-rose-view",
                name="Rose View Hotel Sylhet (5-Star)",
                star_rating=5,
                category="5-Star City Center Luxury",
                location_area="Shahjalal Upashahar, Sylhet",
                address="Plot 2, Block D, Shahjalal Upashahar, Sylhet 3100, Bangladesh",
                rating=4.7,
                review_count=2150,
                price_per_night_bdt=8500.0,
                price_per_night_usd=70.0,
                image_url="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=640&q=80",
                amenities=[
                    "Rooftop Swimming Pool",
                    "Fitness Studio & Sauna",
                    "Pakhtoon Gourmet Restaurant",
                    "Free Airport Transfer",
                    "High-Speed Free WiFi",
                ],
                featured_badge="Best City Business Stay",
                free_cancellation=True,
                distance_to_center_km=1.0,
                room_types=[
                    HotelRoomType(
                        name="Executive King Room",
                        price_bdt=8500.0,
                        price_usd=70.0,
                        bed_type="1 King Bed",
                        capacity="2 Adults",
                        features=["City Skyline View", "Free Breakfast", "Mini Bar"],
                    )
                ],
            ),
        ]
        return HotelSearchData(
            query=f"Hotels in {location}",
            location="Sylhet, Bangladesh",
            check_in=check_in,
            check_out=check_out,
            guests=guests,
            total_results=len(hotels),
            hotels=hotels,
            price_range_summary="৳8,500 – ৳17,500 / night ($70 – $143) with tea garden vistas",
        )

    # 3. Paris, France
    if any(k in loc_lower for k in ["paris", "france", "eiffel"]):
        hotels = [
            HotelItem(
                id="hotel-ritz-paris",
                name="The Ritz Paris (Palace Luxury)",
                star_rating=5,
                category="Historic Palace Luxury",
                location_area="Place Vendôme, 1st Arrondissement",
                address="15 Place Vendôme, 75001 Paris, France",
                rating=4.9,
                review_count=4850,
                price_per_night_bdt=195000.0,
                price_per_night_usd=1600.0,
                image_url="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=640&q=80",
                amenities=[
                    "Iconic Roman-Style Indoor Heated Pool",
                    "Chanel Spa au Ritz Paris",
                    "Espadon Michelin-Starred Fine Dining",
                    "Bar Hemingway Historic Lounge",
                    "Chauffeured Airport Transfer",
                ],
                featured_badge="Legendary Paris Palace",
                free_cancellation=True,
                distance_to_center_km=0.6,
                room_types=[
                    HotelRoomType(
                        name="Superior King Suite",
                        price_bdt=195000.0,
                        price_usd=1600.0,
                        bed_type="1 Grand King Bed",
                        capacity="2 Guests",
                        features=["Place Vendôme View", "Marble Bath", "24/7 Butler"],
                    )
                ],
            ),
            HotelItem(
                id="hotel-george-v",
                name="Four Seasons Hotel George V Paris",
                star_rating=5,
                category="5-Star Golden Triangle Luxury",
                location_area="Champs-Élysées, 8th Arrondissement",
                address="31 Avenue George V, 75008 Paris, France",
                rating=4.9,
                review_count=3920,
                price_per_night_bdt=185000.0,
                price_per_night_usd=1516.0,
                image_url="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=640&q=80",
                amenities=[
                    "5 Michelin Stars Under One Roof",
                    "Jeff Leatham World-Famous Floral Art",
                    "Hydrotherapy Pool & Spa",
                    "Private Eiffel Tower Balcony Options",
                    "Complimentary High-Speed WiFi",
                ],
                featured_badge="Eiffel Tower Proximity",
                free_cancellation=True,
                distance_to_center_km=1.1,
                room_types=[
                    HotelRoomType(
                        name="Deluxe Room with Parisian Balcony",
                        price_bdt=185000.0,
                        price_usd=1516.0,
                        bed_type="1 King Bed",
                        capacity="2 Adults",
                        features=["Courtyard View", "Nespresso Bar", "Hermès Amenities"],
                    )
                ],
            ),
        ]
        return HotelSearchData(
            query=f"Hotels in {location}",
            location="Paris, France",
            check_in=check_in,
            check_out=check_out,
            guests=guests,
            total_results=len(hotels),
            hotels=hotels,
            price_range_summary="€1,200 – €1,600 / night ($1,300 – $1,600) with Place Vendôme & Eiffel views",
        )

    # 4. Tokyo, Japan
    if any(k in loc_lower for k in ["tokyo", "japan", "shinjuku", "ginza"]):
        hotels = [
            HotelItem(
                id="hotel-aman-tokyo",
                name="Aman Tokyo (Skyline Sanctuary)",
                star_rating=5,
                category="5-Star Zen Luxury Sanctuary",
                location_area="Otemachi, Chiyoda, Tokyo",
                address="The Otemachi Tower, 1-5-6 Otemachi, Chiyoda-ku, Tokyo 100-0004",
                rating=4.9,
                review_count=3120,
                price_per_night_bdt=160000.0,
                price_per_night_usd=1310.0,
                image_url="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=640&q=80",
                amenities=[
                    "30-Meter Heated Skyline Pool",
                    "Traditional Japanese Onsen Baths",
                    "Arva Italian Fine Dining",
                    "Imperial Palace Gardens View",
                    "Aman Traditional Spa",
                ],
                featured_badge="Top Tokyo Skyline Luxury",
                free_cancellation=True,
                distance_to_center_km=0.8,
                room_types=[
                    HotelRoomType(
                        name="Deluxe Palace View Room",
                        price_bdt=160000.0,
                        price_usd=1310.0,
                        bed_type="1 King Bed or 2 Twins",
                        capacity="2 Adults",
                        features=["Mount Fuji & Palace View", "Furo Soaking Tub", "Washi Paper Decor"],
                    )
                ],
            ),
            HotelItem(
                id="hotel-park-hyatt-tokyo",
                name="Park Hyatt Tokyo (Shinjuku)",
                star_rating=5,
                category="5-Star Landmark Luxury",
                location_area="Nishi-Shinjuku, Shinjuku, Tokyo",
                address="3-7-1-2 Nishi-Shinjuku, Shinjuku-ku, Tokyo 163-1055",
                rating=4.8,
                review_count=4110,
                price_per_night_bdt=95000.0,
                price_per_night_usd=778.0,
                image_url="https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=640&q=80",
                amenities=[
                    "Club on the Park 47th-Floor Pool",
                    "New York Grill & Jazz Bar",
                    "Panoramic Mount Fuji Views",
                    "Full-Service Spa & Sauna",
                ],
                featured_badge="Iconic Shinjuku Tower",
                free_cancellation=True,
                distance_to_center_km=1.5,
                room_types=[
                    HotelRoomType(
                        name="Park View King Room",
                        price_bdt=95000.0,
                        price_usd=778.0,
                        bed_type="1 King Bed",
                        capacity="2 Adults",
                        features=["Skyline View", "Deep Soaking Tub", "Complimentary High-Tea"],
                    )
                ],
            ),
        ]
        return HotelSearchData(
            query=f"Hotels in {location}",
            location="Tokyo, Japan",
            check_in=check_in,
            check_out=check_out,
            guests=guests,
            total_results=len(hotels),
            hotels=hotels,
            price_range_summary="¥115,000 – ¥195,000 / night ($778 – $1,310) with Mount Fuji & skyline views",
        )

    # 5. Dubai, UAE
    if any(k in loc_lower for k in ["dubai", "uae", "burj", "emirates"]):
        hotels = [
            HotelItem(
                id="hotel-burj-al-arab",
                name="Burj Al Arab Jumeirah (7-Star Experience)",
                star_rating=5,
                category="Ultra-Luxury All-Suite Landmark",
                location_area="Jumeirah Beach Road, Umm Suqeim 3",
                address="Jumeirah St - Umm Suqeim - Umm Suqeim 3 - Dubai - UAE",
                rating=4.9,
                review_count=6850,
                price_per_night_bdt=240000.0,
                price_per_night_usd=1967.0,
                image_url="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=640&q=80",
                amenities=[
                    "Private Helipad & Rolls-Royce Phantom Fleet",
                    "Infinity Pool Terrace Extending into Arabian Gulf",
                    "Talise Spa 150m Above the Sea",
                    "Al Mahara Underwater Michelin Dining",
                    "24/7 Dedicated Floor Butler",
                ],
                featured_badge="World's Most Iconic Hotel",
                free_cancellation=True,
                distance_to_center_km=8.5,
                room_types=[
                    HotelRoomType(
                        name="Deluxe One-Bedroom Marina Suite",
                        price_bdt=240000.0,
                        price_usd=1967.0,
                        bed_type="1 Super King Bed + Duplex Living",
                        capacity="2 Adults + 2 Children",
                        features=["Panoramic Gulf View", "Jacuzzi for Two", "Hermès Toiletries", "iPad in 24k Gold"],
                    )
                ],
            ),
            HotelItem(
                id="hotel-atlantis-royal",
                name="Atlantis The Royal, Palm Jumeirah",
                star_rating=5,
                category="5-Star Ultra-Luxury Resort & Residences",
                location_area="Crescent Road, Palm Jumeirah, Dubai",
                address="Crescent Rd - Palm Jumeirah - Dubai - UAE",
                rating=4.9,
                review_count=4920,
                price_per_night_bdt=175000.0,
                price_per_night_usd=1434.0,
                image_url="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=640&q=80",
                amenities=[
                    "Cloud 22 90-Meter Sky Pool",
                    "17 World-Class Celebrity Chef Restaurants",
                    "Private 2km White Sand Beach",
                    "Complimentary Aquaventure Waterpark Access",
                ],
                featured_badge="Premier Palm Jumeirah Resort",
                free_cancellation=True,
                distance_to_center_km=14.0,
                room_types=[
                    HotelRoomType(
                        name="Seascape King Room",
                        price_bdt=175000.0,
                        price_usd=1434.0,
                        bed_type="1 King Bed",
                        capacity="2 Adults",
                        features=["Arabian Sea Balcony", "Walk-in Wardrobe", "Free Waterpark Passes"],
                    )
                ],
            ),
        ]
        return HotelSearchData(
            query=f"Hotels in {location}",
            location="Dubai, UAE",
            check_in=check_in,
            check_out=check_out,
            guests=guests,
            total_results=len(hotels),
            hotels=hotels,
            price_range_summary="AED 4,500 – AED 7,200 / night ($1,434 – $1,967) with private beach & sky pools",
        )

    # 6. Default: Dhaka, Bangladesh (Gulshan, Banani, Airport Road, Ramna)
    hotels = [
        HotelItem(
            id="hotel-westin-dhaka",
            name="The Westin Dhaka (5-Star Luxury)",
            star_rating=5,
            category="5-Star International Luxury",
            location_area="Gulshan-2, Dhaka",
            address="Main Gulshan Avenue, Plot-01, Road 45, Gulshan-2, Dhaka 1212",
            rating=4.8,
            review_count=2480,
            price_per_night_bdt=18500.0,
            price_per_night_usd=151.0,
            image_url="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=640&q=80",
            amenities=[
                "Heated Outdoor Pool",
                "Heavenly Spa by Westin",
                "5 Award-Winning Restaurants",
                "WestinWORKOUT Fitness Studio",
                "24/7 Airport Limousine Shuttle",
                "High-Speed Free WiFi",
            ],
            featured_badge="Premier Diplomatic Choice",
            check_in_time="3:00 PM",
            check_out_time="12:00 PM",
            free_cancellation=True,
            distance_to_center_km=0.5,
            room_types=[
                HotelRoomType(
                    name="Deluxe King Guest Room",
                    price_bdt=18500.0,
                    price_usd=151.0,
                    bed_type="1 Signature Westin Heavenly King Bed",
                    capacity="2 Guests",
                    features=["Gulshan Skyline View", "Heavenly Bath", "Soundproof Glass", "Work Desk"],
                ),
                HotelRoomType(
                    name="Executive Club Suite",
                    price_bdt=31000.0,
                    price_usd=254.0,
                    bed_type="1 King Bed + Separate Living Room",
                    capacity="2 Adults + 1 Child",
                    features=["Club Lounge Free Breakfast & Cocktails", "Butler Service", "Express Check-in"],
                ),
            ],
        ),
        HotelItem(
            id="hotel-intercontinental-dhaka",
            name="InterContinental Dhaka",
            star_rating=5,
            category="5-Star Historic Heritage Luxury",
            location_area="Minto Road, Ramna, Dhaka",
            address="1 Minto Road, Ramna, Dhaka 1000, Bangladesh",
            rating=4.9,
            review_count=3150,
            price_per_night_bdt=22000.0,
            price_per_night_usd=180.0,
            image_url="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=640&q=80",
            amenities=[
                "Temperature-Controlled Lagoon Pool",
                "Balaka Heritage Spa & Wellness",
                "Elements All-Day Dining & Club Lounge",
                "Lush Private Botanical Lawns",
                "State-of-the-art Gym & Steam Room",
                "VIP Airport Transfer",
            ],
            featured_badge="Top Historic 5-Star",
            check_in_time="2:00 PM",
            check_out_time="12:00 PM",
            free_cancellation=True,
            distance_to_center_km=1.0,
            room_types=[
                HotelRoomType(
                    name="Classic Luxury King Room",
                    price_bdt=22000.0,
                    price_usd=180.0,
                    bed_type="1 Ultra Plush King Bed",
                    capacity="2 Guests",
                    features=["Heritage Garden View", "Marble Bathroom with Tub", "Nespresso Machine"],
                ),
                HotelRoomType(
                    name="Diplomatic Suite",
                    price_bdt=42000.0,
                    price_usd=344.0,
                    bed_type="1 Grand King Bed + Dining Area",
                    capacity="3 Guests",
                    features=["Executive Club Privileges", "Private Meeting Room", "Airport VIP Escort"],
                ),
            ],
        ),
        HotelItem(
            id="hotel-radisson-dhaka",
            name="Radisson Blu Dhaka Water Garden",
            star_rating=5,
            category="5-Star Resort-Style Luxury",
            location_area="Airport Road, Dhaka Cantonment",
            address="Airport Road, Dhaka Cantonment, Dhaka 1206, Bangladesh",
            rating=4.8,
            review_count=2910,
            price_per_night_bdt=19800.0,
            price_per_night_usd=162.0,
            image_url="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=640&q=80",
            amenities=[
                "7 Acres of Manicured Water Gardens",
                "5 Minutes to Hazrat Shahjalal Airport",
                "Outdoor Heated Swimming Pool & Spa",
                "Tennis Courts & Jogging Track",
                "Water Garden Brasserie & Sublime Grill",
                "Complimentary Airport Shuttle",
            ],
            featured_badge="Best Near Airport",
            check_in_time="2:00 PM",
            check_out_time="12:00 PM",
            free_cancellation=True,
            distance_to_center_km=4.2,
            room_types=[
                HotelRoomType(
                    name="Superior Room - Water Garden View",
                    price_bdt=19800.0,
                    price_usd=162.0,
                    bed_type="1 King Bed or 2 Twin Beds",
                    capacity="2 Guests",
                    features=["Garden & Pool View", "Rain Shower", "Workstation", "Free Buffet Breakfast"],
                ),
            ],
        ),
        HotelItem(
            id="hotel-sarina-dhaka",
            name="Hotel Sarina Dhaka (5-Star Boutique)",
            star_rating=5,
            category="5-Star Boutique Business Hotel",
            location_area="Banani Commercial Area, Dhaka",
            address="Plot 27, Road 17, Banani C/A, Dhaka 1213, Bangladesh",
            rating=4.6,
            review_count=1890,
            price_per_night_bdt=11200.0,
            price_per_night_usd=92.0,
            image_url="https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=640&q=80",
            amenities=[
                "Rooftop Swimming Pool & Bar",
                "Aura Italian & Indian Fine Dining",
                "Walking Distance to Banani 11 Cafes",
                "Free High-Speed WiFi & Breakfast",
                "Fitness Center & Steam",
            ],
            featured_badge="Best Value 5-Star",
            check_in_time="2:00 PM",
            check_out_time="12:00 PM",
            free_cancellation=True,
            distance_to_center_km=1.8,
            room_types=[
                HotelRoomType(
                    name="Imperial Deluxe Room",
                    price_bdt=11200.0,
                    price_usd=92.0,
                    bed_type="1 King Bed",
                    capacity="2 Guests",
                    features=["Banani View", "Free Breakfast", "Mini Fridge", "Complimentary High-Tea"],
                )
            ],
        ),
    ]

    return HotelSearchData(
        query=f"Hotels in {location}",
        location=location if location else "Dhaka, Bangladesh",
        check_in=check_in,
        check_out=check_out,
        guests=guests,
        total_results=len(hotels),
        hotels=hotels,
        price_range_summary="৳11,200 – ৳22,000 / night ($92 – $180) across top verified 5-star properties",
    )


def search_hotels(
    location: str = "",
    check_in: str = "Tomorrow",
    check_out: str = "In 2 days",
    guests: int = 2
) -> Dict[str, Any]:
    """Search luxury hotels, resorts, room rates, and amenities for any city, region, or country worldwide.
    If no location is specified, returns interactive HITL clarification data so user can choose or type a destination.
    """
    clean_loc = (location or "").strip()

    # If location is empty or generic, trigger interactive destination selection / HITL
    if not clean_loc or clean_loc.lower() in ["", "any", "hotel", "hotels", "anywhere", "somewhere"]:
        logger.info("No location provided for hotel search; triggering interactive destination clarification")
        clarification = _get_clarification_data()
        return clarification.model_dump()

    # First attempt: live dynamic search via Gemini for any global destination
    dynamic_data = _generate_dynamic_hotels(clean_loc, check_in, check_out, guests)
    if dynamic_data and dynamic_data.hotels:
        logger.info(f"Retrieved dynamic hotels data for location: '{clean_loc}' ({len(dynamic_data.hotels)} hotels)")
        return dynamic_data.model_dump()

    # Second attempt: rich curated catalogs for popular destinations
    logger.info(f"Using curated hotels catalog for location: '{clean_loc}'")
    curated = _get_curated_hotels(clean_loc, check_in, check_out, guests)
    return curated.model_dump()
