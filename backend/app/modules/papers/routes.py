from flask import Blueprint, request, jsonify
from app.modules.papers.service import PaperService
from app.modules.papers.schemas import PaperCreateDTO
from pydantic import ValidationError

papers_bp = Blueprint("papers", __name__)
service = PaperService()


@papers_bp.route("/", methods=["POST"])
def create_paper():
    try:
        data = request.get_json()
        dto = PaperCreateDTO(**data)
        result = service.create_paper(dto)
        return jsonify(result.model_dump()), 201
    except ValidationError as e:
        return jsonify(e.errors()), 400


@papers_bp.route("/<int:id>", methods=["GET"])
def get_paper(id):
    result = service.get_paper(id)
    return jsonify(result.model_dump()), 200


@papers_bp.route("/", methods=["GET"])
def get_papers():
    results = service.get_all_papers()
    return jsonify([r.model_dump() for r in results]), 200
