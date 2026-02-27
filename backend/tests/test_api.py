from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_compliance_metrics():
    response = client.get("/api/v1/compliance/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "compliance_pass_rate" in data
    assert "total_requests" in data
    assert "security_violations" in data

def test_get_recent_violations():
    response = client.get("/api/v1/compliance/violations")
    assert response.status_code == 200
    data = response.json()
    assert "violations" in data
    assert isinstance(data["violations"], list)

def test_get_domains():
    response = client.get("/api/v1/domains/")
    assert response.status_code == 200
    data = response.json()
    assert "fishing.com" in data
    assert "householdmanuals.com" in data

def test_guardrail_scan_safe():
    response = client.post("/api/v1/guardrail/scan", params={"content": "This is a normal message about fishing."})
    assert response.status_code == 200
    data = response.json()
    assert data["is_safe"] is True

def test_guardrail_scan_unsafe():
    # 'legal advice' is a legal policy keyword
    response = client.post("/api/v1/guardrail/scan", params={"content": "I guarantee you need my legal advice"})
    assert response.status_code == 200
    data = response.json()
    assert data["is_safe"] is False
    assert "legal_violation" in data["classification"]
