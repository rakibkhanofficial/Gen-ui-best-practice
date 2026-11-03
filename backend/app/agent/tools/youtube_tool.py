from typing import Dict, Any
from app.models.schemas import YouTubeSearchData, YouTubeVideo


def search_youtube_videos(query: str = "Next.js tutorial") -> Dict[str, Any]:
    """Search YouTube for video suggestions with previews."""

    videos = [
        YouTubeVideo(
            id="yt-001",
            video_id="dQw4w9WgXcQ",
            title="Build a Full-Stack AI App with Next.js 16 & Gemini 3.8 Flash",
            channel_name="Fireship",
            channel_avatar="https://yt3.googleusercontent.com/ytc/AIdro_lGRv8pn2VBQ76hVyOv3k8r3qY1xS3N4OM0h7eRjJE2Csk=s88-c-k-c0x00ffffff-no-rj",
            thumbnail_url="https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=640&q=80",
            duration="12:34",
            views="2.1M views",
            published="3 weeks ago",
            description="Learn to build production GenUI apps with the latest Gemini model, CopilotKit V2, and Server-Sent Events streaming.",
            tags=["Next.js", "Gemini", "AI", "Full Stack"],
            like_count="89K",
        ),
        YouTubeVideo(
            id="yt-002",
            video_id="Sklc_fQBmCS",
            title="Generative UI: The Future of AI Interfaces (2026 Deep Dive)",
            channel_name="Theo - t3.gg",
            channel_avatar="https://yt3.googleusercontent.com/4NapxEtLcHQ6wN2zA_DMmkOk47RFb_gy6sjSmUZGg_ARHjlIUjFsrMBQ0RbEKoLSNaussKE=s88-c-k-c0x00ffffff-no-rj",
            thumbnail_url="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=640&q=80",
            duration="28:17",
            views="845K views",
            published="1 week ago",
            description="Why static chat UIs are dead. How CopilotKit, A2UI, and Open Generative UI are changing everything.",
            tags=["GenUI", "CopilotKit", "AI UX", "React"],
            like_count="42K",
        ),
        YouTubeVideo(
            id="yt-003",
            video_id="wMl08ENxGbU",
            title="Python FastAPI + SSE Streaming – Real-Time Agent Architecture",
            channel_name="ArjanCodes",
            channel_avatar="https://yt3.googleusercontent.com/LY5TkuYOkFkGp0VzuJMU2qG9OATR6VlrYJvR4wRHpMJ4kMOn_Bz7N4WYd7eJ3Hqh_g6WPF3cV8=s88-c-k-c0x00ffffff-no-rj",
            thumbnail_url="https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=640&q=80",
            duration="45:02",
            views="523K views",
            published="2 weeks ago",
            description="Complete guide to building streaming agent backends with Server-Sent Events, async generators, and tool orchestration.",
            tags=["Python", "FastAPI", "SSE", "Backend"],
            like_count="31K",
        ),
        YouTubeVideo(
            id="yt-004",
            video_id="T7nHsUBgTXo",
            title="React 19 + Framer Motion: Beautiful UI Animations Masterclass",
            channel_name="Web Dev Simplified",
            channel_avatar="https://yt3.googleusercontent.com/ytc/AIdro_mhebFxgpW7_cmdfOzfl5JXIJp9hlN4D2FRXCzyVWLgN6v7=s88-c-k-c0x00ffffff-no-rj",
            thumbnail_url="https://images.unsplash.com/photo-1618761714954-0b8cd0026356?auto=format&fit=crop&w=640&q=80",
            duration="32:48",
            views="1.3M views",
            published="5 days ago",
            description="Master layout animations, exit transitions, scroll-linked effects, and gesture-driven micro-interactions.",
            tags=["React", "Framer Motion", "Animation", "CSS"],
            like_count="67K",
        ),
    ]

    data = YouTubeSearchData(
        query=query,
        total_results=len(videos),
        videos=videos,
    )
    return data.model_dump()
