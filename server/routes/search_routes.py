from flask import Blueprint, render_template, request, Response
import requests
import os

OLLIE_API_URL = os.getenv('OLLIE_API_URL')

search_routes_bp = Blueprint('search_routes', __name__)

# Old ichild homepage


@search_routes_bp.route("/", methods=['POST', 'GET'])
def msg():
    return render_template('index.html')

# API route for ICHILD frontend
# Takes in a search_query and conversation_id to generate a response


@search_routes_bp.route("/formattedresults", methods=['POST', 'GET'])
def formatted_db_search():
    upstream_url = f"{OLLIE_API_URL}/formattedresults"

    try:
        if request.method == "GET":
            upstream_resp = requests.get(
                upstream_url,
                params=request.args,  # forward query string
                timeout=30,
            )
        else:
            # Forward form data (and also include any query params if present)
            upstream_resp = requests.post(
                upstream_url,
                data=request.form,     # forward form-encoded body
                params=request.args,   # forward query string
                timeout=30,
            )

        # Return upstream response body + status + content-type
        return Response(
            upstream_resp.content,
            status=upstream_resp.status_code,
            content_type=upstream_resp.headers.get(
                "Content-Type", "application/json"),
        )

    except requests.RequestException as e:
        return {
            "error": "Upstream request failed",
            "details": str(e),
        }, 502
