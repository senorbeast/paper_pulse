
import random
from faker import Faker
from app import create_app, db
from app.modules.authors.service import AuthorService
from app.modules.papers.service import PaperService
from app.modules.authors.schemas import AuthorCreateDTO
from app.modules.papers.schemas import PaperCreateDTO
from app.modules.authors.models import Author
from app.modules.papers.models import Paper
from app.common.error_handler import AppError

fake = Faker()

def seed_database():
    app = create_app()
    with app.app_context():
        # Services
        author_service = AuthorService()
        paper_service = PaperService()

        # Clear existing data provided it's safe (dev only usually)
        print("Clearing existing data...")

        Paper.query.delete()
        Author.query.delete()
        db.session.commit()

        print("Seeding Authors...")
        authors_ids = []
        for _ in range(10):
            dto = AuthorCreateDTO(
                name=fake.name(),
                bio=fake.text(max_nb_chars=200),
                email=fake.unique.email()
            )
            try:
                author_response = author_service.create_author(dto)
                authors_ids.append(author_response.id)
            except AppError as e:
                print(f"Skipping author creation due to error: {e.message}")
        
        print(f"Created {len(authors_ids)} authors.")

        if not authors_ids:
            print("No authors created, skipping papers.")
            return

        print("Seeding Papers...")
        papers_count = 0
        for _ in range(25):
            author_id = random.choice(authors_ids)
            dto = PaperCreateDTO(
                title=fake.catch_phrase(),
                abstract=fake.paragraph(nb_sentences=5),
                doi=f"10.{fake.random_number(digits=4)}/{fake.uuid4()[:8]}",
                author_id=author_id
            )
            try:
                paper_service.create_paper(dto)
                papers_count += 1
            except AppError as e:
                print(f"Skipping paper creation due to error: {e.message}")
        
        print(f"Created {papers_count} papers.")
        print("✅ Seeding complete!")

if __name__ == "__main__":
    seed_database()
