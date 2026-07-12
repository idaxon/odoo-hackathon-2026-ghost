import { useState, useEffect } from 'react';
import { ShieldAlert, Plus, Wrench, CheckCircle2, User, X, AlertCircle } from 'lucide-react';
import { api } from '../api';

interface MaintenanceRequest {
  id: number;
  asset_id: number;
  raised_by: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  created_at: string;
  resolved_at: string | null;
  asset_name: string;
  asset_code: string;
}

interface AssetOption {
  id: number;
  name: string;
  asset_code: string;
}

export default function Maintenance() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [assets, setAssets] = useState<AssetOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Form State
  const [selectedAssetId, setSelectedAssetId] = useState<number | ''>('');
  const [formRaisedBy, setFormRaisedBy] = useState('Daksh Mishra');
  const [formPriority, setFormPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [formDesc, setFormDesc] = useState('');

  // Resolve Confirmation State
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceRequest | null>(null);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [scannedCode, setScannedCode] = useState('');
  const [verifyStatus, setVerifyStatus] = useState<'none' | 'success' | 'fail'>('none');

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await api.getMaintenanceRequests();
      setRequests(data || []);
      
      const assetList = await api.getAssets();
      setAssets(assetList || []);
      if (assetList && assetList.length > 0) {
        setSelectedAssetId(assetList[0].id);
      }
    } catch (err) {
      console.error('Failed to load maintenance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleResolveClick = (ticket: MaintenanceRequest) => {
    setSelectedTicket(ticket);
    setResolutionNotes('');
    setScannedCode('');
    setVerifyStatus('none');
    setIsResolveModalOpen(true);
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    try {
      await api.resolveMaintenanceRequest(selectedTicket.id, {
        resolution_notes: resolutionNotes,
        scanned_code: scannedCode
      });
      setIsResolveModalOpen(false);
      setSelectedTicket(null);
      loadRequests();
    } catch (error) {
      console.error('Failed to resolve maintenance request:', error);
    }
  };

  const handleSimulateScan = () => {
    if (!selectedTicket) return;
    setScannedCode(selectedTicket.asset_code);
    setVerifyStatus('success');
  };

  const handleCodeChange = (val: string) => {
    setScannedCode(val);
    if (!selectedTicket) return;
    if (val.trim() === '') {
      setVerifyStatus('none');
    } else if (val.trim() === selectedTicket.asset_code) {
      setVerifyStatus('success');
    } else {
      setVerifyStatus('fail');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId) return;

    try {
      const payload = {
        asset_id: Number(selectedAssetId),
        raised_by: formRaisedBy,
        priority: formPriority,
        description: formDesc
      };

      await api.createMaintenanceRequest(payload);
      setIsPanelOpen(false);
      setFormDesc('');
      loadRequests();
    } catch (err) {
      console.error('Failed to report issue:', err);
    }
  };

  const getPriorityStyle = (priority: MaintenanceRequest['priority']) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'High':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Low':
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusStyle = (status: MaintenanceRequest['status']) => {
    switch (status) {
      case 'Pending':
        return 'text-blue-600 border border-blue-200 bg-blue-50/50';
      case 'In Progress':
        return 'text-amber-600 border border-amber-200 bg-amber-50/50';
      case 'Resolved':
        return 'text-green-600 border border-green-200 bg-green-50/50';
    }
  };

  // Derived metrics counts
  const criticalCount = requests.filter(r => r.priority === 'Critical' && r.status !== 'Resolved').length;
  const pendingCount = requests.filter(r => r.status !== 'Resolved').length;
  const resolvedCount = requests.filter(r => r.status === 'Resolved').length;

  return (
    <div className="space-y-6 max-w-5xl font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Maintenance & Repairs</h1>
          <p className="text-sm text-text-muted">Schedule calibration, manage tickets, and assign technicians to faulty hardware.</p>
        </div>
        <button 
          onClick={() => setIsPanelOpen(true)}
          className="btn-primary"
        >
          <Plus size={16} /> Log Issue
        </button>
      </div>

      {/* Task Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-premium p-4 flex items-center gap-3 bg-white">
          <div className="p-2 bg-red-50 text-red-600 rounded">
            <ShieldAlert size={20} />
          </div>
          <div>
            <p className="text-xs text-text-muted font-medium">Critical Issues</p>
            <p className="text-xl font-bold text-text">
              {loading ? '-' : `${criticalCount} Open`}
            </p>
          </div>
        </div>
        <div className="card-premium p-4 flex items-center gap-3 bg-white">
          <div className="p-2 bg-amber-50 text-amber-600 rounded">
            <Wrench size={20} />
          </div>
          <div>
            <p className="text-xs text-text-muted font-medium">Pending Tasks</p>
            <p className="text-xl font-bold text-text">
              {loading ? '-' : `${pendingCount} Tickets`}
            </p>
          </div>
        </div>
        <div className="card-premium p-4 flex items-center gap-3 bg-white">
          <div className="p-2 bg-green-50 text-green-600 rounded">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-xs text-text-muted font-medium">Resolved Tickets</p>
            <p className="text-xl font-bold text-text">
              {loading ? '-' : `${resolvedCount} Resolved`}
            </p>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="card-premium overflow-hidden bg-white">
        <div className="px-5 py-4 border-b border-border-light bg-gray-50/50">
          <h3 className="font-semibold text-text">Maintenance Log</h3>
        </div>
        <div className="divide-y divide-border-light">
          {loading ? (
            // Skeletons list
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-5 h-20 w-full skeleton-pulse rounded-none"></div>
            ))
          ) : (
            requests.map((request) => (
              <div key={request.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/20">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-semibold text-text-muted">{request.asset_code}</span>
                    <span className="font-semibold text-text text-sm">&bull; {request.asset_name}</span>
                    <span className={`tag-status border ${getPriorityStyle(request.priority)}`}>
                      {request.priority} Priority
                    </span>
                  </div>
                  <p className="text-sm text-text font-medium">{request.description}</p>
                  <div className="flex items-center gap-4 text-xs text-text-muted">
                    <span className="flex items-center gap-1 font-medium">
                      <User size={13} /> Raised By: {request.raised_by}
                    </span>
                    <span>Reported: {request.created_at}</span>
                    {request.resolved_at && (
                      <span className="text-green-600 font-semibold">Resolved: {request.resolved_at}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-between sm:justify-end">
                  <span className={`tag-status text-xs py-1 px-2.5 font-semibold ${getStatusStyle(request.status)}`}>
                    {request.status}
                  </span>
                  {request.status !== 'Resolved' ? (
                    <button 
                      onClick={() => handleResolveClick(request)}
                      className="btn-secondary py-1.5 px-3 text-xs text-secondary border-secondary/20 hover:bg-secondary/5 font-semibold"
                    >
                      Resolve Issue
                    </button>
                  ) : (
                    <div className="w-[84px]"></div> // Placeholder alignment
                  )}
                </div>
              </div>
            ))
          )}
          {!loading && requests.length === 0 && (
            <div className="p-12 text-center text-text-muted text-sm">
              No maintenance requests reported in system logs.
            </div>
          )}
        </div>
      </div>

      {/* Sliding Side Panel Drawer (Right-aligned) */}
      {isPanelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop overlay */}
          <div 
            className="absolute inset-0 bg-black/30 transition-opacity" 
            onClick={() => setIsPanelOpen(false)}
          ></div>

          {/* Drawer Body */}
          <div className="relative w-full max-w-md bg-surface shadow-xl h-full flex flex-col justify-between border-l border-border-light z-10 animate-slide-in">
            {/* Header */}
            <div className="h-16 border-b border-border-light flex items-center justify-between px-6 bg-gray-50/50">
              <h3 className="font-bold text-text text-base">Report Hardware Issue</h3>
              <button 
                onClick={() => setIsPanelOpen(false)} 
                className="text-text-muted hover:text-text p-1.5 rounded hover:bg-gray-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Form */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <form id="maintenance-report-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-muted font-medium">Faulty Asset *</label>
                  <select 
                    required
                    className="input-premium w-full text-sm"
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(Number(e.target.value))}
                  >
                    {assets.map(asset => (
                      <option key={asset.id} value={asset.id}>
                        {asset.name} ({asset.asset_code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-muted font-medium">Raised By *</label>
                    <input 
                      type="text" 
                      required 
                      className="input-premium w-full text-sm" 
                      value={formRaisedBy}
                      onChange={(e) => setFormRaisedBy(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-muted font-medium">Priority *</label>
                    <select 
                      className="input-premium w-full text-sm" 
                      value={formPriority}
                      onChange={(e) => setFormPriority(e.target.value as any)}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-muted font-medium">Description of Issue *</label>
                  <textarea 
                    required 
                    rows={4}
                    placeholder="Describe the failure symptoms, temperature errors, leaks or noise issues..."
                    className="input-premium w-full text-sm" 
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                  />
                </div>

                <div className="p-3 bg-red-50 border border-red-100 rounded text-[11px] text-red-700 flex items-start gap-1.5 leading-relaxed">
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  <span>On confirm, the asset condition index status transitions to <strong>Maintenance</strong>. Technicians are alerted.</span>
                </div>
              </form>
            </div>

            {/* Footer containing action buttons */}
            <div className="h-16 border-t border-border-light flex items-center justify-end px-6 gap-2 bg-gray-50/50">
              <button 
                type="button" 
                onClick={() => setIsPanelOpen(false)} 
                className="btn-secondary py-1.5 px-4 text-xs font-medium"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="maintenance-report-form" 
                className="btn-primary py-1.5 px-4 text-xs font-semibold"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Resolve Confirmation Dialog Modal */}
      {isResolveModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsResolveModalOpen(false)}></div>
          
          {/* Modal Container */}
          <div className="bg-white rounded shadow-xl border border-border-light w-full max-w-md overflow-hidden relative z-10 animate-scale-up font-sans">
            {/* Header */}
            <div className="h-14 border-b border-border-light flex items-center justify-between px-6 bg-gray-50/50">
              <h3 className="font-bold text-text text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Wrench size={14} className="text-secondary" /> Resolve Ticket #{selectedTicket.id}
              </h3>
              <button 
                onClick={() => setIsResolveModalOpen(false)}
                className="text-text-muted hover:text-text p-1.5 rounded hover:bg-gray-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleResolveSubmit}>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted block">Asset under Maintenance</span>
                  <p className="text-sm font-semibold text-text">{selectedTicket.asset_name} ({selectedTicket.asset_code})</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-muted">Resolution Description / Actions Taken *</label>
                  <textarea
                    required
                    rows={3}
                    className="input-premium w-full text-sm"
                    placeholder="e.g. Cleared paper jam, replaced roller, ran test sheets..."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">Confirm Asset QR Verification (Optional)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="input-premium flex-1 text-sm font-mono"
                      placeholder="Scan or type Asset ID code..."
                      value={scannedCode}
                      onChange={(e) => handleCodeChange(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={handleSimulateScan}
                      className="btn-secondary py-1.5 px-3 text-xs font-semibold bg-gray-50 border-border-light hover:bg-gray-100"
                    >
                      Simulate Scan
                    </button>
                  </div>

                  {verifyStatus === 'success' && (
                    <p className="text-[10px] font-semibold text-green-700 flex items-center gap-1 mt-1">
                      <CheckCircle2 size={12} /> Asset verification matches. Match confirmed.
                    </p>
                  )}
                  {verifyStatus === 'fail' && (
                    <p className="text-[10px] font-semibold text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle size={12} /> Warning: Scanned code does not match ticket asset code ({selectedTicket.asset_code}).
                    </p>
                  )}
                </div>

                <div className="p-3 bg-gray-50 border border-border-light rounded text-[10px] text-text-muted leading-relaxed">
                  <strong>Handoff:</strong> Setting status to Resolved updates virtual diagnostics health back to 95% and appends this event block directly inside the digital twin lifecycle timeline.
                </div>
              </div>

              {/* Footer Actions */}
              <div className="h-14 border-t border-border-light flex items-center justify-end px-6 gap-2 bg-gray-50/50">
                <button
                  type="button"
                  onClick={() => setIsResolveModalOpen(false)}
                  className="btn-secondary py-1.5 px-4 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary py-1.5 px-4 text-xs font-semibold"
                >
                  Complete Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
