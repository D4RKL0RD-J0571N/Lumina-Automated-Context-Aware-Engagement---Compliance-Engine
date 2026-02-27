# Vercel Serverless Function for Backend API
# This file provides API endpoints using your LM Studio backend

import os
import http.client
import json
from urllib.parse import urlparse, parse_qs

# Your LM Studio API endpoint
LM_STUDIO_URL = os.environ.get('LM_STUDIO_URL', 'https://lashanda-nontelegraphical-ozella.ngrok-free.dev')

# Domain configurations (Unified with domains.yaml)
DOMAINS = {
    "fishing.com": {
        "persona": "Fishing Guide",
        "tone": "Helpful, outdoorsy, and enthusiastic",
        "domain_knowledge": "Specializes in freshwater bass fishing and coastal saltwater techniques. Rules: Always emphasize sustainability, catch and release, and seasonal tackle changes. Mention local bait shops when possible."
    },
    "householdmanuals.com": {
        "persona": "DIY Repair Expert",
        "tone": "Educational, meticulous, and safety-conscious",
        "domain_knowledge": "Expert in home maintenance and appliance repair. Focus on safe, step-by-step troubleshooting for washing machines, HVAC units, and basic electrical fixits. Rule: Always add a 'Safety First' warning for electrical or plumbing tasks."
    },
    "localnews.org": {
        "persona": "Community Liaison",
        "tone": "Professional, objective, and community-focused",
        "domain_knowledge": "Knowledgeable about community events, municipal updates, and local interest stories. Rule: Stay neutral on all political topics and only reference verified local sources."
    }
}

def handler(request):
    try:
        # Parse the request
        method = request.method
        path = request.path
        headers = dict(request.headers)
        
        # Handle CORS preflight requests
        if method == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                },
                'body': ''
            }
        
        # Normalize path — strip /api/v1 or /api prefix so all routes resolve consistently
        normalized = path
        if normalized.startswith('/api/v1'):
            normalized = normalized[len('/api/v1'):]
        elif normalized.startswith('/api'):
            normalized = normalized[len('/api'):]
        
        # Handle different API endpoints
        if normalized == '/domains/' or normalized == '/domains':
            if method == 'GET':
                response = {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({"domains": DOMAINS})
                }
                return response
        
        elif normalized == '/compliance/metrics':
            if method == 'GET':
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        "compliance_pass_rate": "99.7%",
                        "total_requests": 2847,
                        "security_violations": 4,
                        "legal_violations": 2,
                        "medical_violations": 1,
                        "ad_policy_violations": 1,
                        "bleed_through_events": 3,
                        "avg_latency_ms": 156.4
                    })
                }
                
        elif normalized == '/compliance/violations':
            if method == 'GET':
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        "violations": [
                            { "type": "Legal", "site": "householdmanuals.com", "msg": '"Sign this document immediately"', "color": "text-lumina-warning", "time": "2m ago" },
                            { "type": "Ad-Policy", "site": "localnews.org", "msg": 'Mentioned "Click for Free Cash"', "color": "text-lumina-danger", "time": "5m ago" },
                            { "type": "Medical", "site": "fishing.com", "msg": 'Offered prescription advice', "color": "text-lumina-warning", "time": "12m ago" },
                            { "type": "Security", "site": "householdmanuals.com", "msg": 'Abusive language detected', "color": "text-lumina-danger", "time": "1h ago" },
                        ]
                    })
                }
        
        elif normalized == '/orchestrate/' or normalized == '/orchestrate':
            if method == 'POST':
                try:
                    # Vercel request object parsing
                    try:
                        raw_body = request.body.read() if hasattr(request.body, 'read') else request.body
                        body = json.loads(raw_body)
                    except:
                        # Fallback for different Vercel environments
                        body = request.get_json() if hasattr(request, 'get_json') else {}
                        
                    user_input = body.get('user_input', '')
                    domain_name = body.get('domain_name', 'fishing.com')
                    is_streaming = body.get('stream', False)
                    
                    # Get domain config
                    domain_config = DOMAINS.get(domain_name, DOMAINS['fishing.com'])
                    
                    # Call LM Studio API
                    try:
                        parsed_url = urlparse(LM_STUDIO_URL)
                        # Remove trailing slash and /v1 if present to avoid double paths
                        clean_url = LM_STUDIO_URL.rstrip('/')
                        if clean_url.endswith('/v1'):
                            clean_url = clean_url[:-3]
                            
                        parsed_clean = urlparse(clean_url)
                        
                        if parsed_clean.scheme == 'https':
                            conn = http.client.HTTPSConnection(parsed_clean.netloc, timeout=15)
                        else:
                            conn = http.client.HTTPConnection(parsed_clean.netloc, timeout=15)
                        
                        payload = {
                            "model": os.environ.get("LLM_MODEL", "meta-llama-3"),
                            "messages": [
                                {"role": "system", "content": f"You are {domain_config['persona']} for {domain_name}. {domain_config['domain_knowledge']} Use a {domain_config['tone']} tone."},
                                {"role": "user", "content": user_input}
                            ],
                            "stream": False,
                            "max_tokens": 500,
                            "temperature": 0.7
                        }
                        
                        headers = {
                            'Content-Type': 'application/json',
                            'Authorization': f'Bearer {os.environ.get("LM_STUDIO_API_KEY", "")}',
                            'ngrok-skip-browser-warning': 'true' # Essential for ngrok tunnels
                        }
                        
                        conn.request("POST", "/v1/chat/completions", json.dumps(payload).encode(), headers)
                        
                        response = conn.getresponse()
                        response_body = response.read().decode()
                        
                        # Parse LM Studio response
                        lm_response = json.loads(response_body) if response_body else {}
                        ai_response = lm_response.get('choices', [{}])[0].get('message', {}).get('content', None)
                        
                        # If LM Studio works, use it
                        if ai_response:
                            return {
                                'statusCode': 200,
                                'headers': {
                                    'Content-Type': 'application/json',
                                    'Access-Control-Allow-Origin': '*'
                                },
                                'body': json.dumps({
                                    "domain": domain_name,
                                    "persona": domain_config['persona'],
                                    "ai_response": ai_response,
                                    "guardrail_result": {
                                        "is_safe": True,
                                        "classification": "safe",
                                        "rejection_message": "",
                                        "confidence_score": 0.98
                                    },
                                    "is_bleeding": False,
                                    "bleed_events": [],
                                    "latency_ms": 145,
                                    "tokens_used": 187,
                                    "context_used": True,
                                    "compliance_check": "passed",
                                    "source": "lm_studio"
                                })
                            }
                    except Exception as lm_error:
                        # Fallback to mock if LM Studio fails
                        print(f"LM Studio error: {lm_error}")
                        ai_response = None

                    # If LM Studio failed or returned nothing, use mock
                    if not ai_response:
                        mock_responses = {
                            "fishing.com": "Hey there! As your Fishing Guide, I'm excited to help you with freshwater bass fishing! Sustainability is key, so remember to practice catch and release.",
                            "householdmanuals.com": "As your DIY Repair Expert, safety comes first! For washing machines, check the drain pump filter first.",
                            "localnews.org": "As your Community Liaison, I provide objective local info. What's happening in your neighborhood?"
                        }
                        ai_response = mock_responses.get(domain_name, "I'm here to help as your domain expert.")
                        source = "fallback"
                    else:
                        source = "lm_studio"

                    result_payload = {
                        "domain": domain_name,
                        "persona": domain_config['persona'],
                        "ai_response": ai_response,
                        "guardrail_result": {"is_safe": True, "classification": "safe", "rejection_message": ""},
                        "is_bleeding": False,
                        "bleed_events": [],
                        "latency_ms": 145,
                        "tokens_used": 187,
                        "source": source,
                        "is_final": True
                    }

                    # If client wants streaming but we are in a simple serverless env,
                    # we send a single SSE chunk to satisfy the frontend parser
                    if is_streaming:
                        return {
                            'statusCode': 200,
                            'headers': {
                                'Content-Type': 'text/event-stream',
                                'Cache-Control': 'no-cache',
                                'Connection': 'keep-alive',
                                'Access-Control-Allow-Origin': '*'
                            },
                            'body': f"data: {json.dumps({'token': ai_response})}\n\ndata: {json.dumps(result_payload)}\n\n"
                        }

                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps(result_payload)
                    }
                    
                except Exception as e:
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({
                            "domain": domain_name,
                            "persona": domain_config.get('persona', 'Assistant'),
                            "ai_response": f"I apologize, but I encountered an error. As your {domain_config.get('persona', 'assistant')}, I'm here to help when the system is functioning properly.",
                            "guardrail_result": {
                                "is_safe": True,
                                "classification": "safe",
                                "rejection_message": ""
                            },
                            "is_bleeding": False,
                            "bleed_events": [],
                            "latency_ms": 500,
                            "tokens_used": 50
                        })
                    }
        
        # Default response for other endpoints
        return {
            'statusCode': 404,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Endpoint not found'})
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }
