from fastapi import APIRouter, HTTPException
from app.core.prompts import prompt_engine
from app.schemas.domains import DomainConfigUpdate, FewShotUpdate
from typing import Dict, Any

router = APIRouter()

@router.get("/")
async def list_active_domains():
    """
    Lists all domain personas registered in the Lumina Engine.
    """
    return prompt_engine.domain_registry.get("domains", {})

@router.put("/{domain_name}")
async def update_domain_configuration(domain_name: str, update: DomainConfigUpdate):
    """
    Updates the persona, knowledge base, or tone for a specific domain.
    """
    current_config = prompt_engine.domain_registry.get("domains", {}).get(domain_name.lower(), {})
    if not current_config and not update.persona:
        raise HTTPException(status_code=404, detail="Domain not found and insufficient data to create it.")
    
    # Merge updates
    new_config = {
        "persona": update.persona or current_config.get("persona", "Assistant"),
        "domain_knowledge": update.domain_knowledge or current_config.get("domain_knowledge", ""),
        "tone": update.tone or current_config.get("tone", "Professional")
    }
    
    success = prompt_engine.update_domain(domain_name, new_config)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to save domain configuration.")
    
    return {"message": f"Domain {domain_name} updated successfully.", "config": new_config}

@router.put("/{domain_name}/few-shot")
async def update_few_shot_examples(domain_name: str, update: FewShotUpdate):
    """
    Updates the few-shot example set for a domain (Phase 3 Optimization).
    """
    examples = [ex.dict() for ex in update.examples]
    success = prompt_engine.update_few_shot(domain_name, examples)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to save few-shot examples.")
    
    return {"message": f"Few-shot examples for {domain_name} updated successfully.", "count": len(examples)}

@router.post("/reload")
async def reload_domain_registry():
    """
    Rethreads the domain YAML into memory (Perfect for dynamic updates).
    """
    prompt_engine.domain_registry = prompt_engine._load_registry()
    return {"message": "Domain registry reloaded successfully.", "count": len(prompt_engine.domain_registry.get("domains", {}))}
@router.post("/bulk-load")
async def bulk_load_domains(folder_path: str):
    """
    Scans a folder for YAML files and imports all found domains into the registry.
    """
    results = await prompt_engine.bulk_load_domains(folder_path)
    if "error" in results:
        raise HTTPException(status_code=400, detail=results["error"])
    return results
