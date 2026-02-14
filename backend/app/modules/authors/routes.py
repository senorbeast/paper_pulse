from flask import Blueprint, request, jsonify
from app.modules.authors.service import AuthorService
from app.modules.authors.schemas import AuthorCreateDTO
from pydantic import ValidationError

authors_bp = Blueprint("authors", __name__)
service = AuthorService()


@authors_bp.route("/", methods=["POST"])
def create_author():
    try:
        data = request.get_json()
        dto = AuthorCreateDTO(**data)
        result = service.create_author(dto)
        return jsonify(result.model_dump()), 201
    except ValidationError as e:
        return jsonify(e.errors()), 400


@authors_bp.route("/<int:id>", methods=["GET"])
def get_author(id):
    result = service.get_author(id)
    return jsonify(result.model_dump()), 200


@authors_bp.route("/", methods=["GET"])
def get_authors():
    results = service.get_all_authors()
    return jsonify([r.model_dump() for r in results]), 200
