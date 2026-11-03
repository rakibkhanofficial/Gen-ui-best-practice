from typing import Dict, Any
from app.models.schemas import WebsiteLinkData, WebsiteLink


def fetch_website_info(query: str = "best AI tools") -> Dict[str, Any]:
    """Fetch website metadata with favicons and descriptions for suggested sites."""
    
    q = query.lower()

    sites_db = {
        "ai": [
            WebsiteLink(url="https://ai.google.dev", title="Google AI for Developers", description="Build with Gemini models — the most capable AI from Google. Access APIs, SDKs, and documentation for text, image, video, and code generation.", favicon_url="https://www.gstatic.com/devrel-devsite/prod/v0e0f589edd85502a40d78d7d0825db8ea5ef3b99ab4070381ee86977c9168730/googledevai/images/favicon.png", og_image="https://ai.google.dev/static/images/social-share.png", domain="ai.google.dev", category="AI Platform", relevance_note="Official Google AI developer portal with Gemini API access"),
            WebsiteLink(url="https://copilotkit.ai", title="CopilotKit — Build AI Copilots", description="The open-source framework for building in-app AI copilots with Generative UI, A2UI, and agent integration.", favicon_url="https://copilotkit.ai/favicon.ico", og_image="https://copilotkit.ai/images/og-image.png", domain="copilotkit.ai", category="Developer Framework", relevance_note="Powers the GenUI runtime and AG-UI protocol in this project"),
            WebsiteLink(url="https://huggingface.co", title="Hugging Face — The AI Community", description="The platform where the machine learning community collaborates on models, datasets, and applications.", favicon_url="https://huggingface.co/favicon.ico", og_image="https://huggingface.co/front/assets/huggingface_logo.svg", domain="huggingface.co", category="ML Platform", relevance_note="Largest open-source model hub with 500K+ models"),
        ],
        "react": [
            WebsiteLink(url="https://react.dev", title="React — The Library for Web and Native UI", description="Official React documentation. Learn React with interactive examples, guides, and API reference.", favicon_url="https://react.dev/favicon-32x32.png", domain="react.dev", category="Frontend Framework", relevance_note="Core UI library used in this project"),
            WebsiteLink(url="https://nextjs.org", title="Next.js by Vercel", description="The React Framework for the Web. Used by some of the world's largest companies, Next.js enables you to create high-quality web applications.", favicon_url="https://nextjs.org/favicon.ico", og_image="https://nextjs.org/static/twitter-cards/home.jpg", domain="nextjs.org", category="Full-Stack Framework", relevance_note="Powers the frontend with App Router and API routes"),
            WebsiteLink(url="https://www.framer.com/motion/", title="Framer Motion — Animation Library for React", description="A production-ready motion library for React. Use declarative animations, layout transitions, and gestures.", favicon_url="https://www.framer.com/images/favicon.png", domain="framer.com", category="Animation Library", relevance_note="Used for all GenUI component enter/exit animations"),
        ],
        "default": [
            WebsiteLink(url="https://github.com", title="GitHub — Where the World Builds Software", description="Millions of developers and companies build, ship, and maintain their software on GitHub — the largest and most advanced development platform.", favicon_url="https://github.githubassets.com/favicons/favicon.svg", og_image="https://github.githubassets.com/images/modules/site/social-cards/campaign-social.png", domain="github.com", category="Development Platform", relevance_note="Source code hosting and collaboration platform"),
            WebsiteLink(url="https://vercel.com", title="Vercel — Build and Deploy the Best Web Experiences", description="Vercel's frontend cloud gives developers frameworks, workflows, and infrastructure to build a faster, more personalized web.", favicon_url="https://vercel.com/favicon.ico", og_image="https://vercel.com/static/og/vercel.png", domain="vercel.com", category="Deployment Platform", relevance_note="Deploy Next.js apps with zero configuration"),
            WebsiteLink(url="https://tailwindcss.com", title="Tailwind CSS — Rapidly Build Modern Websites", description="A utility-first CSS framework packed with classes that can be composed to build any design, directly in your markup.", favicon_url="https://tailwindcss.com/favicons/favicon-32x32.png", og_image="https://tailwindcss.com/_next/static/media/social-card-large.a6e71726.jpg", domain="tailwindcss.com", category="CSS Framework", relevance_note="Core styling framework used throughout the GenUI components"),
        ],
    }

    matched_key = "default"
    for key in sites_db:
        if key in q:
            matched_key = key
            break

    websites = sites_db[matched_key]
    
    data = WebsiteLinkData(
        query=query,
        total_results=len(websites),
        websites=websites,
    )
    return data.model_dump()
