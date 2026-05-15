import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { FiDollarSign, FiTrendingUp, FiPieChart, FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

const COLORS = ['#0d9488', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AdminFinance() {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/admin/revenue-stats', {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        const result = await res.json();
        if (res.ok) setData(result);
      } catch (error) {
        console.error('Failed to fetch finance stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  if (loading) return <div className="text-center py-20 text-slate-500">Calculating platform finances...</div>;
  if (!data) return <div className="text-center py-20 text-red-500">Failed to load financial data.</div>;

  const { summary, dailyTrends, categoryDistribution } = data;

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Financial Insights</h1>
        <p className="text-slate-500">Real-time revenue monitoring and fiscal performance.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total GMV', value: `₹${summary.totalGMV.toLocaleString()}`, sub: 'Marketplace Volume', icon: <FiDollarSign />, color: 'bg-teal-50 text-teal-600' },
          { label: 'Platform Profit', value: `₹${summary.totalPlatformFee.toLocaleString()}`, sub: 'Net Platform Fees', icon: <FiTrendingUp />, color: 'bg-indigo-50 text-indigo-600' },
          { label: 'Tax Collected', value: `₹${summary.totalTax.toLocaleString()}`, sub: 'Total GST Liability', icon: <FiPieChart />, color: 'bg-amber-50 text-amber-600' },
          { label: 'Worker Payouts', value: `₹${(summary.totalGMV - summary.totalPlatformFee).toLocaleString()}`, sub: 'Released to Workers', icon: <FiArrowUpRight />, color: 'bg-emerald-50 text-emerald-600' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${kpi.color}`}>
              {kpi.icon}
            </div>
            <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
            <p className="text-2xl font-black text-slate-800">{kpi.value}</p>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-slate-800">Daily Revenue Growth</h3>
            <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold bg-emerald-50 px-3 py-1 rounded-full">
              <FiArrowUpRight /> +12.5% 
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrends}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="_id" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10}}
                  tickFormatter={(val) => val.split('-').slice(1).join('/')}
                />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-8">Revenue by Category</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-50 text-center">
            <p className="text-xs text-slate-400">Distribution of platform fees across all service types.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
