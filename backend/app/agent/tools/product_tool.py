from typing import Dict, Any
from app.models.schemas import ProductCatalogData, ProductItem, ProductSpec


def search_product_catalog(query: str = "Pro Laptops") -> Dict[str, Any]:
    """Searches the product database and returns rich comparison matrices, specs, and rating data.
    
    Args:
        query: Search keywords or product category (e.g. 'MacBook', 'Workstation', 'Ultrabook', 'Cloud Server').
    """
    catalog = ProductCatalogData(
        query=query,
        total_found=2,
        highlight_category="Flagship AI Workstations",
        products=[
            ProductItem(
                id="prod-mbp-m4-max",
                name="MacBook Pro 16\" (M4 Max)",
                tagline="Extreme AI inference throughput with 128GB unified memory",
                brand="Apple",
                category="Laptops & Workstations",
                price=3499.00,
                currency="USD ($)",
                rating=4.9,
                review_count=842,
                image_url="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
                badge="Editor's Choice",
                specs=[
                    ProductSpec(key="Processor", value="16-Core CPU, 40-Core GPU", highlight=True),
                    ProductSpec(key="Neural Engine", value="16-core (38 TOPS)", highlight=True),
                    ProductSpec(key="Unified Memory", value="64GB / 128GB", highlight=True),
                    ProductSpec(key="Storage", value="1TB to 8TB PCIe SSD"),
                    ProductSpec(key="Battery Life", value="Up to 24 hours"),
                    ProductSpec(key="Weight", value="2.14 kg (4.71 lbs)"),
                ],
                key_features=[
                    "Liquid Retina XDR display with 1,600 nits peak HDR",
                    "Over 400 GB/s unified memory bandwidth",
                    "Thunderbolt 5 ports (up to 120Gb/s transfer)"
                ],
                in_stock=True
            ),
            ProductItem(
                id="prod-thinkpad-p1-gen7",
                name="ThinkPad P1 Gen 7 AI Studio",
                tagline="NVIDIA RTX 4080 Ada Generation workstation with OLED display",
                brand="Lenovo",
                category="Laptops & Workstations",
                price=3199.00,
                currency="USD ($)",
                rating=4.7,
                review_count=319,
                image_url="https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80",
                badge="Best Value for CUDA",
                specs=[
                    ProductSpec(key="Processor", value="Intel Core Ultra 9 185H (16-Core)", highlight=True),
                    ProductSpec(key="GPU Acceleration", value="NVIDIA RTX 4080 Ada (12GB VRAM)", highlight=True),
                    ProductSpec(key="Memory", value="64GB LPDDR5x LPCAMM2", highlight=True),
                    ProductSpec(key="Storage", value="2TB NVMe Gen4 Performance"),
                    ProductSpec(key="Display", value="16\" 4K OLED Touch (100% DCI-P3)"),
                    ProductSpec(key="Weight", value="1.82 kg (4.01 lbs)"),
                ],
                key_features=[
                    "Native TensorRT and CUDA acceleration for PyTorch",
                    "Vapor chamber liquid cooling architecture",
                    "Modular LPCAMM2 memory upgradability"
                ],
                in_stock=True
            )
        ]
    )
    return catalog.model_dump()

