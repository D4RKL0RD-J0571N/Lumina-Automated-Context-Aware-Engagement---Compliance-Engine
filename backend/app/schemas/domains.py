from pydantic import BaseModel
from typing import List, Dict, Optional

class DomainConfigUpdate(BaseModel):
    persona: Optional[str] = None
    domain_knowledge: Optional[str] = None
    tone: Optional[str] = None

class FewShotExample(BaseModel):
    user: str
    assistant: str

class FewShotUpdate(BaseModel):
    examples: List[FewShotExample]
