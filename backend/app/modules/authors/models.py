from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app import db


class Author(db.Model):
    __tablename__ = "authors"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    bio = Column(Text, nullable=True)
    email = Column(String(120), unique=True, nullable=False)

    # Relationships
    papers = relationship(
        "Paper", back_populates="author", cascade="all, delete-orphan"
    )
