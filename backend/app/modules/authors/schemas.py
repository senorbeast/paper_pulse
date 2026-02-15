from pydantic import BaseModel, EmailStr, ConfigDict, Field, BeforeValidator
from typing import Optional, Annotated

STRIP_WS = BeforeValidator(lambda v: v.strip() if isinstance(v, str) else v)

class AuthorBaseDTO(BaseModel):
    name: Annotated[str, STRIP_WS] = Field(..., min_length=1, max_length=100)
    bio: Optional[Annotated[str, STRIP_WS]] = None
    email: Annotated[EmailStr, STRIP_WS] = Field(..., max_length=120)


class AuthorCreateDTO(AuthorBaseDTO):
    pass


class AuthorResponseDTO(AuthorBaseDTO):
    id: int

    model_config = ConfigDict(from_attributes=True)
