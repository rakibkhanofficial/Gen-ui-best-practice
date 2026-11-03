from typing import Dict, Any, Optional
from app.models.schemas import HITLActionData, ResourceImpact
import uuid
from datetime import datetime


# In-memory store for pending HITL actions (can be backed by Redis in production)
_PENDING_ACTIONS: Dict[str, Dict[str, Any]] = {}


def request_sensitive_action(
    action_type: str = "customer_refund",
    target_id: str = "ORD-8921",
    amount: float = 1250.00,
    reason: str = "Duplicate enterprise subscription renewal billing"
) -> Dict[str, Any]:
    """Generates a Human-in-the-Loop approval gate for sensitive or high-risk actions.
    
    Args:
        action_type: Type of action ('customer_refund', 'production_deployment', 'database_migration').
        target_id: Identifier of the target resource (e.g. 'ORD-8921', 'k8s-prod-us-west').
        amount: Financial value involved if applicable.
        reason: Justification provided by user or agent.
    """
    action_id = f"act-{str(uuid.uuid4())[:8]}"
    
    if action_type == "customer_refund":
        title = f"Approve Customer Refund of ${amount:,.2f}"
        desc = f"Agent is requesting authorization to disburse ${amount:,.2f} USD to customer for Order #{target_id} ({reason})."
        risk_level = "HIGH"
        impacts = [
            ResourceImpact(
                resource_type="Stripe Payment Ledger",
                resource_name=f"Charge for {target_id}",
                action="refund",
                current_state=f"Captured (${amount:,.2f})",
                proposed_state=f"Refunded ($0.00 net)"
            ),
            ResourceImpact(
                resource_type="Salesforce CRM",
                resource_name="Customer Account Status",
                action="update",
                current_state="Active (In Dispute)",
                proposed_state="Active (Resolved & Refunded)"
            )
        ]
    elif action_type == "production_deployment":
        title = f"Deploy Release v2.8.4 to Production"
        desc = f"Agent requests rollout to production cluster {target_id}. Traffic will shift gradually over 5 minutes."
        risk_level = "CRITICAL"
        impacts = [
            ResourceImpact(
                resource_type="Kubernetes Deployment",
                resource_name=target_id,
                action="deploy",
                current_state="Image: registry/api:v2.8.3 (16 pods)",
                proposed_state="Image: registry/api:v2.8.4 (16 pods)"
            )
        ]
    else:
        title = f"Execute System Operation on {target_id}"
        desc = f"Action: {action_type} requested for {target_id}. Requires manual administrator approval."
        risk_level = "MEDIUM"
        impacts = [
            ResourceImpact(
                resource_type="Infrastructure Resource",
                resource_name=target_id,
                action="update",
                current_state="Current configuration",
                proposed_state="Modified configuration"
            )
        ]

    action_data = HITLActionData(
        action_id=action_id,
        action_type=action_type,
        title=title,
        description=desc,
        risk_level=risk_level,
        timeout_seconds=60,
        impacts=impacts,
        status="pending_approval",
        created_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
        requested_by="Autonomous Agent (Antigravity Core)",
        requires_confirmation_token=True
    )
    
    _PENDING_ACTIONS[action_id] = action_data.model_dump()
    return action_data.model_dump()


def execute_approved_action(action_id: str, decision: str = "approve") -> Dict[str, Any]:
    """Callback triggered when the human user clicks Approve or Reject on the GenUI card.
    
    Args:
        action_id: The ID of the pending action.
        decision: 'approve' to execute, 'reject' to abort.
    """
    if action_id not in _PENDING_ACTIONS:
        return {
            "success": False,
            "action_id": action_id,
            "status": "error",
            "message": f"Action {action_id} not found or expired."
        }

    action = _PENDING_ACTIONS[action_id]
    if decision.lower() == "approve":
        action["status"] = "executed"
        return {
            "success": True,
            "action_id": action_id,
            "status": "executed",
            "decision": "approved",
            "message": f"Action '{action['title']}' was approved by human operator and executed successfully."
        }
    else:
        action["status"] = "rejected"
        return {
            "success": False,
            "action_id": action_id,
            "status": "rejected",
            "decision": "rejected",
            "message": f"Action '{action['title']}' was rejected by human operator. No changes were made."
        }

