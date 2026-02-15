from typing import List, Optional
from app.modules.authors.repository import AuthorRepository
from app.modules.authors.schemas import AuthorCreateDTO, AuthorResponseDTO
from app.common.error_handler import AppError
from pydantic import ValidationError
import logging

logger = logging.getLogger(__name__)


class AuthorService:
    def __init__(self, repository=None):
        self.repository = repository or AuthorRepository()

    def create_author(self, data: AuthorCreateDTO) -> AuthorResponseDTO:
        if self.repository.get_by_email(data.email):
            raise AppError("Author with this email already exists", 409)

        author = self.repository.create(**data.model_dump())
        return AuthorResponseDTO.model_validate(author)

    def get_author(self, author_id: int) -> AuthorResponseDTO:
        author = self.repository.get_by_id(author_id)
        if not author:
            raise AppError("Author not found", 404)
        return AuthorResponseDTO.model_validate(author)

    def get_all_authors(self) -> List[AuthorResponseDTO]:
        authors = self.repository.get_all()
        valid_authors = []
        
        for author in authors:
            try:
                valid_authors.append(AuthorResponseDTO.model_validate(author))
            except ValidationError as e:
                # Log the validation error and skip this author
                logger.warning(
                    f"Skipping author {author.id} due to validation error: {e}"
                )
                continue
        
        return valid_authors
