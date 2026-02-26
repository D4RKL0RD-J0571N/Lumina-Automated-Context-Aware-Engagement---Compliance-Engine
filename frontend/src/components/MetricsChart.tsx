import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Shield, AlertTriangle } from 'lucide-react';

interface MetricsChartProps {
  data: {
    compliance_rate: number;
    total_requests: number;
    violations: number;
    latency: number;
  };
}

const MetricsChart = ({ data }: MetricsChartProps) => {
  const chartData = [
    { label: 'Compliance', value: data.compliance_rate, color: 'bg-lumina-success' },
    { label: 'Requests', value: data.total_requests, color: 'bg-lumina-primary' },
    { label: 'Violations', value: data.violations, color: 'bg-lumina-danger' },
    { label: 'Latency', value: data.latency, color: 'bg-lumina-warning' }
  ];

  const maxValue = Math.max(...chartData.map(d => d.value));

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-lumina-accent flex items-center gap-2">
          <BarChart3 size={20} />
          Performance Metrics
        </h3>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <TrendingUp size={14} className="text-lumina-success" />
          Live
        </div>
      </div>

      <div className="space-y-4">
        {chartData.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.8, delay: 0.1 * index }}
            className="space-y-2"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-300">{item.label}</span>
              <span className={`text-sm font-bold ${
                item.color === 'bg-lumina-success' ? 'text-lumina-success' :
                item.color === 'bg-lumina-primary' ? 'text-lumina-primary' :
                item.color === 'bg-lumina-danger' ? 'text-lumina-danger' :
                'text-lumina-warning'
              }`}>
                {item.value}
                {item.label === 'Latency' ? 'ms' : item.label === 'Requests' ? '/24h' : '%'}
              </span>
            </div>
            
            <div className="relative h-6 bg-slate-800/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.value / maxValue) * 100}%` }}
                transition={{ duration: 1, delay: 0.2 * index }}
                className={`h-full ${item.color} rounded-full relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2 text-center">
        <div className="glass-accent p-3 rounded-lg">
          <Shield size={16} className="text-lumina-success mx-auto mb-1" />
          <p className="text-xs font-bold text-lumina-success">Secure</p>
        </div>
        <div className="glass-accent p-3 rounded-lg">
          <TrendingUp size={16} className="text-lumina-primary mx-auto mb-1" />
          <p className="text-xs font-bold text-lumina-primary">Optimized</p>
        </div>
        <div className="glass-accent p-3 rounded-lg">
          <AlertTriangle size={16} className="text-lumina-warning mx-auto mb-1" />
          <p className="text-xs font-bold text-lumina-warning">Monitored</p>
        </div>
      </div>
    </motion.div>
  );
};

export default MetricsChart;
