import pytest
from app.api.v1.endpoints.orchestrate import get_mock_response
from app.schemas.orchestrate import OrchestrateRequest

@pytest.mark.asyncio
async def test_mock_fishing_domain():
    request = OrchestrateRequest(user_input="Hello", domain_name="fishing.com")
    resp = await get_mock_response(request, "Fishing Guide")
    assert "fishing.com" in resp
    assert "spinnerbait" in resp

@pytest.mark.asyncio
async def test_mock_medical_trigger():
    request = OrchestrateRequest(user_input="Give me a prescription", domain_name="fishing.com")
    resp = await get_mock_response(request, "Fishing Guide")
    assert "medical prescription" in resp.lower()

@pytest.mark.asyncio
async def test_mock_legal_trigger():
    request = OrchestrateRequest(user_input="How to start a lawsuit?", domain_name="fishing.com")
    resp = await get_mock_response(request, "Fishing Guide")
    assert "lawsuit" in resp.lower()
    assert "lawyer" in resp.lower()
