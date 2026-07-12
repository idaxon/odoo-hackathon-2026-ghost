import { useState } from 'react';
import { Plus, Search, Filter, MoreVertical, Shield, Cpu, Smartphone, Monitor } from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  category: string;
  serial: string;
  status: 'Available' | 'In Use' | 'Maintenance' | 'Retired';
  assignee: string;
  location: string;
}

export default function Assets() {
  const [searchTerm, setSearchTerm] = useState('');

  const assets: Asset[] = [
    { id: 'AST-2026-001', name: 'MacBook Pro 16" (M3 Max)', category: 'Workstation', serial: 'C02F12X0Q05D', status: 'In Use', assignee: 'Sarah Connor', location: 'HQ - Floor 3' },
    { id: 'AST-2026-002', name: 'Dell UltraSharp 32" 4K', category: 'Monitor', serial: 'CN-0P826D-74443', status: 'Available', assignee: '—', location: 'HQ - Storage B' },
    { id: 'AST-2026-003', name: 'iPhone 15 Pro Max 512GB', category: 'Mobile', serial: 'G03K4829G902', status: 'In Use', assignee: 'John Doe', location: 'Remote' },
    { id: 'AST-2026-004', name: 'Supermicro Server 2U Rack', category: 'Server', serial: 'SM-82910398', status: 'Maintenance', assignee: 'Infrastructure Team', location: 'Data Center 1' },
    { id: 'AST-2026-005', name: 'iPad Pro 11" (M2)', category: 'Tablet', serial: 'DLX29103810', status: 'Available', assignee: '—', location: 'HQ - Storage B' },
    { id: 'AST-2026-006', name: 'Lenovo ThinkPad X1 Carbon', category: 'Workstation', serial: 'PF-289D2B', status: 'Retired', assignee: '—', location: 'Disposal Queue' },
  ];

  const getStatusStyle = (status: Asset['status']) => {
    switch (status) {
      case 'Available':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'In Use':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Maintenance':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Retired':
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Workstation': return <Cpu size={14} className="text-primary" />;
      case 'Mobile': return <Smartphone size={14} className="text-secondary" />;
      case 'Monitor': return <Monitor size={14} className="text-[#017E84]" />;
      default: return <Shield size={14} className="text-gray" />;
    }
  };

  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.serial.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Asset Inventory</h1>
          <p className="text-sm text-text-muted">Manage, track, and audit physical and virtual hardware assets.</p>
        </div>
        <button className="btn-primary">
          <Plus size={16} /> Add Asset
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 border border-border-light rounded-lg">
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search by ID, name, serial..."
            className="input-premium pl-9 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="btn-secondary flex-1 sm:flex-initial py-2 px-3 text-xs flex items-center justify-center gap-1.5">
            <Filter size={14} /> Category
          </button>
          <button className="btn-secondary flex-1 sm:flex-initial py-2 px-3 text-xs flex items-center justify-center gap-1.5">
            <Filter size={14} /> Status
          </button>
        </div>
      </div>

      {/* Assets Table */}
      <div className="card-premium overflow-hidden">
        <table className="min-w-full divide-y divide-border-light text-left text-sm">
          <thead className="bg-gray-50 text-text-muted text-xs font-semibold uppercase">
            <tr>
              <th className="px-6 py-3">Asset ID</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Serial Number</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Assigned To</th>
              <th className="px-6 py-3">Location</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light bg-white">
            {filteredAssets.map((asset) => (
              <tr key={asset.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 font-mono text-xs font-semibold text-text">{asset.id}</td>
                <td className="px-6 py-4 font-medium text-text">{asset.name}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-xs text-text">
                    {getCategoryIcon(asset.category)}
                    {asset.category}
                  </div>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-text-muted">{asset.serial}</td>
                <td className="px-6 py-4">
                  <span className={`tag-status border ${getStatusStyle(asset.status)}`}>
                    {asset.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs font-medium text-text">{asset.assignee}</td>
                <td className="px-6 py-4 text-xs text-text-muted">{asset.location}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-text-muted hover:text-text p-1 rounded hover:bg-gray-100">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
