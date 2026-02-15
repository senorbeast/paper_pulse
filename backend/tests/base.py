import pytest

@pytest.mark.usefixtures("client_class")
class BaseTestCase:
    """
    Base class for integration tests.
    It provides class attributes 'client' and 'session' which are populated by 'client_class' fixture.
    """
    client: "testing.FlaskClient"
    session: "sqlalchemy.orm.scoped_session"

    def create_author(self, name="Test Author", email="author@example.com", bio="Some bio"):
        """Helper to create an author via API."""
        return self.client.post("/api/authors/", json={
            "name": name,
            "email": email,
            "bio": bio
        })
    
    def create_paper(self, author_id, title="Test Paper", doi="10.1234/test", abstract="Abstract"):
        """Helper to create a paper via API."""
        return self.client.post("/api/papers/", json={
            "title": title,
            "abstract": abstract,
            "doi": doi,
            "author_id": author_id
        })
