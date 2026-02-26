import asyncio
import time
import httpx
import statistics

async def benchmark_orchestration(n=10):
    print(f"--- LUMINA LATENCY BENCHMARKING (n={n}) ---")
    url = "http://localhost:8000/api/v1/orchestrate/"
    
    payload = {
        "user_input": "How do I fix my dryer heater?",
        "domain_name": "householdmanuals.com",
        "stream": False
    }
    
    latencies = []
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        # Warmup
        await client.post(url, json=payload)
        
        for i in range(n):
            start = time.perf_counter()
            resp = await client.post(url, json=payload)
            end = time.perf_counter()
            
            if resp.status_code == 200:
                data = resp.json()
                total_time = (end - start) * 1000
                engine_reported = data.get("latency_ms", 0)
                latencies.append(engine_reported)
                print(f"Request {i+1}: {engine_reported:.2f}ms (HTTP Total: {total_time:.2f}ms)")
            else:
                print(f"Request {i+1} FAILED: {resp.status_code}")
                
    if latencies:
        avg = statistics.mean(latencies)
        p95 = statistics.quantiles(latencies, n_segments=20)[18] if len(latencies) >= 20 else max(latencies)
        print("\n--- RESULTS ---")
        print(f"Avg Latency: {avg:.2f}ms")
        print(f"Min Latency: {min(latencies):.2f}ms")
        print(f"Max Latency: {max(latencies):.2f}ms")
        if len(latencies) >= 20:
             print(f"P95 Latency: {p95:.2f}ms")
        print("----------------")

if __name__ == "__main__":
    # Note: Requires the server to be running!
    asyncio.run(benchmark_orchestration(5))
