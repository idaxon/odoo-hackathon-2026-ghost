import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { Plus, Search, X, Download, Cpu, Smartphone, Monitor, HardDrive, Sparkles, Check, Image as ImageIcon, AlertTriangle, Layers } from 'lucide-react';
import { api } from '../api';

interface Asset {
  id: number;
  asset_code: string;
  name: string;
  category: string;
  department_name: string;
  status: 'Available' | 'In Use' | 'Maintenance' | 'Retired';
  health_score: number;
}

interface AssetRequest {
  id: number;
  requested_by: string;
  category: string;
  department_id: number;
  justification: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  duplicate_risk: number;
  created_at: string;
  department_name: string;
}

export default function Assets() {
  const navigate = useNavigate();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [registeredAsset, setRegisteredAsset] = useState<{ id: string; name: string; category: string } | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Workstation');
  const [formDepartment, setFormDepartment] = useState('Engineering');
  const [formPurchaseDate, setFormPurchaseDate] = useState('');
  const [formPurchaseCost, setFormPurchaseCost] = useState('');
  const [formVendor, setFormVendor] = useState('');
  const [formSerial, setFormSerial] = useState('');
  const [formWarranty, setFormWarranty] = useState('');
  const [formImage, setFormImage] = useState<File | null>(null);

  // Asset Requests State
  const [requests, setRequests] = useState<AssetRequest[]>([]);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [reqRequestedBy, setReqRequestedBy] = useState('Jane Austen');
  const [reqCategory, setReqCategory] = useState('Workstation');
  const [reqDeptId, setReqDeptId] = useState(3);
  const [reqJustification, setReqJustification] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [matchingAssets, setMatchingAssets] = useState<any[]>([]);

  const categories = ['Workstation', 'Monitor', 'Mobile', 'Server', 'Accessories', 'Furniture', 'Tablet', 'Networking', 'Printer'];
  const departments = ['Engineering', 'Design', 'Marketing', 'Infrastructure', 'HR', 'Operations', 'Sales', 'Finance'];

  const loadAssets = async () => {
    try {
      setLoading(true);
      const data = await api.getAssets();
      setAssets(data || []);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      const data = await api.getAssetRequests();
      setRequests(data || []);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    }
  };

  const handleRequestSubmit = async (e?: React.FormEvent, force = false) => {
    if (e) e.preventDefault();
    try {
      const res = await api.createAssetRequest({
        requested_by: reqRequestedBy,
        category: reqCategory,
        department_id: reqDeptId,
        justification: reqJustification,
        force
      });

      if (res.duplicate_warning) {
        setDuplicateWarning(true);
        setMatchingAssets(res.matching_assets || []);
      } else {
        setReqJustification('');
        setIsRequestOpen(false);
        setDuplicateWarning(false);
        setMatchingAssets([]);
        loadRequests();
      }
    } catch (err) {
      console.error('Failed to submit asset request:', err);
    }
  };

  const handleApproveRequest = async (requestId: number) => {
    try {
      await api.approveAssetRequest(requestId);
      loadRequests();
      loadAssets();
    } catch (err) {
      console.error('Failed to approve request:', err);
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    try {
      await api.rejectAssetRequest(requestId);
      loadRequests();
    } catch (err) {
      console.error('Failed to reject request:', err);
    }
  };

  const [qrOrigin, setQrOrigin] = useState(window.location.origin);

  useEffect(() => {
    loadAssets();
    loadRequests();

    async function fetchSystemIp() {
      try {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          const res = await api.getSystemIp();
          if (res && res.ip && res.ip !== '127.0.0.1') {
            setQrOrigin(`http://${res.ip}:${window.location.port}`);
          }
        }
      } catch (err) {
        console.error('Failed to get system IP:', err);
      }
    }
    fetchSystemIp();
  }, []);

  const getStatusStyle = (status: Asset['status']) => {
    switch (status) {
      case 'Available':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'In Use':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Maintenance':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'Retired':
        return 'bg-gray-100 text-gray-700 border border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Workstation': return <Cpu size={14} className="text-primary" />;
      case 'Mobile': return <Smartphone size={14} className="text-secondary" />;
      case 'Monitor': return <Monitor size={14} className="text-blue-500" />;
      case 'Server': return <HardDrive size={14} className="text-red-500" />;
      default: return <Sparkles size={14} className="text-gray" />;
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const resetForm = () => {
    setFormName('');
    setFormCategory('Workstation');
    setFormDepartment('Engineering');
    setFormPurchaseDate('');
    setFormPurchaseCost('');
    setFormVendor('');
    setFormSerial('');
    setFormWarranty('');
    setFormImage(null);
    setRegisteredAsset(null);
  };

  // Map department names to database seeded IDs (1: Marketing, 2: HR, 3: Engineering, 4+: fallback/default to Engineering/1)
  const getDepartmentId = (deptName: string) => {
    switch (deptName) {
      case 'Marketing': return 1;
      case 'HR': return 2;
      case 'Engineering': return 3;
      default: return 3; // Default to Engineering
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: formName || 'Unnamed Asset',
      category: formCategory,
      department_id: getDepartmentId(formDepartment),
      purchase_date: formPurchaseDate || new Date().toISOString().split('T')[0],
      purchase_cost: parseFloat(formPurchaseCost) || 0,
      vendor: formVendor || 'Vendor Store',
      serial_number: formSerial || 'SN-GEN-01',
      warranty_expiry: formWarranty || '',
      condition: 'Excellent',
      battery_pct: formCategory === 'Workstation' || formCategory === 'Mobile' ? 100 : null
    };

    try {
      const response = await api.createAsset(payload);
      if (response && response.asset_code) {
        setRegisteredAsset({
          id: response.asset_code,
          name: payload.name,
          category: payload.category
        });
        loadAssets(); // Refetch database items
      }
    } catch (error) {
      console.error('Failed to register asset:', error);
    }
  };

  const downloadQR = (assetId: string) => {
    const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `QR-${assetId}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const filteredAssets = assets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.asset_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (asset.department_name && asset.department_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-6xl relative">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Asset Inventory</h1>
          <p className="text-sm text-text-muted">Register, track, and monitor health scores of organizational resources.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsRequestOpen(true);
              setDuplicateWarning(false);
              setMatchingAssets([]);
            }}
            className="btn-secondary text-primary border-border-light hover:bg-gray-50 font-semibold text-xs flex items-center gap-1.5 py-2 px-3 shadow-sm"
          >
            <Layers size={14} /> Request New Asset
          </button>
          
          <button
            onClick={() => {
              resetForm();
              setIsPanelOpen(true);
            }}
            className="btn-primary flex items-center gap-1.5 font-semibold text-xs py-2 px-4 shadow-sm"
          >
            <Plus size={16} /> Register Asset
          </button>
        </div>
      </div>

      {/* Search Filter bar */}
      <div className="relative max-w-sm">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
          <Search size={16} />
        </span>
        <input
          type="text"
          placeholder="Filter by name, ID, category..."
          className="input-premium pl-9 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Main Table view */}
      <div className="card-premium overflow-hidden bg-white font-sans">
        <table className="min-w-full divide-y divide-border-light text-left text-sm">
          <thead className="bg-gray-50 text-text-muted text-xs font-semibold uppercase">
            <tr>
              <th className="px-6 py-3.5">Asset ID</th>
              <th className="px-6 py-3.5">Name</th>
              <th className="px-6 py-3.5">Category</th>
              <th className="px-6 py-3.5">Department</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5">Health Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light bg-white">
            {loading ? (
              // Table row loading skeletons
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={6} className="px-6 py-4">
                    <div className="h-6 w-full skeleton-pulse rounded"></div>
                  </td>
                </tr>
              ))
            ) : (
              filteredAssets.map((asset) => (
                <tr
                  key={asset.id}
                  className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/assets/${asset.id}`)}
                >
                  <td className="px-6 py-4 font-mono text-xs font-semibold text-text">{asset.asset_code}</td>
                  <td className="px-6 py-4 font-medium text-text">{asset.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-text">
                      {getCategoryIcon(asset.category)}
                      {asset.category}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-text-muted">{asset.department_name}</td>
                  <td className="px-6 py-4">
                    <span className={`tag-status ${getStatusStyle(asset.status)}`}>
                      {asset.status === 'In Use' ? 'Allocated' : asset.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-current" style={{ color: asset.health_score >= 90 ? '#16a34a' : asset.health_score >= 60 ? '#d97706' : '#dc2626' }}></div>
                      <span className={`font-semibold text-xs ${getHealthColor(asset.health_score)}`}>
                        {asset.health_score}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {!loading && filteredAssets.length === 0 && (
          <div className="p-12 text-center text-text-muted text-sm bg-white">
            No assets found matching search criteria.
          </div>
        )}
      </div>

      {/* Asset Requests Approval Queue Section */}
      <div className="card-premium overflow-hidden bg-white space-y-4 p-6 font-sans">
        <div>
          <h3 className="text-sm font-bold text-text uppercase tracking-wider">Asset Request approval queue</h3>
          <p className="text-xs text-text-muted">Review, reject or approve dynamic resource acquisition flows checking duplicate risks.</p>
        </div>

        <div className="overflow-x-auto -mx-6">
          <table className="min-w-full divide-y divide-border-light text-left text-xs">
            <thead className="bg-gray-50 text-text-muted font-bold uppercase">
              <tr>
                <th className="px-6 py-3">Requester</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Justification</th>
                <th className="px-6 py-3">Created</th>
                <th className="px-6 py-3">Alerts</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light bg-white">
              {requests.map(req => (
                <tr key={req.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-semibold text-text">{req.requested_by}</td>
                  <td className="px-6 py-4 font-medium text-text">{req.category}</td>
                  <td className="px-6 py-4 text-text-muted font-medium">{req.department_name}</td>
                  <td className="px-6 py-4 text-text-muted max-w-[180px] truncate" title={req.justification}>
                    {req.justification}
                  </td>
                  <td className="px-6 py-4 font-mono font-medium text-text-muted">{req.created_at}</td>
                  <td className="px-6 py-4">
                    {req.duplicate_risk === 1 ? (
                      <span className="inline-flex items-center gap-1 py-0.5 px-2 text-[9px] font-bold uppercase rounded bg-red-50 text-red-700 border border-red-200 animate-pulse">
                        <AlertTriangle size={10} /> Duplicate Risk
                      </span>
                    ) : (
                      <span className="text-[10px] text-text-muted italic">Clear</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`tag-status ${req.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' : req.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {req.status === 'Pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApproveRequest(req.id)}
                          className="btn-primary py-1 px-3 text-[10px] font-semibold"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectRequest(req.id)}
                          className="text-red-600 hover:text-red-700 font-semibold text-[10px]"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-text-muted italic">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-6 text-center text-xs text-text-muted font-medium">
                    No active asset requests logged.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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

          {/* Drawer content body */}
          <div className="relative w-full max-w-md bg-surface shadow-xl h-full flex flex-col justify-between border-l border-border-light z-10 animate-slide-in">
            {/* Header */}
            <div className="h-16 border-b border-border-light flex items-center justify-between px-6 bg-gray-50/50">
              <h3 className="font-bold text-text text-base">
                {registeredAsset ? 'Registration Confirmed' : 'Register New Asset'}
              </h3>
              <button
                onClick={() => setIsPanelOpen(false)}
                className="text-text-muted hover:text-text p-1.5 rounded hover:bg-gray-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Form Panel OR QR Code confirmation view */}
            <div className="flex-1 overflow-y-auto p-6">
              {!registeredAsset ? (
                // Form view
                <form id="asset-register-form" onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-muted">Asset Name *</label>
                    <input
                      type="text"
                      required
                      className="input-premium w-full"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Dell Latitude 7440"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-text-muted">Category *</label>
                      <select
                        className="input-premium w-full text-sm"
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                      >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-text-muted">Department *</label>
                      <select
                        className="input-premium w-full text-sm"
                        value={formDepartment}
                        onChange={(e) => setFormDepartment(e.target.value)}
                      >
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-text-muted">Purchase Date</label>
                      <input
                        type="date"
                        className="input-premium w-full text-sm"
                        value={formPurchaseDate}
                        onChange={(e) => setFormPurchaseDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-text-muted">Cost (INR)</label>
                      <input
                        type="number"
                        className="input-premium w-full text-sm"
                        value={formPurchaseCost}
                        placeholder="e.g. 85000"
                        onChange={(e) => setFormPurchaseCost(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-muted">Vendor Partner</label>
                    <input
                      type="text"
                      className="input-premium w-full text-sm"
                      value={formVendor}
                      placeholder="e.g. Dell Direct Service"
                      onChange={(e) => setFormVendor(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-muted">Serial Number / Asset Tag</label>
                    <input
                      type="text"
                      className="input-premium w-full text-sm font-mono"
                      value={formSerial}
                      placeholder="e.g. SN-8291A-09"
                      onChange={(e) => setFormSerial(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-muted">Warranty Expiration Date</label>
                    <input
                      type="date"
                      className="input-premium w-full text-sm"
                      value={formWarranty}
                      onChange={(e) => setFormWarranty(e.target.value)}
                    />
                  </div>

                  {/* Image upload mock component */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-muted">Asset Image</label>
                    <div className="border-2 border-dashed border-border-light hover:border-secondary transition-colors rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer bg-gray-50/50">
                      <ImageIcon size={22} className="text-text-muted mb-1.5" />
                      <span className="text-[11px] font-medium text-text-muted">
                        {formImage ? formImage.name : 'Click to drag & upload image'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="form-image-uploader"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            setFormImage(e.target.files[0]);
                          }
                        }}
                      />
                      <label htmlFor="form-image-uploader" className="text-[10px] text-secondary font-semibold mt-1 hover:underline cursor-pointer">
                        Select File
                      </label>
                    </div>
                  </div>
                </form>
              ) : (
                // QR Confirmation view
                <div className="space-y-6 py-4">
                  <div className="bg-green-50 border border-green-200 rounded-[4px] p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0">
                      <Check size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-green-900">Asset Registered Successfully</h4>
                      <p className="text-xs text-green-700">Database entry compiled with ID: <span className="font-mono font-bold">{registeredAsset.id}</span></p>
                    </div>
                  </div>

                  <div className="bg-white p-6 border border-border-light rounded-lg shadow-sm flex flex-col items-center justify-center space-y-4">
                    <QRCodeCanvas
                      id="qr-code-canvas"
                      value={`${qrOrigin}/assets/${registeredAsset.id}?scan=true`}
                      size={160}
                      level="H"
                      includeMargin={true}
                    />
                    <div className="text-center">
                      <h5 className="font-bold text-text text-sm">{registeredAsset.name}</h5>
                      <p className="text-xs text-text-muted">ID: {registeredAsset.id} &bull; {registeredAsset.category}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => downloadQR(registeredAsset.id)}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      <Download size={15} /> Download QR Code PNG
                    </button>
                    <button
                      onClick={() => {
                        resetForm();
                        setIsPanelOpen(false);
                      }}
                      className="btn-secondary w-full"
                    >
                      Return to Inventory
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer containing action buttons */}
            {!registeredAsset && (
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
                  form="asset-register-form"
                  className="btn-primary py-1.5 px-4 text-xs font-semibold"
                >
                  Confirm Registration
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Asset Request Dialog Modal */}
      {isRequestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsRequestOpen(false)}></div>
          <div className="bg-white rounded shadow-xl border border-border-light w-full max-w-lg overflow-hidden relative z-10 animate-scale-up font-sans">
            {/* Modal Header */}
            <div className="h-14 border-b border-border-light flex items-center justify-between px-6 bg-gray-50/50">
              <h3 className="font-bold text-text text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Layers size={14} className="text-primary" /> Request New Asset
              </h3>
              <button 
                onClick={() => setIsRequestOpen(false)}
                className="text-text-muted hover:text-text p-1.5 rounded hover:bg-gray-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {!duplicateWarning ? (
                /* Main Request Form */
                <form id="new-asset-request-form" onSubmit={(e) => handleRequestSubmit(e, false)} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-muted">Requested By *</label>
                    <input
                      type="text"
                      required
                      className="input-premium w-full text-sm"
                      value={reqRequestedBy}
                      onChange={(e) => setReqRequestedBy(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-text-muted">Asset Category *</label>
                      <select
                        className="input-premium w-full text-sm"
                        value={reqCategory}
                        onChange={(e) => setReqCategory(e.target.value)}
                      >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-text-muted">Target Department *</label>
                      <select
                        className="input-premium w-full text-sm"
                        value={reqDeptId}
                        onChange={(e) => setReqDeptId(parseInt(e.target.value))}
                      >
                        <option value={1}>Marketing</option>
                        <option value={2}>HR</option>
                        <option value={3}>Engineering</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-muted">Justification / Business Need *</label>
                    <textarea
                      required
                      rows={3}
                      className="input-premium w-full text-sm"
                      placeholder="Describe why this asset is required..."
                      value={reqJustification}
                      onChange={(e) => setReqJustification(e.target.value)}
                    />
                  </div>

                  <div className="p-3 bg-gray-50 border border-border-light rounded text-[11px] text-text-muted leading-relaxed">
                    <strong>Waste Protection:</strong> Upon submission, the system will search active and idle items matching this category in the database before granting approval routing.
                  </div>
                </form>
              ) : (
                /* Interrupt Duplicates Warning View */
                <div className="space-y-5">
                  <div className="bg-amber-50 border border-amber-200 rounded-[4px] p-4 flex items-start gap-3">
                    <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-amber-900">Wait — Idle Assets Already Available!</h4>
                      <p className="text-xs text-amber-700 leading-relaxed">
                        We detected <strong>{matchingAssets.length}</strong> matching <strong>{reqCategory}</strong> asset(s) that are currently available or idle in the system. Reallocating an existing asset saves budget and prevents waste.
                      </p>
                    </div>
                  </div>

                  {/* Matching duplicate list */}
                  <div className="border border-border-light rounded overflow-hidden max-h-48 overflow-y-auto">
                    <table className="min-w-full divide-y divide-border-light text-left text-xs">
                      <thead className="bg-gray-50 text-text-muted font-bold uppercase">
                        <tr>
                          <th className="px-4 py-2">Asset Code</th>
                          <th className="px-4 py-2">Asset Name</th>
                          <th className="px-4 py-2">Health</th>
                          <th className="px-4 py-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-light bg-white">
                        {matchingAssets.map(match => (
                          <tr key={match.id} className="hover:bg-gray-50/50">
                            <td className="px-4 py-2.5 font-mono font-semibold text-text">{match.asset_code}</td>
                            <td className="px-4 py-2.5 font-medium text-text">{match.name}</td>
                            <td className="px-4 py-2.5 font-semibold text-green-700">{match.health_score}%</td>
                            <td className="px-4 py-2.5 text-right">
                              <button
                                onClick={() => navigate(`/assets/${match.id}`)}
                                className="btn-secondary text-primary border-primary/20 py-0.5 px-2 text-[10px] hover:bg-primary/5 font-semibold"
                              >
                                Allocate This
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p className="text-xs text-text-muted">
                    If none of these assets fit the user's specific technical requirements, you can bypass this warning to continue requesting a new unit.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="h-14 border-t border-border-light flex items-center justify-end px-6 gap-2 bg-gray-50/50">
              {!duplicateWarning ? (
                <>
                  <button 
                    onClick={() => setIsRequestOpen(false)} 
                    className="btn-secondary py-1.5 px-4 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    form="new-asset-request-form" 
                    className="btn-primary py-1.5 px-4 text-xs font-semibold"
                  >
                    Submit Request
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setDuplicateWarning(false)} 
                    className="btn-secondary py-1.5 px-4 text-xs font-medium"
                  >
                    Back to Form
                  </button>
                  <button 
                    onClick={() => handleRequestSubmit(undefined, true)} 
                    className="btn-primary bg-amber-600 hover:bg-amber-700 text-white py-1.5 px-4 text-xs font-semibold"
                  >
                    Still Request New (Flags Duplicate Risk)
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
