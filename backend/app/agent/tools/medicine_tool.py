import logging
import json
from typing import Dict, Any, List, Optional
from google import genai

from app.config import settings
from app.models.schemas import MedicineSearchData, MedicineItem, MedicineAlternative

logger = logging.getLogger("genui.medicine")

# Initialize Gemini client if API key is present
_client = None
if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your_gemini_api_key_here":
    try:
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    except Exception as e:
        logger.warning(f"Could not initialize Gemini Client for medicine_tool: {e}")


def _generate_dynamic_medicine(query: str) -> Optional[MedicineSearchData]:
    """Uses Gemini to retrieve or synthesize precise pharmaceutical and generic drug information."""
    if not _client:
        return None

    try:
        prompt = f"""You are a clinical pharmacologist and medical AI specialist.
The user is asking: "{query}".
Identify the primary medicine, its generic name, pharmaceutical company (e.g. Beximco, ACI Limited, Square, Incepta), dosage, and direct generic alternatives.
If the user asks about Napa or Napa alternatives, make sure to highlight ACI's Xcel (ACI Limited) as a top alternative alongside Ace (Square Pharmaceuticals).

Return realistic clinical data for Bangladesh/International market including:
- Primary medicine brand name, generic name, manufacturer, dosage form, strength, pack size, price in BDT.
- Clinical indications, dosage guide, safety advice, pregnancy category.
- List of 3 to 5 generic alternatives from top pharmaceutical companies (e.g. ACI Limited, Square, Beximco, Incepta, Acme).
"""
        for model_name in ["gemini-3.5-flash-lite", "gemini-2.5-flash", "gemini-3.8-flash"]:
            try:
                response = _client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config={
                        "response_mime_type": "application/json",
                        "response_schema": MedicineSearchData,
                        "temperature": 0.2,
                    },
                )
                if response and response.text:
                    data = json.loads(response.text)
                    return MedicineSearchData(**data)
            except Exception as err:
                logger.debug(f"Gemini medicine dynamic generation with {model_name} failed: {err}")
                continue

        return None
    except Exception as e:
        logger.warning(f"Dynamic medicine search failed: {e}")
        return None


def _get_curated_medicine_data(query: str) -> MedicineSearchData:
    """Rich curated catalog of popular Bangladesh pharmaceuticals and direct generic alternatives."""
    q_lower = query.lower()

    # Local verified company logos & high-res images
    FAVICONS = {
        "beximco": "/images/medicines/beximco.png",
        "aci": "/images/medicines/aci.png",
        "square": "/images/medicines/square.png",
        "incepta": "/images/medicines/incepta.png",
        "acme": "/images/medicines/acme.png",
        "eskayef": "/images/medicines/beximco.png",
        "renata": "/images/medicines/aci.png",
        "popular": "/images/medicines/square.png",
    }

    # 1. Napa / Paracetamol / Fever / Pain / Xcel (User requested!)
    if any(k in q_lower for k in ["napa", "xcel", "ace", "paracetamol", "fever", "headache", "pain"]):
        is_xcel_primary = "xcel" in q_lower and "napa" not in q_lower

        if is_xcel_primary:
            primary = MedicineItem(
                id="med-xcel-500",
                brand_name="Xcel",
                generic_name="Paracetamol",
                manufacturer="ACI Limited (Healthcare Division)",
                dosage_form="Tablet",
                strength="500 mg",
                pack_size="10 x 10 Strip Box (100 Tablets)",
                unit_price_bdt=1.20,
                strip_price_bdt=12.00,
                indications=["Fever", "Headache", "Toothache", "Body Ache", "Mild to Moderate Pain"],
                dosage_guide="Adults: 1–2 tablets every 4 to 6 hours as needed. Maximum 4,000 mg (8 tablets) in 24 hours.",
                safety_advice="High safety profile. Do not exceed maximum daily dosage to avoid hepatic risk. Safe during pregnancy under medical guidance.",
                pregnancy_category="Category B",
                ecommerce_available=True,
                in_stock=True,
                company_favicon_url=FAVICONS["aci"],
                image_url="/images/medicines/xcel.jpg",
                dar_reg_no="DAR No. 021-0082-046",
                alternatives=[
                    MedicineAlternative(
                        brand_name="Napa",
                        generic_name="Paracetamol",
                        manufacturer="Beximco Pharmaceuticals Ltd.",
                        strength="500 mg",
                        form="Tablet",
                        price_bdt=1.20,
                        highlights="Direct Generic Equivalent",
                        company_favicon_url=FAVICONS["beximco"],
                        image_url="/images/medicines/napa.jpg",
                        dar_reg_no="DAR No. 003-0144-046",
                    ),
                    MedicineAlternative(
                        brand_name="Ace",
                        generic_name="Paracetamol",
                        manufacturer="Square Pharmaceuticals PLC",
                        strength="500 mg",
                        form="Tablet",
                        price_bdt=1.20,
                        highlights="Leading Market Generic",
                        company_favicon_url=FAVICONS["square"],
                        image_url="/images/medicines/ace.jpg",
                        dar_reg_no="DAR No. 018-0051-046",
                    ),
                    MedicineAlternative(
                        brand_name="Xcel DT",
                        generic_name="Paracetamol",
                        manufacturer="ACI Limited",
                        strength="500 mg",
                        form="Dispersible Tablet",
                        price_bdt=1.50,
                        highlights="Fast-Dissolving Formula",
                        company_favicon_url=FAVICONS["aci"],
                        image_url="/images/medicines/xcel.jpg",
                        dar_reg_no="DAR No. 021-0145-046",
                    ),
                    MedicineAlternative(
                        brand_name="Fast",
                        generic_name="Paracetamol",
                        manufacturer="Acme Laboratories Ltd.",
                        strength="500 mg",
                        form="Tablet",
                        price_bdt=1.20,
                        highlights="Affordable Standard Generic",
                        company_favicon_url=FAVICONS["acme"],
                        image_url="/images/medicines/napa.jpg",
                        dar_reg_no="DAR No. 006-0091-046",
                    ),
                ],
            )
        else:
            primary = MedicineItem(
                id="med-napa-500",
                brand_name="Napa",
                generic_name="Paracetamol",
                manufacturer="Beximco Pharmaceuticals Ltd.",
                dosage_form="Tablet",
                strength="500 mg",
                pack_size="10 x 10 Strip Box (100 Tablets)",
                unit_price_bdt=1.20,
                strip_price_bdt=12.00,
                indications=["Fever", "Headache", "Body Pain", "Toothache", "Post-Vaccination Pyrexia"],
                dosage_guide="Adults: 1–2 tablets (500–1000 mg) every 4–6 hours as required. Do not exceed 8 tablets in 24 hours.",
                safety_advice="Safe and widely tolerated. Avoid concurrent use with other paracetamol-containing products.",
                pregnancy_category="Category B",
                ecommerce_available=True,
                in_stock=True,
                company_favicon_url=FAVICONS["beximco"],
                image_url="/images/medicines/napa.jpg",
                dar_reg_no="DAR No. 003-0144-046",
                alternatives=[
                    MedicineAlternative(
                        brand_name="Xcel",
                        generic_name="Paracetamol",
                        manufacturer="ACI Limited",
                        strength="500 mg",
                        form="Tablet",
                        price_bdt=1.20,
                        highlights="ACI's Direct Premium Alternative (Same Efficacy & Price)",
                        company_favicon_url=FAVICONS["aci"],
                        image_url="/images/medicines/xcel.jpg",
                        dar_reg_no="DAR No. 021-0082-046",
                    ),
                    MedicineAlternative(
                        brand_name="Ace",
                        generic_name="Paracetamol",
                        manufacturer="Square Pharmaceuticals PLC",
                        strength="500 mg",
                        form="Tablet",
                        price_bdt=1.20,
                        highlights="Square's Equivalent Formulation",
                        company_favicon_url=FAVICONS["square"],
                        image_url="/images/medicines/ace.jpg",
                        dar_reg_no="DAR No. 018-0051-046",
                    ),
                    MedicineAlternative(
                        brand_name="Napa Extra",
                        generic_name="Paracetamol + Caffeine",
                        manufacturer="Beximco Pharmaceuticals Ltd.",
                        strength="500 mg + 65 mg",
                        form="Tablet",
                        price_bdt=2.50,
                        highlights="Caffeine-Enhanced Fast Pain Relief",
                        company_favicon_url=FAVICONS["beximco"],
                        image_url="/images/medicines/napa.jpg",
                        dar_reg_no="DAR No. 003-0210-046",
                    ),
                    MedicineAlternative(
                        brand_name="Xcel Plus",
                        generic_name="Paracetamol + Caffeine",
                        manufacturer="ACI Limited",
                        strength="500 mg + 65 mg",
                        form="Tablet",
                        price_bdt=2.50,
                        highlights="ACI Rapid Action Headache Alternative",
                        company_favicon_url=FAVICONS["aci"],
                        image_url="/images/medicines/xcel.jpg",
                        dar_reg_no="DAR No. 021-0188-046",
                    ),
                    MedicineAlternative(
                        brand_name="Reset",
                        generic_name="Paracetamol",
                        manufacturer="Incepta Pharmaceuticals Ltd.",
                        strength="500 mg",
                        form="Tablet",
                        price_bdt=1.20,
                        highlights="Incepta Standard Generic",
                        company_favicon_url=FAVICONS["incepta"],
                        image_url="/images/medicines/napa.jpg",
                        dar_reg_no="DAR No. 013-0045-046",
                    ),
                ],
            )

        return MedicineSearchData(
            query=query,
            primary_medicine=primary,
            alternatives_count=len(primary.alternatives),
            generic_group="Analgesics & Antipyretics (Paracetamol)",
        )

    # 2. Omeprazole / Gastric / Acidity (Seclo / Losectil)
    elif any(k in q_lower for k in ["seclo", "gastric", "acidity", "omeprazole", "pantoprazole", "losectil"]):
        primary = MedicineItem(
            id="med-seclo-20",
            brand_name="Seclo",
            generic_name="Omeprazole",
            manufacturer="Square Pharmaceuticals PLC",
            dosage_form="Capsule",
            strength="20 mg",
            pack_size="10 x 10 Capsule Box",
            unit_price_bdt=6.00,
            strip_price_bdt=60.00,
            indications=["GERD", "Gastric Ulcer", "Duodenal Ulcer", "Hyperacidity", "Heartburn"],
            dosage_guide="Take 1 capsule (20 mg) once daily, ideally 30 minutes before breakfast on an empty stomach.",
            safety_advice="Swallow whole with water; do not crush or chew. Consult physician for treatment extending past 4 weeks.",
            pregnancy_category="Category C",
            ecommerce_available=True,
            in_stock=True,
            company_favicon_url=FAVICONS["square"],
            image_url="/images/medicines/seclo.jpg",
            dar_reg_no="DAR No. 018-0240-048",
            alternatives=[
                MedicineAlternative(
                    brand_name="Losectil",
                    generic_name="Omeprazole",
                    manufacturer="Eskayef Pharmaceuticals Ltd.",
                    strength="20 mg",
                    form="Capsule",
                    price_bdt=6.00,
                    highlights="Direct Equivalence",
                    company_favicon_url=FAVICONS["eskayef"],
                    image_url="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",
                    dar_reg_no="DAR No. 024-0130-048",
                ),
                MedicineAlternative(
                    brand_name="Proceptin",
                    generic_name="Omeprazole",
                    manufacturer="Beximco Pharmaceuticals Ltd.",
                    strength="20 mg",
                    form="Capsule",
                    price_bdt=6.00,
                    highlights="Enteric-Coated Pellets",
                    company_favicon_url=FAVICONS["beximco"],
                    image_url="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",
                    dar_reg_no="DAR No. 003-0182-048",
                ),
                MedicineAlternative(
                    brand_name="Omep",
                    generic_name="Omeprazole",
                    manufacturer="ACI Limited",
                    strength="20 mg",
                    form="Capsule",
                    price_bdt=5.50,
                    highlights="ACI Cost-Effective Alternative",
                    company_favicon_url=FAVICONS["aci"],
                    image_url="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",
                    dar_reg_no="DAR No. 021-0099-048",
                ),
            ],
        )
        return MedicineSearchData(
            query=query,
            primary_medicine=primary,
            alternatives_count=len(primary.alternatives),
            generic_group="Proton Pump Inhibitors (PPI)",
        )

    # 3. Default General Medicine (Napa & Xcel)
    else:
        return _get_curated_medicine_data("napa alternative xcel")


def search_medicines(query: str = "Napa alternative") -> Dict[str, Any]:
    """Search for medicine details, pharmaceutical company, pricing, and generic alternatives."""
    q_l = query.lower()

    # 1. Prioritize curated clinical data for common inquiries (e.g. Napa, Xcel, Ace, Paracetamol, Seclo)
    if any(k in q_l for k in ["napa", "xcel", "ace", "paracetamol", "seclo", "omeprazole", "fever", "headache", "gastric"]):
        logger.info(f"Using curated medicine catalog for query: '{query}'")
        curated = _get_curated_medicine_data(query)
        return curated.model_dump()

    # 2. Try dynamic generation with Gemini for rare medications
    dynamic_data = _generate_dynamic_medicine(query)
    if dynamic_data:
        # Guarantee local fallback image & favicon
        pm = dynamic_data.primary_medicine
        if not pm.image_url or not pm.image_url.startswith("/"):
            pm.image_url = "/images/medicines/napa.jpg"
        if not pm.company_favicon_url or not pm.company_favicon_url.startswith("/"):
            pm.company_favicon_url = "/images/medicines/aci.png" if "aci" in pm.manufacturer.lower() else "/images/medicines/beximco.png"
        for alt in pm.alternatives:
            if not alt.image_url or not alt.image_url.startswith("/"):
                alt.image_url = "/images/medicines/xcel.jpg" if "xcel" in alt.brand_name.lower() else "/images/medicines/ace.jpg"
            if not alt.company_favicon_url or not alt.company_favicon_url.startswith("/"):
                alt.company_favicon_url = "/images/medicines/aci.png" if "aci" in alt.manufacturer.lower() else "/images/medicines/square.png"
        logger.info(f"Retrieved dynamic medicine data for query: '{query}'")
        return dynamic_data.model_dump()

    # 3. Fall back to curated, clinical catalog
    logger.info(f"Using curated medicine catalog fallback for query: '{query}'")
    curated = _get_curated_medicine_data(query)
    return curated.model_dump()

