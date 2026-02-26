import json
import os
import time
from datetime import datetime
from typing import Dict, Any

class AuditLogger:
    """
    Handles persistent logging of orchestration events for compliance and security auditing.
    Logs include the full prompt stack (L1/L2/L3) and the raw output.
    """
    
    def __init__(self, log_dir: str = "logs/audit"):
        self.log_dir = log_dir
        if not os.path.exists(log_dir):
            os.makedirs(log_dir, exist_ok=True)
            
    def log_event(self, domain: str, request_data: Dict[str, Any], system_prompt: str, ai_response: str, compliance_result: Any):
        """Logs a single orchestration event to a daily JSONL file."""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "domain": domain,
            "request": {
                "user_input": request_data.get("user_input"),
                "rag_context": request_data.get("rag_context"),
                "stream": request_data.get("stream")
            },
            "orchestration_stack": {
                "full_system_prompt": system_prompt
            },
            "response": {
                "raw_text": ai_response,
                "is_safe": getattr(compliance_result, "is_safe", True),
                "classification": str(getattr(compliance_result, "classification", "unknown"))
            }
        }
        
        # Write to daily file
        today = datetime.now().strftime("%Y-%m-%d")
        file_path = os.path.join(self.log_dir, f"audit_{today}.jsonl")
        
        with open(file_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(log_entry) + "\n")

# Singleton
audit_logger = AuditLogger()
