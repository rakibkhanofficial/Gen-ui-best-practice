from typing import Dict, Any, List
from app.models.schemas import PlanningBoardData, BoardColumn, StickyNote


def generate_planning_board(topic: str = "Generative AI Architecture Roadmap") -> Dict[str, Any]:
    """Generates an interactive Miro & Excalidraw style visual planning board tailored dynamically to the user's topic."""
    t_lower = topic.lower()

    # 1. E-Commerce / Storefront Topic
    if any(k in t_lower for k in ["ecommerce", "shop", "store", "checkout", "cart", "product"]):
        cols = [
            BoardColumn(
                id="col-backlog",
                title="Backlog & Discovery",
                color_accent="#F59E0B",
                notes=[
                    StickyNote(id="n-1", title="Headless Shopify Storefront", content="Decouple frontend using Next.js App Router and GraphQL Storefront API.", color="yellow", tags=["Frontend", "Shopify"], votes=14, assignee="Tariq A.", column_id="col-backlog"),
                    StickyNote(id="n-2", title="Dynamic Currency & FX", content="Integrate multi-currency price conversion for international shoppers.", color="orange", tags=["Checkout", "Payments"], votes=9, assignee="Amina H.", column_id="col-backlog"),
                ]
            ),
            BoardColumn(
                id="col-progress",
                title="In Development",
                color_accent="#3B82F6",
                notes=[
                    StickyNote(id="n-3", title="Stripe Element Checkout", content="Implement 1-click Apple Pay & Google Pay with webhooks idempotency.", color="blue", tags=["Payments", "Security"], votes=21, assignee="Alex M.", column_id="col-progress"),
                    StickyNote(id="n-4", title="Redis Cart & Stock Locking", content="Prevent overselling during flash sales with atomic Redis keys.", color="green", tags=["Backend", "Redis"], votes=18, assignee="Rakib K.", column_id="col-progress"),
                ]
            ),
            BoardColumn(
                id="col-review",
                title="Review & QA",
                color_accent="#8B5CF6",
                notes=[
                    StickyNote(id="n-5", title="Lighthouse CWV Optimization", content="Ensure Largest Contentful Paint (LCP) under 1.2s for mobile catalog pages.", color="purple", tags=["Performance", "SEO"], votes=11, assignee="Elena R.", column_id="col-review"),
                ]
            ),
            BoardColumn(
                id="col-done",
                title="Shipped to Prod",
                color_accent="#10B981",
                notes=[
                    StickyNote(id="n-6", title="Product Algolia InstantSearch", content="Sub-50ms search with faceting, typos, and predictive auto-complete.", color="green", tags=["Search", "Production"], votes=32, assignee="Core Team", column_id="col-done"),
                ]
            ),
        ]

    # 2. Cloud / DevOps / Infrastructure Topic
    elif any(k in t_lower for k in ["cloud", "devops", "kubernetes", "k8s", "docker", "infra", "aws", "gcp"]):
        cols = [
            BoardColumn(
                id="col-backlog",
                title="Architecture & Specs",
                color_accent="#F59E0B",
                notes=[
                    StickyNote(id="n-1", title="Multi-Region Active-Active", content="Design cross-continental failover with Cloudflare Geo-DNS and Anycast.", color="yellow", tags=["Infra", "Reliability"], votes=16, assignee="DevOps Lead", column_id="col-backlog"),
                    StickyNote(id="n-2", title="Zero-Trust Service Mesh", content="Evaluate Istio vs Linkerd for mTLS inter-service encryption.", color="pink", tags=["Security", "Network"], votes=8, assignee="Sam K.", column_id="col-backlog"),
                ]
            ),
            BoardColumn(
                id="col-progress",
                title="Terraform & Helm",
                color_accent="#3B82F6",
                notes=[
                    StickyNote(id="n-3", title="K8s Autoscaling (KEDA)", content="Scale FastAPI backend pods on Redis queue depth and SSE connection count.", color="blue", tags=["Kubernetes", "Autoscale"], votes=24, assignee="David W.", column_id="col-progress"),
                ]
            ),
            BoardColumn(
                id="col-review",
                title="Chaos Testing & Security",
                color_accent="#8B5CF6",
                notes=[
                    StickyNote(id="n-4", title="Prometheus & Grafana Alerting", content="Set SLO breach triggers for SSE stream latency > 500ms.", color="purple", tags=["Observability", "SLO"], votes=15, assignee="SRE Team", column_id="col-review"),
                ]
            ),
            BoardColumn(
                id="col-done",
                title="Production Live",
                color_accent="#10B981",
                notes=[
                    StickyNote(id="n-5", title="GitHub Actions GitOps CD", content="ArgoCD automated rollouts with automated canary testing.", color="green", tags=["CI/CD", "GitOps"], votes=34, assignee="Ops Core", column_id="col-done"),
                ]
            ),
        ]

    # 3. Mobile App Topic
    elif any(k in t_lower for k in ["mobile", "flutter", "react native", "ios", "android", "app"]):
        cols = [
            BoardColumn(
                id="col-backlog",
                title="Design & UX Specs",
                color_accent="#F59E0B",
                notes=[
                    StickyNote(id="n-1", title="Offline First Sync (WatermelonDB)", content="Support background queuing of changes with bi-directional conflict resolution.", color="yellow", tags=["Mobile", "Offline"], votes=19, assignee="Mobile Architect", column_id="col-backlog"),
                ]
            ),
            BoardColumn(
                id="col-progress",
                title="Feature Sprints",
                color_accent="#3B82F6",
                notes=[
                    StickyNote(id="n-2", title="Biometric FaceID & Fingerprint", content="Implement native hardware keychain authentication with secure enclave.", color="blue", tags=["Auth", "Security"], votes=26, assignee="Nadia B.", column_id="col-progress"),
                    StickyNote(id="n-3", title="Firebase FCM Push Notifications", content="Rich push notifications with actionable quick replies and deep links.", color="green", tags=["Push", "Notifications"], votes=17, assignee="Tanvir S.", column_id="col-progress"),
                ]
            ),
            BoardColumn(
                id="col-review",
                title="Device Lab Testing",
                color_accent="#8B5CF6",
                notes=[
                    StickyNote(id="n-4", title="App Store & Play Store Sandbox", content="Test in-app purchase consumables and recurring subscription webhooks.", color="purple", tags=["IAP", "Billing"], votes=13, assignee="QA Lead", column_id="col-review"),
                ]
            ),
            BoardColumn(
                id="col-done",
                title="Store Deployed",
                color_accent="#10B981",
                notes=[
                    StickyNote(id="n-5", title="Flutter 3.24 Cross-Platform Build", content="60 FPS smooth rendering on iOS & Android with custom shaders.", color="green", tags=["Flutter", "AppStore"], votes=39, assignee="Mobile Team", column_id="col-done"),
                ]
            ),
        ]

    # 4. Default / AI & Agentic Architecture Roadmap
    else:
        topic_title = topic.strip().title()
        cols = [
            BoardColumn(
                id="col-backlog",
                title="Discovery & Backlog",
                color_accent="#F59E0B",
                notes=[
                    StickyNote(id="n-1", title=f"Architectural Spec: {topic_title}", content=f"Define interfaces, schema boundaries, and SLO targets for {topic}.", color="yellow", tags=["Architecture", "Specs"], votes=15, assignee="Lead Architect", column_id="col-backlog"),
                    StickyNote(id="n-2", title="Multimodal Voice Streaming", content="Bidirectional audio WebSocket integration with Gemini 3.8 Live API.", color="pink", tags=["Gemini", "Voice"], votes=11, assignee="Sarah T.", column_id="col-backlog"),
                ]
            ),
            BoardColumn(
                id="col-progress",
                title="Active Development",
                color_accent="#3B82F6",
                notes=[
                    StickyNote(id="n-3", title="Generative UI Registry Mounting", content="Real-time Server-Sent Events dispatch to interactive dynamic React components.", color="blue", tags=["GenUI", "React"], votes=28, assignee="Rakib K.", column_id="col-progress"),
                    StickyNote(id="n-4", title="Tool Authorization & Gating", content="Human-in-the-Loop timed approval interceptors for sensitive operations.", color="green", tags=["Security", "HITL"], votes=22, assignee="David W.", column_id="col-progress"),
                ]
            ),
            BoardColumn(
                id="col-review",
                title="Review & Validation",
                color_accent="#8B5CF6",
                notes=[
                    StickyNote(id="n-5", title="End-to-End Latency Verification", content="Verify that reasoning stages and source attributions complete under 4s.", color="purple", tags=["Testing", "Telemetry"], votes=17, assignee="Elena R.", column_id="col-review"),
                ]
            ),
            BoardColumn(
                id="col-done",
                title="Production Ready",
                color_accent="#10B981",
                notes=[
                    StickyNote(id="n-6", title="Google Antigravity SDK Engine", content="Autonomous agent orchestration, tool routing, and streaming architecture.", color="green", tags=["Core", "Production"], votes=42, assignee="Core Team", column_id="col-done"),
                ]
            ),
        ]

    board = PlanningBoardData(
        board_id=f"board-{abs(hash(topic)) % 10000}",
        title=f"Miro Canvas: {topic.title()}",
        description=f"Interactive collaborative planning canvas for '{topic}'. Drag notes, vote, or add new ideas.",
        last_updated="Just now",
        columns=cols,
    )
    return board.model_dump()
