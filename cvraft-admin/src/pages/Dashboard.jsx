import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import {
  TrendingUp,
  Users,
  DollarSign,
  FileText,
  LogOut,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCheck,
  RefreshCw,
  Sliders,
  Mail,
  Download,
  Loader2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics');
  const [adminEmail, setAdminEmail] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  
  // Loading & Error States
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState(null);

  // Modals & Search States
  const [searchUser, setSearchUser] = useState('');
  const [searchPayment, setSearchPayment] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  
  // Edit Credits Modal
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [resumesInput, setResumesInput] = useState(0);
  const [lettersInput, setLettersInput] = useState(0);
  const [isUpdatingCredits, setIsUpdatingCredits] = useState(false);

  // Delete User Confirmation Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const email = localStorage.getItem('admin_email');
    if (!token) {
      navigate('/login');
    } else {
      setAdminEmail(email || 'admin@cvraft.com');
      fetchDashboardData();
    }
  }, [navigate]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [analyticsRes, usersRes, paymentsRes] = await Promise.all([
        api.get('/analytics'),
        api.get('/users'),
        api.get('/payments')
      ]);

      setAnalytics(analyticsRes.data.analytics);
      setUsers(usersRes.data.users || []);
      setPayments(paymentsRes.data.payments || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_email');
    navigate('/login');
  };

  // ── CSV & PDF EXPORT UTILITIES ────────────────────────
  const downloadCSV = (data, filename, headers) => {
    const getNestedValue = (obj, path) => {
      return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : ''), obj);
    };

    const csvRows = [];
    // Add headers row
    csvRows.push(headers.map(h => `"${h.label.replace(/"/g, '""')}"`).join(','));

    // Add data rows
    for (const row of data) {
      const values = headers.map(h => {
        let val = getNestedValue(row, h.key);
        if (val === null || val === undefined) {
          val = '';
        }
        if (h.type === 'date' && val) {
          val = new Date(val).toLocaleString('en-IN');
        }
        if (h.type === 'currency' && val !== '') {
          val = (val / 100).toFixed(2);
        }
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvString = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadIncomeReport = () => {
    const headers = [
      { label: 'Client Name', key: 'userId.name' },
      { label: 'Client Email', key: 'userId.email' },
      { label: 'Plan / Package', key: 'plan' },
      { label: 'Amount (INR)', key: 'amount', type: 'currency' },
      { label: 'Status', key: 'status' },
      { label: 'Razorpay Order ID', key: 'razorpayOrderId' },
      { label: 'Razorpay Payment ID', key: 'razorpayPaymentId' },
      { label: 'Transaction Date', key: 'createdAt', type: 'date' }
    ];
    downloadCSV(payments, `income_report_${new Date().toISOString().slice(0, 10)}.csv`, headers);
  };

  const handleDownloadClientsReport = () => {
    const headers = [
      { label: 'Client Name', key: 'name' },
      { label: 'Client Email', key: 'email' },
      { label: 'Resumes Created', key: 'resumeCount' },
      { label: 'Payments Completed', key: 'completedPaymentCount' },
      { label: 'Allowed Resumes Credit', key: 'allowedResumesCount' },
      { label: 'Allowed Cover Letters Credit', key: 'allowedCoverLettersCount' },
      { label: 'Joined Date', key: 'createdAt', type: 'date' }
    ];
    downloadCSV(users, `clients_directory_${new Date().toISOString().slice(0, 10)}.csv`, headers);
  };

  const handleDownloadInvoice = async (payment) => {
    if (!payment || !payment._id) return;
    setDownloadingInvoiceId(payment._id);
    try {
      const response = await api.get(`/payments/${payment._id}/invoice`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = `invoice_${payment.razorpayPaymentId || payment._id}.pdf`;
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to download invoice PDF. Make sure the backend server and LaTeX compilation service are running.');
    } finally {
      setDownloadingInvoiceId(null);
    }
  };

  // ── UPDATE USER CREDITS ──────────────────────────────
  const openCreditModal = (user) => {
    setSelectedUser(user);
    setResumesInput(user.allowedResumesCount);
    setLettersInput(user.allowedCoverLettersCount);
    setShowCreditModal(true);
  };

  const handleUpdateCreditsSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsUpdatingCredits(true);
    try {
      const res = await api.post(`/users/${selectedUser._id}/credits`, {
        allowedResumesCount: parseInt(resumesInput, 10),
        allowedCoverLettersCount: parseInt(lettersInput, 10)
      });
      if (res.data.success) {
        // Update local state
        setUsers(users.map(u => u._id === selectedUser._id ? {
          ...u,
          allowedResumesCount: parseInt(resumesInput, 10),
          allowedCoverLettersCount: parseInt(lettersInput, 10)
        } : u));
        setShowCreditModal(false);
        setSelectedUser(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update credits');
    } finally {
      setIsUpdatingCredits(false);
    }
  };

  // ── DELETE USER ─────────────────────────────────────
  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setIsDeletingUser(true);
    try {
      await api.delete(`/users/${userToDelete._id}`);
      setUsers(users.filter(u => u._id !== userToDelete._id));
      setPayments(payments.filter(p => p.userId?._id !== userToDelete._id));
      setShowDeleteModal(false);
      setUserToDelete(null);
      // Refresh analytics in background
      api.get('/analytics').then(res => setAnalytics(res.data.analytics)).catch(e => console.error(e));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setIsDeletingUser(false);
    }
  };

  // Filters and Queries
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchUser.toLowerCase())
  );

  const filteredPayments = payments.filter(p => {
    const email = p.userId?.email || '';
    const name = p.userId?.name || '';
    const paymentId = p.razorpayPaymentId || '';
    const matchesSearch = email.toLowerCase().includes(searchPayment.toLowerCase()) || 
                          name.toLowerCase().includes(searchPayment.toLowerCase()) ||
                          paymentId.toLowerCase().includes(searchPayment.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesPlan = planFilter === 'all' || p.plan === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── TOP NAV ────────────────────────────────────── */}
      <header className="glass-card border-b border-white/5 px-6 py-4 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-xl font-bold text-white tracking-tight flex items-center gap-1.5">
              Cvraft
              <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/35 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Owner Portal</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-sm text-slate-400 font-medium">Logged in: {adminEmail}</span>
            <button
              onClick={fetchDashboardData}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600/90 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:py-8 flex flex-col gap-6">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-white/5 gap-2 pb-px overflow-x-auto">
          {[
            { id: 'analytics', label: 'Dashboard & Analytics', icon: TrendingUp },
            { id: 'users', label: 'Client Management', icon: Users },
            { id: 'payments', label: 'Transaction Logs', icon: FileText }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3.5 border-b-2 font-bold text-sm transition focus:outline-none whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="bg-red-950/40 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-slate-400 text-sm font-medium">Aggregating system logs...</p>
          </div>
        ) : (
          <>
            {/* ── ANALYTICS VIEW ──────────────────────────── */}
            {activeTab === 'analytics' && analytics && (
              <div className="space-y-6">
                
                {/* Header section with Income CSV Report Export */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/30 p-5 rounded-2xl border border-white/5">
                  <div>
                    <h2 className="text-xl font-bold text-white">System Analytics</h2>
                    <p className="text-xs text-slate-400">Real-time revenue, client conversion and operational metrics</p>
                  </div>
                  <button
                    onClick={handleDownloadIncomeReport}
                    className="flex items-center gap-2 bg-emerald-600/90 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Income Report (CSV)</span>
                  </button>
                </div>
                
                {/* Analytics Key Metrics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Total Income Card */}
                  <div className="glass-card rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col">
                    <div className="absolute right-4 top-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-2.5 rounded-xl">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Revenue</span>
                    <span className="text-2xl md:text-3xl font-black text-emerald-400 mt-2">
                      ₹{analytics.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1 font-medium">All cleared invoices</span>
                  </div>

                  {/* Total Users Card */}
                  <div className="glass-card rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col">
                    <div className="absolute right-4 top-4 bg-blue-500/10 border border-blue-500/20 text-blue-400 p-2.5 rounded-xl">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Clients</span>
                    <span className="text-2xl md:text-3xl font-black text-white mt-2">
                      {analytics.totalUsers.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1 font-medium">Registered user base</span>
                  </div>

                  {/* Resumes Generated Card */}
                  <div className="glass-card rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col">
                    <div className="absolute right-4 top-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 p-2.5 rounded-xl">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Resumes Created</span>
                    <span className="text-2xl md:text-3xl font-black text-white mt-2">
                      {analytics.totalResumes.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1 font-medium">AI generated database</span>
                  </div>

                  {/* Total Purchases Card */}
                  <div className="glass-card rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col">
                    <div className="absolute right-4 top-4 bg-purple-500/10 border border-purple-500/20 text-purple-400 p-2.5 rounded-xl">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Paid Invoices</span>
                    <span className="text-2xl md:text-3xl font-black text-white mt-2">
                      {analytics.totalPayments.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1 font-medium">Successful purchases</span>
                  </div>
                </div>

                {/* Daily Income Trend & Plan Breakdown */}
                <div className="grid lg:grid-cols-3 gap-6">
                  
                  {/* Daily Income Graph Card */}
                  <div className="lg:col-span-2 glass-card rounded-2xl p-5 flex flex-col">
                    <div className="mb-4">
                      <h3 className="text-base font-bold text-white">Daily Income Trend</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Chronological sales revenue history</p>
                    </div>
                    <div className="h-64 mt-2">
                      {analytics.dailyIncomeTrend.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-500 text-xs">No records available</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={analytics.dailyIncomeTrend}>
                            <defs>
                              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                            <XAxis dataKey="_id" stroke="#64748b" fontSize={10} tickLine={false} />
                            <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} unit="₹" />
                            <Tooltip
                              contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                              labelStyle={{ fontSize: '10px', color: '#94a3b8', fontWeight: 'bold' }}
                              itemStyle={{ fontSize: '12px', color: '#3b82f6' }}
                              formatter={(value) => [`₹${value}`, 'Revenue']}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* Plan Sales Breakdown Card */}
                  <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">Package Breakdown</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Volume share per pricing tier</p>
                    </div>
                    <div className="space-y-4 my-6">
                      {[
                        { label: 'Basic Plan (₹149)', value: analytics.planStats.basic.count, revenue: analytics.planStats.basic.revenue, color: 'bg-slate-400' },
                        { label: 'Pro Plan (₹249)', value: analytics.planStats.pro.count, revenue: analytics.planStats.pro.revenue, color: 'bg-blue-500' },
                        { label: 'Bundle Plan (₹349)', value: analytics.planStats.bundle.count, revenue: analytics.planStats.bundle.revenue, color: 'bg-purple-500' }
                      ].map((item) => {
                        const total = analytics.totalPayments || 1;
                        const percentage = ((item.value / total) * 100).toFixed(1);
                        return (
                          <div key={item.label} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-semibold text-slate-300">
                              <span>{item.label}</span>
                              <span>{item.value} sold ({percentage}%)</span>
                            </div>
                            <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                              <div className={`h-full ${item.color} rounded-full`} style={{ width: `${percentage}%` }} />
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium text-right">
                              Revenue: ₹{item.revenue.toLocaleString()}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="border-t border-white/5 pt-3 text-[10px] text-slate-500 flex justify-between">
                      <span>Total sales volume</span>
                      <span className="font-bold text-slate-400">{analytics.totalPayments} invoices</span>
                    </div>
                  </div>
                </div>

                {/* Recent Purchases List */}
                <div className="glass-card rounded-2xl p-5">
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-white">Recent Transactions</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Last 10 completed orders</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead>
                        <tr>
                          <th className="pb-3 pl-2">Client</th>
                          <th className="pb-3">Plan</th>
                          <th className="pb-3">Amount</th>
                          <th className="pb-3">Razorpay ID</th>
                          <th className="pb-3">Purchased At</th>
                          <th className="pb-3 pr-2 text-center">Invoice</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.recentPayments.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="py-6 text-center text-slate-500 text-xs">No transactions found</td>
                          </tr>
                        ) : (
                          analytics.recentPayments.map((p) => (
                            <tr key={p._id} className="hover:bg-white/[0.01]">
                              <td className="py-3 pl-2">
                                <div className="font-bold text-white">{p.userId?.name || 'Deleted User'}</div>
                                <div className="text-xs text-slate-500">{p.userId?.email || 'N/A'}</div>
                              </td>
                              <td className="py-3">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase border ${
                                  p.plan === 'bundle'
                                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                    : p.plan === 'pro'
                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                    : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                }`}>
                                  {p.plan}
                                </span>
                              </td>
                              <td className="py-3 font-bold text-slate-200">₹{p.amount / 100}</td>
                              <td className="py-3 text-xs text-slate-400 font-mono">{p.razorpayPaymentId || 'N/A'}</td>
                              <td className="py-3 text-xs text-slate-500">
                                {new Date(p.createdAt).toLocaleString('en-IN', {
                                  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                })}
                              </td>
                              <td className="py-3 pr-2 text-center">
                                {p.status === 'paid' ? (
                                  <button
                                    onClick={() => handleDownloadInvoice(p)}
                                    disabled={downloadingInvoiceId === p._id}
                                    className="p-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 transition disabled:opacity-50 inline-flex items-center justify-center"
                                    title="Download PDF Invoice"
                                  >
                                    {downloadingInvoiceId === p._id ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Download className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                ) : (
                                  <span className="text-xs text-slate-600 font-medium">—</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* ── CLIENTS VIEW ────────────────────────────── */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                
                {/* Search Bar */}
                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                  <div className="flex-1 glass-card rounded-2xl p-4 flex items-center gap-3">
                    <Search className="w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      value={searchUser}
                      onChange={(e) => setSearchUser(e.target.value)}
                      placeholder="Search clients by name or email..."
                      className="flex-1 bg-transparent border-none text-sm focus:ring-0 focus:outline-none p-1 placeholder-slate-500"
                    />
                    {searchUser && (
                      <button onClick={() => setSearchUser('')} className="text-slate-400 hover:text-white text-xs">Clear</button>
                    )}
                  </div>
                  <button
                    onClick={handleDownloadClientsReport}
                    className="flex items-center justify-center gap-2 bg-blue-600/90 hover:bg-blue-600 text-white px-5 py-4 rounded-2xl text-sm font-bold shadow-md transition whitespace-nowrap"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Directory (CSV)</span>
                  </button>
                </div>

                {/* Clients Table Card */}
                <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead>
                        <tr className="bg-white/[0.02]">
                          <th className="py-4 pl-6">Client Info</th>
                          <th className="py-4">Resumes</th>
                          <th className="py-4">Purchased</th>
                          <th className="py-4">Credits</th>
                          <th className="py-4">Joined Date</th>
                          <th className="py-4 pr-6 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="py-10 text-center text-slate-500 text-sm">No clients match search criteria</td>
                          </tr>
                        ) : (
                          filteredUsers.map((u) => (
                            <tr key={u._id} className="hover:bg-white/[0.01]">
                              <td className="py-4 pl-6">
                                <div className="font-bold text-white text-sm">{u.name}</div>
                                <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                                  <span>{u.email}</span>
                                </div>
                              </td>
                              <td className="py-4 font-semibold text-slate-200">{u.resumeCount} templates</td>
                              <td className="py-4">
                                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                                  u.completedPaymentCount > 0
                                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                    : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                }`}>
                                  {u.completedPaymentCount > 0 ? `Paid (${u.completedPaymentCount})` : 'Unpaid'}
                                </span>
                              </td>
                              <td className="py-4">
                                <div className="text-xs text-slate-300">
                                  Resumes: <strong className="text-blue-400">{u.allowedResumesCount}</strong>
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">
                                  Cover Letters: <strong className="text-purple-400">{u.allowedCoverLettersCount}</strong>
                                </div>
                              </td>
                              <td className="py-4 text-xs text-slate-500">
                                {new Date(u.createdAt).toLocaleDateString('en-IN', {
                                  day: '2-digit', month: 'short', year: 'numeric'
                                })}
                              </td>
                              <td className="py-4 pr-6 text-center">
                                <div className="flex justify-center items-center gap-2">
                                  <button
                                    onClick={() => openCreditModal(u)}
                                    className="p-2 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 transition"
                                    title="Edit Credits"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => openDeleteModal(u)}
                                    className="p-2 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-400 transition"
                                    title="Delete Client"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* ── TRANSACTIONS VIEW ────────────────────────── */}
            {activeTab === 'payments' && (
              <div className="space-y-4">
                
                {/* Search & Filters */}
                <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
                  <div className="flex-1 flex items-center gap-3 bg-slate-900/40 border border-white/5 rounded-xl px-4 py-2.5">
                    <Search className="w-5 h-5 text-slate-500 flex-shrink-0" />
                    <input
                      type="text"
                      value={searchPayment}
                      onChange={(e) => setSearchPayment(e.target.value)}
                      placeholder="Search transactions by user name, email, or Payment ID..."
                      className="flex-1 bg-transparent border-none text-sm focus:ring-0 focus:outline-none p-0.5 placeholder-slate-500"
                    />
                    {searchPayment && (
                      <button onClick={() => setSearchPayment('')} className="text-slate-400 hover:text-white text-xs">Clear</button>
                    )}
                  </div>
                  
                  <div className="flex gap-3 flex-wrap items-center">
                    
                    {/* Status filter */}
                    <div className="flex items-center gap-2 bg-slate-900/40 border border-white/5 rounded-xl px-3 py-1.5">
                      <Sliders className="w-3.5 h-3.5 text-slate-500" />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-transparent text-xs border-none p-0.5 pr-6 font-semibold focus:ring-0 cursor-pointer"
                      >
                        <option value="all" className="bg-slate-900">All Statuses</option>
                        <option value="paid" className="bg-slate-900 text-green-400">Paid</option>
                        <option value="created" className="bg-slate-900 text-yellow-400">Created</option>
                        <option value="failed" className="bg-slate-900 text-red-400">Failed</option>
                      </select>
                    </div>

                    {/* Plan filter */}
                    <div className="flex items-center gap-2 bg-slate-900/40 border border-white/5 rounded-xl px-3 py-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <select
                        value={planFilter}
                        onChange={(e) => setPlanFilter(e.target.value)}
                        className="bg-transparent text-xs border-none p-0.5 pr-6 font-semibold focus:ring-0 cursor-pointer"
                      >
                        <option value="all" className="bg-slate-900">All Packages</option>
                        <option value="basic" className="bg-slate-900">Basic (₹149)</option>
                        <option value="pro" className="bg-slate-900">Pro (₹249)</option>
                        <option value="bundle" className="bg-slate-900">Bundle (₹349)</option>
                      </select>
                    </div>

                    <button
                      onClick={handleDownloadIncomeReport}
                      className="flex items-center gap-2 bg-emerald-600/90 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition whitespace-nowrap"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Report (CSV)</span>
                    </button>
                  </div>
                </div>

                {/* Transactions Table Card */}
                <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead>
                        <tr className="bg-white/[0.02]">
                          <th className="py-4 pl-6">Client</th>
                          <th className="py-4">Plan Package</th>
                          <th className="py-4">Amount</th>
                          <th className="py-4">Status</th>
                          <th className="py-4">Razorpay Order ID</th>
                          <th className="py-4">Razorpay Payment ID</th>
                          <th className="py-4">Transaction Date</th>
                          <th className="py-4 pr-6 text-center">Invoice</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPayments.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="py-12 text-center text-slate-500 text-sm">No transaction history matching parameters</td>
                          </tr>
                        ) : (
                          filteredPayments.map((p) => (
                            <tr key={p._id} className="hover:bg-white/[0.01]">
                              <td className="py-4 pl-6">
                                <div className="font-bold text-white text-sm">{p.userId?.name || 'Deleted Account'}</div>
                                <div className="text-xs text-slate-500 mt-0.5">{p.userId?.email || 'N/A'}</div>
                              </td>
                              <td className="py-4">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                  p.plan === 'bundle'
                                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                    : p.plan === 'pro'
                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                    : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                } uppercase`}>
                                  {p.plan}
                                </span>
                              </td>
                              <td className="py-4 font-bold text-slate-200">₹{p.amount / 100}</td>
                              <td className="py-4">
                                <div className="flex items-center gap-1.5">
                                  {p.status === 'paid' ? (
                                    <span className="flex items-center gap-1 text-xs text-green-400 font-semibold bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                                      <CheckCircle className="w-3.5 h-3.5" />
                                      Paid
                                    </span>
                                  ) : p.status === 'failed' ? (
                                    <span className="flex items-center gap-1 text-xs text-red-400 font-semibold bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                                      <XCircle className="w-3.5 h-3.5" />
                                      Failed
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1 text-xs text-yellow-400 font-semibold bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full">
                                      <AlertCircle className="w-3.5 h-3.5" />
                                      Pending
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 text-xs text-slate-400 font-mono">{p.razorpayOrderId}</td>
                              <td className="py-4 text-xs text-slate-400 font-mono">{p.razorpayPaymentId || '—'}</td>
                              <td className="py-4 text-xs text-slate-500">
                                {new Date(p.createdAt).toLocaleString('en-IN', {
                                  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                              </td>
                              <td className="py-4 pr-6 text-center">
                                {p.status === 'paid' ? (
                                  <button
                                    onClick={() => handleDownloadInvoice(p)}
                                    disabled={downloadingInvoiceId === p._id}
                                    className="p-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 transition disabled:opacity-50 inline-flex items-center justify-center"
                                    title="Download PDF Invoice"
                                  >
                                    {downloadingInvoiceId === p._id ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Download className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                ) : (
                                  <span className="text-xs text-slate-600 font-medium">—</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}
          </>
        )}
      </main>

      {/* ── UPDATE CREDITS MODAL ────────────────────────── */}
      {showCreditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6 backdrop-blur-sm">
          <div className="glass-card rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
            <div>
              <h3 className="text-xl font-extrabold text-white">Modify Client Credits</h3>
              <p className="text-xs text-slate-400 mt-1">Editing credits for: {selectedUser.name}</p>
            </div>
            
            <form onSubmit={handleUpdateCreditsSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Allowed Resumes</label>
                <input
                  type="number"
                  min="0"
                  value={resumesInput}
                  onChange={(e) => setResumesInput(parseInt(e.target.value, 10) || 0)}
                  className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Allowed Cover Letters</label>
                <input
                  type="number"
                  min="0"
                  value={lettersInput}
                  onChange={(e) => setLettersInput(parseInt(e.target.value, 10) || 0)}
                  className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowCreditModal(false); setSelectedUser(null); }}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 font-semibold text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingCredits}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
                >
                  {isUpdatingCredits ? 'Saving...' : 'Apply Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CLIENT CONFIRMATION MODAL ────────────── */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6 backdrop-blur-sm">
          <div className="glass-card rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white">Delete Client Account?</h3>
              <p className="text-sm text-slate-400 mt-2">
                This will permanently delete <strong>{userToDelete.name}</strong>, all their CV templates, cover letters, and payment logs from the database.
              </p>
              <p className="text-xs text-red-400 font-semibold mt-3">⚠️ This action is irreversible!</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setShowDeleteModal(false); setUserToDelete(null); }}
                className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 font-semibold text-sm transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeletingUser}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
              >
                {isDeletingUser ? 'Deleting...' : 'Delete Client'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER ─────────────────────────────────────── */}
      <footer className="glass-card border-t border-white/5 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>© 2026 Cvraft. Operational Administration Panel.</span>
          <span>Queries: <a href="mailto:synchabit@gmail.com" className="text-blue-500 hover:underline">synchabit@gmail.com</a></span>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
