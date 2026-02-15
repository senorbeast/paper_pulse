from tests.base import BaseTestCase

class TestPapers(BaseTestCase):
    def test_create_paper_lifecycle(self):
        """
        Test creating an author, then creating a paper, then fetching it.
        """
        # 1. Create an author first (helper available in BaseTestCase)
        author_resp = self.create_author(name="Prof. X", email="x@test.com")
        assert author_resp.status_code == 201
        author_id = author_resp.get_json()["id"]

        # 2. Create a paper
        paper_data = {
            "title": "Quantum Physics",
            "doi": "10.0001/qp",
            "abstract": "Deep dive",
            "author_id": author_id
        }
        create_resp = self.client.post("/api/papers/", json=paper_data)
        assert create_resp.status_code == 201
        paper = create_resp.get_json()
        assert paper["title"] == "Quantum Physics"
        paper_id = paper["id"]

        # 3. Get Paper
        get_resp = self.client.get(f"/api/papers/{paper_id}")
        assert get_resp.status_code == 200
        fetched = get_resp.get_json()
        assert fetched["title"] == "Quantum Physics"

    def test_paper_validation(self):
        """
        Ensure papers without valid author or missing fields fail.
        """
        # Fails without Author ID
        resp = self.client.post("/api/papers/", json={
            "title": "Invalid Paper",
            "doi": "10.000/invalid"
        })
        assert resp.status_code == 400

        # Fails with invalid Author ID (if checked)
        invalid_resp = self.client.post("/api/papers/", json={
            "title": "Zombie Paper",
            "doi": "10.000/zombie",
            "author_id": 99999
        })
        # Assuming DB constraint / app logic catches this
        assert invalid_resp.status_code == 404
