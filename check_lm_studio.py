import os
import http.client
import json
from urllib.parse import urlparse

def test_lm_studio_connection():
    # Use the same configuration as the backend
    url = os.environ.get('LM_STUDIO_URL', 'https://lashanda-nontelegraphical-ozella.ngrok-free.dev')
    print(f"Checking connectivity to: {url}")
    
    parsed_url = urlparse(url)
    
    try:
        # Check if we should use HTTP or HTTPS
        if parsed_url.scheme == 'https':
            conn = http.client.HTTPSConnection(parsed_url.netloc, timeout=10)
        else:
            conn = http.client.HTTPConnection(parsed_url.netloc, timeout=10)
            
        payload = {
            "model": "meta-llama-3",
            "messages": [
                {"role": "system", "content": "You are a test assistant."},
                {"role": "user", "content": "Say 'Connection Successful'"}
            ],
            "max_tokens": 10
        }
        
        headers = {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true' # Essential for ngrok tunnels
        }
        
        print("Sending request...")
        conn.request("POST", "/v1/chat/completions", json.dumps(payload).encode(), headers)
        
        response = conn.getresponse()
        status = response.status
        reason = response.reason
        body = response.read().decode()
        
        print(f"Status: {status} {reason}")
        
        if status == 200:
            result = json.loads(body)
            content = result.get('choices', [{}])[0].get('message', {}).get('content', '')
            print(f"✅ AI Response: {content}")
            return True
        else:
            print(f"❌ Error Output: {body}")
            return False
            
    except Exception as e:
        print(f"💥 Connection failed: {str(e)}")
        return False

if __name__ == "__main__":
    test_lm_studio_connection()
