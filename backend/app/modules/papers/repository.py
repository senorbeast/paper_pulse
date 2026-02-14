from typing import Optional
from app import db
from app.common.base_repository import BaseRepository
from app.modules.papers.models import Paper


class PaperRepository(BaseRepository[Paper]):
    def __init__(self):
        super().__init__(Paper)

    def get_by_doi(self, doi: str) -> Optional[Paper]:
        return self.session.query(Paper).filter_by(doi=doi).first()
