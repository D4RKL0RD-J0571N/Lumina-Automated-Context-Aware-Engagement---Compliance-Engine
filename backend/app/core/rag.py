import os
import json
from typing import List, Dict, Any, Optional
from app.core.config import settings

class RAGEngine:
    """
    Handles Layer 3 (Context/RAG) retrieval for Lumina.
    This connects the AI orchestrator to domain-specific knowledge bases.
    """

    def __init__(self):
        # In a real setup, you'd initialize your vector client here (e.g., Redis, Pinecone, or Supabase)
        self.enabled = True
        
        # 🔹 MOCK KNOWLEDGE BASE (For Demonstration)
        # In production, this data lives in a Vector DB.
        self.MOCK_KNOWLEDGE: Dict[str, List[Dict[str, str]]] = {
            "fishing.com": [
                {"text": "The 2024 Bass Open tournament starts July 15th at Lake Fork. Entry fee is $200.", "tags": ["tournament", "bass", "calendar"]},
                {"text": "Recent reports show clear water conditions on the North shore. Spinnerbaits are performing well.", "tags": ["report", "lure", "conditions"]},
                {"text": "New state regulations restrict catch limits to 3 per day on specific trophy lakes.", "tags": ["regulation", "limit"]}
            ],
            "householdmanuals.com": [
                {"text": "Model X-500 Dryers require lint filter cleaning every 30 cycles to prevent thermostat trips.", "tags": ["dryer", "maintenance"]},
                {"text": "Error code E12 on Samsung washers usually indicates a drain pump blockage.", "tags": ["error", "washer", "e12"]},
                {"text": "HVAC systems should be inspected annually; filters must be MERV-8 or higher for warranty compliance.", "tags": ["hvac", "warranty"]}
            ],
            "localnews.org": [
                {"text": "Main Street will be closed this Friday for the Annual Peach Festival parade from 4 PM to 9 PM.", "tags": ["street", "traffic", "festival"]},
                {"text": "The City Council approved the new park proposal for East Side yesterday with a 5-2 vote.", "tags": ["council", "park", "proposal"]},
                {"text": "Local library is extending hours until 8 PM on Tuesdays starting next month.", "tags": ["library", "news"]}
            ]
        }

    async def retrieve_context(self, query: str, domain: str, top_k: int = 2) -> str:
        """
        Retrieves relevant context snippets for a query within a domain scope.
        """
        query_lower = query.lower()
        domain_kb = self.MOCK_KNOWLEDGE.get(domain.lower(), [])
        
        if not domain_kb:
            return ""

        # 🔹 SIMPLE KEYWORD RETRIEVAL (Mocking Semantic Search)
        # In production: embeddings + vector similarity search
        scored_results = []
        for entry in domain_kb:
            score = 0
            # Check text matches
            words = query_lower.split()
            for word in words:
                if len(word) > 3 and word in entry["text"].lower():
                    score += 1
            
            # Check tag matches
            for tag in entry["tags"]:
                if tag in query_lower:
                    score += 2
            
            if score > 0:
                scored_results.append((score, entry["text"]))

        # Sort by score and take top K
        scored_results.sort(key=lambda x: x[0], reverse=True)
        top_results = [r[1] for r in scored_results[:top_k]]

        if not top_results:
            return ""

        context_header = f"Relevant information from {domain} knowledge base:\n"
        return context_header + "\n".join([f"- {r}" for r in top_results])

# Singleton
rag_engine = RAGEngine()
