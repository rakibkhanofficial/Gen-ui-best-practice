from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Literal


# --- 1. Weather Schemas ---
class ForecastDay(BaseModel):
    day: str
    date: str
    condition: str
    high_temp_c: float
    low_temp_c: float
    high_temp_f: float
    low_temp_f: float
    precipitation_prob: int
    icon: str


class WeatherData(BaseModel):
    city: str
    country: str
    condition: str
    temp_c: float
    temp_f: float
    feels_like_c: float
    feels_like_f: float
    humidity: int
    wind_speed_kmh: float
    air_quality_index: int
    air_quality_label: str
    uv_index: int
    summary: str
    forecast: List[ForecastDay]


# --- 2. Sales & Business Analytics Schemas ---
class SalesKPI(BaseModel):
    label: str
    value: str
    change_pct: float
    trend: Literal["up", "down", "neutral"]
    period: str


class MonthlySalesPoint(BaseModel):
    month: str
    revenue: float
    target: float
    orders: int
    expenses: float


class TransactionRow(BaseModel):
    id: str
    customer: str
    tier: Literal["Enterprise", "Growth", "Starter"]
    plan: str
    amount: float
    status: Literal["Paid", "Pending", "Failed"]
    date: str


class SalesAnalyticsData(BaseModel):
    title: str
    quarter: str
    year: int
    currency: str
    kpis: List[SalesKPI]
    monthly_trend: List[MonthlySalesPoint]
    category_breakdown: List[Dict[str, Any]]
    recent_transactions: List[TransactionRow]
    summary_insight: str


# --- 3. Miro-style Planning Board Schemas ---
class StickyNote(BaseModel):
    id: str
    title: str
    content: str
    color: Literal["yellow", "blue", "green", "pink", "purple", "orange"]
    tags: List[str]
    votes: int
    assignee: Optional[str] = None
    column_id: str


class BoardColumn(BaseModel):
    id: str
    title: str
    color_accent: str
    notes: List[StickyNote]


class PlanningBoardData(BaseModel):
    board_id: str
    title: str
    description: str
    last_updated: str
    columns: List[BoardColumn]
    initial_mode: Optional[str] = "board"
    mcp_app_url: Optional[str] = "https://mcp.excalidraw.com"
    mcp_server_id: Optional[str] = "example_mcp_app"
    excalidraw_elements: Optional[List[Dict[str, Any]]] = None


# --- 4. Product Catalog & Comparison Schemas ---
class ProductSpec(BaseModel):
    key: str
    value: str
    highlight: bool = False


class ProductColorOption(BaseModel):
    name: str
    hex_code: str
    label: str


class ProductStorageOption(BaseModel):
    capacity: str
    price_usd: float
    price_bdt: float


class ComparisonCategoryWinner(BaseModel):
    category: str        # e.g. "Camera & Video", "Chipset & Speed", "Battery Life", "Display & Glass", "Value"
    winner_name: str     # e.g. "iPhone 16 Pro"
    winner_reason: str   # e.g. "4K 120fps Dolby Vision, ProRes Log & dedicated Camera Control button"


class ProductComparisonMatrix(BaseModel):
    title: str
    verdict: str
    winner_device_id: str
    category_winners: List[ComparisonCategoryWinner]
    recommended_for_a: str
    recommended_for_b: str


class ProductItem(BaseModel):
    id: str
    name: str
    tagline: str
    brand: str
    category: str
    price: float
    currency: str = "USD ($)"
    price_bdt: Optional[float] = None
    rating: float
    review_count: int
    image_url: str
    badge: Optional[str] = None
    specs: List[ProductSpec]
    key_features: List[str]
    in_stock: bool = True
    # Enhanced Phone & Tech Specs
    colors: Optional[List[ProductColorOption]] = None
    storage_options: Optional[List[ProductStorageOption]] = None
    pros: Optional[List[str]] = None
    cons: Optional[List[str]] = None
    benchmarks: Optional[Dict[str, str]] = None
    overall_score: Optional[float] = 9.4


class ProductCatalogData(BaseModel):
    query: str
    total_found: int
    highlight_category: str
    products: List[ProductItem]
    is_comparison: bool = False
    comparison_matrix: Optional[ProductComparisonMatrix] = None
    available_competitors: Optional[List[str]] = None


# --- 5. Route & Distance Explorer Schemas ---
class RouteWaypoint(BaseModel):
    name: str
    distance_from_start_km: float
    note: Optional[str] = None


class TravelModeOption(BaseModel):
    mode: Literal["driving", "transit", "flying", "walking"]
    duration_text: str
    distance_km: float
    distance_miles: float
    estimated_cost: Optional[str] = None
    carbon_kg: Optional[float] = None
    is_recommended: bool = False


class NavigationStep(BaseModel):
    step_number: int
    instruction: str
    distance: str
    duration: str


class RouteDistanceData(BaseModel):
    origin: str
    destination: str
    recommended_mode: str
    options: List[TravelModeOption]
    waypoints: List[RouteWaypoint]
    steps: List[NavigationStep]
    map_summary: str
    osm_embed_url: Optional[str] = None
    osm_directions_url: Optional[str] = None
    google_maps_directions_url: Optional[str] = None
    origin_coords: Optional[List[float]] = None
    destination_coords: Optional[List[float]] = None
    route_summary_notes: Optional[str] = None


# --- 6. Human-in-the-Loop (HITL) Action Approval Schemas ---
class ResourceImpact(BaseModel):
    resource_type: str
    resource_name: str
    action: Literal["create", "update", "delete", "refund", "deploy"]
    current_state: Optional[str] = None
    proposed_state: Optional[str] = None


class HITLActionData(BaseModel):
    action_id: str
    action_type: str
    title: str
    description: str
    risk_level: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    timeout_seconds: int = 60
    impacts: List[ResourceImpact]
    status: Literal["pending_approval", "approved", "rejected", "executed", "expired"]
    created_at: str
    requested_by: str
    requires_confirmation_token: bool = True



# --- 7. Interactive Code Studio Schemas ---
class CodeFile(BaseModel):
    filename: str
    language: str
    code: str
    explanation: str
    output_simulation: Optional[str] = None
    complexity: Optional[str] = "O(n)"


class CodeSnippetData(BaseModel):
    title: str
    description: str
    active_language: str
    execution_command: str
    files: List[CodeFile]


# --- 8. Job Board & Search Schemas (BDJobs & LinkedIn) ---
class JobListing(BaseModel):
    id: str
    title: str
    company: str
    company_logo: Optional[str] = None
    location: str
    platform: Literal["BDJobs", "LinkedIn", "RemoteGlobal"]
    salary_range: str
    work_type: Literal["Remote", "Hybrid", "On-site"]
    experience_level: Literal["Junior", "Mid-Level", "Senior", "Lead"]
    tags: List[str]
    posted_time: str
    description: str
    apply_url: str
    match_score: int
    interview_tips: Optional[List[str]] = None


class JobSearchData(BaseModel):
    query: str
    location: str
    total_jobs: int
    featured_platform: str
    jobs: List[JobListing]


# --- 9. Flight Search & Details Schemas ---
class FlightSegment(BaseModel):
    airline: str
    airline_logo: str
    flight_number: str
    departure_airport: str
    departure_code: str
    departure_time: str
    arrival_airport: str
    arrival_code: str
    arrival_time: str
    duration: str
    aircraft: str
    cabin_class: str
    stops: int
    stop_cities: List[str] = []


class FlightOption(BaseModel):
    id: str
    price: float
    currency: str
    trip_type: str
    outbound: FlightSegment
    inbound: Optional[FlightSegment] = None
    baggage: str
    refundable: bool
    score: int
    badge: Optional[str] = None
    price_bdt: Optional[float] = None
    price_inr: Optional[float] = None
    preferred_currency: Optional[str] = "BDT"


class FlightSearchData(BaseModel):
    origin: str
    origin_code: str
    destination: str
    destination_code: str
    departure_date: str
    return_date: Optional[str] = None
    passengers: int
    cabin_class: str
    total_results: int
    flights: List[FlightOption]
    default_currency: str = "BDT"
    exchange_rates: Optional[Dict[str, float]] = None


# --- 10. Currency Converter Schemas ---
class CurrencyRate(BaseModel):
    code: str
    name: str
    flag_emoji: str
    rate_to_usd: float
    rate_from_usd: float
    change_24h: float
    trend: Literal["up", "down", "neutral"]


class CurrencyConversion(BaseModel):
    from_currency: str
    from_amount: float
    to_currency: str
    to_amount: float
    rate: float
    inverse_rate: float
    last_updated: str


class CurrencyConverterData(BaseModel):
    conversion: CurrencyConversion
    popular_rates: List[CurrencyRate]
    historical_note: str


# --- 11. YouTube Video Suggestion Schemas ---
class YouTubeVideo(BaseModel):
    id: str
    video_id: str
    title: str
    channel_name: str
    channel_avatar: str
    thumbnail_url: str
    duration: str
    views: str
    published: str
    description: str
    tags: List[str] = []
    like_count: Optional[str] = None


class YouTubeSearchData(BaseModel):
    query: str
    total_results: int
    videos: List[YouTubeVideo]


# --- 12. Website Link Preview Schemas ---
class WebsiteLink(BaseModel):
    url: str
    title: str
    description: str
    favicon_url: str
    og_image: Optional[str] = None
    domain: str
    category: str
    relevance_note: str


class WebsiteLinkData(BaseModel):
    query: str
    total_results: int
    websites: List[WebsiteLink]


# --- 13. Meeting Time Picker & Scheduling Schemas ---
class MeetingSlot(BaseModel):
    id: str
    date: str
    start_time: str
    end_time: str
    duration_minutes: int
    badge: Optional[str] = None
    is_recommended: bool = False


class MeetingParticipant(BaseModel):
    name: str
    email: str
    avatar: str
    role: str


class MeetingScheduleData(BaseModel):
    meeting_id: str
    title: str
    reason: str
    duration_minutes: int
    timezone: str
    host: MeetingParticipant
    participants: List[MeetingParticipant]
    available_slots: List[MeetingSlot]
    google_meet_url: str
    status: str = "pending"  # pending | confirmed | declined



# --- 14. Medicine & Generic Alternatives Schemas ---
class MedicineAlternative(BaseModel):
    brand_name: str
    generic_name: str
    manufacturer: str  # e.g. "ACI Limited", "Square Pharmaceuticals", "Beximco"
    strength: str      # e.g. "500 mg", "665 mg XR"
    form: str          # "Tablet", "Syrup", "Suspension", "Suppository"
    price_bdt: float   # e.g. 1.20
    is_requested: bool = False
    highlights: Optional[str] = None  # e.g. "Direct Generic Match", "XR Extended Release", "Cost-effective"
    company_favicon_url: Optional[str] = None
    image_url: Optional[str] = None
    dar_reg_no: Optional[str] = None


class MedicineItem(BaseModel):
    id: str
    brand_name: str
    generic_name: str
    manufacturer: str
    dosage_form: str
    strength: str
    pack_size: str
    unit_price_bdt: float
    strip_price_bdt: float
    indications: List[str]
    dosage_guide: str
    safety_advice: str
    pregnancy_category: str
    alternatives: List[MedicineAlternative]
    ecommerce_available: bool = True
    in_stock: bool = True
    company_favicon_url: Optional[str] = None
    image_url: Optional[str] = None
    dar_reg_no: Optional[str] = None


class MedicineSearchData(BaseModel):
    query: str
    primary_medicine: MedicineItem
    alternatives_count: int
    generic_group: str
    disclaimer: str = "Always consult a licensed physician before starting or switching medications."


# --- 15. Doctor Directory & Chamber Booking Schemas ---
class DoctorChamber(BaseModel):
    hospital_name: str
    location: str
    visiting_days: str
    visiting_hours: str
    room_no: str
    hotline: str


class DoctorItem(BaseModel):
    id: str
    name: str
    avatar_url: str
    degrees: str
    designation: str
    specialty: str
    experience_years: int
    rating: float
    review_count: int
    consultation_fee_bdt: float
    chambers: List[DoctorChamber]
    key_expertise: List[str]
    available_today: bool = True
    appointment_slot: str


class DoctorSearchData(BaseModel):
    query: str
    specialty: str
    location: str
    total_results: int
    doctors: List[DoctorItem]


# --- 16. Agriculture & Crop Care Products Schemas ---
class AgriProductItem(BaseModel):
    id: str
    name: str
    category: str  # "Hybrid Seeds", "Crop Care", "Bio-Fertilizer", "Farm Machinery"
    manufacturer: str  # "ACI Agribusiness", "ACI Motors", "ACI Crop Care"
    image_url: str
    pack_size: str
    price_bdt: float
    target_crops: List[str]
    active_ingredient: Optional[str] = None
    key_benefits: List[str]
    application_rate: str
    in_stock: bool = True
    ecom_link: str = "https://www.aci-bd.com/businesses/agribusinesses"
    dealer_contact: str = "ACI Agro Hotline: 16500"


class AgriProductSearchData(BaseModel):
    query: str
    category: str
    total_results: int
    products: List[AgriProductItem]
    seasonal_advice: str


# --- 17. Google Maps & Location Explorer Schemas ---
class MapPlaceItem(BaseModel):
    id: str
    name: str
    category: str
    address: str
    latitude: float
    longitude: float
    rating: float
    review_count: int
    open_now: bool = True
    opening_hours: str
    phone: str
    google_maps_url: str
    embed_map_url: str
    distance_km: Optional[float] = None
    travel_time_min: Optional[int] = None


class MapSearchData(BaseModel):
    query: str
    location: str
    places: List[MapPlaceItem]
    active_place_index: int = 0


# --- 18. Math Problem Solver & Grapher Schemas ---
class MathStep(BaseModel):
    step_number: int
    title: str
    explanation: str
    latex_expression: str


class MathSolverData(BaseModel):
    problem_title: str
    problem_type: str  # "Algebra", "Calculus", "Trigonometry", "Financial Math", "Geometry"
    input_expression: str
    latex_input: str
    solution_latex: str
    solution_summary: str
    steps: List[MathStep]
    graph_coordinates: Optional[List[Dict[str, float]]] = None
    formula_identity: Optional[str] = None
    practical_application: str


# --- 19. Hotel Search & Booking Schemas ---
class HotelRoomType(BaseModel):
    name: str
    price_bdt: float
    price_usd: Optional[float] = None
    bed_type: str
    capacity: str
    features: List[str]


class HotelItem(BaseModel):
    id: str
    name: str
    star_rating: int  # 3, 4, 5
    category: str     # "5-Star Luxury", "Business Boutique", "Airport Hotel", "Resort"
    location_area: str  # "Gulshan-2, Dhaka", "Airport Road, Dhaka", "Banani"
    address: str
    rating: float     # 4.8
    review_count: int # 2450
    price_per_night_bdt: float
    price_per_night_usd: Optional[float] = None
    image_url: str
    amenities: List[str]  # ["Free WiFi", "Swimming Pool", "Airport Shuttle", "Breakfast Included", "Spa & Wellness", "Gym"]
    featured_badge: Optional[str] = None  # "Top Luxury", "Near Airport", "Best Value"
    room_types: List[HotelRoomType]
    check_in_time: str = "2:00 PM"
    check_out_time: str = "12:00 PM"
    booking_url: str = "https://www.booking.com"
    free_cancellation: bool = True
    distance_to_center_km: Optional[float] = None


class HotelDestinationSuggestion(BaseModel):
    id: str
    name: str
    country: str
    flag: str
    tagline: str
    image_url: Optional[str] = None
    popular_stay: Optional[str] = None


class HotelSearchData(BaseModel):
    query: str
    location: str
    check_in: str = "Tomorrow"
    check_out: str = "In 2 days"
    guests: int = 2
    total_results: int = 0
    hotels: List[HotelItem] = Field(default_factory=list)
    price_range_summary: str = ""
    is_clarification_needed: bool = False
    clarification_title: Optional[str] = "Where would you like to stay?"
    clarification_message: Optional[str] = "Please specify a destination city, region, or country to find top-rated luxury hotels and verified stays."
    suggested_destinations: Optional[List[HotelDestinationSuggestion]] = None


# --- 18. Real-time News & Breaking Stories Schemas ---
class NewsArticle(BaseModel):
    id: str
    title: str
    summary: str
    content_snippet: str
    source_name: str
    source_url: str = "https://news.google.com"
    source_icon: Optional[str] = "📰"
    author: Optional[str] = "Staff Correspondent"
    published_at: str
    category: str
    image_url: str
    read_time_minutes: int = 3
    key_takeaways: List[str] = Field(default_factory=list)
    sentiment: str = "Neutral"
    sentiment_label: Optional[str] = "Market Watch"
    tags: List[str] = Field(default_factory=list)


class NewsSearchData(BaseModel):
    query: str
    category: str = "All"
    total_results: int = 0
    breaking_alert: Optional[str] = None
    featured_article: Optional[NewsArticle] = None
    articles: List[NewsArticle] = Field(default_factory=list)
    trending_topics: List[str] = Field(default_factory=list)
    suggested_followups: List[str] = Field(default_factory=list)
    last_updated: str = "Just now"
