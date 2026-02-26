# Vercel Serverless Function for Backend
# This file routes API requests to your FastAPI backend

import os
import http.client
import json
from urllib.parse import urlparse, parse_qs

# Your backend URL (could be ngrok, Railway, Render, etc.)
BACKEND_URL = os.environ.get('BACKEND_URL', 'https://lashanda-nontelegraphical-ozella.ngrok-free.dev')

def handler(request):
    try:
        # Parse the request
        method = request.method
        path = request.path
        headers = dict(request.headers)
        
        # Get request body
        if method in ['POST', 'PUT', 'PATCH']:
            try:
                body = request.get_json()
            except:
                body = request.get_data(as_text=True)
        else:
            body = None
        
        # Parse query parameters
        query_string = request.query_string.decode('utf-8')
        query_params = parse_qs(query_string) if query_string else {}
        
        # Construct backend URL
        backend_path = path.replace('/api', '', 1)
        if not backend_path.startswith('/'):
            backend_path = '/' + backend_path
            
        full_url = BACKEND_URL + backend_path
        if query_string:
            full_url += '?' + query_string
        
        # Make request to backend
        parsed_url = urlparse(full_url)
        conn = http.client.HTTPSConnection(parsed_url.netloc)
        
        # Prepare headers
        backend_headers = {}
        for key, value in headers.items():
            if key.lower() not in ['host', 'content-length']:
                backend_headers[key] = value
        
        # Make the request
        conn.request(method, parsed_url.path + ('?' + query_string if query_string else ''), 
                     body, backend_headers)
        
        response = conn.getresponse()
        response_body = response.read()
        
        # Prepare response headers
        response_headers = {}
        for key, value in response.getheaders():
            if key.lower() not in ['content-length', 'transfer-encoding', 'connection']:
                response_headers[key] = value
        
        return {
            'statusCode': response.status,
            'headers': response_headers,
            'body': response_body
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)})
        }
