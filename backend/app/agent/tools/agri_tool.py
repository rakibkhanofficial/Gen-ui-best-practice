import logging
import json
from typing import Dict, Any, List, Optional
from google import genai

from app.config import settings
from app.models.schemas import AgriProductSearchData, AgriProductItem

logger = logging.getLogger("genui.agri")

# Initialize Gemini client if API key is present
_client = None
if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your_gemini_api_key_here":
    try:
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    except Exception as e:
        logger.warning(f"Could not initialize Gemini Client for agri_tool: {e}")


def _generate_dynamic_agri_products(query: str, category: str) -> Optional[AgriProductSearchData]:
    """Uses Gemini to retrieve or synthesize verified agricultural products, seeds, fertilizers, and farm equipment."""
    if not _client:
        return None

    try:
        prompt = f"""You are an agronomist and agribusiness specialist in Bangladesh.
The user is searching for: "{query}". Category: {category}.
Highlight agricultural products from leading providers (especially ACI Agribusiness, ACI Motors, ACI Crop Care, ACI Seed, and partner suppliers).

Return 3 to 5 realistic agricultural items with:
- Product name (e.g. ACI Hybrid Dhan, ACI Cruiser insecticide, Bio-Fertilizer, Sonalika Tractor, Fungicide).
- Category ("Hybrid Seeds", "Crop Care", "Bio-Fertilizer", "Farm Machinery").
- Manufacturer ("ACI Agribusiness", "ACI Crop Care", "ACI Motors", etc.).
- Image URL, pack size, price in BDT (৳), target crops, active ingredients, application rate, and seasonal advice.
"""
        for model_name in ["gemini-3.5-flash-lite", "gemini-2.5-flash", "gemini-3.8-flash"]:
            try:
                response = _client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config={
                        "response_mime_type": "application/json",
                        "response_schema": AgriProductSearchData,
                        "temperature": 0.2,
                    },
                )
                if response and response.text:
                    data = json.loads(response.text)
                    return AgriProductSearchData(**data)
            except Exception as err:
                logger.debug(f"Gemini agri products with {model_name} failed: {err}")
                continue

        return None
    except Exception as e:
        logger.warning(f"Dynamic agri products generation failed: {e}")
        return None


def _get_curated_agri_products(query: str, category: str) -> AgriProductSearchData:
    """Rich curated catalog of ACI Agribusiness products (Seeds, Crop Care, Fertilizer, Machinery)."""
    products = [
        AgriProductItem(
            id="agri-aci-dhan2",
            name="ACI Hybrid Dhan-2 (হাইজিন ধান-২)",
            category="Hybrid Seeds",
            manufacturer="ACI Seed (ACI Agribusiness)",
            image_url="https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=640&q=80",
            pack_size="5 kg Seed Bag",
            price_bdt=1450.00,
            target_crops=["Boro Rice", "Aus Rice", "Irrigated Paddy"],
            active_ingredient="High Yield F1 Hybrid Rice Seed (Oryza sativa)",
            key_benefits=[
                "High Yield Capacity: 8.5 to 9.2 Metric Tons per Hectare",
                "Medium-slim grain with superior milling recovery and aroma",
                "Built-in genetic resistance to Sheath Blight and Brown Plant Hopper",
                "Early harvest maturity: 140–145 days from seeding",
            ],
            application_rate="10–12 kg seeds per acre for transplanting",
            in_stock=True,
            ecom_link="https://www.aci-bd.com/businesses/agribusinesses/seed.html",
            dealer_contact="ACI Seed Care: 16500 (Free Farmer Call)",
        ),
        AgriProductItem(
            id="agri-aci-cruiser",
            name="ACI Cruiser 350 FS Seed Treatment",
            category="Crop Care & Pesticides",
            manufacturer="ACI Crop Care",
            image_url="https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=640&q=80",
            pack_size="100 ml Bottle",
            price_bdt=680.00,
            target_crops=["Paddy Seedlings", "Potato", "Corn/Maize", "Cotton", "Vegetables"],
            active_ingredient="Thiamethoxam 35% FS (Systemic Neonicotinoid)",
            key_benefits=[
                "Vigor effect: stimulates robust root growth and early crop establishment",
                "Long-lasting systemic defense against sucking pests, aphids, and thrips",
                "Protects seedlings during critical first 30 days after emergence",
                "Reduces total spray frequency by over 50%",
            ],
            application_rate="2.0–2.5 ml per kg of crop seeds before sowing",
            in_stock=True,
            ecom_link="https://www.aci-bd.com/businesses/agribusinesses/crop-care.html",
            dealer_contact="ACI Crop Protection Helpline: +880 9606 666000",
        ),
        AgriProductItem(
            id="agri-aci-biofertilizer",
            name="ACI Organic Bio-Fertilizer (জৈব সার)",
            category="Bio-Fertilizer & Soil Nutrients",
            manufacturer="ACI Fertilizer (ACI Agribusiness)",
            image_url="https://images.unsplash.com/photo-1592417817098-8f3d69102656?auto=format&fit=crop&w=640&q=80",
            pack_size="25 kg Bag",
            price_bdt=850.00,
            target_crops=["Vegetables", "Paddy", "Fruits (Mango, Banana)", "Betel Leaf", "Spices"],
            active_ingredient="Decomposed Organic Carbon, Azotobacter, Mycorrhizal Inoculum",
            key_benefits=[
                "Restores organic carbon content in degraded agricultural soils",
                "Improves soil water-retention capacity and aeration",
                "Encourages beneficial microbial colonies and nitrogen-fixing bacteria",
                "100% natural, free of heavy metals and noxious weed seeds",
            ],
            application_rate="150–200 kg per acre during final land preparation",
            in_stock=True,
            ecom_link="https://www.aci-bd.com/businesses/agribusinesses/fertilizer.html",
            dealer_contact="ACI Fertilizer Agro Desk: 16500",
        ),
        AgriProductItem(
            id="agri-aci-sonalika",
            name="ACI Sonalika DI 745 III Heavy Tractor",
            category="Farm Machinery",
            manufacturer="ACI Motors Limited",
            image_url="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=640&q=80",
            pack_size="Complete Agricultural Machine",
            price_bdt=1350000.00,
            target_crops=["All Agricultural Land Preparation", "Wetland Puddling", "Haulage"],
            active_ingredient="50 HP Water-Cooled Diesel Engine, 3 Cylinder",
            key_benefits=[
                "Exceptional fuel efficiency with heavy torque at low RPM",
                "Dual clutch with 8 Forward + 2 Reverse sliding mesh gearbox",
                "High hydraulic lifting capacity: up to 1800 kg",
                "Full nationwide service network with genuine spare parts warranty",
            ],
            application_rate="Operates rotavator, cultivator, disc plough, and trolley",
            in_stock=True,
            ecom_link="https://www.acimotors-bd.com/product/sonalika-di-745-iii",
            dealer_contact="ACI Motors 24/7 Hotline: 16500",
        ),
        AgriProductItem(
            id="agri-aci-amistar",
            name="ACI Amistar Top 325 SC Fungicide",
            category="Crop Care & Pesticides",
            manufacturer="ACI Crop Care (Syngenta Partner)",
            image_url="https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=640&q=80",
            pack_size="250 ml Bottle",
            price_bdt=1820.00,
            target_crops=["Rice", "Potato", "Tomato", "Chili", "Onion"],
            active_ingredient="Azoxystrobin 200 g/L + Difenoconazole 125 g/L",
            key_benefits=[
                "Dual mode of action: protective and curative against fungal diseases",
                "Controls Rice Blast, Sheath Blight, Early Blight, and Purple Blotch",
                "Keeps leaves greener longer, maximizing grain filling and market yield",
                "Rain-fast within 2 hours of application",
            ],
            application_rate="1 ml per liter of clean water (spray on foliage)",
            in_stock=True,
            ecom_link="https://www.aci-bd.com/businesses/agribusinesses/crop-care.html",
            dealer_contact="ACI Crop Protection Helpline: 16500",
        ),
    ]

    return AgriProductSearchData(
        query=query,
        category=category or "All Agricultural Products",
        total_results=len(products),
        products=products,
        seasonal_advice="Current Boro & Summer Crop Season: Treat seeds with ACI Cruiser prior to sowing. Apply ACI Bio-Fertilizer during tilling to ensure nutrient balance.",
    )


def search_agri_products(query: str = "ACI agriculture products", category: str = "All") -> Dict[str, Any]:
    """Search for agriculture supplies, hybrid seeds, bio-fertilizers, pesticides, tractors, and e-commerce dealer info."""
    dynamic_data = _generate_dynamic_agri_products(query, category)
    if dynamic_data:
        logger.info(f"Retrieved dynamic agri products for query: '{query}'")
        return dynamic_data.model_dump()

    logger.info(f"Using curated ACI Agribusiness catalog for query: '{query}'")
    curated = _get_curated_agri_products(query, category)
    return curated.model_dump()
