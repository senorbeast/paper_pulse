import os


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "default-dev-key")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        "postgresql://paperpulse_user:paperpulse_pass@localhost:5432/paperpulse_db",
    )


class DevConfig(Config):
    DEBUG = True


class ProdConfig(Config):
    DEBUG = False
