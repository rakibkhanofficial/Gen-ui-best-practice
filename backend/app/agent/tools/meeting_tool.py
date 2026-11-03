import re
import datetime
from typing import Dict, Any, List, Optional
from app.models.schemas import MeetingScheduleData, MeetingSlot, MeetingParticipant


def schedule_meeting(
    reason: str = "GenUI Architecture Review & Alignment",
    duration_minutes: int = 30,
    participants: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """Generates an interactive Meeting Time Picker with real-time calendar slots and Human-in-the-Loop booking."""
    now = datetime.datetime.now()
    
    # Calculate upcoming dates for slots (Tomorrow, Day+2, Day+3, Day+4)
    dates = []
    for i in range(1, 5):
        target_date = now + datetime.timedelta(days=i)
        # Skip Sundays if applicable
        if target_date.weekday() == 6:  # Sunday
            target_date += datetime.timedelta(days=1)
        dates.append(target_date)

    d1, d2, d3, d4 = dates[:4]

    slots = [
        MeetingSlot(
            id="slot-1",
            date=d1.strftime("%A, %b %d"),
            start_time="10:00 AM",
            end_time="10:30 AM" if duration_minutes == 30 else "10:45 AM",
            duration_minutes=duration_minutes,
            badge="Recommended • Both Free",
            is_recommended=True,
        ),
        MeetingSlot(
            id="slot-2",
            date=d1.strftime("%A, %b %d"),
            start_time="02:30 PM",
            end_time="03:00 PM" if duration_minutes == 30 else "03:15 PM",
            duration_minutes=duration_minutes,
            badge="Afternoon Focus",
            is_recommended=False,
        ),
        MeetingSlot(
            id="slot-3",
            date=d2.strftime("%A, %b %d"),
            start_time="11:15 AM",
            end_time="11:45 AM" if duration_minutes == 30 else "12:00 PM",
            duration_minutes=duration_minutes,
            badge="Optimal Energy",
            is_recommended=False,
        ),
        MeetingSlot(
            id="slot-4",
            date=d3.strftime("%A, %b %d"),
            start_time="04:00 PM",
            end_time="04:30 PM" if duration_minutes == 30 else "04:45 PM",
            duration_minutes=duration_minutes,
            badge="Wrap-up Slot",
            is_recommended=False,
        ),
    ]

    # Host & Attendees
    host = MeetingParticipant(
        name="Rakib Khan",
        email="rakib.khan@enterprise.ai",
        avatar="https://api.dicebear.com/7.x/bottts/svg?seed=Rakib",
        role="Host • Senior AI Engineer",
    )

    attendee_list = [
        MeetingParticipant(
            name="Sarah Chen",
            email="sarah.chen@partner.io",
            avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
            role="Lead Solution Architect",
        ),
        MeetingParticipant(
            name="Alex Mercer",
            email="alex.mercer@cloudinfra.net",
            avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
            role="Staff Frontend Engineer",
        ),
    ]

    meeting_title = reason.strip().title()
    if not any(k in meeting_title.lower() for k in ["meeting", "sync", "review", "call", "catchup", "discussion"]):
        meeting_title = f"{meeting_title} Sync"

    meeting_data = MeetingScheduleData(
        meeting_id=f"mtg-{abs(hash(reason)) % 100000}",
        title=meeting_title,
        reason=reason,
        duration_minutes=duration_minutes,
        timezone="UTC+06:00 (Asia/Dhaka / GMT+6)",
        host=host,
        participants=attendee_list,
        available_slots=slots,
        google_meet_url=f"https://meet.google.com/gen-{abs(hash(reason)) % 900 + 100}-{abs(hash(reason)) % 900 + 100}",
        status="pending",
    )

    return meeting_data.model_dump()
