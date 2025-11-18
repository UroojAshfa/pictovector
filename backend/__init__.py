import os
from flask import Flask
from backend.clients import get_qdb_client, get_genai_client

def create_app(test_config = None):
    #Flask application
    app = Flask(__name__, instance_relative_config=True)

    if test_config is None:
        app.config.from_pyfile("config.py", silent=True)

    else:
        app.config.from_mapping(test_config)

    from .routes import bp
    app.register_blueprint(bp)

    return app
