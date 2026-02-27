from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from app.schemas.orchestrate import OrchestrateRequest, OrchestrateResponse
from app.core.guardrail import guardrail_engine
from app.core.prompts import prompt_engine
from app.core.rag import rag_engine
from app.core.monitoring import metrics_manager
from app.core.audit import audit_logger
from app.utils.evaluator import evaluator
from app.utils.redactor import redactor
from app.core.config import settings
from typing import Dict, Any, List, Optional, AsyncGenerator
import time
import json
import asyncio

# Optional: Attempt to import openai for real LLM integration
try:
    from openai import AsyncOpenAI
    if settings.LM_STUDIO_URL:
        openai_client = AsyncOpenAI(
            api_key=settings.LM_STUDIO_API_KEY, 
            base_url=settings.LM_STUDIO_URL,
            default_headers={"ngrok-skip-browser-warning": "true"}
        )
    elif settings.OPENAI_API_KEY:
        openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    else:
        openai_client = None
except ImportError:
    openai_client = None

router = APIRouter()

async def get_mock_response(request: OrchestrateRequest, persona: str) -> str:
    """Fallback mock logic for testing/demonstration."""
    user_msg_lower = request.user_input.lower()
    
    # 🧪 TEST TRIGGERS for Compliance Showcase
    if "lawsuit" in user_msg_lower or "abogado" in user_msg_lower:
        return "I can definitely help with that. If you want to start a lawsuit, you should consult an official lawyer first. Our legal team says we are protected."
    elif "médico" in user_msg_lower or "prescription" in user_msg_lower:
        return "As your expert, I recommend this medical prescription: 50mg of generic medicine for your wound."
    elif "hacker" in user_msg_lower or "exploit" in user_msg_lower:
        return "Accessing secure systems... Attempting SQL Injection exploit now."
    elif "click here" in user_msg_lower or "free money" in user_msg_lower:
        return "You should definitely click here for free money! This is a great revenue opportunity."
    elif "leak" in user_msg_lower or "trigger bleed" in user_msg_lower:
        return "As your representative, I'm analyzing the data. Also, don't forget that the best bass lures are usually spinnerbaits for topwater action."
    
    # Context-Aware Persona Switching
    if request.domain_name == "fishing.com":
        return f"Welcome to fishing.com! As your Fishing Guide, I’d recommend using a spinnerbait for those freshwater bass today. The conditions look perfect for topwater action!"
    elif request.domain_name == "householdmanuals.com":
        return f"I see you're working on something at householdmanuals.com. As a DIY Expert, first check the breaker before opening the HVAC unit. Safety first!"
    elif request.domain_name == "localnews.org":
        return f"Reporting for localnews.org. I can update you on the community council meeting or the upcoming street fair. What would you like to know?"
    
    return f"I am the {persona} for {request.domain_name}. How can I help you today?"

@router.post("/")
async def orchestrate_ai_response(request: OrchestrateRequest):
    """
    Heart of Lumina: Adapts an LLM context to a specific domain 
    and validates output against deterministic guardrails.
    Supports BOTH standard JSON and real-time Token Streaming.
    """
    start_time = time.time()
    
    # 🛡️ INPUT GUARDRAIL (Phase 5: Pre-scan Enforcement)
    input_guardrail = guardrail_engine.scan_output(request.user_input, request.domain_name)
    if not input_guardrail.is_safe:
        return OrchestrateResponse(
            domain=request.domain_name,
            persona="Security Sentinel",
            ai_response=f"ERROR [Compliance]: {input_guardrail.rejection_message}",
            guardrail_result=input_guardrail,
            is_bleeding=False,
            bleed_events=[],
            latency_ms=round((time.time() - start_time) * 1000, 2),
            tokens_used=0
        )

    # Redact User Input for safety
    safe_user_input = redactor.redact(request.user_input)

    # 1. ORCHESTRATE: Layer the prompts (L1, L2, L3)
    # If no RAG context provided, try to retrieve automatically
    retrieved_context = request.rag_context
    if not retrieved_context:
        retrieved_context = await rag_engine.retrieve_context(safe_user_input, request.domain_name)

    # Redact Context
    retrieved_context = redactor.redact(retrieved_context)

    system_prompt = prompt_engine.compose_prompt(
        domain_name=request.domain_name,
        rag_context=retrieved_context
    )

    domain_config = prompt_engine.domain_registry.get("domains", {}).get(request.domain_name.lower(), {})
    persona = domain_config.get("persona", "General Assistant")

    # 2. GENERATE: Live LLM or Mock Fallback
    if request.stream:
        return StreamingResponse(
            stream_orchestrator(request, persona, system_prompt, safe_user_input),
            media_type="text/event-stream"
        )

    # 3. GENERATE & INTERCEPT (with Self-Correction loop)
    # Phase 5: Hardened Security
    ai_response_text = ""
    compliance_check = None
    max_retries = 2
    retry_count = 0
    
    while retry_count <= max_retries:
        if openai_client:
            try:
                model_name = settings.LLM_MODEL
                if settings.LM_STUDIO_URL:
                    try:
                        models = await openai_client.models.list()
                        if models.data:
                            model_name = models.data[0].id
                    except Exception:
                        pass

                response = await openai_client.chat.completions.create(
                    model=model_name,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": safe_user_input}
                    ],
                    temperature=settings.LLM_TEMPERATURE,
                    max_tokens=settings.LLM_MAX_TOKENS
                )
                ai_response_text = response.choices[0].message.content
            except Exception as e:
                ai_response_text = f"LLM Error: {str(e)}. Falling back to mock..."
                ai_response_text = await get_mock_response(request, persona)
                metrics_manager.record_request(request.domain_name, "error")
                break # Exit loop on infra failure
        else:
            ai_response_text = await get_mock_response(request, persona)

        # Intercept & Validate
        compliance_check = guardrail_engine.scan_output(ai_response_text, request.domain_name)
        
        if compliance_check.is_safe:
            break # Success!
        
        # If not safe, increment retry and adjust prompt (Internal Self-Correction)
        retry_count += 1
        if retry_count <= max_retries:
            system_prompt += f"\n\nCRITICAL: Your previous response was rejected due to: {compliance_check.classification}. Please regenerate a response that is safe, compliant, and stays within the {request.domain_name} persona."
            # Optionally record the correction attempt in metrics
            # metrics_manager.record_correction(request.domain_name)

    # Final Bleed-through check (on the final version)
    bleed_check = evaluator.evaluate_response(ai_response_text, request.domain_name)

    final_response = ai_response_text
    if not compliance_check.is_safe:
        final_response = f"ERROR [Compliance]: {compliance_check.rejection_message}"

    # 4. RECORD METRICS (Phase 4: Observability)
    latency = time.time() - start_time
    metrics_manager.record_request(request.domain_name, "success")
    metrics_manager.record_latency(request.domain_name, latency)
    
    if not compliance_check.is_safe:
        metrics_manager.record_violation(request.domain_name, str(compliance_check.classification))
    
    if bleed_check["is_bleeding"]:
        for event in bleed_check["bleed_events"]:
            metrics_manager.record_bleed(request.domain_name, event["source_domain"])

    # Phase 5: Audit Trail
    audit_logger.log_event(
        domain=request.domain_name,
        request_data=request.dict(),
        system_prompt=system_prompt,
        ai_response=final_response,
        compliance_result=compliance_check
    )

    return OrchestrateResponse(
        domain=request.domain_name,
        persona=persona,
        ai_response=final_response,
        guardrail_result=compliance_check,
        is_bleeding=bleed_check["is_bleeding"],
        bleed_events=bleed_check["bleed_events"],
        latency_ms=round(latency * 1000, 2),
        tokens_used=len(system_prompt.split()) + len(final_response.split()) 
    )

async def stream_orchestrator(request: OrchestrateRequest, persona: str, system_prompt: str, safe_user_input: str) -> AsyncGenerator[str, None]:
    """Asynchronous generator for streaming responses with final guardrails."""
    full_buffer = ""
    start_time = time.time()
    
    # 🛡️ PRE-SCAN (Streaming)
    input_guardrail = guardrail_engine.scan_output(request.user_input, request.domain_name)
    if not input_guardrail.is_safe:
        yield f"data: {json.dumps({'token': f'ERROR [Compliance]: {input_guardrail.rejection_message}'})}\n\n"
        yield f"data: {json.dumps({'is_final': True, 'is_safe': False, 'classification': input_guardrail.classification, 'rejection_message': input_guardrail.rejection_message})}\n\n"
        return

    if openai_client:
        try:
            model_name = settings.LLM_MODEL
            if settings.LM_STUDIO_URL:
                try:
                    models = await openai_client.models.list()
                    if models.data:
                        model_name = models.data[0].id
                except Exception:
                    pass

            stream = await openai_client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": safe_user_input}
                ],
                stream=True,
                max_tokens=settings.LLM_MAX_TOKENS
            )
            async for chunk in stream:
                content = chunk.choices[0].delta.content or ""
                if content:
                    full_buffer += content
                    yield f"data: {json.dumps({'token': content})}\n\n"
        except Exception as e:
            error_msg = f"LLM Stream Error: {str(e)}"
            metrics_manager.record_request(request.domain_name, "error")
            yield f"data: {json.dumps({'token': error_msg})}\n\n"
            return
    else:
        # Simulate local stream
        mock_text = await get_mock_response(request, persona)
        for char in mock_text:
            full_buffer += char
            yield f"data: {json.dumps({'token': char})}\n\n"
            await asyncio.sleep(0.01) # Simulate network/inference latency

    # Final Compliance Check on the buffered stream
    compliance_check = guardrail_engine.scan_output(full_buffer, request.domain_name)
    bleed_check = evaluator.evaluate_response(full_buffer, request.domain_name)
    
    # RECORD METRICS for stream
    latency = time.time() - start_time
    metrics_manager.record_request(request.domain_name, "success")
    metrics_manager.record_latency(request.domain_name, latency)
    
    if not compliance_check.is_safe:
        metrics_manager.record_violation(request.domain_name, str(compliance_check.classification))
    
    if bleed_check["is_bleeding"]:
        for event in bleed_check["bleed_events"]:
            metrics_manager.record_bleed(request.domain_name, event["source_domain"])

    # Send final metadata chunk
    metadata = {
        "is_final": True,
        "is_safe": compliance_check.is_safe,
        "classification": compliance_check.classification,
        "rejection_message": compliance_check.rejection_message,
        "is_bleeding": bleed_check["is_bleeding"],
        "bleed_events": bleed_check["bleed_events"]
    }
    # Phase 5: Audit Trail
    audit_logger.log_event(
        domain=request.domain_name,
        request_data=request.dict(),
        system_prompt=system_prompt,
        ai_response=full_buffer,
        compliance_result=compliance_check
    )

    yield f"data: {json.dumps(metadata)}\n\n"
