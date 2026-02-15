# Backend Testing Guide

## Overview

The testing framework uses **pytest** with a hierarchical structure:
- **conftest.py** - Test configuration and fixtures
- **base.py** - Base class for integration tests with helper methods
- **integration tests** - Full API endpoint testing (HTTP layer)
- **unit tests** - Isolated service logic testing (mocked dependencies)

---

## 1. conftest.py - Test Configuration Hub

This is the **central configuration** file that pytest automatically discovers. It provides reusable fixtures for all tests.

### Key Fixtures

#### `app` fixture (session-scoped)

```python
@pytest.fixture(scope='session')
def app():
    """Create and configure a new app instance for each test session."""
```

- **Scope**: `session` - Created once for the entire test run
- **Purpose**: Creates a Flask app with `TestingConfig`
- **Lifecycle**: 
  - Sets up database tables with `db.create_all()`
  - Yields the app for tests to use
  - Tears down with `db.drop_all()` after all tests complete

#### `client` fixture (function-scoped)

```python
@pytest.fixture(scope='function')
def client(app):
    """A test client for the app."""
```

- **Scope**: `function` - Fresh client for each test
- **Purpose**: Provides Flask test client for making HTTP requests
- **Usage**: Used in integration tests to call API endpoints

#### `session` fixture (function-scoped)

```python
@pytest.fixture(scope='function')
def session(app):
    """Creates a new database session for a test. Rolls back any changes."""
```

- **Scope**: `function` - Fresh session for each test
- **Purpose**: Provides **isolated database transactions**
- **Key mechanism**:
  1. Creates a new database connection
  2. Begins a transaction
  3. **Monkey patches** `db.session` to use test session
  4. **Rolls back** everything after the test (no data persists)
  5. Restores original `db.session`
- **Result**: Each test has a clean database state

#### `client_class` fixture (function-scoped)

```python
@pytest.fixture(scope='function')
def client_class(request, client, session):
    """Injects client and session into the test class."""
```

- **Purpose**: Dependency injection for class-based tests
- **Mechanism**: Sets `client` and `session` as class attributes
- **Enables**: Tests to access via `self.client` and `self.session`

---

## 2. base.py - Integration Test Foundation

Provides a **base class** for integration tests with common utilities.

### BaseTestCase Class

```python
@pytest.mark.usefixtures("client_class")
class BaseTestCase:
    """
    Base class for integration tests.
    It provides class attributes 'client' and 'session' which are populated by 'client_class' fixture.
    """
    client: "testing.FlaskClient"
    session: "sqlalchemy.orm.scoped_session"
```

**Key Features:**

1. **Fixture Integration**: Uses `@pytest.mark.usefixtures("client_class")` to automatically get `client` and `session` injected

2. **Type Hints**: Declares `client` and `session` attributes for IDE support

3. **Helper Methods**: Provides reusable methods for common operations:
   - **`create_author()`** - POSTs to `/api/authors/` endpoint
   - **`create_paper()`** - POSTs to `/api/papers/` endpoint

**Benefits:**
- **DRY principle** - Avoid repeating common setup code
- **Consistent API** - All integration tests use same patterns
- **Easy extension** - Add more helpers as needed

---

## 3. Integration Tests - test_authors_api.py

Tests the **full request-response cycle** through HTTP endpoints.

### Test Class Structure

```python
from tests.base import BaseTestCase

class TestAuthors(BaseTestCase):
    # Tests go here
```

Inherits from `BaseTestCase`, gaining access to:
- `self.client` - For HTTP requests
- `self.session` - For database verification (if needed)
- Helper methods like `create_author()`

### Test Examples

#### Test 1: Full Lifecycle

```python
def test_create_and_get_author(self):
    """Test the full lifecycle of creating and retrieving an author via the API."""
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
```

- Creates author via API (`POST /api/authors/`)
- Verifies 201 status and response data
- Fetches author by ID (`GET /api/authors/{id}`)
- Verifies data integrity

#### Test 2: Validation

```python
def test_validation_error(self):
    """Test validation logic for authors."""
    # Missing email via raw client call
    response = self.client.post("/api/authors/", json={
        "name": "No Email",
        # email missing
        "bio": "Should fail"
    })
    assert response.status_code == 400
```

- Sends invalid data (missing required `email` field)
- Verifies 400 error response
- Tests **Pydantic validation** at API layer

#### Test 3: Listing

```python
def test_list_authors(self):
    """Test listing multiple authors."""
    self.create_author(name="A1", email="a1@example.com")
    self.create_author(name="A2", email="a2@example.com")

    response = self.client.get("/api/authors/")
    assert response.status_code == 200
    authors = response.get_json()
    assert len(authors) >= 2
    emails = [a["email"] for a in authors]
    assert "a1@example.com" in emails
```

- Creates multiple authors
- Fetches all authors (`GET /api/authors/`)
- Verifies all created authors are present

### What Integration Tests Cover

✅ HTTP routing  
✅ Request validation (Pydantic DTOs)  
✅ Controller logic  
✅ Service layer  
✅ Database persistence  
✅ Response serialization  

---

## 4. Unit Tests - test_authors_service.py

Tests **isolated business logic** with mocked dependencies.

### Test Structure

```python
import pytest
from unittest.mock import Mock
from app.modules.authors.service import AuthorService
from app.modules.authors.schemas import AuthorCreateDTO, AuthorResponseDTO


@pytest.fixture
def mock_repo():
    return Mock()
```

Creates a **mock repository** to isolate the service layer.

### Test Example

```python
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
```

**Flow:**
1. **Setup mocks**: Configure mock repository behavior
   ```python
   mock_repo.get_by_email.return_value = None  # No duplicate
   mock_repo.create.return_value = author      # Return created author
   ```

2. **Create service** with mock dependency:
   ```python
   service = AuthorService(repository=mock_repo)
   ```

3. **Call service method**:
   ```python
   result = service.create_author(dto)
   ```

4. **Verify behavior**:
   ```python
   assert result.id == 1
   mock_repo.create.assert_called_once()
   ```

### What Unit Tests Cover

✅ Service business logic  
✅ DTO transformations  
✅ Repository interactions  
❌ No database  
❌ No HTTP layer  
❌ No external dependencies  

---

## Testing Flow Diagram

### Overall Test Lifecycle

```
┌─────────────────────────────────────────────────────────┐
│  conftest.py - Test Configuration                       │
├─────────────────────────────────────────────────────────┤
│  Session Start → app fixture creates Flask app          │
│               ↓                                          │
│  Each Test → client fixture (test client)               │
│           → session fixture (DB transaction)            │
│           → client_class injects into test class        │
│               ↓                                          │
│  Test Execution                                          │
│               ↓                                          │
│  Test End → session.rollback() (clean state)            │
│               ↓                                          │
│  Session End → db.drop_all()                             │
└─────────────────────────────────────────────────────────┘
```

### Integration Test Flow

```
┌─────────────────────────────────────────────────────────┐
│  Integration Test (test_authors_api.py)                 │
├─────────────────────────────────────────────────────────┤
│  TestAuthors(BaseTestCase)                              │
│      ↓                                                   │
│  self.client.post("/api/authors/") → Flask App           │
│      ↓                                                   │
│  Routes → Controller → Service → Repository → DB        │
│      ↓                                                   │
│  Response ← Controller ← Service ← Repository ← DB      │
│      ↓                                                   │
│  Assertions on HTTP response                             │
└─────────────────────────────────────────────────────────┘
```

### Unit Test Flow

```
┌─────────────────────────────────────────────────────────┐
│  Unit Test (test_authors_service.py)                    │
├─────────────────────────────────────────────────────────┤
│  mock_repo = Mock()                                      │
│      ↓                                                   │
│  service = AuthorService(repository=mock_repo)           │
│      ↓                                                   │
│  service.create_author(dto)                              │
│      ↓                                                   │
│  Assertions on service behavior + mock calls             │
└─────────────────────────────────────────────────────────┘
```

---

## Key Design Patterns

1. **Fixture-Based Setup**: All dependencies injected via pytest fixtures
2. **Transaction Rollback**: Database state isolated per test
3. **Class-Based Organization**: Related tests grouped in classes
4. **Base Class Pattern**: Common utilities in `BaseTestCase`
5. **Dependency Injection**: Services accept repository in constructor (enables mocking)
6. **Separation of Concerns**: Unit tests for logic, integration tests for full flow

---

## Best Practices

### ✅ Do's

- **Test isolation** - Each test has clean database state
- **Reusable fixtures** - DRY configuration
- **Helper methods** - Simplified test writing
- **Mock dependencies** - Fast unit tests
- **Full stack testing** - Integration tests verify everything works together
- **Clear naming** - Test names describe what they verify
- **Use BaseTestCase helpers** - Leverage `create_author()`, `create_paper()` for setup
- **Test edge cases** - Invalid inputs, missing fields, boundary conditions

### ❌ Don'ts

- Don't pollute the database - Always use the `session` fixture with rollback
- Don't test implementation details in unit tests - Focus on behavior
- Don't duplicate test logic - Use fixtures and helper methods
- Don't skip assertions - Always verify expected outcomes
- Don't ignore test failures - Fix them immediately

---

## Writing New Tests

### Adding a New Integration Test

1. **Create/update test file** in `tests/integration/`
2. **Inherit from BaseTestCase**:
   ```python
   from tests.base import BaseTestCase
   
   class TestMyFeature(BaseTestCase):
       def test_my_scenario(self):
           # Use self.client for HTTP calls
           # Use self.create_author() etc. for setup
           pass
   ```
3. **Use helper methods** from BaseTestCase for common operations
4. **Add new helpers** to BaseTestCase if needed

### Adding a New Unit Test

1. **Create/update test file** in `tests/unit/`
2. **Create mock fixtures** for dependencies:
   ```python
   @pytest.fixture
   def mock_dependency():
       return Mock()
   ```
3. **Test service in isolation**:
   ```python
   def test_feature(mock_dependency):
       service = MyService(dependency=mock_dependency)
       result = service.do_something()
       assert result == expected
       mock_dependency.method.assert_called_once()
   ```

### Adding Helper Methods to BaseTestCase

When you find yourself repeating code across multiple tests:

```python
def create_paper_with_author(self, author_name="Test Author"):
    """Helper to create both author and paper."""
    author_response = self.create_author(name=author_name)
    author_id = author_response.get_json()["id"]
    
    paper_response = self.create_paper(author_id=author_id)
    return author_response, paper_response
```

---

## Running Tests

### Run all tests
```bash
make test-backend
# or
pytest backend/tests/
```

### Run specific test file
```bash
pytest backend/tests/integration/test_authors_api.py
```

### Run specific test class
```bash
pytest backend/tests/integration/test_authors_api.py::TestAuthors
```

### Run specific test method
```bash
pytest backend/tests/integration/test_authors_api.py::TestAuthors::test_create_and_get_author
```

### Run with verbose output
```bash
pytest -v backend/tests/
```

### Run with coverage
```bash
pytest --cov=app backend/tests/
```

---

## Troubleshooting

### Test database isn't clean

**Symptom**: Tests fail due to existing data  
**Solution**: Check that `session` fixture is being used and transaction rollback is working

### Fixtures not available

**Symptom**: `AttributeError: 'TestClass' object has no attribute 'client'`  
**Solution**: Ensure test class inherits from `BaseTestCase` or uses `@pytest.mark.usefixtures("client_class")`

### Tests affecting each other

**Symptom**: Tests pass individually but fail when run together  
**Solution**: Ensure each test is truly isolated - check for shared state or missing rollbacks

### Mock not being called

**Symptom**: `AssertionError: Expected 'mock' to have been called once.`  
**Solution**: Verify the service is using the mocked dependency and not creating its own
