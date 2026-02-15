import logging
from flask import jsonify

logger = logging.getLogger(__name__)

class AppError(Exception):
    def __init__(self, message, status_code=400, payload=None):
        super().__init__()
        self.message = message
        self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = {}
        rv["message"] = self.message
        rv["status_code"] = self.status_code
        if self.payload is not None:
            rv["payload"] = self.payload
        return rv


def register_error_handlers(app):
    @app.errorhandler(AppError)
    def handle_app_error(error):
        logger.warning(f"AppError: {error.message}", extra={"status_code": error.status_code, "payload": error.payload})
        response = jsonify(error.to_dict())
        response.status_code = error.status_code
        return response

    @app.errorhandler(404)
    def handle_not_found(error):
        logger.warning(f"Resource not found: {error}", extra={"status_code": 404})
        return jsonify({"message": "Resource not found", "status_code": 404}), 404

    @app.errorhandler(500)
    def handle_server_error(error):
        logger.exception(f"Internal Server Error: {error}", extra={"status_code": 500})
        return jsonify({"message": "Internal Server Error", "status_code": 500}), 500
