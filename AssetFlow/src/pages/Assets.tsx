import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Plus, Search, X, Download, Cpu, Smartphone, Monitor, HardDrive, Sparkles, Check, Image as ImageIcon } from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  category: string;
  department: string;
  status: 'Available' | 'In Use' | 'Maintenance' | 'Retired';
  healthScore: number;
}

export default function Assets() {
  // 9 Initial Mock Rows
  const [assets, setAssets] = useState<Asset[]>([
    { id: 'AF-0001', name: 'MacBook Pro 16" (M3 Max)', category: 'Workstation', department: 'Engineering', status: 'In Use', healthScore: 94 },
    { id: 'AF-0002', name: 'Dell UltraSharp 32" 4K Monitor', category: 'Monitor', department: 'Design', status: 'Available', healthScore: 98 },
    { id: 'AF-0003', name: 'iPhone 15 Pro Max 256GB', category: 'Mobile', department: 'Marketing', status: 'In Use', healthScore: 89 },
    { id: 'AF-0004', name: 'Supermicro 2U Database Server', category: 'Server', department: 'Infrastructure', status: 'Maintenance', healthScore: 42 },
    { id: 'AF-0005', name: 'Sony WH-1000XM5 Headset', category: 'Accessories', department: 'HR', status: 'Available', healthScore: 100 },
    { id: 'AF-0006', name: 'Herman Miller Aeron Chair', category: 'Furniture', department: 'Operations', status: 'In Use', healthScore: 91 },
    { id: 'AF-0007', name: 'iPad Pro 12.9" (M2)', category: 'Tablet', department: 'Sales', status: 'Available', healthScore: 87 },
    { id: 'AF-0008', name: 'Cisco Catalyst 9300 Switch', category: 'Networking', department: 'Infrastructure', status: 'In Use', healthScore: 78 },
    { id: 'AF-0009', name: 'ThinkPad X1 Carbon Gen 11', category: 'Workstation', department: 'Finance', status: 'Retired', healthScore: 35 }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [registeredAsset, setRegisteredAsset] = useState<Asset | null>(null);

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

  const categories = ['Workstation', 'Monitor', 'Mobile', 'Server', 'Accessories', 'Furniture', 'Tablet', 'Networking'];
  const departments = ['Engineering', 'Design', 'Marketing', 'Infrastructure', 'HR', 'Operations', 'Sales', 'Finance'];

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-generate Asset ID incrementing from list length
    const nextNum = assets.length + 1;
    const newId = `AF-${String(nextNum).padStart(4, '0')}`;

    const newAsset: Asset = {
      id: newId,
      name: formName || 'Unnamed Asset',
      category: formCategory,
      department: formDepartment,
      status: 'Available',
      healthScore: 100 // default for new asset
    };

    setAssets([...assets, newAsset]);
    setRegisteredAsset(newAsset);
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
    asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl relative">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Asset Inventory</h1>
          <p className="text-sm text-text-muted">Register, track, and monitor health scores of organizational resources.</p>
        </div>
        <button 
          onClick={() => {
            resetForm();
            setIsPanelOpen(true);
          }} 
          className="btn-primary"
        >
          <Plus size={16} /> Register Asset
        </button>
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
      <div className="card-premium overflow-hidden bg-white">
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
            {filteredAssets.map((asset) => (
              <tr key={asset.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs font-semibold text-text">{asset.id}</td>
                <td className="px-6 py-4 font-medium text-text">{asset.name}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-xs text-text">
                    {getCategoryIcon(asset.category)}
                    {asset.category}
                  </div>
                </td>
                <td className="px-6 py-4 text-xs font-medium text-text-muted">{asset.department}</td>
                <td className="px-6 py-4">
                  <span className={`tag-status ${getStatusStyle(asset.status)}`}>
                    {asset.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-current" style={{ color: asset.healthScore >= 90 ? '#16a34a' : asset.healthScore >= 60 ? '#d97706' : '#dc2626' }}></div>
                    <span className={`font-semibold text-xs ${getHealthColor(asset.healthScore)}`}>
                      {asset.healthScore}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredAssets.length === 0 && (
          <div className="p-12 text-center text-text-muted text-sm bg-white">
            No assets found matching search criteria.
          </div>
        )}
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
                // QR Confirmation view: Plain white card, no decorative border
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

                  {/* Plain white card, no decorative border */}
                  <div className="bg-white p-6 border border-border-light rounded-lg shadow-sm flex flex-col items-center justify-center space-y-4">
                    <QRCodeCanvas
                      id="qr-code-canvas"
                      value={registeredAsset.id}
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

            {/* Footer containing action buttons (only if not registered yet) */}
            {!registeredAsset && (
              <div className="h-16 border-t border-border-light flex items-center justify-end px-6 gap-2 bg-gray-50/50">
                <button 
                  type="button" 
                  onClick={() => setIsPanelOpen(false)} 
                  className="btn-secondary py-1.5 px-4 text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  form="asset-register-form" 
                  className="btn-primary py-1.5 px-4 text-xs"
                >
                  Confirm Registration
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
