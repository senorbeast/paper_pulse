from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app import db


class Paper(db.Model):
    __tablename__ = "papers"

    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    abstract = Column(Text, nullable=True)
    doi = Column(String(100), unique=True, nullable=False)
    author_id = Column(Integer, ForeignKey("authors.id"), nullable=False)

    # Relationships
    author = relationship("Author", back_populates="papers")
