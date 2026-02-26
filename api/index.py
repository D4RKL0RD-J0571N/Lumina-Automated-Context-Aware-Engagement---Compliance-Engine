# Vercel Serverless Function for Backend API
# This file provides API endpoints using your LM Studio backend

import os
import http.client
import json
from urllib.parse import urlparse, parse_qs

# Your LM Studio API endpoint
LM_STUDIO_URL = os.environ.get('LM_STUDIO_URL', 'https://lashanda-nontelegraphical-ozella.ngrok-free.dev')

# Domain configurations for demo
DOMAINS = {
    "healthcare.com": {
        "persona": "Medical Assistant",
        "tone": "Professional, empathetic",
        "domain_knowledge": "Medical and healthcare related queries with patient safety focus"
    },
    "finance.com": {
        "persona": "Financial Advisor", 
        "tone": "Formal, trustworthy",
        "domain_knowledge": "Banking and financial services with regulatory compliance"
    },
    "legal.com": {
        "persona": "Legal Assistant",
        "tone": "Precise, formal", 
        "domain_knowledge": "Legal document analysis and case law research"
    },
    "fishing.com": {
        "persona": "Fishing Guide",
        "tone": "Helpful, outdoorsy, and enthusiastic",
        "domain_knowledge": "Freshwater bass fishing and coastal saltwater techniques with sustainability focus"
    },
    "householdmanuals.com": {
        "persona": "DIY Repair Expert",
        "tone": "Educational, meticulous, and safety-conscious",
        "domain_knowledge": "Home maintenance and appliance repair with safety guidelines"
    },
    "localnews.org": {
        "persona": "Community Liaison",
        "tone": "Professional, objective, and community-focused",
        "domain_knowledge": "Community events and local interest stories with neutral reporting"
    }
}

def handler(request):
    try:
        # Parse the request
        method = request.method
        path = request.path
        headers = dict(request.headers)
        
        # Handle different API endpoints
        if path == '/api/v1/domains/':
            if method == 'GET':
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({"domains": DOMAINS})
                }
        
        elif path.startswith('/api/v1/orchestrate/'):
            if method == 'POST':
                try:
                    body = request.get_json()
                    user_input = body.get('user_input', '')
                    domain_name = body.get('domain_name', 'healthcare.com')
                    
                    # Get domain config
                    domain_config = DOMAINS.get(domain_name, DOMAINS['healthcare.com'])
                    
                    # Create prompt with domain context
                    prompt = f"""You are {domain_config['persona']} for {domain_name}. 
                    {domain_config['domain_knowledge']}
                    Use a {domain_config['tone']} tone.
                    
                    User: {user_input}
                    
                    Respond as the {domain_config['persona']}:"""
                    
                    # Call LM Studio API
                    parsed_url = urlparse(LM_STUDIO_URL)
                    conn = http.client.HTTPSConnection(parsed_url.netloc)
                    
                    payload = {
                        "model": "your-model-name",  # Update with your actual model
                        "messages": [
                            {"role": "user", "content": prompt}
                        ],
                        "stream": False
                    }
                    
                    conn.request("POST", parsed_url.path, json.dumps(payload).encode(), {
                        'Content-Type': 'application/json',
                        'Authorization': f'Bearer {os.environ.get("LM_STUDIO_API_KEY", "")}'
                    })
                    
                    response = conn.getresponse()
                    response_body = response.read().decode()
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json'},
                        'body': response_body
                    }
                    
                except Exception as e:
                    return {
                        'statusCode': 500,
                        'headers': {'Content-Type': 'application/json'},
                        'body': json.dumps({'error': str(e)})
                    }
        
        # Default response for other endpoints
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Endpoint not found'})
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)})
        }
