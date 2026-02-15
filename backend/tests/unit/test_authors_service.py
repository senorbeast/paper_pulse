import pytest
from unittest.mock import Mock
from app.modules.authors.service import AuthorService
from app.modules.authors.schemas import AuthorCreateDTO, AuthorResponseDTO


@pytest.fixture
def mock_repo():
    return Mock()


def test_create_author_success(mock_repo):
    # Setup mock
    mock_repo.get_by_email.return_value = None
    author = Mock(
        id=1, bio="Researcher", email="john@example.com"
    )
    author.name = "John Doe"
    mock_repo.create.return_value = author

    service = AuthorService(repository=mock_repo)
    dto = AuthorCreateDTO(name="John Doe", bio="Researcher", email="john@example.com")

    result = service.create_author(dto)

    # Assert
    assert result.id == 1
    assert result.email == "john@example.com"
    mock_repo.create.assert_called_once()
