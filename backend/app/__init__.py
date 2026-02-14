import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=Base)


def create_app(config_object="config.DevConfig"):
    app = Flask(__name__)
    app.config.from_object(config_object)

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    db.init_app(app)

    with app.app_context():
        # Import and Register Blueprints
        from app.modules.papers.routes import papers_bp

        app.register_blueprint(papers_bp, url_prefix="/api/papers")

        # Register global error handler
        from app.common.error_handler import register_error_handlers

        register_error_handlers(app)

        # Create Tables (for dev/simplicity, usually migration tool handles this)
        db.create_all()

    return app
