import { useState, useRef, useEffect } from 'react';
import {
    Send,
    MessageCircle,
    Shield,
    X,
    Bot,
    AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { orchestrateAPI } from '../services/api';
import { APP_CONFIG, FALLBACK_DOMAINS } from '../config/constants';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    metadata?: any;
    isViolation?: boolean;
    violationType?: string;
    isBleeding?: boolean;
    bleedEvents?: any[];
}

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeDomain, setActiveDomain] = useState(Object.keys(FALLBACK_DOMAINS)[0]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [domains, setDomains] = useState<any>({});

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadDomains = async () => {
            try {
                const domainsData = await orchestrateAPI.getDomains();
                console.log('Loaded domains:', domainsData);
                setDomains(domainsData);
                if (Object.keys(domainsData).length > 0) {
                    setActiveDomain(Object.keys(domainsData)[0]);
                }
            } catch (error) {
                console.error('Failed to load domains:', error);
                // Fallback domains for demo
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
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: inputValue.trim(), timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        const aiMsgId = Date.now().toString();
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
                    setMessages(prev => prev.map(m =>
                        m.id === aiMsgId ? {
                            ...m,
                            content: final.is_safe ? m.content : `ERROR [Compliance]: ${final.rejection_message}`,
                            isViolation: !final.is_safe,
                            violationType: final.classification || 'Policy Violation',
                            isBleeding: final.is_bleeding,
                            bleedEvents: final.bleed_events,
                            metadata: final // Store all final metadata
                        } : m
                    ));
                }
            );
        } catch (err) {
            setMessages(prev => prev.map(m =>
                m.id === aiMsgId ? { ...m, content: "Error: Engine connection timed out.", isError: true } : m
            ));
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
                        className="w-16 h-16 rounded-full bg-gradient-to-tr from-lumina-primary to-lumina-accent shadow-2xl flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all glow-blue group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-shimmer"></div>
                        <MessageCircle size={30} className="group-hover:rotate-12 transition-transform duration-300 relative z-10" />
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 100, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 100 }}
                        className="w-[400px] h-[600px] glass-dark flex flex-col overflow-hidden border border-white/10 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)]"
                    >
                        {/* Header */}
                        <header className="p-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 glass-accent rounded-lg">
                                    <Bot size={20} className="text-lumina-accent" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm tracking-wide uppercase bg-clip-text text-transparent bg-gradient-to-r from-lumina-accent to-white">Lumina Orchestrator</h3>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-lumina-success animate-pulse"></div>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Context Locked</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white">
                                    <X size={18} />
                                </button>
                            </div>
                        </header>

                        {/* Domain Selector */}
                        <div className="px-4 py-2 bg-slate-900/50 flex items-center gap-2 border-b border-white/5">
                            <span className="text-[9px] font-bold text-slate-500 uppercase">Target Domain:</span>
                            <select
                                value={activeDomain}
                                onChange={(e) => {
                                    setActiveDomain(e.target.value);
                                    setMessages([]);
                                }}
                                className="bg-transparent text-xs font-semibold text-lumina-accent outline-none cursor-pointer hover:text-white transition-colors"
                            >
                                {Object.keys(domains).map(d => (
                                    <option key={d} value={d} className="bg-slate-900 text-white">{d}</option>
                                ))}
                            </select>
                        </div>

                        {/* Messages Area */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-950/20">
                            {messages.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 0.4, y: 0 }}
                                    className="h-full flex flex-col items-center justify-center text-center px-8"
                                >
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                        className="mb-4"
                                    >
                                        <Bot size={40} className="text-lumina-accent" />
                                    </motion.div>
                                    <p className="text-sm font-medium">Hello! I've adapted to <span className="text-lumina-accent font-bold">{activeDomain}</span>.</p>
                                    <p className="text-xs mt-1 text-slate-400">Ask me anything about this domain. Compliance guardrails are active.</p>
                                </motion.div>
                            )}

                            {messages.map((msg, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={i}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                        ? 'bg-lumina-primary/20 border border-lumina-primary/30 text-indigo-50 rounded-tr-none'
                                        : msg.isViolation
                                            ? 'bg-lumina-danger/10 border border-lumina-danger/30 text-red-200 rounded-tl-none'
                                            : msg.isBleeding
                                                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-100 rounded-tl-none'
                                                : 'bg-white/5 border border-white/10 text-slate-300 rounded-tl-none'
                                        }`}>
                                        {msg.isViolation && (
                                            <div className="flex items-center gap-2 mb-2 text-lumina-danger font-bold text-[10px] uppercase tracking-tighter">
                                                <Shield size={12} />
                                                Compliance Override: {msg.violationType}
                                            </div>
                                        )}
                                        {msg.isBleeding && !msg.isViolation && (
                                            <div className="flex items-center gap-2 mb-2 text-amber-400 font-bold text-[10px] uppercase tracking-tighter">
                                                <AlertTriangle size={12} />
                                                Context Leak: {msg.bleedEvents?.[0]?.source_domain}
                                            </div>
                                        )}
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}

                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex justify-start"
                                >
                                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-lumina-primary/10 to-transparent animate-shimmer"></div>
                                        <div className="relative z-10 flex gap-1.5">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="w-1.5 h-1.5 bg-slate-500 rounded-full"
                                            ></motion.div>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear", delay: 0.15 }}
                                                className="w-1.5 h-1.5 bg-slate-500 rounded-full"
                                            ></motion.div>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear", delay: 0.3 }}
                                                className="w-1.5 h-1.5 bg-slate-500 rounded-full"
                                            ></motion.div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white/5 border-t border-white/10">
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    placeholder="Type your message..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    disabled={isLoading}
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-lumina-primary/50 transition-all placeholder:text-slate-600"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={isLoading}
                                    className={`absolute right-2 p-2 rounded-lg transition-all ${inputValue.trim() ? 'bg-lumina-primary text-white shadow-lg shadow-indigo-500/20' : 'text-slate-600'
                                        }`}
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between mt-3 px-1">
                                <p className="text-[10px] text-slate-500 font-medium">{APP_CONFIG.NAME} v{APP_CONFIG.VERSION} • {APP_CONFIG.RELEASE_PHASE}</p>
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 rounded-full bg-lumina-accent/50"></div>
                                    <div className="w-2 h-2 rounded-full bg-lumina-primary/50"></div>
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
