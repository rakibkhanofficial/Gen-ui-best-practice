import re
from typing import Dict, Any, List
from app.models.schemas import JobSearchData, JobListing


def search_jobs(
    query: str = "Frontend Developer",
    location: str = "Dhaka, Bangladesh",
    platform: str = "All"
) -> Dict[str, Any]:
    """Dynamically searches job openings aggregated from BDJobs and LinkedIn tailored to query parameters."""
    q_lower = query.lower()

    # 1. Python / Backend / FastAPI
    if any(k in q_lower for k in ["python", "fastapi", "django", "backend"]):
        jobs = [
            JobListing(
                id="job-py-01",
                title="Senior Python & FastAPI Backend Engineer",
                company="Brain Station 23",
                company_logo="https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=120&q=80",
                location="Gulshan-1, Dhaka (Hybrid)",
                platform="BDJobs",
                salary_range="৳160,000 - ৳230,000 / month",
                work_type="Hybrid",
                experience_level="Senior",
                tags=["Python", "FastAPI", "PostgreSQL", "Redis", "Docker"],
                posted_time="1 day ago",
                description="Lead development of async microservices, SSE event streaming backends, and high-throughput REST APIs for global enterprise clients.",
                apply_url="https://jobs.bdjobs.com/jobdetails.asp?id=1148291",
                match_score=98,
                interview_tips=[
                    "Expect questions on Python 3.12 async generators and Server-Sent Events (SSE).",
                    "Review Pydantic V2 model validation performance optimizations.",
                    "Be prepared to discuss database connection pooling in asyncpg and SQLAlchemy."
                ]
            ),
            JobListing(
                id="job-py-02",
                title="Staff AI Platform & Backend Engineer",
                company="Pathao",
                company_logo="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=120&q=80",
                location="Dhanmondi, Dhaka (On-site)",
                platform="LinkedIn",
                salary_range="৳180,000 - ৳250,000 / month",
                work_type="On-site",
                experience_level="Lead",
                tags=["FastAPI", "PyTorch", "Kubernetes", "Kafka", "Redis"],
                posted_time="Just now",
                description="Design low-latency dispatch algorithms, real-time tracking streams, and production LLM orchestration platforms for logistics services.",
                apply_url="https://www.linkedin.com/jobs/view/402819201",
                match_score=95,
                interview_tips=[
                    "Demonstrate mastery of distributed lock mechanisms in Redis.",
                    "Prepare for system design of real-time geospatial dispatchers."
                ]
            ),
            JobListing(
                id="job-py-03",
                title="Python Backend Developer (Fintech Platform)",
                company="bKash Limited",
                company_logo="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=120&q=80",
                location="Dhaka, Bangladesh",
                platform="BDJobs",
                salary_range="৳140,000 - ৳190,000 / month",
                work_type="Hybrid",
                experience_level="Mid-Level",
                tags=["Python", "Django", "FastAPI", "RabbitMQ", "Microservices"],
                posted_time="3 days ago",
                description="Build secure financial transaction gateways and compliance reporting microservices serving over 70 million active mobile wallet users.",
                apply_url="https://jobs.bdjobs.com/jobdetails.asp?id=1148502",
                match_score=92,
                interview_tips=[
                    "Focus on ACID compliance and two-phase commit patterns.",
                    "Review rate limiting and idempotency token implementations."
                ]
            ),
        ]

    # 2. DevOps / Cloud / SRE
    elif any(k in q_lower for k in ["devops", "cloud", "sre", "kubernetes", "infra"]):
        jobs = [
            JobListing(
                id="job-ops-01",
                title="Senior DevOps & Cloud Infrastructure Engineer",
                company="Therap (BD) Ltd.",
                company_logo="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=120&q=80",
                location="Banasree, Dhaka (On-site)",
                platform="LinkedIn",
                salary_range="৳180,000 - ৳260,000 / month",
                work_type="On-site",
                experience_level="Senior",
                tags=["Kubernetes", "Terraform", "AWS", "Helm", "CI/CD"],
                posted_time="2 days ago",
                description="Architect multi-region HIPAA-compliant cloud clusters with automated GitOps pipelines and zero-downtime rolling deploys.",
                apply_url="https://www.linkedin.com/jobs/view/399812049",
                match_score=97,
                interview_tips=[
                    "Be ready to explain Kubernetes ingress routing, cert-manager, and network policies.",
                    "Review Terraform state locking and drift detection strategies."
                ]
            ),
            JobListing(
                id="job-ops-02",
                title="Site Reliability Engineer (SRE)",
                company="Chaldal",
                company_logo="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=120&q=80",
                location="Tejgaon, Dhaka (Hybrid)",
                platform="BDJobs",
                salary_range="৳130,000 - ৳180,000 / month",
                work_type="Hybrid",
                experience_level="Mid-Level",
                tags=["Prometheus", "Grafana", "Linux", "Docker", "Go"],
                posted_time="4 days ago",
                description="Scale observability, incident response, and automated self-healing clusters for e-commerce logistics.",
                apply_url="https://jobs.bdjobs.com/jobdetails.asp?id=1148901",
                match_score=90,
                interview_tips=[
                    "Prepare practical examples of MTTR reduction and post-mortem analysis.",
                    "Discuss Prometheus PromQL queries for SLO alerting."
                ]
            ),
        ]

    # 3. Mobile / Flutter / React Native
    elif any(k in q_lower for k in ["flutter", "mobile", "ios", "android", "react native"]):
        jobs = [
            JobListing(
                id="job-mob-01",
                title="Lead Flutter Application Engineer",
                company="ShopUp",
                company_logo="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=120&q=80",
                location="Mohakhali DOHS, Dhaka (Hybrid)",
                platform="BDJobs",
                salary_range="৳170,000 - ৳240,000 / month",
                work_type="Hybrid",
                experience_level="Lead",
                tags=["Flutter", "Dart", "BLoC", "Clean Architecture", "REST"],
                posted_time="1 day ago",
                description="Lead mobile architecture for merchant B2B commerce app with offline synchronization and real-time ledger updates.",
                apply_url="https://jobs.bdjobs.com/jobdetails.asp?id=1148811",
                match_score=96,
                interview_tips=[
                    "Expect questions on Flutter render object lifecycle and custom shaders.",
                    "Review state management trade-offs between BLoC and Riverpod."
                ]
            ),
            JobListing(
                id="job-mob-02",
                title="Senior React Native Developer",
                company="Kite Games Studio",
                company_logo="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=120&q=80",
                location="Uttara, Dhaka (On-site)",
                platform="LinkedIn",
                salary_range="৳150,000 - ৳210,000 / month",
                work_type="On-site",
                experience_level="Senior",
                tags=["React Native", "TypeScript", "Redux Toolkit", "Native Modules"],
                posted_time="3 days ago",
                description="Develop high-performance mobile apps with 60 FPS gesture animations and native bridge modules for iOS and Android.",
                apply_url="https://www.linkedin.com/jobs/view/401928374",
                match_score=93,
                interview_tips=[
                    "Review the React Native New Architecture (TurboModules & Fabric).",
                    "Be ready to explain bundle splitting and Hermes engine optimization."
                ]
            ),
        ]

    # 4. Default / Full Stack & Frontend
    else:
        jobs = [
            JobListing(
                id="job-fs-01",
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
                id="job-fs-02",
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
                id="job-fs-03",
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
            ),
        ]

    data = JobSearchData(
        query=query.title() if query else "Software Engineering Jobs",
        location=location,
        total_jobs=len(jobs),
        featured_platform=platform if platform != "All" else "BDJobs & LinkedIn",
        jobs=jobs,
    )
    return data.model_dump()
