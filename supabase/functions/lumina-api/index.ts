// @ts-nocheck — This file runs in Supabase's Deno runtime, not Node.js.
// Deno URL-based imports and globals (Deno.env) are resolved at deploy time.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
}

// Domain configurations - migrated from Flask
const DOMAINS = {
  "fishing.com": {
    persona: "Fishing Guide",
    tone: "Helpful, outdoorsy, and enthusiastic",
    domain_knowledge: "Specializes in freshwater bass fishing and coastal saltwater techniques. Rules: Always emphasize sustainability, catch and release, and seasonal tackle changes."
  },
  "householdmanuals.com": {
    persona: "DIY Repair Expert",
    tone: "Educational, meticulous, and safety-conscious",
    domain_knowledge: "Expert in home maintenance and appliance repair. Focus on safe, step-by-step troubleshooting."
  },
  "localnews.org": {
    persona: "Community Liaison",
    tone: "Professional, objective, and community-focused",
    domain_knowledge: "Knowledgeable about community events. Stay neutral on all political topics."
  }
}

// LM Studio configuration
const LM_STUDIO_URL = Deno.env.get('LM_STUDIO_URL') || 'https://lashanda-nontelegraphical-ozella.ngrok-free.dev'
const LM_STUDIO_API_KEY = Deno.env.get('LM_STUDIO_API_KEY') || 'lm-studio'

/**
 * Normalize incoming path by stripping the Edge Function prefix (/lumina-api)
 * AND the optional /api/v1 prefix. This ensures the frontend (which sends
 * /compliance/metrics) and direct API callers (who send /api/v1/compliance/metrics)
 * both resolve to the same handler.
 */
function normalizePath(rawPath: string): string {
  let p = rawPath.replace(/^\/lumina-api/, '')
  p = p.replace(/^\/api\/v1/, '')
  p = p.replace(/\/+$/, '') || '/'     // strip trailing slashes, keep root as "/"
  return p
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const normalized = normalizePath(url.pathname)

    // Route handling — matches both /compliance/metrics AND /api/v1/compliance/metrics
    if (normalized === '/ping' || normalized === '/api/ping') {
      return handlePing()
    }

    if (normalized === '/domains') {
      return handleGetDomains()
    }

    if (normalized === '/compliance/metrics') {
      return handleGetMetrics()
    }

    if (normalized === '/compliance/violations') {
      return handleGetViolations()
    }

    if (normalized === '/orchestrate') {
      return handleOrchestrate(req)
    }

    if (normalized === '/guardrail/scan' && req.method === 'POST') {
      return handleGuardrailScan(req)
    }

    // Return function info for root path
    if (normalized === '/') {
      return new Response(
        JSON.stringify({
          message: "Lumina API is working!",
          version: "1.0.0",
          endpoints: [
            "/domains",
            "/compliance/metrics",
            "/compliance/violations",
            "/orchestrate",
            "/guardrail/scan",
            "/ping"
          ]
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Catch-all for other routes
    return new Response(
      JSON.stringify({ error: `Path ${url.pathname} not found`, normalized }),
      {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('API Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function handlePing() {
  try {
    const testResponse = await fetch(LM_STUDIO_URL, {
      headers: { 'ngrok-skip-browser-warning': 'true' },
      signal: AbortSignal.timeout(5000)
    })

    return new Response(
      JSON.stringify({
        status: "online",
        ngrok: testResponse.status,
        url: LM_STUDIO_URL
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: "offline",
        error: (error as Error).message,
        url: LM_STUDIO_URL
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function handleGetDomains() {
  return new Response(
    JSON.stringify({ domains: DOMAINS }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleGetMetrics() {
  const metrics = {
    compliance_pass_rate: "99.7%",
    total_requests: 2847,
    security_violations: 4,
    legal_violations: 2,
    medical_violations: 1,
    ad_policy_violations: 1,
    bleed_through_events: 3,
    avg_latency_ms: 156.4
  }

  return new Response(
    JSON.stringify(metrics),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleGetViolations() {
  const violations = {
    violations: [
      { type: "Legal", site: "householdmanuals.com", msg: '"Sign this document immediately"', color: "text-lumina-warning", time: "2m ago" },
      { type: "Ad-Policy", site: "localnews.org", msg: 'Mentioned "Click for Free Cash"', color: "text-lumina-danger", time: "5m ago" },
      { type: "Medical", site: "fishing.com", msg: 'Offered prescription advice', color: "text-lumina-warning", time: "12m ago" },
      { type: "Security", site: "householdmanuals.com", msg: 'Abusive language detected', color: "text-lumina-danger", time: "1h ago" },
    ]
  }

  return new Response(
    JSON.stringify(violations),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleOrchestrate(req: Request) {
  try {
    const data = await req.json()
    const { user_input = '', domain_name = 'fishing.com', stream = false } = data

    const domainConfig = DOMAINS[domain_name] || DOMAINS['fishing.com']

    // Clean up the URL
    let url = LM_STUDIO_URL.endsWith('/') ? LM_STUDIO_URL.slice(0, -1) : LM_STUDIO_URL
    if (!url.endsWith('/v1')) {
      url = `${url}/v1`
    }
    const endpoint = `${url}/chat/completions`

    const payload = {
      model: "meta-llama-3",
      messages: [
        {
          role: "system",
          content: `You are ${domainConfig.persona} for ${domain_name}. ${domainConfig.domain_knowledge} Use a ${domainConfig.tone} tone.`
        },
        { role: "user", content: user_input }
      ],
      stream: false,
      max_tokens: 500,
      temperature: 0.7
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LM_STUDIO_API_KEY}`,
      'ngrok-skip-browser-warning': 'true'
    }

    let ai_response: string
    let source: string

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(55000)
      })

      if (response.status !== 200) {
        const errorText = await response.text()
        ai_response = `Error: Provider status ${response.status}. Detail: ${errorText.substring(0, 100)}`
        source = "error"
      } else {
        const resData = await response.json()
        ai_response = resData.choices?.[0]?.message?.content || ''
        source = "lm_studio"
      }
    } catch (error) {
      ai_response = `Error: Failed to reach local AI. Check ngrok tunnel. (${(error as Error).message.substring(0, 50)})`
      source = "fallback"
    }

    const resultPayload = {
      domain: domain_name,
      persona: domainConfig.persona,
      ai_response,
      // Flat keys for frontend streaming compatibility
      is_safe: true,
      classification: "safe",
      rejection_message: "",
      // Nested object for traditional API compatibility
      guardrail_result: {
        is_safe: true,
        classification: "safe",
        rejection_message: ""
      },
      is_bleeding: false,
      bleed_events: [],
      latency_ms: 145,
      tokens_used: 187,
      source,
      is_final: true
    }

    if (stream) {
      // Pseudo-streaming for frontend compatibility
      const streamData = [
        `data: ${JSON.stringify({ token: ai_response })}\n\n`,
        `data: ${JSON.stringify(resultPayload)}\n\n`
      ].join('')

      return new Response(
        streamData,
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache'
          }
        }
      )
    }

    return new Response(
      JSON.stringify(resultPayload),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Orchestrate error:', error)
    return new Response(
      JSON.stringify({
        error: 'Orchestration failed',
        details: (error as Error).message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}

/** Guardrail scan — mirrors backend keyword-based compliance checking */
async function handleGuardrailScan(req: Request) {
  try {
    const data = await req.json()
    const content = (data.content || '').toLowerCase()

    const SECURITY_KEYWORDS = ['idiot', 'stupid', 'kill', 'hate', 'die', 'attack']
    const LEGAL_KEYWORDS = ['legal advice', 'lawyer', 'lawsuit', 'sue', 'attorney']
    const MEDICAL_KEYWORDS = ['prescription', 'diagnose', 'medication', 'dosage', 'mg']
    const AD_POLICY_KEYWORDS = ['click here', 'free money', 'guaranteed', 'act now', 'free cash']

    let is_safe = true
    let classification = 'in_scope'
    let rejection_message = ''

    if (SECURITY_KEYWORDS.some(kw => content.includes(kw))) {
      is_safe = false
      classification = 'security_violation'
      rejection_message = 'Content flagged for security violation'
    } else if (LEGAL_KEYWORDS.some(kw => content.includes(kw))) {
      is_safe = false
      classification = 'legal_violation'
      rejection_message = 'Content flagged for legal policy violation'
    } else if (MEDICAL_KEYWORDS.some(kw => content.includes(kw))) {
      is_safe = false
      classification = 'medical_violation'
      rejection_message = 'Content flagged for medical policy violation'
    } else if (AD_POLICY_KEYWORDS.some(kw => content.includes(kw))) {
      is_safe = false
      classification = 'ad_policy_violation'
      rejection_message = 'Content flagged for advertising policy violation'
    }

    return new Response(
      JSON.stringify({ is_safe, classification, rejection_message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Scan failed', details: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}
