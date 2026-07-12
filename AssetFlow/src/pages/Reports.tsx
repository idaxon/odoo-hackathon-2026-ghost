import { FileText, Download, Play, RefreshCw, BarChart2, PieChart, TrendingUp } from 'lucide-react';

interface Report {
  id: string;
  name: string;
  description: string;
  lastGenerated: string;
  fileSize: string;
  category: string;
}

export default function Reports() {
  const reports: Report[] = [
    { id: 'REP-001', name: 'Asset Valuation & Depreciation', description: 'Calculates the current net value of all physical assets using straight-line depreciation.', lastGenerated: '2026-07-01 02:00', fileSize: '1.4 MB', category: 'Finance' },
    { id: 'REP-002', name: 'Equipment Utilization Analytics', description: 'Detailed reports showing booking frequencies and active utilization rates of shared devices.', lastGenerated: '2026-07-10 18:30', fileSize: '820 KB', category: 'Operations' },
    { id: 'REP-003', name: 'Maintenance Cost & Breakdown Log', description: 'Total cost analysis of repairs, parts replacements, and third-party calibration services.', lastGenerated: '2026-07-12 08:15', fileSize: '2.1 MB', category: 'Maintenance' },
    { id: 'REP-004', name: 'Lost or Damaged Asset Auditing', description: 'Incidents log highlighting missing hardware, writing-off status, and replacement tracking.', lastGenerated: '2026-06-30 23:59', fileSize: '340 KB', category: 'Compliance' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">System Reports</h1>
          <p className="text-sm text-text-muted">Generate financial audits, utilization reports, and equipment failure analysis logs.</p>
        </div>
        <button className="btn-primary">
          <RefreshCw size={16} /> Refresh Metrics
        </button>
      </div>

      {/* Grid of Report Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-premium p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Asset Capital Expense</span>
            <BarChart2 size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text">$348,200</p>
            <p className="text-xs text-text-muted">+14.2% from last fiscal year</p>
          </div>
        </div>
        <div className="card-premium p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Active Resource Load</span>
            <TrendingUp size={18} className="text-[#017E84]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text">84.2%</p>
            <p className="text-xs text-text-muted">Peak capacity load on Monday</p>
          </div>
        </div>
        <div className="card-premium p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Avg Maintenance Time</span>
            <PieChart size={18} className="text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text">1.8 Days</p>
            <p className="text-xs text-text-muted">-0.4 days improvement MoM</p>
          </div>
        </div>
      </div>

      {/* Available Reports list */}
      <div className="space-y-3">
        <h3 className="font-semibold text-text text-base">Analytical Report Exports</h3>
        <div className="grid grid-cols-1 gap-4">
          {reports.map((report) => (
            <div key={report.id} className="card-premium p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                    Last Compiled: {report.lastGenerated} &bull; File Size: {report.fileSize}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5">
                  <Play size={13} /> Run Report
                </button>
                <button className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5">
                  <Download size={13} /> Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
