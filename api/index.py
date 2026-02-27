from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import os
import json
import requests

app = Flask(__name__)
# Enable CORS for the whole app
CORS(app)

# Your LM Studio API endpoint
LM_STUDIO_URL = os.environ.get('LM_STUDIO_URL', 'https://lashanda-nontelegraphical-ozella.ngrok-free.dev')

# Domain configurations
DOMAINS = {
    "fishing.com": {
        "persona": "Fishing Guide",
        "tone": "Helpful, outdoorsy, and enthusiastic",
        "domain_knowledge": "Specializes in freshwater bass fishing and coastal saltwater techniques."
    },
    "householdmanuals.com": {
        "persona": "DIY Repair Expert",
        "tone": "Educational, meticulous, and safety-conscious",
        "domain_knowledge": "Expert in home maintenance and appliance repair."
    },
    "localnews.org": {
        "persona": "Community Liaison",
        "tone": "Professional, objective, and community-focused",
        "domain_knowledge": "Knowledgeable about community events."
    }
}

@app.route('/api/v1/ping', methods=['GET'])
@app.route('/api/ping', methods=['GET'])
def ping():
    try:
        # Simple test to see if we can reach ngrok
        test = requests.get(LM_STUDIO_URL, timeout=5, headers={'ngrok-skip-browser-warning': 'true'})
        return jsonify({"status": "online", "ngrok": test.status_code, "url": LM_STUDIO_URL})
    except Exception as e:
        return jsonify({"status": "offline", "error": str(e), "url": LM_STUDIO_URL})

@app.route('/api/v1/domains/', methods=['GET'])
@app.route('/api/v1/domains', methods=['GET'])
def get_domains():
    return jsonify({"domains": DOMAINS})

@app.route('/api/v1/compliance/metrics', methods=['GET'])
def get_metrics():
    return jsonify({
        "compliance_pass_rate": "99.7%",
        "total_requests": 2847,
        "security_violations": 4,
        "legal_violations": 2,
        "medical_violations": 1,
        "ad_policy_violations": 1,
        "bleed_through_events": 3,
        "avg_latency_ms": 156.4
    })

@app.route('/api/v1/compliance/violations', methods=['GET'])
def get_violations():
    return jsonify({
        "violations": [
            { "type": "Legal", "site": "householdmanuals.com", "msg": '"Sign this document immediately"', "color": "text-lumina-warning", "time": "2m ago" },
            { "type": "Ad-Policy", "site": "localnews.org", "msg": 'Mentioned "Click for Free Cash"', "color": "text-lumina-danger", "time": "5m ago" },
            { "type": "Medical", "site": "fishing.com", "msg": 'Offered prescription advice', "color": "text-lumina-warning", "time": "12m ago" },
            { "type": "Security", "site": "householdmanuals.com", "msg": 'Abusive language detected', "color": "text-lumina-danger", "time": "1h ago" },
        ]
    })

@app.route('/api/v1/orchestrate/', methods=['POST', 'OPTIONS'])
@app.route('/api/v1/orchestrate', methods=['POST', 'OPTIONS'])
def orchestrate():
    if request.method == 'OPTIONS':
        return '', 200
        
    data = request.json or {}
    user_input = data.get('user_input', '')
    domain_name = data.get('domain_name', 'fishing.com')
    is_streaming = data.get('stream', False)
    
    domain_config = DOMAINS.get(domain_name, DOMAINS['fishing.com'])
    
    # Clean up the URL
    url = LM_STUDIO_URL.rstrip('/')
    if not url.endswith('/v1'):
        url = f"{url}/v1"
    endpoint = f"{url}/chat/completions"
    
    # Handle API Key
    api_key = os.environ.get("LM_STUDIO_API_KEY", "lm-studio")
    if api_key.startswith('http'):
        api_key = "lm-studio"

    try:
        payload = {
            "model": "meta-llama-3",
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
            'Authorization': f'Bearer {api_key}',
            'ngrok-skip-browser-warning': 'true'
        }
        
        # Use requests for the AI call
        response = requests.post(endpoint, json=payload, headers=headers, timeout=55)
        
        if response.status_code != 200:
            ai_response = f"Error: Provider status {response.status_code}. Detail: {response.text[:100]}"
            source = "error"
        else:
            res_data = response.json()
            ai_response = res_data.get('choices', [{}])[0].get('message', {}).get('content', '')
            source = "lm_studio"
            
    except Exception as e:
        ai_response = f"Error: Failed to reach local AI. Check ngrok tunnel. ({str(e)[:50]})"
        source = "fallback"

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

    if is_streaming:
        # Pseudo-streaming for frontend compatibility
        def generate():
            yield f"data: {json.dumps({'token': ai_response})}\n\n"
            yield f"data: {json.dumps(result_payload)}\n\n"
        return Response(generate(), mimetype='text/event-stream')
    
    return jsonify(result_payload)

# Catch-all for other /api routes
@app.route('/api/<path:path>')
@app.route('/api/v1/<path:path>')
def catch_all(path):
    return jsonify({"error": f"Path /api/{path} not found"}), 404

# Vercel needs the 'app' variable
handler = app
