import { useState, useEffect } from 'react';
import {
    ShieldCheck,
    Activity,
    AlertTriangle,
    Clock,
    Search,
    Globe,
    Cpu,
    Zap,
    ChevronRight,
    Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { orchestrateAPI } from './services/api';
import MetricsChart from './components/MetricsChart';
import { APP_CONFIG, UI_CONSTANTS, FALLBACK_DOMAINS, FALLBACK_METRICS, FALLBACK_VIOLATIONS } from './config/constants';

interface MetricsData {
    compliance_pass_rate: string;
    total_requests: number;
    security_violations: number;
    legal_violations: number;
    medical_violations: number;
    ad_policy_violations: number;
    bleed_through_events: number;
    avg_latency_ms: number;
}

interface Violation {
    type: string;
    site: string;
    msg: string;
    color: string;
    time: string;
}

interface DomainConfig {
    persona: string;
    tone: string;
    domain_knowledge: string;
}

const Dashboard = () => {
    const [metrics, setMetrics] = useState<MetricsData | null>(null);
    const [domains, setDomains] = useState<Record<string, DomainConfig> | null>(null);
    const [violations, setViolations] = useState<Violation[]>([]);
    const [loading, setLoading] = useState(true);
    const [statsVisible, setStatsVisible] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [m, d, v] = await Promise.all([
                    orchestrateAPI.getMetrics(),
                    orchestrateAPI.getDomains(),
                    orchestrateAPI.getViolations()
                ]);

                // Merge session-specific violations from localStorage
                const sessionLogs = JSON.parse(localStorage.getItem('lumina_session_violations') || '[]');
                const mergedMetrics = { ...m };

                sessionLogs.forEach((log: any) => {
                    const type = log.classification.toLowerCase();
                    if (type.includes('security')) mergedMetrics.security_violations++;
                    if (type.includes('legal')) mergedMetrics.legal_violations++;
                    if (type.includes('medical')) mergedMetrics.medical_violations++;
                    if (type.includes('ad_policy')) mergedMetrics.ad_policy_violations++;
                    if (type.includes('out_of_scope')) mergedMetrics.security_violations++; // Out of scope is high-risk
                });

                setMetrics(mergedMetrics);
                setDomains(d);

                // Prepend session violations to the log
                const sessionViolations = sessionLogs.map((log: any) => ({
                    type: log.classification.split('_').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join('-'),
                    site: log.domain,
                    msg: log.message.length > 40 ? log.message.slice(0, 37) + '...' : log.message,
                    color: log.classification.includes('security') || log.classification.includes('ad') ? 'text-lumina-danger' : 'text-lumina-warning',
                    time: "Just now"
                }));

                setViolations([...sessionViolations, ...(v.violations || [])]);
            } catch (err) {
                console.error("Failed to fetch dashboard data — using fallback", err);
                setMetrics(FALLBACK_METRICS);
                setDomains(FALLBACK_DOMAINS);
                setViolations(FALLBACK_VIOLATIONS);
            } finally {
                setLoading(false);
                setTimeout(() => setStatsVisible(true), 100);
            }
        };

        fetchData();

        const intervalId = setInterval(async () => {
            try {
                const updatedMetrics = await orchestrateAPI.getMetrics();
                setMetrics(updatedMetrics);
            } catch { /* polling failure is non-critical */ }
        }, 15000);

        return () => clearInterval(intervalId);
    }, []);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-screen bg-lumina-darker gap-6">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="relative w-16 h-16"
            >
                <div className="absolute inset-0 rounded-full border-t-2 border-b-2 border-lumina-accent opacity-20"></div>
                <div className="absolute inset-0 rounded-full border-l-2 border-r-2 border-lumina-primary animate-pulse"></div>
            </motion.div>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lumina-accent font-bold tracking-widest uppercase text-xs animate-pulse"
            >
                Initializing Compliance Core...
            </motion.p>
        </div>
    );

    return (
        <div className="min-h-screen bg-lumina-darker text-slate-100 font-sans selection:bg-lumina-primary/30 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-lumina-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-lumina-accent/5 rounded-full blur-[100px] pointer-events-none"></div>

            <main className="max-w-[1600px] mx-auto p-6 md:p-10 relative z-10">
                {/* Header Section */}
                <header className="flex flex-col xl:flex-row xl:items-end justify-between mb-16 gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-lumina-primary/10 border border-lumina-primary/20 rounded-full text-[10px] font-bold text-lumina-primary uppercase tracking-[0.2em]">
                                Enterprise Simulation Active
                            </span>
                            <div className="w-2 h-2 rounded-full bg-lumina-success shadow-[0_0_12px_rgba(16,218,129,0.5)]"></div>
                        </div>
                        <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none italic">
                            LUMINA<span className="text-lumina-accent not-italic">.</span>CORE
                        </h1>
                        <div className="flex items-center gap-6 mt-2">
                            <p className="text-slate-400 font-medium flex items-center gap-2 group cursor-help">
                                <Activity size={18} className="text-lumina-success group-hover:scale-110 transition-transform" />
                                <span className="border-b border-transparent group-hover:border-slate-500 transition-colors">Global Orchestration Layer</span>
                            </p>
                            <div className="h-4 w-px bg-white/10"></div>
                            <p className="text-slate-500 text-sm font-mono tracking-wider italic">
                                BUILD V{APP_CONFIG.VERSION}
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-wrap gap-4"
                    >
                        <button className="px-8 py-4 glass-dark border-white/5 hover:border-white/20 transition-all flex items-center gap-3 group">
                            <Lock size={18} className="text-slate-500 group-hover:text-lumina-accent transition-colors" />
                            <span className="font-bold text-sm tracking-widest uppercase">Policy Engine</span>
                        </button>
                        <button className="px-8 py-4 bg-gradient-to-r from-lumina-primary to-indigo-600 rounded-none shadow-[0_10px_40px_-10px_rgba(37,99,235,0.4)] hover:shadow-lumina-primary/30 transition-all active:scale-95 group relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                            <span className="font-bold text-sm tracking-widest uppercase flex items-center gap-2">
                                New Campaign <ChevronRight size={18} />
                            </span>
                        </button>
                    </motion.div>
                </header>

                {/* Main Stats Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate={statsVisible ? "visible" : "hidden"}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
                >
                    {/* Performance Score */}
                    <motion.div variants={itemVariants} className="glass group p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-lumina-success/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-lumina-success/10 transition-colors"></div>
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-lumina-success/10 rounded-2xl">
                                <ShieldCheck className="text-lumina-success" size={24} />
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Compliance</span>
                                <p className="text-lumina-success text-xs font-bold leading-none">{UI_CONSTANTS.DASHBOARD.COMPLIANCE_HEALTH_CHANGE}</p>
                            </div>
                        </div>
                        <h3 className="text-5xl font-black tracking-tighter text-white transition-transform group-hover:scale-105 duration-500">
                            {metrics?.compliance_pass_rate}
                        </h3>
                        <div className="mt-6 flex items-center gap-4">
                            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: metrics?.compliance_pass_rate }}
                                    className="h-full bg-lumina-success shadow-[0_0_8px_rgba(16,218,129,0.5)]"
                                ></motion.div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Scale Card */}
                    <motion.div variants={itemVariants} className="glass p-8 group overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-lumina-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-lumina-primary/10 transition-colors"></div>
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-lumina-primary/10 rounded-2xl">
                                <Globe className="text-lumina-primary" size={24} />
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Infrastructure</span>
                                <p className="text-lumina-primary text-xs font-bold leading-none">Global Coverage</p>
                            </div>
                        </div>
                        <h3 className="text-5xl font-black tracking-tighter group-hover:translate-x-1 transition-transform">
                            {Object.keys(domains || {}).length} <span className="text-lg text-slate-500 font-medium">Nodes</span>
                        </h3>
                        <p className="text-slate-500 text-xs mt-4 flex items-center gap-2">
                            <Zap size={14} className="text-lumina-accent" /> Total Throughput: <span className="text-white font-bold">{metrics?.total_requests}</span>
                        </p>
                    </motion.div>

                    {/* Risk Analysis Card */}
                    <motion.div variants={itemVariants} className="glass p-8 group border-lumina-danger/10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-lumina-danger/10 rounded-2xl">
                                <AlertTriangle className="text-lumina-danger" size={24} />
                            </div>
                            <div className="px-2 py-1 bg-lumina-danger/20 rounded text-[9px] font-black text-white italic uppercase animate-pulse">
                                High Risk
                            </div>
                        </div>
                        <h3 className="text-5xl font-black tracking-tighter text-white">
                            {(metrics?.security_violations ?? 0) + (metrics?.legal_violations ?? 0) + (metrics?.medical_violations ?? 0)}
                        </h3>
                        <p className="text-slate-500 text-xs mt-4 font-medium uppercase tracking-tight">Active Blocks Detected</p>
                        <div className="mt-4 flex gap-2">
                            <div className="h-1.5 w-6 bg-lumina-danger rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                            <div className="h-1.5 w-4 bg-white/10 rounded-full"></div>
                            <div className="h-1.5 w-4 bg-white/10 rounded-full"></div>
                        </div>
                    </motion.div>

                    {/* Latency Optimized Card */}
                    <motion.div variants={itemVariants} className="glass p-8 group overflow-hidden bg-gradient-to-br from-white/[0.03] to-transparent">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-lumina-accent/10 rounded-2xl">
                                <Clock className="text-lumina-accent" size={24} />
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">P99 Optimized</span>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-5xl font-black tracking-tighter text-white">{metrics?.avg_latency_ms}</h3>
                            <span className="text-2xl font-bold text-lumina-accent">ms</span>
                        </div>
                        <p className="text-slate-500 text-[10px] mt-4 font-bold border-l-2 border-lumina-accent pl-2">REAL-TIME ORCHESTRATION</p>
                    </motion.div>
                </motion.div>

                {/* Secondary Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Visualizer Section */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="lg:col-span-1 space-y-6"
                    >
                        <MetricsChart data={{
                            compliance_rate: metrics?.compliance_pass_rate ? parseFloat(metrics.compliance_pass_rate) : 0,
                            total_requests: metrics?.total_requests ?? 0,
                            violations: (metrics?.security_violations ?? 0) + (metrics?.legal_violations ?? 0) + (metrics?.medical_violations ?? 0) + (metrics?.ad_policy_violations ?? 0),
                            latency: metrics?.avg_latency_ms ?? 0
                        }} />

                        <div className="glass p-6 bg-gradient-to-tr from-lumina-primary/10 to-transparent flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">Context Leak Guard</h4>
                                <p className="text-2xl font-black italic">{metrics?.bleed_through_events} <span className="text-xs text-slate-500 not-italic">Events</span></p>
                            </div>
                            <div className="p-4 glass-accent rounded-full animate-spin-slow">
                                <Cpu size={24} className="text-lumina-accent" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Table and Log Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="lg:col-span-2 space-y-8"
                    >
                        {/* Domain Portfolio */}
                        <div className="glass-dark overflow-hidden border border-white/5 relative">
                            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">Domain Portfolio</h2>
                                <Search size={16} className="text-slate-500 cursor-pointer hover:text-white" />
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white/[0.01] text-slate-500 text-[10px] uppercase font-black tracking-widest">
                                            <th className="px-8 py-5">Host Identity</th>
                                            <th className="px-8 py-5">Persona Model</th>
                                            <th className="px-8 py-5">Linguistic Profile</th>
                                            <th className="px-8 py-5 text-right">Shield</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {Object.entries(domains || {}).map(([name, config]: [string, DomainConfig], idx) => (
                                            <motion.tr
                                                key={name}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.1 * idx }}
                                                className="hover:bg-lumina-primary/5 transition-colors group cursor-crosshair"
                                            >
                                                <td className="px-8 py-5 font-bold text-white group-hover:text-lumina-accent transition-colors">
                                                    {name}
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="text-[10px] px-2 py-1 bg-white/5 border border-white/10 rounded font-black tracking-tighter text-slate-400 group-hover:text-white transition-colors">
                                                        {config.persona}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-slate-400 text-xs italic opacity-60 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                    "{config.tone}"
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="inline-flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-lumina-success shadow-[0_0_8px_rgba(16,218,129,0.5)]"></div>
                                                        <span className="text-[9px] font-black text-lumina-success uppercase tracking-widest">Active</span>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Violation Log */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="glass p-6 pb-2">
                                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-lumina-danger mb-6 underline underline-offset-8">Critical Incidents</h2>
                                <div className="space-y-4 max-h-[280px] overflow-y-auto custom-scrollbar pr-2">
                                    <AnimatePresence>
                                        {violations.length > 0 ? violations.map((v, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="group p-4 bg-white/5 border-l-2 border-transparent hover:border-lumina-danger hover:bg-lumina-danger/5 transition-all"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${v.color}`}>{v.type}</span>
                                                    <span className="text-[9px] text-slate-600 font-mono italic">{v.time}</span>
                                                </div>
                                                <p className="text-sm text-slate-200 mt-2 font-bold">{v.site}</p>
                                                <p className="text-xs text-slate-500 mt-1 italic group-hover:text-slate-300 transition-colors">"{v.msg}"</p>
                                            </motion.div>
                                        )) : (
                                            <div className="text-center text-slate-500 text-xs py-10 italic">
                                                CLEAR AIR - ZERO VIOLATIONS
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* System Status / Network */}
                            <div className="glass p-6 bg-gradient-to-b from-transparent to-white/[0.02]">
                                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-6 italic">Secure Channel Status</h2>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase">RAG Engine V.09</div>
                                        <div className="px-2 py-0.5 bg-lumina-success/10 rounded-full text-lumina-success text-[10px] font-black">STABLE</div>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            animate={{ x: [-100, 400] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                            className="w-1/3 h-full bg-lumina-accent/40 blur-sm rounded-full"
                                        ></motion.div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 glass-dark text-center">
                                            <p className="text-[9px] text-slate-600 font-black uppercase">Shard ID</p>
                                            <p className="text-xs font-mono text-lumina-accent mt-1 tracking-tighter">US-EAST-04</p>
                                        </div>
                                        <div className="p-4 glass-dark text-center">
                                            <p className="text-[9px] text-slate-600 font-black uppercase">Traffic</p>
                                            <p className="text-xs font-mono text-lumina-success mt-1 tracking-tighter">0.024ms</p>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-2 font-medium italic opacity-50">
                                        All orchestration requests are cryptographically signed and context-bound via Lumina deterministic guardrails.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
