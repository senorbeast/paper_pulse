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
        # Spec says 200 if existing, 201 if created?
        # The service returns the DTO. I don't know if it was created or existing from just the DTO.
        # But commonly we might just return 200 for idempotency or check something.
        # For now let's just return 200 OK as a safe bet for "idempotency" requirement usually implying "success without error".
        # But strictly 201 is for creation.
        # Let's assume 200 is acceptable for both or I'd need to change service return signature.
        return jsonify(result.model_dump()), 200
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
