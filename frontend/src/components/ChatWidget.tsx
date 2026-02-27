import { useState, useRef, useEffect } from 'react';
import {
    Send,
    MessageCircle,
    Shield,
    X,
    Bot,
    AlertTriangle,
    Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { orchestrateAPI } from '../services/api';
import type { StreamFinalPayload } from '../services/api';
import { APP_CONFIG, FALLBACK_DOMAINS } from '../config/constants';

interface BleedEvent {
    source_domain: string;
    leaked_context: string[];
}

interface GuardrailResult {
    is_safe: boolean;
    classification: string;
    rejection_message: string;
    confidence_score?: number;
}

interface OrchestrateMetadata {
    domain: string;
    persona: string;
    ai_response: string;
    guardrail_result: GuardrailResult;
    is_bleeding: boolean;
    bleed_events: BleedEvent[];
    latency_ms: number;
    tokens_used: number;
}

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    metadata?: OrchestrateMetadata | StreamFinalPayload;
    isViolation?: boolean;
    violationType?: string;
    isBleeding?: boolean;
    bleedEvents?: BleedEvent[];
    isError?: boolean;
}

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeDomain, setActiveDomain] = useState(Object.keys(FALLBACK_DOMAINS)[0]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [domains, setDomains] = useState<Record<string, { persona: string; tone: string; domain_knowledge: string }>>({});

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadDomains = async () => {
            try {
                const domainsData = await orchestrateAPI.getDomains();
                // Unwrap domains if nested
                const unwrapped = domainsData.domains || domainsData;
                setDomains(unwrapped);
                if (Object.keys(unwrapped).length > 0) {
                    setActiveDomain(Object.keys(unwrapped)[0]);
                }
            } catch {
                setDomains(FALLBACK_DOMAINS);
                setActiveDomain(Object.keys(FALLBACK_DOMAINS)[0]);
            }
        };

        loadDomains();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userInput = inputValue;
        const userMsg: ChatMessage = { id: `user-${Date.now()}`, role: 'user', content: inputValue.trim(), timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        const aiMsgId = `ai-${Date.now()}`;
        // Add placeholder message for streaming
        setMessages(prev => [...prev, { id: aiMsgId, role: 'assistant', content: '', timestamp: new Date() }]);

        try {
            await orchestrateAPI.orchestrateStream(
                { user_input: userInput, domain_name: activeDomain },
                (token) => {
                    setMessages(prev => prev.map(m =>
                        m.id === aiMsgId ? { ...m, content: m.content + token } : m
                    ));
                },
                (final) => {
                    const isSafe = final.is_safe ?? final.guardrail_result?.is_safe ?? true;
                    const rejectionMsg = final.rejection_message ?? final.guardrail_result?.rejection_message ?? "Policy violation detected";
                    const classification = final.classification ?? final.guardrail_result?.classification ?? "Policy Violation";

                    if (!isSafe) {
                        // 🟢 ALIVE PROTOTYPE: Record violation to session storage
                        const existing = JSON.parse(localStorage.getItem('lumina_session_violations') || '[]');
                        localStorage.setItem('lumina_session_violations', JSON.stringify([
                            { classification, domain: activeDomain, message: userInput, timestamp: new Date().toISOString() },
                            ...existing
                        ].slice(0, 10))); // Keep last 10
                    }

                    setMessages(prev => prev.map(m =>
                        m.id === aiMsgId ? {
                            ...m,
                            content: isSafe ? m.content : rejectionMsg,
                            isViolation: !isSafe,
                            violationType: classification,
                            isBleeding: final.is_bleeding,
                            bleedEvents: final.bleed_events,
                            metadata: final // Store all final metadata
                        } : m
                    ));
                }
            );
        } catch (err) {
            console.warn('Streaming failed — falling back to non-streaming API', err);
            try {
                // FALLBACK: Use non-streaming orchestrate if streaming fails (e.g. Vercel limitations)
                const result = await orchestrateAPI.orchestrate({
                    user_input: userInput,
                    domain_name: activeDomain
                });

                const isSafe = result.guardrail_result.is_safe;
                if (!isSafe) {
                    const existing = JSON.parse(localStorage.getItem('lumina_session_violations') || '[]');
                    localStorage.setItem('lumina_session_violations', JSON.stringify([
                        { classification: result.guardrail_result.classification, domain: activeDomain, message: userInput, timestamp: new Date().toISOString() },
                        ...existing
                    ].slice(0, 10)));
                }

                setMessages(prev => prev.map(m =>
                    m.id === aiMsgId ? {
                        ...m,
                        content: isSafe ? result.ai_response : result.guardrail_result.rejection_message,
                        isViolation: !isSafe,
                        violationType: result.guardrail_result.classification || 'Policy Violation',
                        isBleeding: result.is_bleeding,
                        bleedEvents: result.bleed_events,
                        metadata: result
                    } : m
                ));
            } catch {
                setMessages(prev => prev.map(m =>
                    m.id === aiMsgId ? { ...m, content: "Lumina Engine Error: Connection timed out.", isError: true } : m
                ));
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 45 }}
                        whileHover={{ scale: 1.1, rotate: 12 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(true)}
                        className="w-16 h-16 rounded-full bg-gradient-to-tr from-lumina-primary to-lumina-accent shadow-2xl flex items-center justify-center text-white glow-blue group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-shimmer"></div>
                        <MessageCircle size={30} className="group-hover:rotate-12 transition-transform duration-300 relative z-10" />
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 50, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 50 }}
                        className="w-[420px] h-[640px] glass-dark flex flex-col overflow-hidden border border-white/10 shadow-[0_45px_100px_-20px_rgba(0,0,0,0.8)]"
                    >
                        {/* Header */}
                        <header className="p-5 bg-gradient-to-b from-white/[0.05] to-transparent border-b border-white/10 flex justify-between items-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-lumina-primary/5 -translate-y-1/2 blur-3xl pointer-events-none"></div>
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="p-2.5 bg-lumina-accent/10 rounded-xl border border-lumina-accent/20">
                                    <Bot size={22} className="text-lumina-accent" />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="font-black text-xs tracking-[0.2em] uppercase text-white/90">Lumina Orchestrator</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-lumina-success/10 rounded-full border border-lumina-success/20">
                                            <div className="w-1.5 h-1.5 rounded-full bg-lumina-success animate-pulse"></div>
                                            <span className="text-[9px] text-lumina-success font-black uppercase tracking-widest leading-none">Context Locked</span>
                                        </div>
                                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{APP_CONFIG.RELEASE_PHASE}</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white relative z-10">
                                <X size={20} />
                            </button>
                        </header>

                        {/* Domain Select Bar */}
                        <div className="px-5 py-3 bg-black/40 flex items-center justify-between border-b border-white/5 relative group">
                            <div className="flex items-center gap-2">
                                <Shield size={12} className="text-lumina-accent group-hover:scale-110 transition-transform" />
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Enforcement Domain:</span>
                            </div>
                            <select
                                value={activeDomain}
                                onChange={(e) => {
                                    setActiveDomain(e.target.value);
                                    setMessages([]);
                                }}
                                className="bg-transparent text-[11px] font-black text-lumina-accent outline-none cursor-pointer hover:text-white transition-colors uppercase tracking-tight"
                            >
                                {Object.keys(domains).map(d => (
                                    <option key={d} value={d} className="bg-slate-900 text-white">{d}</option>
                                ))}
                            </select>
                        </div>

                        {/* Messages Area */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar bg-slate-950/40 relative">
                            {/* Watermark */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
                                <div className="text-6xl font-black rotate-[-30deg] tracking-tighter">SECURE CHANNEL</div>
                            </div>

                            {messages.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="h-full flex flex-col items-center justify-center text-center px-10"
                                >
                                    <div className="relative mb-6">
                                        <div className="absolute inset-0 bg-lumina-accent/20 blur-3xl rounded-full"></div>
                                        <Bot size={48} className="text-lumina-accent relative z-10" />
                                    </div>
                                    <h4 className="text-sm font-black text-white uppercase tracking-widest italic mb-2">Protocol Initialized</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        I am strictly configured to assist with <span className="text-lumina-accent font-bold underline underline-offset-4">{activeDomain}</span>.
                                        All cross-domain inquiries will be deterministically blocked.
                                    </p>
                                </motion.div>
                            )}

                            {messages.map((msg) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    key={msg.id}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[88%] relative group ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                        <div className={`p-4 rounded-2xl text-[13px] leading-relaxed transition-all ${msg.role === 'user'
                                            ? 'bg-lumina-primary/10 border border-lumina-primary/30 text-indigo-50 rounded-tr-none shadow-lg shadow-indigo-500/5'
                                            : msg.isViolation
                                                ? 'bg-lumina-danger/10 border border-lumina-danger/40 text-red-200 rounded-tl-none font-medium'
                                                : msg.isBleeding
                                                    ? 'bg-amber-500/10 border border-amber-500/30 text-amber-100 rounded-tl-none'
                                                    : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none'
                                            }`}>

                                            {msg.isViolation && (
                                                <div className="flex items-center gap-2 mb-3 py-1.5 px-2 bg-lumina-danger/20 border border-lumina-danger/20 rounded flex-wrap">
                                                    <Lock size={14} className="text-lumina-danger" />
                                                    <span className="font-black text-[10px] uppercase tracking-widest text-lumina-danger">
                                                        Security Sentinel Halt: {msg.violationType?.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            )}

                                            {msg.isBleeding && !msg.isViolation && (
                                                <div className="flex items-center gap-2 mb-2 text-amber-400 font-black text-[10px] uppercase tracking-tighter bg-amber-400/10 p-1 rounded">
                                                    <AlertTriangle size={12} />
                                                    Context Leak: {msg.bleedEvents?.[0]?.source_domain}
                                                </div>
                                            )}

                                            <div className={`markdown-content ${msg.isViolation ? "font-mono text-xs italic opacity-90" : ""}`}>
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                        <span className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em] mt-1.5 block px-1">
                                            {msg.role === 'user' ? 'Transmission' : 'Orchestrated'} • {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}

                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex justify-start"
                                >
                                    <div className="px-5 py-4 bg-white/5 border border-white/10 rounded-2xl rounded-tl-none flex flex-col gap-2 min-w-[120px]">
                                        <div className="flex gap-1.5 items-center">
                                            <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity }} className="w-1 h-1 bg-lumina-accent rounded-full" />
                                            <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-1 h-1 bg-lumina-accent rounded-full" />
                                            <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-1 h-1 bg-lumina-accent rounded-full" />
                                        </div>
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Running Guardrails...</span>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-5 bg-gradient-to-t from-black/60 to-transparent border-t border-white/10">
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="Execute domain command..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    disabled={isLoading}
                                    className="w-full bg-slate-900/80 border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-sm focus:outline-none focus:border-lumina-primary/50 focus:ring-1 focus:ring-lumina-primary/20 transition-all placeholder:text-slate-600 placeholder:italic placeholder:font-medium font-medium text-slate-100"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={isLoading || !inputValue.trim()}
                                    className={`absolute right-2 top-2 bottom-2 px-3.5 rounded-xl transition-all flex items-center justify-center ${inputValue.trim()
                                        ? 'bg-lumina-primary text-white shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95'
                                        : 'text-slate-700 bg-white/5'
                                        }`}
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between mt-4 px-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-lumina-success"></div>
                                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">{APP_CONFIG.NAME} ENG v1.0.4 - ACTIVE</p>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-1 h-3 bg-white/5 rounded-full"></div>
                                    <div className="w-1 h-3 bg-lumina-accent/20 rounded-full"></div>
                                    <div className="w-1 h-3 bg-lumina-primary/40 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ChatWidget;
