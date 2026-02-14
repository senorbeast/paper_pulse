from typing import Optional
from app import db
from app.common.base_repository import BaseRepository
from app.modules.authors.models import Author


class AuthorRepository(BaseRepository[Author]):
    def __init__(self):
        super().__init__(Author)

    def get_by_email(self, email: str) -> Optional[Author]:
        return self.session.query(Author).filter_by(email=email).first()
