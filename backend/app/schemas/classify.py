from pydantic import BaseModel

class ClassifyResponse(BaseModel):
    result: str
    confidence: float
