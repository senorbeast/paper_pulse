import os
from flask import Flask, jsonify
from app.common.logger import setup_logging
from app.common.logging_middleware import configure_request_logging
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=Base)


def create_app(config_object="config.DevConfig"):
    app = Flask(__name__)
    app.config.from_object(config_object)
    
    # Setup logging and middleware
    setup_logging(app)
    configure_request_logging(app)

    # Configure CORS with explicit settings
    CORS(
        app,
        resources={r"/api/*": {
            "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "expose_headers": ["Content-Type"],
            "supports_credentials": True
        }}
    )

    db.init_app(app)

    with app.app_context():
        # Import and Register Blueprints
        from app.modules.papers.routes import papers_bp
        from app.modules.authors.routes import authors_bp

        app.register_blueprint(papers_bp, url_prefix="/api/papers")
        app.register_blueprint(authors_bp, url_prefix="/api/authors")

        # Register global error handler
        from app.common.error_handler import register_error_handlers

        register_error_handlers(app)

        # Create Tables (for dev/simplicity, usually migration tool handles this)
        db.create_all()

    return app
