from tests.base import BaseTestCase

class TestAuthors(BaseTestCase):
    def test_create_and_get_author(self):
        """
        Test the full lifecycle of creating and retrieving an author via the API.
        """
        # 1. Create a new author using BaseTestCase helper
        response = self.create_author(email="jane@example.com")
        assert response.status_code == 201
        created_author = response.get_json()
        assert created_author["email"] == "jane@example.com"
        assert "id" in created_author

        author_id = created_author["id"]

        # 2. Get the author by ID
        response = self.client.get(f"/api/authors/{author_id}")
        assert response.status_code == 200
        fetched_author = response.get_json()
        assert fetched_author["id"] == author_id

    def test_validation_error(self):
        """
        Test validation logic for authors.
        """
        # Missing email via raw client call or helper if we extend it
        response = self.client.post("/api/authors/", json={
            "name": "No Email",
            # email missing
            "bio": "Should fail"
        })
        assert response.status_code == 400

    def test_list_authors(self):
        """
        Test listing multiple authors.
        """
        self.create_author(name="A1", email="a1@example.com")
        self.create_author(name="A2", email="a2@example.com")

        response = self.client.get("/api/authors/")
        assert response.status_code == 200
        authors = response.get_json()
        assert len(authors) >= 2
        emails = [a["email"] for a in authors]
        assert "a1@example.com" in emails
