import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const url = new URL(req.url)
  const path = url.pathname

  // Simple test endpoint
  if (path === '/' || path === '/test') {
    return new Response(
      JSON.stringify({ 
        message: "Lumina API is working!",
        timestamp: new Date().toISOString(),
        path: path 
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }
    )
  }

  return new Response(
    JSON.stringify({ error: `Path ${path} not found` }),
    { 
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    }
  )
})
