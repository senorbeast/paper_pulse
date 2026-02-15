from typing import List, Optional
from app.modules.papers.repository import PaperRepository
from app.modules.papers.schemas import PaperCreateDTO, PaperResponseDTO
from app.common.error_handler import AppError

from app.modules.authors.service import AuthorService


class PaperService:
    def __init__(self, repository=None, author_service=None):
        self.repository = repository or PaperRepository()
        self.author_service = author_service or AuthorService()

    def create_paper(self, data: PaperCreateDTO) -> PaperResponseDTO:
        # Validate author existence via service
        try:
            self.author_service.get_author(data.author_id)
        except AppError:
            raise AppError("Author not found", 404)

        if self.repository.get_by_doi(data.doi):
            existing = self.repository.get_by_doi(data.doi)
            return PaperResponseDTO.model_validate(existing)

        paper = self.repository.create(**data.model_dump())
        return PaperResponseDTO.model_validate(paper)

    def get_paper(self, paper_id: int) -> PaperResponseDTO:
        paper = self.repository.get_by_id(paper_id)
        if not paper:
            raise AppError("Paper not found", 404)
        return PaperResponseDTO.model_validate(paper)

    def get_all_papers(self) -> List[PaperResponseDTO]:
        papers = self.repository.get_all()
        return [PaperResponseDTO.model_validate(p) for p in papers]
