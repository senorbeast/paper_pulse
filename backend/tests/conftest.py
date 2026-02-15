import sys
import os

# Add the backend directory to sys.path so that 'app' can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
from app import create_app, db
from config import TestingConfig

@pytest.fixture(scope='session')
def app():
    """Create and configure a new app instance for each test session."""
    app = create_app(TestingConfig)
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

@pytest.fixture(scope='function')
def client(app):
    """A test client for the app."""
    return app.test_client()

@pytest.fixture(scope='function')
def session(app):
    """
    Creates a new database session for a test.
    Rolls back any changes made during the test.
    """
    with app.app_context():
        connection = db.engine.connect()
        transaction = connection.begin()
        
        # Bind the session to the connection
        options = dict(bind=connection, binds={})
        from sqlalchemy.orm import scoped_session, sessionmaker
        session_factory = sessionmaker(bind=connection)
        session = scoped_session(session_factory)
        
        # Monkey patch db.session to use our test session
        old_session = db.session
        db.session = session
        
        yield session
        
        # Cleanup
        transaction.rollback()
        connection.close()
        session.remove()
        db.session = old_session

@pytest.fixture(scope='function')
def client_class(request, client, session):
    """
    Injects client and session into the test class.
    """
    if request.cls:
        request.cls.client = client
        request.cls.session = session
