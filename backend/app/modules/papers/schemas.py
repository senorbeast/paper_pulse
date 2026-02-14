from pydantic import BaseModel, ConfigDict
from typing import Optional


class PaperBaseDTO(BaseModel):
    title: str
    abstract: Optional[str] = None
    doi: str
    author_id: int


class PaperCreateDTO(PaperBaseDTO):
    pass


class PaperResponseDTO(PaperBaseDTO):
    id: int

    model_config = ConfigDict(from_attributes=True)
