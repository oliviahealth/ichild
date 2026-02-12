import concurrent.futures
from flask import Blueprint, render_template, request, Response
import requests
import os
import json

OLLIE_API_URL = os.getenv('OLLIE_API_URL')

search_routes_bp = Blueprint('search_routes', __name__)

# Old ichild homepage


@search_routes_bp.route("/", methods=['POST', 'GET'])
def msg():
    return render_template('index.html')

# API route for ICHILD frontend
# Takes in a search_query and conversation_id to generate a response
# Get the ollie response and the documents.json in parallel
# Resolve the documents array in the ollie response
@search_routes_bp.route("/formattedresults", methods=['POST', 'GET'])
def formatted_db_search():
    upstream_url = f"{OLLIE_API_URL}/formattedresults"

    def fetch_url(data):
        url = data.get('url')
        request_type = data.get('request_type')
        params = data.get('params')
        form = data.get('form')

        try:
            if request_type == 'GET':
                return requests.get(url, params=params, timeout=30)
            else:
                return requests.post(url, data=form, params=params, timeout=30)
        except requests.exceptions.RequestException as e:
            return e

    data = [
        {
            "url": upstream_url,
            "request_type": request.method,
            "params": request.args,
            "form": request.form
        },
        {
            "url": "https://oliviahealth.org/wp-content/uploads/resources.json",
            "request_type": "GET",
        }
    ]

    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        results = list(executor.map(fetch_url, data))

    upstream_resp = results[0]
    resources_resp = results[1]

    # Safety check
    if not isinstance(upstream_resp, requests.Response):
        return {"error": str(upstream_resp)}, 502

    if not isinstance(resources_resp, requests.Response):
        return {"error": str(resources_resp)}, 502

    upstream_json = json.loads(upstream_resp.content)
    resources_json = json.loads(resources_resp.content)

    resource_index = {}

    for section_name, section_value in resources_json.items():
        # Only process sections that are lists
        if not isinstance(section_value, list):
            continue

        for item in section_value:
            if isinstance(item, dict) and "id" in item:
                resource_index[item["id"]] = {
                    **item,
                    "resource_type": section_name
                }

    resolved_documents = []
    for doc_id in upstream_json.get("documents", []):
        if doc_id in resource_index:
            resolved_documents.append(resource_index[doc_id])

    upstream_json["resolved_documents"] = resolved_documents

    return Response(
        json.dumps(upstream_json),
        status=upstream_resp.status_code,
        content_type="application/json"
    )
