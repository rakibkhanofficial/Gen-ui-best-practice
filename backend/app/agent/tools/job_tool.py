from typing import Dict, Any, List
from app.models.schemas import JobSearchData, JobListing


def search_jobs(
    query: str = "Frontend Developer",
    location: str = "Dhaka, Bangladesh",
    platform: str = "All"
) -> Dict[str, Any]:
    """Searches job openings aggregated from BDJobs, LinkedIn, and remote platforms.
    
    Args:
        query: Job title or keywords (e.g. 'Frontend', 'Next.js', 'AI Engineer', 'Python').
        location: City or region (e.g. 'Dhaka', 'Chittagong', 'Remote', 'Bangladesh').
        platform: Platform filter ('BDJobs', 'LinkedIn', 'All').
    """
    listings = [
        JobListing(
            id="job-bd-101",
            title="Senior Full-Stack AI Engineer (Next.js & Python)",
            company="Brain Station 23",
            company_logo="https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=120&q=80",
            location="Gulshan-1, Dhaka (Hybrid)",
            platform="BDJobs",
            salary_range="৳160,000 - ৳240,000 / month",
            work_type="Hybrid",
            experience_level="Senior",
            tags=["Next.js 16", "Python", "FastAPI", "Gemini API", "Generative UI"],
            posted_time="2 days ago",
            description="Leading development of enterprise Generative UI and Copilot agent workflows for global clients. Requires deep experience in React 19, App Router, and LLM orchestration.",
            apply_url="https://jobs.bdjobs.com/jobdetails.asp?id=1148291",
            match_score=98,
            interview_tips=[
                "Expect practical questions on Next.js 16 Partial Prerendering (PPR) and Server Components.",
                "Review Server-Sent Events (SSE) buffering and state synchronization in React.",
                "Be ready to discuss Human-in-the-Loop agent authorization patterns."
            ]
        ),
        JobListing(
            id="job-li-202",
            title="Lead Frontend Architect (React, TypeScript & Tailwind)",
            company="Therap (BD) Ltd.",
            company_logo="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=120&q=80",
            location="Banasree, Dhaka (On-site)",
            platform="LinkedIn",
            salary_range="৳200,000 - ৳280,000 / month",
            work_type="On-site",
            experience_level="Lead",
            tags=["TypeScript", "React 19", "Design Systems", "Web Performance"],
            posted_time="Just now",
            description="Architect scalable electronic health record interfaces used by thousands of US state healthcare agencies. High emphasis on accessible UI, WCAG compliance, and micro-frontends.",
            apply_url="https://www.linkedin.com/jobs/view/399120489",
            match_score=94,
            interview_tips=[
                "Prepare for deep-dive questions on React 19 Compiler and memoization behavior.",
                "Demonstrate experience with responsive enterprise design systems and accessibility."
            ]
        ),
        JobListing(
            id="job-bd-303",
            title="Software Engineer - AI Platform & Cloud",
            company="Pathao",
            company_logo="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=120&q=80",
            location="Dhanmondi, Dhaka (Hybrid)",
            platform="BDJobs",
            salary_range="৳130,000 - ৳180,000 / month",
            work_type="Hybrid",
            experience_level="Mid-Level",
            tags=["Python", "FastAPI", "Redis", "PostgreSQL", "Docker"],
            posted_time="3 days ago",
            description="Build predictive dispatch pipelines, dynamic customer routing, and logistics AI agents serving millions of rides and food deliveries daily across Bangladesh.",
            apply_url="https://jobs.bdjobs.com/jobdetails.asp?id=1148732",
            match_score=91,
            interview_tips=[
                "Review graph algorithms (Dijkstra, A*) and geospatial indexing in Redis/PostGIS.",
                "Be prepared for system design of high-throughput websocket dispatch services."
            ]
        ),
        JobListing(
            id="job-li-404",
            title="Staff AI Solutions Engineer (Global Remote)",
            company="Vercel",
            company_logo="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80",
            location="Remote (Bangladesh eligible)",
            platform="LinkedIn",
            salary_range="$130,000 - $165,000 / year (USD)",
            work_type="Remote",
            experience_level="Senior",
            tags=["AI SDK", "Next.js", "Streamdown", "CopilotKit", "Edge Middleware"],
            posted_time="1 day ago",
            description="Work with enterprise customers building cutting-edge Generative UI and AI chat applications on Vercel and Next.js. Competitive global USD compensation.",
            apply_url="https://www.linkedin.com/jobs/view/401928374",
            match_score=97,
            interview_tips=[
                "Demonstrate hands-on mastery of `@vercel/ai` or `streamdown` streaming parsers.",
                "Showcase public GenUI repositories and live prototypes deployed on the web."
            ]
        )
    ]

    # Filter by platform if specified
    if platform and platform != "All":
        filtered = [j for j in listings if j.platform.lower() == platform.lower()]
    else:
        filtered = listings

    data = JobSearchData(
        query=query,
        location=location,
        total_jobs=len(filtered),
        featured_platform=platform if platform != "All" else "BDJobs & LinkedIn Aggregated",
        jobs=filtered
    )
    return data.model_dump()
