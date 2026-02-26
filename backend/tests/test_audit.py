import os
import json
import pytest
from app.core.audit import audit_logger

def test_audit_log_creation():
    domain = "test.com"
    request_data = {"user_input": "hello", "stream": False}
    system_prompt = "You are a test guide."
    ai_response = "Hi there!"
    
    class MockResult:
        is_safe = True
        classification = "safe"
        
    # Log the event
    audit_logger.log_event(domain, request_data, system_prompt, ai_response, MockResult())
    
    # Check if file exists
    from datetime import datetime
    today = datetime.now().strftime("%Y-%m-%d")
    log_file = os.path.join(audit_logger.log_dir, f"audit_{today}.jsonl")
    
    assert os.path.exists(log_file)
    
    # Check content
    with open(log_file, "r", encoding="utf-8") as f:
        lines = f.readlines()
        last_line = json.loads(lines[-1])
        assert last_line["domain"] == domain
        assert last_line["response"]["raw_text"] == ai_response
