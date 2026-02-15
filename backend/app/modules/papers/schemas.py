from pydantic import BaseModel, ConfigDict, Field, BeforeValidator
from typing import Optional, Annotated

STRIP_WS = BeforeValidator(lambda v: v.strip() if isinstance(v, str) else v)

class PaperBaseDTO(BaseModel):
    title: Annotated[str, STRIP_WS] = Field(..., min_length=1, max_length=255)
    abstract: Optional[Annotated[str, STRIP_WS]] = None
    doi: Annotated[str, STRIP_WS] = Field(..., min_length=1, max_length=100)
    author_id: int


class PaperCreateDTO(PaperBaseDTO):
    pass


class PaperResponseDTO(PaperBaseDTO):
    id: int

    model_config = ConfigDict(from_attributes=True)
