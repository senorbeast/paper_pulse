from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional


class AuthorBaseDTO(BaseModel):
    name: str
    bio: Optional[str] = None
    email: EmailStr


class AuthorCreateDTO(AuthorBaseDTO):
    pass


class AuthorResponseDTO(AuthorBaseDTO):
    id: int

    model_config = ConfigDict(from_attributes=True)
