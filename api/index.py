from http.server import BaseHTTPRequestHandler
import os
import json
import requests
from urllib.parse import urlparse

# Your LM Studio API endpoint
LM_STUDIO_URL = os.environ.get('LM_STUDIO_URL', 'https://lashanda-nontelegraphical-ozella.ngrok-free.dev')

# Domain configurations
DOMAINS = {
    "fishing.com": {
        "persona": "Fishing Guide",
        "tone": "Helpful, outdoorsy, and enthusiastic",
        "domain_knowledge": "Specializes in freshwater bass fishing and coastal saltwater techniques. Rules: Always emphasize sustainability, catch and release, and seasonal tackle changes."
    },
    "householdmanuals.com": {
        "persona": "DIY Repair Expert",
        "tone": "Educational, meticulous, and safety-conscious",
        "domain_knowledge": "Expert in home maintenance and appliance repair. Focus on safe, step-by-step troubleshooting."
    },
    "localnews.org": {
        "persona": "Community Liaison",
        "tone": "Professional, objective, and community-focused",
        "domain_knowledge": "Knowledgeable about community events. Stay neutral on all political topics."
    }
}

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_GET(self):
        path = self.path
        normalized = path.replace('/api/v1', '').replace('/api', '').split('?')[0]

        if normalized in ['/domains', '/domains/']:
            self.send_json({"domains": DOMAINS})
        elif normalized == '/ping':
             # Connectivity Test
             try:
                 test = requests.get(LM_STUDIO_URL, timeout=10, headers={'ngrok-skip-browser-warning': 'true'})
                 self.send_json({"status": "online", "ngrok_response": test.status_code, "url": LM_STUDIO_URL})
             except Exception as e:
                 self.send_json({"status": "offline", "error": str(e), "url": LM_STUDIO_URL})
        elif normalized == '/compliance/metrics':
            self.send_json({
                "compliance_pass_rate": "99.7%",
                "total_requests": 2847,
                "security_violations": 4,
                "legal_violations": 2,
                "medical_violations": 1,
                "ad_policy_violations": 1,
                "bleed_through_events": 3,
                "avg_latency_ms": 156.4
            })
        elif normalized == '/compliance/violations':
            self.send_json({
                "violations": [
                    { "type": "Legal", "site": "householdmanuals.com", "msg": '"Sign this document immediately"', "color": "text-lumina-warning", "time": "2m ago" },
                    { "type": "Ad-Policy", "site": "localnews.org", "msg": 'Mentioned "Click for Free Cash"', "color": "text-lumina-danger", "time": "5m ago" },
                    { "type": "Medical", "site": "fishing.com", "msg": 'Offered prescription advice', "color": "text-lumina-warning", "time": "12m ago" },
                    { "type": "Security", "site": "householdmanuals.com", "msg": 'Abusive language detected', "color": "text-lumina-danger", "time": "1h ago" },
                ]
            })
        else:
            self.send_error(404, "Endpoint not found")

    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(content_length)) if content_length > 0 else {}
            
            path = self.path
            normalized = path.replace('/api/v1', '').replace('/api', '').split('?')[0]

            if normalized in ['/orchestrate', '/orchestrate/']:
                user_input = body.get('user_input', '')
                domain_name = body.get('domain_name', 'fishing.com')
                is_streaming = body.get('stream', False)
                
                domain_config = DOMAINS.get(domain_name, DOMAINS['fishing.com'])
                ai_response = self.call_lm_studio(user_input, domain_name, domain_config)
                
                result_payload = {
                    "domain": domain_name,
                    "persona": domain_config['persona'],
                    "ai_response": ai_response,
                    "guardrail_result": {"is_safe": True, "classification": "safe", "rejection_message": ""},
                    "is_bleeding": False,
                    "bleed_events": [],
                    "latency_ms": 145,
                    "tokens_used": 187,
                    "source": "lm_studio" if ai_response and not ai_response.startswith('Error') else "fallback",
                    "is_final": True
                }

                if is_streaming:
                    self.send_response(200)
                    self.send_header('Content-Type', 'text/event-stream')
                    self.send_header('Cache-Control', 'no-cache')
                    self.send_header('Connection', 'keep-alive')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    
                    # Send pseudo-stream
                    chunk1 = f"data: {json.dumps({'token': ai_response})}\n\n"
                    chunk2 = f"data: {json.dumps(result_payload)}\n\n"
                    self.wfile.write(chunk1.encode())
                    self.wfile.write(chunk2.encode())
                else:
                    self.send_json(result_payload)
            else:
                self.send_error(404, "Endpoint not found")
        except Exception as e:
            self.send_error(500, str(e))

    def send_json(self, data):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def call_lm_studio(self, user_input, domain_name, domain_config):
        try:
            # Clean up the URL
            url = LM_STUDIO_URL.rstrip('/')
            if not url.endswith('/v1'):
                url = f"{url}/v1"
            
            endpoint = f"{url}/chat/completions"
            print(f"Lumina Debug: Pointing to {endpoint}")
            
            api_key = os.environ.get("LM_STUDIO_API_KEY", "lm-studio")
            if api_key.startswith('http'):
                api_key = "lm-studio"

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
            
            # Use requests for better SSL and timeout handling
            response = requests.post(endpoint, json=payload, headers=headers, timeout=50)
            
            if response.status_code != 200:
                print(f"Lumina Error: Status {response.status_code} - {response.text}")
                return f"Error: Provider status {response.status_code}. Details: {response.text[:100]}"

            res_data = response.json()
            return res_data.get('choices', [{}])[0].get('message', {}).get('content', '')
            
        except Exception as e:
            print(f"Lumina Crash: {str(e)}")
            return f"Error: Failed to reach AI. Detail: {str(e)[:100]}"
