
import logging
import uuid
import time
from flask import request, g, Response

logger = logging.getLogger(__name__)

def configure_request_logging(app):
    @app.before_request
    def start_timer():
        g.start_time = time.time()
        g.request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        
        # Log request start
        logger.info(f"Request started: {request.method} {request.path}", extra={
            "method": request.method,
            "path": request.path,
            "query_params": request.args.to_dict(),
            "remote_addr": request.remote_addr,
            "user_agent": request.user_agent.string
        })

    @app.after_request
    def log_request(response: Response):
        if hasattr(g, "start_time"):
            duration = time.time() - g.start_time
            response.headers["X-Request-ID"] = g.request_id
            
            # Log request completion
            logger.info(f"Request finished: {response.status_code}", extra={
                "method": request.method,
                "path": request.path,
                "status_code": response.status_code,
                "duration": duration,
                "content_length": response.content_length
            })
            
        return response
