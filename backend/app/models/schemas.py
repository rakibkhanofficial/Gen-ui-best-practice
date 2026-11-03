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


# --- 4. Product Catalog & Comparison Schemas ---
class ProductSpec(BaseModel):
    key: str
    value: str
    highlight: bool = False


class ProductItem(BaseModel):
    id: str
    name: str
    tagline: str
    brand: str
    category: str
    price: float
    currency: str
    rating: float
    review_count: int
    image_url: str
    badge: Optional[str] = None
    specs: List[ProductSpec]
    key_features: List[str]
    in_stock: bool


class ProductCatalogData(BaseModel):
    query: str
    total_found: int
    highlight_category: str
    products: List[ProductItem]


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
