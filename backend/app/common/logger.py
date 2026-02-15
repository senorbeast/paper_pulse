
import json
import logging
import sys
from datetime import datetime, timezone

class JsonFormatter(logging.Formatter):
    """
    Formatter that outputs JSON strings after parsing the LogRecord.
    It supports extra fields passed in the `extra` dictionary.
    """
    def format(self, record):
        log_record = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        # Identify standard LogRecord attributes to ignore
        # These are attributes always present in a LogRecord
        startner_attrs = {
            "args", "asctime", "created", "exc_info", "exc_text", "filename",
            "funcName", "levelname", "levelno", "lineno", "module", "msecs",
            "message", "msg", "name", "pathname", "process", "processName",
            "relativeCreated", "stack_info", "thread", "threadName"
        }

        # Add any extra attributes present in the record
        for key, value in record.__dict__.items():
            if key not in startner_attrs and key not in log_record:
                log_record[key] = value

        # If there's exception info, format it
        if record.exc_info:
            log_record["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_record, default=str)

class ContextFilter(logging.Filter):
    """
    Filter that injects request context information into log records.
    """
    def filter(self, record):
        from flask import has_request_context, g
        
        if has_request_context():
            # Inject request_id if set by middleware
            if hasattr(g, 'request_id'):
                record.request_id = g.request_id
            
        return True

def setup_logging(app):
    """
    Configures the root logger to output JSON logs to stdout.
    """
    # Remove default handlers
    root_logger = logging.getLogger()
    if root_logger.handlers:
        for handler in root_logger.handlers:
            root_logger.removeHandler(handler)
    
    # Create console handler with JSON formatter
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())
    
    # Add context filter to handler (so all logs processed by this handler get context)
    handler.addFilter(ContextFilter())
    
    # Set logging level based on app config or default to INFO
    log_level = app.config.get("LOG_LEVEL", "INFO").upper()
    root_logger.setLevel(getattr(logging, log_level, logging.INFO))
    root_logger.addHandler(handler)
    
    # Determine libraries to be less verbose if needed
    logging.getLogger("werkzeug").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

    # Attach logger to app just in case, though standard logging.getLogger(__name__) is preferred usage
    app.logger.handlers = [] # clear flask default handlers
    app.logger.addHandler(handler)
    app.logger.setLevel(getattr(logging, log_level, logging.INFO))
    
    # Log startup
    logging.getLogger(__name__).info("Logging configured with JSON format")
