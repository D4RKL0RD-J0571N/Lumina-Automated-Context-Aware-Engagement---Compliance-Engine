import { useState, useEffect } from 'react';
import {
    ShieldCheck,
    Activity,
    Target,
    AlertTriangle,
    Clock,
    Search
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { orchestrateAPI } from './services/api';
import MetricsChart from './components/MetricsChart';

const Dashboard = () => {
    const [metrics, setMetrics] = useState<any>(null);
    const [domains, setDomains] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [m, d] = await Promise.all([
                    orchestrateAPI.getMetrics(),
                    orchestrateAPI.getDomains()
                ]);
                setMetrics(m);
                setDomains(d);
            } catch (err) {
                console.error("Failed to fetch metrics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const cardVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.5,
                ease: "easeOut"
            }
        })
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-lumina-darker">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lumina-accent"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-lumina-darker p-8 font-sans selection:bg-lumina-primary/30">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
                <div>
                    <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-lumina-accent animate-pulse-glow">
                        Lumina Engine
                    </h1>
                    <p className="text-slate-400 mt-3 flex items-center gap-2 text-sm md:text-base">
                        <Activity size={16} className="text-lumina-success animate-pulse" />
                        <span className="font-medium">Operational</span>
                        <span className="text-lumina-accent">•</span>
                        <span className="italic">Context-Aware Compliance Layer</span>
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => window.open('/api/v1/logs', '_blank')}
                        className="px-5 py-2.5 glass-accent text-blue-100 hover:bg-blue-500/20 transition-all flex items-center gap-2"
                    >
                        <Search size={18} />
                        Inspect Logs
                    </button>
                    <button
                        onClick={() => alert('New Campaign feature coming soon!')}
                        className="btn-primary"
                    >
                        New Campaign
                    </button>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible" className="glass p-6 hover:scale-105 transition-transform duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Compliance Health</p>
                        <div className="relative">
                            <ShieldCheck className="text-lumina-success" size={20} />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-lumina-success rounded-full animate-ping"></div>
                        </div>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold text-lumina-success">{metrics?.compliance_pass_rate}</h3>
                    <p className="text-slate-500 text-xs mt-2 flex items-center gap-1">
                        <span className="text-lumina-success">↑</span>
                        <span>0.2% from last hour</span>
                    </p>
                    <div className="mt-4 h-1 bg-gradient-to-r from-lumina-success/20 to-transparent rounded-full"></div>
                </motion.div>

                <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible" className="glass p-6 hover:scale-105 transition-transform duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Active Domains</p>
                        <div className="relative">
                            <Target className="text-lumina-primary" size={20} />
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-lumina-primary rounded-full animate-pulse"></div>
                        </div>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold text-lumina-primary">{Object.keys(domains || {}).length}</h3>
                    <p className="text-slate-500 text-xs mt-2">Scale: <span className="text-lumina-accent font-bold">{metrics?.total_requests}</span> reqs/24h</p>
                    <div className="mt-4 grid grid-cols-3 gap-1">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`h-8 rounded-full bg-gradient-to-t from-lumina-primary/20 to-transparent ${i === 1 ? 'col-span-2' : ''}`}></div>
                        ))}
                    </div>
                </motion.div>

                <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible" className="glass p-6">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-slate-400 text-sm font-medium">Risk & Quality</p>
                        <AlertTriangle className="text-lumina-warning" size={20} />
                    </div>
                    <h3 className="text-3xl font-bold">{metrics?.security_violations + metrics?.legal_violations + metrics?.medical_violations}</h3>
                    <p className="text-slate-500 text-xs mt-1">Critical blocks this period</p>
                    <p className="text-amber-400/70 text-[10px] mt-1 font-semibold">{metrics?.bleed_through_events} context-leak events detected</p>
                </motion.div>

                <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible" className="glass p-6 border-indigo-500/20 shadow-indigo-500/5">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-slate-400 text-sm font-medium">Avg. Orchestration</p>
                        <Clock className="text-lumina-accent" size={20} />
                    </div>
                    <h3 className="text-3xl font-bold">{metrics?.avg_latency_ms} ms</h3>
                    <p className="text-slate-500 text-xs mt-2">Latency: P99 Optimized</p>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Metrics Chart */}
                <MetricsChart data={{
                    compliance_rate: metrics?.compliance_pass_rate || 0,
                    total_requests: metrics?.total_requests || 0,
                    violations: (metrics?.security_violations || 0) + (metrics?.legal_violations || 0) + (metrics?.medical_violations || 0),
                    latency: metrics?.avg_latency_ms || 0
                }} />

                {/* Domain Management */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-semibold mb-4">Portfolio Overview</h2>
                    <div className="glass-dark overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 text-slate-400 text-sm uppercase tracking-wider">
                                    <th className="px-6 py-4 font-semibold">Domain</th>
                                    <th className="px-6 py-4 font-semibold">Persona</th>
                                    <th className="px-6 py-4 font-semibold">Tone</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {Object.entries(domains || {}).map(([name, config]: [string, any]) => (
                                    <tr key={name} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-indigo-100 group-hover:text-lumina-accent transition-colors">{name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm px-2 py-1 bg-white/5 rounded border border-white/10 uppercase tracking-tighter text-slate-300">
                                                {config.persona}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-sm italic">
                                            "{config.tone}"
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-lumina-success shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                                <span className="text-xs font-semibold text-lumina-success uppercase">Secured</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Audit Log / Alerts */}
                <div className="glass p-6">
                    <h2 className="text-xl font-semibold mb-6">Recent Violations</h2>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                        {[
                            { type: 'Legal', site: 'SeniorsInfo.org', msg: '"Sign this document immediately"', color: 'text-lumina-warning' },
                            { type: 'Ad-Policy', site: 'LocalNews.org', msg: 'Mentioned "Click for Free Cash"', color: 'text-lumina-danger' },
                            { type: 'Medical', site: 'Fishing.com', msg: 'Offered prescription advice', color: 'text-lumina-warning' },
                            { type: 'Security', site: 'HouseholdManuals.com', msg: 'Abusive language detected', color: 'text-lumina-danger' },
                        ].map((v, i) => (
                            <div key={i} className="flex gap-4 p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-all cursor-pointer">
                                <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${v.color.replace('text', 'bg')}`}></div>
                                <div>
                                    <div className="flex justify-between items-center w-full gap-8">
                                        <span className={`text-xs font-bold uppercase tracking-widest ${v.color}`}>{v.type}</span>
                                        <span className="text-[10px] text-slate-500">2m ago</span>
                                    </div>
                                    <p className="text-sm text-slate-300 font-medium mt-1">{v.site}</p>
                                    <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[180px] italic">{v.msg}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-3 rounded-xl border border-white/5 text-slate-400 text-xs font-semibold hover:bg-white/5 transition-all">
                        View Full Compliance Audit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
