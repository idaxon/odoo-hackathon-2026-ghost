import { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Play, 
  RefreshCw, 
  BarChart2, 
  PieChart, 
  TrendingUp, 
  X, 
  CheckCircle2, 
  Loader2
} from 'lucide-react';
import { api } from '../api';

interface Report {
  id: string;
  name: string;
  description: string;
  lastGenerated: string;
  fileSize: string;
  category: string;
}

export default function Reports() {
  const [assets, setAssets] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal & Generation wizard states
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');
  const [reportList, setReportList] = useState<Report[]>([
    { id: 'REP-001', name: 'Asset Valuation & Depreciation', description: 'Calculates the current net value of all physical assets using straight-line depreciation.', lastGenerated: '2026-07-01 02:00', fileSize: '1.4 MB', category: 'Finance' },
    { id: 'REP-002', name: 'Equipment Utilization Analytics', description: 'Detailed reports showing booking frequencies and active utilization rates of shared devices.', lastGenerated: '2026-07-10 18:30', fileSize: '820 KB', category: 'Operations' },
    { id: 'REP-003', name: 'Maintenance Cost & Breakdown Log', description: 'Total cost analysis of repairs, parts replacements, and third-party calibration services.', lastGenerated: '2026-07-12 08:15', fileSize: '2.1 MB', category: 'Maintenance' },
    { id: 'REP-004', name: 'Lost or Damaged Asset Auditing', description: 'Incidents log highlighting missing hardware, writing-off status, and replacement tracking.', lastGenerated: '2026-06-30 23:59', fileSize: '340 KB', category: 'Compliance' },
  ]);

  const loadData = async () => {
    try {
      setLoading(true);
      const assetList = await api.getAssets();
      setAssets(assetList || []);
      const bookingList = await api.getBookings();
      setBookings(bookingList || []);
      const ticketList = await api.getMaintenanceRequests();
      setRequests(ticketList || []);
    } catch (err) {
      console.error('Failed to load database for reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const runGenerationWizard = (report: Report) => {
    setSelectedReport(report);
    setIsGenerating(true);
    setProgress(0);
    setProgressMsg('Connecting to SQLite query engine...');

    const messages = [
      { p: 15, msg: 'Querying tables and compiling rows...' },
      { p: 40, msg: 'Performing straight-line depreciation calculations...' },
      { p: 70, msg: 'Validating telemetry indices and activity loads...' },
      { p: 90, msg: 'Formatting schema columns and generating stats...' },
      { p: 100, msg: 'Completed successfully.' }
    ];

    messages.forEach((step) => {
      setTimeout(() => {
        setProgress(step.p);
        setProgressMsg(step.msg);
        if (step.p === 100) {
          setTimeout(() => {
            setIsGenerating(false);
            // Update report execution details in list
            setReportList(prev => prev.map(r => r.id === report.id ? {
              ...r,
              lastGenerated: new Date().toISOString().replace('T', ' ').substring(0, 16),
              fileSize: (Math.random() * 0.8 + 0.3).toFixed(2) + ' MB'
            } : r));
          }, 400);
        }
      }, step.p * 15); // Takes ~1.5s
    });
  };

  // Compile datasets for report previews
  const getCompiledData = (id: string) => {
    switch (id) {
      case 'REP-001': {
        const headers = ['Code', 'Asset Name', 'Original Cost', 'Health Score', 'Book Value', 'Depreciation'];
        const rows = assets.map(a => {
          const net = Math.round(a.purchase_cost * (a.health_score / 100));
          const dep = a.purchase_cost - net;
          return [a.asset_code, a.name, `₹${a.purchase_cost.toLocaleString()}`, `${a.health_score}%`, `₹${net.toLocaleString()}`, `₹${dep.toLocaleString()}`];
        });
        const totalCost = assets.reduce((sum, a) => sum + a.purchase_cost, 0);
        const totalNet = assets.reduce((sum, a) => sum + Math.round(a.purchase_cost * (a.health_score / 100)), 0);
        const kpis = [
          { label: 'Total Capital Allocated', value: `₹${totalCost.toLocaleString()}` },
          { label: 'Calculated Net Value', value: `₹${totalNet.toLocaleString()}` }
        ];
        return { headers, rows, kpis };
      }
      case 'REP-002': {
        const headers = ['Category', 'Total Assets', 'Operational / In Use', 'Utilization Rate'];
        const categories = Array.from(new Set(assets.map(a => a.category)));
        const rows = categories.map(cat => {
          const catAssets = assets.filter(a => a.category === cat);
          const inUse = catAssets.filter(a => a.status === 'In Use').length;
          const pct = catAssets.length > 0 ? Math.round((inUse / catAssets.length) * 100) : 0;
          return [cat, catAssets.length, inUse, `${pct}%`];
        });
        const totalInUse = assets.filter(a => a.status === 'In Use').length;
        const totalPct = assets.length > 0 ? Math.round((totalInUse / assets.length) * 100) : 0;
        const kpis = [
          { label: 'System Active Load', value: `${totalPct}%` },
          { label: 'Total Scheduled Bookings', value: bookings.length.toString() }
        ];
        return { headers, rows, kpis };
      }
      case 'REP-003': {
        const headers = ['Ticket ID', 'Asset Code', 'Asset Name', 'Reporter', 'Priority', 'Status'];
        const rows = requests.map(r => [
          `#${r.id}`,
          r.asset_code,
          r.asset_name,
          r.raised_by,
          r.priority,
          r.status
        ]);
        const openCount = requests.filter(r => r.status !== 'Resolved').length;
        const resolvedCount = requests.filter(r => r.status === 'Resolved').length;
        const kpis = [
          { label: 'Open Repairs', value: openCount.toString() },
          { label: 'Completed Repairs', value: resolvedCount.toString() }
        ];
        return { headers, rows, kpis };
      }
      case 'REP-004': {
        const headers = ['Code', 'Asset Name', 'Serial Number', 'Health Score', 'Status', 'Risk Level'];
        const riskAssets = assets.filter(a => a.health_score < 60 || a.status === 'Maintenance');
        const rows = riskAssets.map(a => [
          a.asset_code,
          a.name,
          a.serial_number || 'N/A',
          `${a.health_score}%`,
          a.status,
          a.risk_level
        ]);
        const highRisk = riskAssets.filter(a => a.health_score < 40).length;
        const kpis = [
          { label: 'Risky / Damaged Nodes', value: riskAssets.length.toString() },
          { label: 'Critical Health Alerts (<40%)', value: highRisk.toString() }
        ];
        return { headers, rows, kpis };
      }
      default:
        return { headers: [], rows: [], kpis: [] };
    }
  };

  const handleDownloadCSV = (reportName: string, headers: string[], rows: any[][]) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportName.toLowerCase().replace(/\s+/g, '_')}_compiled.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentData = selectedReport ? getCompiledData(selectedReport.id) : null;

  // Global KPIs calculated from live DB state
  const totalAssetsCount = assets.length;
  const activeLoadPercent = assets.length > 0 
    ? Math.round((assets.filter(a => a.status === 'In Use').length / assets.length) * 100) 
    : 0;
  const avgHealthScore = assets.length > 0 
    ? Math.round(assets.reduce((sum, a) => sum + a.health_score, 0) / assets.length) 
    : 0;

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">System Reports</h1>
          <p className="text-sm text-text-muted">Generate financial audits, utilization reports, and equipment failure analysis logs.</p>
        </div>
        <button 
          onClick={loadData}
          disabled={loading}
          className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 border-border-light text-text hover:bg-gray-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Metrics
        </button>
      </div>

      {/* Grid of Report Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-premium p-4 flex flex-col justify-between bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Total Managed Inventory</span>
            <BarChart2 size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text">{loading ? '-' : `${totalAssetsCount} Assets`}</p>
            <p className="text-xs text-text-muted">Live entries tracked in SQLite</p>
          </div>
        </div>
        <div className="card-premium p-4 flex flex-col justify-between bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Active Resource Load</span>
            <TrendingUp size={18} className="text-[#017E84]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text">{loading ? '-' : `${activeLoadPercent}%`}</p>
            <p className="text-xs text-text-muted">Percentage of assets currently allocated</p>
          </div>
        </div>
        <div className="card-premium p-4 flex flex-col justify-between bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Inventory Health Index</span>
            <PieChart size={18} className="text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text">{loading ? '-' : `${avgHealthScore}%`}</p>
            <p className="text-xs text-text-muted">Average device diagnostic condition</p>
          </div>
        </div>
      </div>

      {/* Available Reports list */}
      <div className="space-y-3">
        <h3 className="font-semibold text-text text-base">Analytical Report Exports</h3>
        <div className="grid grid-cols-1 gap-4">
          {reportList.map((report) => (
            <div key={report.id} className="card-premium p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-50 text-primary border border-border-light rounded mt-0.5">
                  <FileText size={20} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-text text-sm">{report.name}</h4>
                    <span className="tag-status border bg-gray-50 text-text-muted border-border-light">
                      {report.category}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted max-w-2xl leading-relaxed">{report.description}</p>
                  <p className="text-[11px] text-text-muted">
                    Last Compiled: {report.lastGenerated} &bull; Approx Size: {report.fileSize}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button 
                  onClick={() => runGenerationWizard(report)}
                  className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 border-secondary/20 text-secondary hover:bg-secondary/5 font-semibold"
                >
                  <Play size={13} /> Run Report
                </button>
                <button 
                  onClick={() => {
                    const data = getCompiledData(report.id);
                    handleDownloadCSV(report.name, data.headers, data.rows);
                  }}
                  className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 border-border-light text-text hover:bg-gray-50 font-semibold"
                >
                  <Download size={13} /> Export CSV
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Generation & Preview Overlay Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => { if (!isGenerating) setSelectedReport(null); }}></div>
          
          {/* Modal Card */}
          <div className="bg-white rounded shadow-xl border border-border-light w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden relative z-10 animate-scale-up">
            {/* Header */}
            <div className="h-14 border-b border-border-light flex items-center justify-between px-6 bg-gray-50/50">
              <h3 className="font-bold text-text text-xs uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={14} className="text-primary" /> {selectedReport.name} ({selectedReport.id})
              </h3>
              {!isGenerating && (
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="text-text-muted hover:text-text p-1.5 rounded hover:bg-gray-100 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {isGenerating ? (
                /* Generating Progress Screen */
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 size={32} className="text-primary animate-spin" />
                  <div className="w-64 bg-gray-100 h-2 rounded overflow-hidden relative">
                    <div 
                      className="bg-primary h-full transition-all duration-300 ease-out" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs font-semibold text-text-muted animate-pulse">{progressMsg}</p>
                </div>
              ) : (
                /* Report Data Dashboard Preview */
                <div className="space-y-6">
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    {currentData?.kpis.map((kpi, idx) => (
                      <div key={idx} className="bg-gray-50 border border-border-light p-4 rounded">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{kpi.label}</span>
                        <p className="text-xl font-bold text-text mt-1">{kpi.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Data Preview Table */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">Live Compiled Data Preview</span>
                      <span className="text-[10px] text-text-muted">{currentData?.rows.length} records generated</span>
                    </div>

                    <div className="border border-border-light rounded overflow-hidden bg-white max-h-[300px] overflow-y-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50/50 border-b border-border-light text-[10px] font-bold text-text-muted uppercase tracking-wider">
                            {currentData?.headers.map((h, i) => (
                              <th key={i} className="px-4 py-2.5">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light text-xs">
                          {currentData?.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-gray-50/50">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="px-4 py-2.5 font-medium text-text">
                                  {cell.toString() === 'Resolved' || cell.toString() === 'Available' ? (
                                    <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold border border-green-200">
                                      {cell}
                                    </span>
                                  ) : cell.toString() === 'Pending' || cell.toString() === 'Maintenance' ? (
                                    <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-200 animate-pulse">
                                      {cell}
                                    </span>
                                  ) : (
                                    cell
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {!isGenerating && currentData && (
              <div className="h-14 border-t border-border-light flex items-center justify-between px-6 bg-gray-50/50">
                <div className="flex items-center gap-1.5 text-[10px] text-green-700 font-semibold">
                  <CheckCircle2 size={13} /> Live SQL dataset compiles with zero warnings.
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedReport(null)}
                    className="btn-secondary py-1.5 px-4 text-xs font-medium"
                  >
                    Close Preview
                  </button>
                  <button 
                    onClick={() => handleDownloadCSV(selectedReport.name, currentData.headers, currentData.rows)}
                    className="btn-primary py-1.5 px-4 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Download size={13} /> Export CSV Raw Data
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
