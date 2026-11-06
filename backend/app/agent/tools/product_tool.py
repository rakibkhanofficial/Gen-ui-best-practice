import logging
import json
import re
from typing import Dict, Any, List, Optional
from google import genai

from app.config import settings
from app.models.schemas import (
    ProductCatalogData,
    ProductItem,
    ProductSpec,
    ProductColorOption,
    ProductStorageOption,
    ComparisonCategoryWinner,
    ProductComparisonMatrix,
)

logger = logging.getLogger("genui.product")

# Initialize Gemini client if API key is present
_client = None
if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your_gemini_api_key_here":
    try:
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    except Exception as e:
        logger.warning(f"Could not initialize Gemini Client for product_tool: {e}")

USD_TO_BDT_RATE = 122.0


# ---------------------------------------------------------------------------
# Curated Flagship Hardware Database
# ---------------------------------------------------------------------------

IPHONE_16_PRO = ProductItem(
    id="prod-iphone-16-pro",
    name="Apple iPhone 16 Pro",
    tagline="Apple Intelligence, A18 Pro 3nm chip, 48MP Fusion Camera & Camera Control",
    brand="Apple",
    category="Flagship Smartphones",
    price=999.00,
    price_bdt=145000.0,
    currency="USD ($)",
    rating=4.9,
    review_count=1840,
    image_url="https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=640&q=80",
    badge="Flagship Camera & Chipset",
    overall_score=9.6,
    colors=[
        ProductColorOption(name="Desert Titanium", hex_code="#c5a582", label="Desert Titanium 🏜️"),
        ProductColorOption(name="Natural Titanium", hex_code="#9f9b96", label="Natural Titanium 🔘"),
        ProductColorOption(name="White Titanium", hex_code="#f2f2f2", label="White Titanium ⚪"),
        ProductColorOption(name="Black Titanium", hex_code="#3b3a39", label="Black Titanium ⚫"),
    ],
    storage_options=[
        ProductStorageOption(capacity="128GB", price_usd=999.0, price_bdt=145000.0),
        ProductStorageOption(capacity="256GB", price_usd=1099.0, price_bdt=158000.0),
        ProductStorageOption(capacity="512GB", price_usd=1299.0, price_bdt=185000.0),
        ProductStorageOption(capacity="1TB", price_usd=1499.0, price_bdt=210000.0),
    ],
    specs=[
        ProductSpec(key="Processor", value="Apple A18 Pro (3nm, 6-core CPU, 6-core GPU, 16-core NPU)", highlight=True),
        ProductSpec(key="Display", value="6.3\" Super Retina XDR OLED, 120Hz ProMotion, 2000 nits peak", highlight=True),
        ProductSpec(key="Camera System", value="48MP Fusion + 48MP Ultra Wide + 12MP 5x Telephoto (120mm)", highlight=True),
        ProductSpec(key="Video Recording", value="4K 120fps Dolby Vision, ProRes Log, Spatial Audio Studio Mix", highlight=True),
        ProductSpec(key="Battery & Power", value="3,582 mAh, 27W wired, 25W MagSafe, USB-C 3.0 (10Gbps)", highlight=False),
        ProductSpec(key="Chassis & Build", value="Grade 5 Titanium Frame with Textured Matte Glass (199g), IP68", highlight=False),
        ProductSpec(key="Hardware Controls", value="Capacitive Sapphire Camera Control + Action Button", highlight=True),
        ProductSpec(key="AI Platform", value="Apple Intelligence: Clean Up, Writing Tools, Visual Intelligence", highlight=True),
    ],
    key_features=[
        "Next-gen 48MP Fusion sensor with 2nd-gen quad-pixel autofocus and zero shutter lag",
        "Record cinema-grade 4K 120 fps Dolby Vision directly to external SSD via USB-C 3.0",
        "All-new Camera Control button with haptic force sensor for tactile zoom, exposure and depth adjustment",
        "Grade 5 Titanium chassis with thinner borders delivering larger 6.3\" display in compact form factor",
        "Next-generation Ceramic Shield front glass is 50% tougher than original formula",
    ],
    benchmarks={
        "Geekbench 6 Single-Core": "3,485 (Class Leader)",
        "Geekbench 6 Multi-Core": "8,810",
        "3DMark Wild Life Extreme": "4,720",
        "Battery Video Playback": "27 Hours",
    },
    pros=[
        "Industry-best A18 Pro single-core computing power and sustained gaming thermals",
        "Unbeatable 4K 120fps Dolby Vision video capture with professional Audio Mix",
        "Tactile Camera Control sapphire button allows fast shooting without unlocking",
        "Comfortable 6.3\" size with lightweight 199g Grade 5 Titanium construction",
    ],
    cons=[
        "Base configuration starts at 128GB storage rather than 256GB",
        "27W maximum wired charging speed lags behind 45W+ Android competitors",
        "Apple Intelligence capabilities roll out gradually across software versions",
    ],
    in_stock=True,
)

SAMSUNG_S24_ULTRA = ProductItem(
    id="prod-galaxy-s24-ultra",
    name="Samsung Galaxy S24 Ultra",
    tagline="Galaxy AI powerhouse with 200MP Quad Tele, embedded S-Pen & anti-reflective Gorilla Armor",
    brand="Samsung",
    category="Flagship Smartphones",
    price=1299.00,
    price_bdt=165000.0,
    currency="USD ($)",
    rating=4.8,
    review_count=2350,
    image_url="https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=640&q=80",
    badge="Ultimate Zoom & Productivity",
    overall_score=9.5,
    colors=[
        ProductColorOption(name="Titanium Gray", hex_code="#545350", label="Titanium Gray 🩶"),
        ProductColorOption(name="Titanium Black", hex_code="#2b2b2b", label="Titanium Black ⚫"),
        ProductColorOption(name="Titanium Violet", hex_code="#5c5270", label="Titanium Violet 💜"),
        ProductColorOption(name="Titanium Yellow", hex_code="#d9c89e", label="Titanium Yellow 💛"),
    ],
    storage_options=[
        ProductStorageOption(capacity="256GB", price_usd=1299.0, price_bdt=165000.0),
        ProductStorageOption(capacity="512GB", price_usd=1419.0, price_bdt=182000.0),
        ProductStorageOption(capacity="1TB", price_usd=1659.0, price_bdt=215000.0),
    ],
    specs=[
        ProductSpec(key="Processor", value="Qualcomm Snapdragon 8 Gen 3 for Galaxy (4nm, Adreno 750)", highlight=True),
        ProductSpec(key="Display", value="6.8\" Dynamic AMOLED 2X, Flat 120Hz LTPO, 2600 nits, Gorilla Armor", highlight=True),
        ProductSpec(key="Camera System", value="200MP Wide + 50MP 5x Periscope + 10MP 3x Tele + 12MP Ultra Wide", highlight=True),
        ProductSpec(key="Zoom Capabilities", value="100x Space Zoom with AI Adaptive Pixel Sensor & OIS", highlight=True),
        ProductSpec(key="Battery & Power", value="5,000 mAh, 45W wired, 15W wireless, Wireless PowerShare", highlight=True),
        ProductSpec(key="Productivity", value="Integrated low-latency Bluetooth S-Pen stylus with air gestures", highlight=True),
        ProductSpec(key="Chassis & Build", value="Titanium Frame with Corning Gorilla Armor Anti-Reflective (232g), IP68", highlight=False),
        ProductSpec(key="AI Platform", value="Galaxy AI: Circle to Search, Live Call Translation, Generative Edit, Note Assist", highlight=True),
    ],
    key_features=[
        "Corning Gorilla Armor screen reduces optical glare and reflections by up to 75%",
        "200MP detail engine paired with 50MP 5x optical periscope telephoto delivering optical quality at 10x",
        "Built-in S-Pen for handwriting notes, precision photo retouches, and remote camera triggering",
        "Generative AI photo edit lets you reframe, remove shadows, and move subjects seamlessly",
        "Long-lasting 5,000 mAh battery with snappy 45W fast wired charging",
    ],
    benchmarks={
        "Geekbench 6 Single-Core": "2,280",
        "Geekbench 6 Multi-Core": "7,150",
        "3DMark Wild Life Extreme": "5,150 (Graphics Leader)",
        "Battery Web Browsing": "16.7 Hours",
    },
    pros=[
        "Groundbreaking anti-reflective glass that makes viewing in bright sunlight unmatched",
        "Versatile 4-lens camera array with exceptional 10x to 100x zoom magnification",
        "Integrated S-Pen offers unparalleled multitasking, sketching, and document signing",
        "7 years of major Android OS and security patch support guaranteed by Samsung",
    ],
    cons=[
        "Substantially larger and heavier device at 232g with boxy, sharp corners",
        "High barrier to entry with a $1,299 starting price tag",
        "Occasional shutter lag in fast-moving indoor children/pet portraits",
    ],
    in_stock=True,
)

PIXEL_9_PRO = ProductItem(
    id="prod-pixel-9-pro",
    name="Google Pixel 9 Pro",
    tagline="Google Gemini Nano on-device multimodal AI, 50MP Triple Pro Camera & 3000-nit Super Actua display",
    brand="Google",
    category="Flagship Smartphones",
    price=999.00,
    price_bdt=138000.0,
    currency="USD ($)",
    rating=4.7,
    review_count=1120,
    image_url="https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=640&q=80",
    badge="AI Camera & Software",
    overall_score=9.3,
    colors=[
        ProductColorOption(name="Obsidian", hex_code="#282828", label="Obsidian ⚫"),
        ProductColorOption(name="Porcelain", hex_code="#eae7e1", label="Porcelain ⚪"),
        ProductColorOption(name="Hazel", hex_code="#87897e", label="Hazel 🫒"),
        ProductColorOption(name="Rose Quartz", hex_code="#deb8b8", label="Rose Quartz 🌸"),
    ],
    storage_options=[
        ProductStorageOption(capacity="128GB", price_usd=999.0, price_bdt=138000.0),
        ProductStorageOption(capacity="256GB", price_usd=1099.0, price_bdt=150000.0),
        ProductStorageOption(capacity="512GB", price_usd=1219.0, price_bdt=168000.0),
        ProductStorageOption(capacity="1TB", price_usd=1449.0, price_bdt=198000.0),
    ],
    specs=[
        ProductSpec(key="Processor", value="Google Tensor G4 (4nm) with Titan M2 security coprocessor", highlight=True),
        ProductSpec(key="RAM", value="16GB LPDDR5X (Dedicated for Gemini Nano on-device AI)", highlight=True),
        ProductSpec(key="Display", value="6.3\" Super Actua LTPO OLED, 120Hz, 3000 nits peak brightness", highlight=True),
        ProductSpec(key="Camera System", value="50MP Octa PD Wide + 48MP Quad PD Ultra Wide + 48MP 5x Telephoto", highlight=True),
        ProductSpec(key="Selfie Camera", value="42MP Dual PD front camera with autofocus & 103° ultrawide", highlight=True),
        ProductSpec(key="Battery & Power", value="4,700 mAh, 27W fast charging, Qi-certified wireless charging", highlight=False),
        ProductSpec(key="AI Platform", value="Gemini Live, Add Me photo group blending, Pixel Screenshots, Call Assist", highlight=True),
    ],
    key_features=[
        "Add Me camera feature merges photographer into group photos effortlessly",
        "16GB RAM as standard ensures rapid on-device LLM reasoning without cloud latency",
        "Industry-brightest 3,000 nits Super Actua display for brilliant direct-sunlight clarity",
        "7 full years of Android OS, Feature Drops, and security updates",
    ],
    benchmarks={
        "Geekbench 6 Single-Core": "1,980",
        "Geekbench 6 Multi-Core": "4,750",
        "Peak Display Brightness": "3,000 nits",
    },
    pros=[
        "Most authentic point-and-shoot portrait photography and Real Tone skin reproduction",
        "Pure Google Android 15 with zero bloatware and instant day-one security updates",
        "High-density 16GB memory delivers snappy multitasking and local AI performance",
        "Compact 6.3\" hand-friendly form factor with rounded polished metal sides",
    ],
    cons=[
        "Tensor G4 raw gaming and synthetic benchmark scores trail Snapdragon and Apple A18",
        "Moderate fast-charging speeds compared to Chinese flagships",
    ],
    in_stock=True,
)

IPHONE_15_PRO = ProductItem(
    id="prod-iphone-15-pro",
    name="Apple iPhone 15 Pro",
    tagline="A17 Pro 3nm chip, Action Button, 48MP camera & Grade 5 Titanium",
    brand="Apple",
    category="Flagship Smartphones",
    price=899.00,
    price_bdt=128000.0,
    currency="USD ($)",
    rating=4.7,
    review_count=3420,
    image_url="https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=640&q=80",
    badge="Previous Gen Value",
    overall_score=9.1,
    specs=[
        ProductSpec(key="Processor", value="Apple A17 Pro (3nm)", highlight=True),
        ProductSpec(key="Display", value="6.1\" Super Retina XDR OLED, 120Hz ProMotion, 2000 nits", highlight=True),
        ProductSpec(key="Camera System", value="48MP Main + 12MP Ultra Wide + 12MP 3x Telephoto (77mm)", highlight=True),
        ProductSpec(key="Battery", value="3,274 mAh, 20W wired, 15W MagSafe, USB-C 3.0", highlight=False),
    ],
    key_features=[
        "A17 Pro ray tracing gaming engine",
        "Action Button customization",
        "Grade 5 Titanium design",
    ],
    in_stock=True,
)

# Laptops
MACBOOK_PRO_M4 = ProductItem(
    id="prod-mbp-m4-max",
    name="MacBook Pro 16\" (M4 Max)",
    tagline="Extreme AI inference throughput with 128GB unified memory and Liquid Retina XDR",
    brand="Apple",
    category="Laptops & Workstations",
    price=3499.00,
    price_bdt=425000.0,
    currency="USD ($)",
    rating=4.9,
    review_count=842,
    image_url="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
    badge="Editor's Choice",
    overall_score=9.8,
    specs=[
        ProductSpec(key="Processor", value="16-Core CPU, 40-Core GPU (M4 Max)", highlight=True),
        ProductSpec(key="Neural Engine", value="16-core (38 TOPS)", highlight=True),
        ProductSpec(key="Unified Memory", value="64GB / 128GB (546 GB/s bandwidth)", highlight=True),
        ProductSpec(key="Storage", value="1TB to 8TB PCIe Gen4 SSD"),
        ProductSpec(key="Display", value="16.2\" Liquid Retina XDR (1600 nits peak, 120Hz)"),
        ProductSpec(key="Battery Life", value="Up to 24 hours of sustained runtime"),
    ],
    key_features=[
        "Over 546 GB/s memory bandwidth for local 70B+ LLM inference",
        "Thunderbolt 5 ports supporting 120 Gb/s data rates",
        "Nano-texture matte display option eliminating office glare",
    ],
    in_stock=True,
)

THINKPAD_P1 = ProductItem(
    id="prod-thinkpad-p1-gen7",
    name="ThinkPad P1 Gen 7 AI Studio",
    tagline="NVIDIA RTX 4080 Ada Generation workstation with 4K OLED display",
    brand="Lenovo",
    category="Laptops & Workstations",
    price=3199.00,
    price_bdt=385000.0,
    currency="USD ($)",
    rating=4.7,
    review_count=319,
    image_url="https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80",
    badge="Best Value for CUDA",
    overall_score=9.2,
    specs=[
        ProductSpec(key="Processor", value="Intel Core Ultra 9 185H (16-Core)", highlight=True),
        ProductSpec(key="GPU Acceleration", value="NVIDIA RTX 4080 Ada (12GB VRAM)", highlight=True),
        ProductSpec(key="Memory", value="64GB LPDDR5x LPCAMM2", highlight=True),
        ProductSpec(key="Storage", value="2TB NVMe Gen4 Performance"),
        ProductSpec(key="Display", value="16\" 4K OLED Touch (100% DCI-P3)"),
    ],
    key_features=[
        "Native TensorRT and CUDA acceleration for PyTorch workflows",
        "Modular LPCAMM2 memory upgradability",
        "Vapor chamber liquid cooling architecture",
    ],
    in_stock=True,
)


def _build_phone_comparison_matrix(dev_a: ProductItem, dev_b: ProductItem) -> ProductComparisonMatrix:
    """Builds a structured head-to-head comparison matrix between two flagship devices."""
    # Compare iPhone 16 Pro vs Samsung S24 Ultra
    if "iphone" in dev_a.name.lower() and "s24" in dev_b.name.lower():
        return ProductComparisonMatrix(
            title="iPhone 16 Pro vs Samsung Galaxy S24 Ultra",
            verdict="Both are apex flagships: choose iPhone 16 Pro for unmatched video fidelity (4K 120fps Dolby Vision), superior single-core A18 Pro processing, and ergonomic compact build. Choose Galaxy S24 Ultra if you prioritize the anti-reflective Gorilla Armor screen, embedded S-Pen stylus, and 100x Space Zoom capability.",
            winner_device_id=dev_a.id,
            category_winners=[
                ComparisonCategoryWinner(
                    category="Camera & Video",
                    winner_name="Apple iPhone 16 Pro",
                    winner_reason="4K 120fps Dolby Vision, ProRes Log, Audio Mix, and dedicated capacitive Camera Control sapphire button."
                ),
                ComparisonCategoryWinner(
                    category="Zoom & Focal Reach",
                    winner_name="Samsung Galaxy S24 Ultra",
                    winner_reason="Quad Tele system with dedicated 50MP 5x periscope delivering clean 10x optical and up to 100x Space Zoom."
                ),
                ComparisonCategoryWinner(
                    category="Raw Performance",
                    winner_name="Apple iPhone 16 Pro",
                    winner_reason="A18 Pro delivers ~50% faster single-core Geekbench 6 score (3,485 vs 2,280), optimizing immediate app response."
                ),
                ComparisonCategoryWinner(
                    category="Display & Outdoor Glare",
                    winner_name="Samsung Galaxy S24 Ultra",
                    winner_reason="Corning Gorilla Armor coating cancels 75% surface reflections; massive 6.8\" canvas with 2600 nits."
                ),
                ComparisonCategoryWinner(
                    category="Battery & Charging",
                    winner_name="Samsung Galaxy S24 Ultra",
                    winner_reason="Larger 5,000 mAh battery with faster 45W wired charging compared to 27W on iPhone."
                ),
                ComparisonCategoryWinner(
                    category="Value & Starting Price",
                    winner_name="Apple iPhone 16 Pro",
                    winner_reason="Starts at $999 (৳145,000) vs $1,299 (৳165,000) for the Galaxy S24 Ultra."
                ),
            ],
            recommended_for_a="Content creators, videographers, iOS users, and anyone wanting a compact, powerful 6.3\" flagship without hand fatigue.",
            recommended_for_b="Heavy power users, digital artists wanting the S-Pen, and photographers needing extreme telephoto zoom."
        )
    elif "iphone" in dev_a.name.lower() and "pixel" in dev_b.name.lower():
        return ProductComparisonMatrix(
            title="iPhone 16 Pro vs Google Pixel 9 Pro",
            verdict="iPhone 16 Pro dominates in raw computing power, gaming GPU, and cinema video recording. Google Pixel 9 Pro shines with 16GB RAM standard for Gemini on-device AI, cleaner still portrait processing, and class-leading 3,000-nit outdoor brightness.",
            winner_device_id=dev_a.id,
            category_winners=[
                ComparisonCategoryWinner(
                    category="Performance & Gaming",
                    winner_name="Apple iPhone 16 Pro",
                    winner_reason="A18 Pro outperforms Tensor G4 by over 70% in benchmark throughput and 3D rendering."
                ),
                ComparisonCategoryWinner(
                    category="Still Photography & Portraits",
                    winner_name="Google Pixel 9 Pro",
                    winner_reason="Superior computational HDR skin tone rendering and Add Me camera blending."
                ),
                ComparisonCategoryWinner(
                    category="Display Peak Brightness",
                    winner_name="Google Pixel 9 Pro",
                    winner_reason="3,000 nits peak outdoor brightness vs 2,000 nits on iPhone 16 Pro."
                ),
                ComparisonCategoryWinner(
                    category="Video Recording",
                    winner_name="Apple iPhone 16 Pro",
                    winner_reason="4K 120fps Dolby Vision and ProRes recording with tactile Camera Control."
                ),
            ],
            recommended_for_a="Power users, mobile gamers, and video creators wanting top-tier sustained performance.",
            recommended_for_b="Android enthusiasts, photo lovers, and users invested in Google Gemini multimodal AI."
        )
    elif "s24" in dev_a.name.lower() and "pixel" in dev_b.name.lower():
        return ProductComparisonMatrix(
            title="Samsung Galaxy S24 Ultra vs Google Pixel 9 Pro",
            verdict="Galaxy S24 Ultra offers unmatched productivity with the S-Pen, larger 6.8\" screen, and 100x zoom. Pixel 9 Pro delivers pure Google software, faster AI features, and a more pocketable 6.3\" form factor.",
            winner_device_id=dev_a.id,
            category_winners=[
                ComparisonCategoryWinner(
                    category="Productivity & Stylus",
                    winner_name="Samsung Galaxy S24 Ultra",
                    winner_reason="Built-in S-Pen and Samsung DeX desktop mode."
                ),
                ComparisonCategoryWinner(
                    category="Photo Consistency",
                    winner_name="Google Pixel 9 Pro",
                    winner_reason="Zero shutter lag with Google computational photography."
                ),
            ],
            recommended_for_a="Note takers, power users, and zoom photography lovers.",
            recommended_for_b="Users wanting clean software, compact size, and cutting-edge Google AI."
        )
    else:
        # Generic comparison matrix
        winner_id = dev_a.id if (dev_a.rating >= dev_b.rating) else dev_b.id
        return ProductComparisonMatrix(
            title=f"{dev_a.name} vs {dev_b.name}",
            verdict=f"Both {dev_a.name} and {dev_b.name} represent pinnacle hardware in their respective categories. Choose based on your operating system preference, budget, and specific workflow requirements.",
            winner_device_id=winner_id,
            category_winners=[
                ComparisonCategoryWinner(
                    category="Performance & Benchmark",
                    winner_name=dev_a.name if dev_a.price >= dev_b.price else dev_b.name,
                    winner_reason="Higher benchmark throughput and sustained architectural efficiency."
                ),
                ComparisonCategoryWinner(
                    category="Value Proposition",
                    winner_name=dev_a.name if dev_a.price <= dev_b.price else dev_b.name,
                    winner_reason=f"More accessible pricing ($ {min(dev_a.price, dev_b.price):,.0f}) with premier core capabilities."
                ),
            ],
            recommended_for_a=f"Users who value {dev_a.brand}'s ecosystem and design philosophy.",
            recommended_for_b=f"Users who value {dev_b.brand}'s feature set and versatility."
        )


def _generate_dynamic_product_comparison(query: str) -> Optional[ProductCatalogData]:
    """Uses Gemini with JSON output to synthesize rich product details or comparison for any device."""
    if not _client:
        return None

    try:
        prompt = f"""You are a senior consumer technology and hardware evaluation specialist.
The user is requesting product details or comparison for: "{query}".

Output a valid JSON object matching this schema:
{{
  "query": "{query}",
  "total_found": 1 or 2,
  "highlight_category": "Category title e.g. Flagship Smartphone Comparison or Apple Flagship Smartphone",
  "products": [
    {{
      "id": "prod-device-id",
      "name": "Full device name e.g. OnePlus 12",
      "tagline": "Punchy 1-sentence product summary",
      "brand": "Manufacturer brand",
      "category": "Flagship Smartphones",
      "price": 799.0,
      "currency": "USD ($)",
      "price_bdt": 98000.0,
      "rating": 4.8,
      "review_count": 850,
      "image_url": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=640&q=80",
      "badge": "Top Pick",
      "overall_score": 9.3,
      "specs": [
        {{"key": "Processor", "value": "Exact SoC name", "highlight": true}},
        {{"key": "Display", "value": "Size, tech, refresh rate, peak nits", "highlight": true}},
        {{"key": "Camera System", "value": "Sensors and lenses", "highlight": true}},
        {{"key": "Battery & Power", "value": "Capacity and charging wattage", "highlight": false}}
      ],
      "key_features": ["3 to 5 key features"],
      "in_stock": true,
      "colors": [
        {{"name": "Color Name", "hex_code": "#hex", "label": "Color Name 🎨"}}
      ],
      "storage_options": [
        {{"capacity": "256GB", "price_usd": 799.0, "price_bdt": 98000.0}}
      ],
      "pros": ["3 distinct advantages"],
      "cons": ["2 drawbacks or caveats"],
      "benchmarks": {{"Geekbench 6 Single-Core": "2,200", "3DMark Extreme": "4,900"}}
    }}
  ],
  "is_comparison": true or false,
  "comparison_matrix": {{
    "title": "Device A vs Device B",
    "verdict": "Comprehensive 2-sentence purchasing verdict comparing both devices.",
    "winner_device_id": "prod-device-id",
    "category_winners": [
      {{"category": "Camera Quality", "winner_name": "Device name", "winner_reason": "Specific reason"}}
    ],
    "recommended_for_a": "Who should buy Device A",
    "recommended_for_b": "Who should buy Device B"
  }},
  "available_competitors": ["3-4 rival model names"]
}}

Rules:
1. If comparing two devices (or "vs", "compare"): set is_comparison=true, include both devices in products array, provide comparison_matrix with category winners.
2. If single device: set is_comparison=false, include single device in products array, set comparison_matrix=null, provide available_competitors with rival options.
3. Keep prices realistic in USD and BDT (1 USD ≈ 122 BDT).
"""
        for model_name in ["gemini-2.5-flash", "gemini-3.5-flash-lite", "gemini-3.8-flash"]:
            try:
                response = _client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config={
                        "response_mime_type": "application/json",
                        "temperature": 0.2,
                    },
                )
                if response and response.text:
                    data = json.loads(response.text)
                    return ProductCatalogData(**data)
            except Exception as err:
                logger.debug(f"Gemini product search with {model_name} failed: {err}")
                continue

        return None
    except Exception as e:
        logger.warning(f"Dynamic product search failed: {e}")
        return None


def search_product_catalog(query: str = "iPhone 16 Pro") -> Dict[str, Any]:
    """Searches smartphone and tech hardware database for single device deep-dives or side-by-side comparison matrices."""
    clean_query = (query or "").strip()
    q_lower = clean_query.lower()

    # Detect if comparison mode requested
    is_vs = bool(re.search(r"\b(vs|versus|compare|comparison|against|with)\b", q_lower))

    # 1. iPhone 16 Pro vs Samsung Galaxy S24 Ultra
    if is_vs and ("iphone" in q_lower or "16" in q_lower or "apple" in q_lower) and ("samsung" in q_lower or "s24" in q_lower or "galaxy" in q_lower):
        matrix = _build_phone_comparison_matrix(IPHONE_16_PRO, SAMSUNG_S24_ULTRA)
        return ProductCatalogData(
            query=clean_query,
            total_found=2,
            highlight_category="Flagship Smartphone Comparison",
            products=[IPHONE_16_PRO, SAMSUNG_S24_ULTRA],
            is_comparison=True,
            comparison_matrix=matrix,
            available_competitors=["Google Pixel 9 Pro", "iPhone 15 Pro", "OnePlus 12", "Xiaomi 15 Pro"],
        ).model_dump()

    # 2. iPhone 16 Pro vs Google Pixel 9 Pro
    if is_vs and ("iphone" in q_lower or "16" in q_lower) and ("pixel" in q_lower or "google" in q_lower or "9 pro" in q_lower):
        matrix = _build_phone_comparison_matrix(IPHONE_16_PRO, PIXEL_9_PRO)
        return ProductCatalogData(
            query=clean_query,
            total_found=2,
            highlight_category="Flagship Smartphone Comparison",
            products=[IPHONE_16_PRO, PIXEL_9_PRO],
            is_comparison=True,
            comparison_matrix=matrix,
            available_competitors=["Samsung Galaxy S24 Ultra", "iPhone 15 Pro", "OnePlus 12"],
        ).model_dump()

    # 3. Samsung Galaxy S24 Ultra vs Google Pixel 9 Pro
    if is_vs and ("samsung" in q_lower or "s24" in q_lower) and ("pixel" in q_lower or "google" in q_lower):
        matrix = _build_phone_comparison_matrix(SAMSUNG_S24_ULTRA, PIXEL_9_PRO)
        return ProductCatalogData(
            query=clean_query,
            total_found=2,
            highlight_category="Android Flagship Titan Comparison",
            products=[SAMSUNG_S24_ULTRA, PIXEL_9_PRO],
            is_comparison=True,
            comparison_matrix=matrix,
            available_competitors=["Apple iPhone 16 Pro", "OnePlus 12"],
        ).model_dump()

    # 4. Laptop comparison: MacBook Pro M4 vs ThinkPad P1
    if is_vs and any(k in q_lower for k in ["macbook", "m4", "thinkpad", "laptop"]):
        matrix = _build_phone_comparison_matrix(MACBOOK_PRO_M4, THINKPAD_P1)
        return ProductCatalogData(
            query=clean_query,
            total_found=2,
            highlight_category="Flagship AI Workstation Comparison",
            products=[MACBOOK_PRO_M4, THINKPAD_P1],
            is_comparison=True,
            comparison_matrix=matrix,
            available_competitors=["Dell XPS 16", "Razer Blade 16"],
        ).model_dump()

    # 5. Single Product Detail: iPhone 16 Pro / iPhone 16 Pro Max
    if any(k in q_lower for k in ["iphone 16", "iphone16", "16 pro", "16pro", "apple iphone", "iphone"]):
        return ProductCatalogData(
            query=clean_query,
            total_found=1,
            highlight_category="Apple Flagship Smartphone",
            products=[IPHONE_16_PRO],
            is_comparison=False,
            available_competitors=["Samsung Galaxy S24 Ultra", "Google Pixel 9 Pro", "iPhone 15 Pro", "OnePlus 12"],
        ).model_dump()

    # 6. Single Product Detail: Samsung Galaxy S24 Ultra
    if any(k in q_lower for k in ["s24", "galaxy s24", "samsung s24", "s24 ultra"]):
        return ProductCatalogData(
            query=clean_query,
            total_found=1,
            highlight_category="Samsung Flagship Smartphone",
            products=[SAMSUNG_S24_ULTRA],
            is_comparison=False,
            available_competitors=["Apple iPhone 16 Pro", "Google Pixel 9 Pro", "OnePlus 12"],
        ).model_dump()

    # 7. Single Product Detail: Google Pixel 9 Pro
    if any(k in q_lower for k in ["pixel 9", "pixel9", "google pixel"]):
        return ProductCatalogData(
            query=clean_query,
            total_found=1,
            highlight_category="Google Flagship Smartphone",
            products=[PIXEL_9_PRO],
            is_comparison=False,
            available_competitors=["Apple iPhone 16 Pro", "Samsung Galaxy S24 Ultra"],
        ).model_dump()

    # 8. Single Product Detail: MacBook Pro M4
    if any(k in q_lower for k in ["macbook", "m4", "m4 max", "apple laptop"]):
        return ProductCatalogData(
            query=clean_query,
            total_found=1,
            highlight_category="Apple Silicon Workstation",
            products=[MACBOOK_PRO_M4],
            is_comparison=False,
            available_competitors=["ThinkPad P1 Gen 7 AI Studio", "Dell XPS 16"],
        ).model_dump()

    # 9. Dynamic synthesis via Gemini for any other phone/device (e.g. OnePlus, Xiaomi, Vivo, ROG Phone, Nothing Phone, iPad, etc.)
    dynamic = _generate_dynamic_product_comparison(clean_query)
    if dynamic and dynamic.products:
        return dynamic.model_dump()

    # Fallback to iPhone 16 Pro with competitor options
    return ProductCatalogData(
        query=clean_query,
        total_found=1,
        highlight_category="Premier Flagship Smartphone",
        products=[IPHONE_16_PRO],
        is_comparison=False,
        available_competitors=["Samsung Galaxy S24 Ultra", "Google Pixel 9 Pro", "iPhone 15 Pro"],
    ).model_dump()
