from typing import Dict, Any
from app.models.schemas import PlanningBoardData, BoardColumn, StickyNote


def generate_planning_board(topic: str = "Generative AI Architecture Roadmap") -> Dict[str, Any]:
    """Generates an interactive Miro-style visual sticky note planning board with columns and tasks.
    
    Args:
        topic: The project or architecture topic to plan (e.g. 'GenUI Release', 'Cloud Migration', 'E-commerce Redesign').
    """
    board = PlanningBoardData(
        board_id="board-genui-2026",
        title=f"Miro Canvas: {topic.title()}",
        description="Collaborative visual roadmap board with interactive sticky notes, voting counters, and status lanes.",
        last_updated="Just now",
        columns=[
            BoardColumn(
                id="col-backlog",
                title="Ideation & Backlog",
                color_accent="#F59E0B", # Amber
                notes=[
                    StickyNote(
                        id="note-101",
                        title="AG-UI Protocol Streaming",
                        content="Implement SSE chunking for multi-agent tool execution feedback directly to CopilotKit.",
                        color="yellow",
                        tags=["Protocol", "Agentic"],
                        votes=14,
                        assignee="Alex K.",
                        column_id="col-backlog"
                    ),
                    StickyNote(
                        id="note-102",
                        title="Voice & Audio Multimodal",
                        content="Explore Gemini Live bidirectional audio streaming integration for voice input.",
                        color="pink",
                        tags=["Gemini", "Voice"],
                        votes=9,
                        assignee="Sarah T.",
                        column_id="col-backlog"
                    )
                ]
            ),
            BoardColumn(
                id="col-progress",
                title="In Progress",
                color_accent="#3B82F6", # Blue
                notes=[
                    StickyNote(
                        id="note-201",
                        title="Generative UI Registry",
                        content="Mount interactive dynamic components on tool call completions with Framer Motion.",
                        color="blue",
                        tags=["Frontend", "CopilotKit"],
                        votes=21,
                        assignee="Rakib K.",
                        column_id="col-progress"
                    ),
                    StickyNote(
                        id="note-202",
                        title="Google Antigravity SDK Engine",
                        content="Configure LocalAgentConfig with custom tool registry and safety policies.",
                        color="green",
                        tags=["Backend", "Python"],
                        votes=17,
                        assignee="David W.",
                        column_id="col-progress"
                    )
                ]
            ),
            BoardColumn(
                id="col-review",
                title="Review & Validation",
                color_accent="#8B5CF6", # Purple
                notes=[
                    StickyNote(
                        id="note-301",
                        title="HITL Approval Flows",
                        content="Test 60s countdown timer and security approval interceptors before action dispatch.",
                        color="purple",
                        tags=["Security", "HITL"],
                        votes=12,
                        assignee="Elena R.",
                        column_id="col-review"
                    )
                ]
            ),
            BoardColumn(
                id="col-done",
                title="Shipped & Verified",
                color_accent="#10B981", # Emerald
                notes=[
                    StickyNote(
                        id="note-401",
                        title="Next.js 16 Setup & Guest Auth",
                        content="App router scaffolding with cookie session token and shadcn base styles.",
                        color="green",
                        tags=["Core", "Auth"],
                        votes=28,
                        assignee="Core Team",
                        column_id="col-done"
                    ),
                    StickyNote(
                        id="note-402",
                        title="Docker Postgres & Redis",
                        content="Configured docker-compose with local port forwarding and health checks.",
                        color="orange",
                        tags=["DevOps", "Docker"],
                        votes=15,
                        assignee="DevOps",
                        column_id="col-done"
                    )
                ]
            )
        ]
    )
    return board.model_dump()

