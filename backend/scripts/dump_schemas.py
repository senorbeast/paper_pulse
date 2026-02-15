import json
import os
import sys
import pkgutil
import importlib
import inspect
from pydantic import BaseModel, create_model

# Add backend to path to import app modules
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

import app.modules

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '../../frontend/specs')

def get_dtos():
    schemas = {}
    
    # Iterate over all modules in app/modules
    if hasattr(app.modules, '__path__'):
        for _, module_name, is_pkg in pkgutil.iter_modules(app.modules.__path__):
            # We expect a 'schemas' submodule in each module
            # e.g. app.modules.authors.schemas
            try:
                schemas_module = importlib.import_module(f'app.modules.{module_name}.schemas')
                
                # Find all classes ending in DTO that are subclasses of BaseModel
                for name, obj in inspect.getmembers(schemas_module):
                    if inspect.isclass(obj) and issubclass(obj, BaseModel) and name.endswith('DTO'):
                        # Check if it's defined in this module to avoid importing re-exports
                        # or if it's a base class we want to include (dependent on use case)
                        if obj.__module__ == schemas_module.__name__:
                            schemas[name] = obj
            except ImportError:
                # Module might not have schemas.py
                pass
                
    return schemas

def generate_openapi():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    dtos = get_dtos()
    print(f"Found DTOs: {list(dtos.keys())}")
    
    # Create a dynamic model to hold all definitions
    # This ensures Pydantic processes all of them and handles refs if needed
    fields = {name: (dto, None) for name, dto in dtos.items()}
    DummyModel = create_model('API', **fields)
    
    # Generate JSON schema
    json_schema = DummyModel.model_json_schema()
    
    # Extract definitions ($defs)
    definitions = json_schema.get('$defs', {})
    
    # Construct OpenAPI spec
    openapi = {
        "openapi": "3.0.0",
        "info": {
            "title": "PaperPulse API",
            "version": "1.0.0"
        },
        "paths": {}, 
        "components": {
            "schemas": definitions
        }
    }
    
    output_path = os.path.join(OUTPUT_DIR, "openapi.json")
    with open(output_path, "w") as f:
        json.dump(openapi, f, indent=2)
    print(f"Generated OpenAPI spec at {output_path}")

if __name__ == "__main__":
    generate_openapi()
