import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Cpu, Smartphone, Monitor, HardDrive, Sparkles, AlertCircle, Wrench, Battery } from 'lucide-react';

interface AssetDetailData {
  id: string;
  name: string;
  category: string;
  department: string;
  owner: string;
  purchaseDate: string;
  serialNumber: string;
  warrantyStatus: 'Active' | 'Expired';
  healthScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  batteryPercentage?: number; // optional
  lastMaintenanceDays: number;
  timelineSteps: { label: string; date: string; desc: string }[];
  aiRecommendation: string;
}

export default function AssetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Mock database of details matching the 9 items from Assets table
  const db: Record<string, AssetDetailData> = {
    'AF-0001': {
      id: 'AF-0001',
      name: 'MacBook Pro 16" (M3 Max)',
      category: 'Workstation',
      department: 'Engineering',
      owner: 'Sarah Connor',
      purchaseDate: '2025-10-15',
      serialNumber: 'C02F12X0Q05D',
      warrantyStatus: 'Active',
      healthScore: 94,
      riskLevel: 'Low',
      condition: 'Excellent',
      batteryPercentage: 92,
      lastMaintenanceDays: 12,
      timelineSteps: [
        { label: 'Purchased', date: 'Oct 15, 2025', desc: 'Acquired through Apple Enterprise Store.' },
        { label: 'Allocated', date: 'Oct 18, 2025', desc: 'Assigned as primary device to Sarah Connor.' },
        { label: 'Maintenance', date: 'Jun 30, 2026', desc: 'Routine diagnostic and system cleanup audit.' },
        { label: 'Current', date: 'Jul 12, 2026', desc: 'Device in active operation, health score optimal.' }
      ],
      aiRecommendation: 'Battery health and storage are optimal. No action required.'
    },
    'AF-0002': {
      id: 'AF-0002',
      name: 'Dell UltraSharp 32" 4K Monitor',
      category: 'Monitor',
      department: 'Design',
      owner: 'Unassigned',
      purchaseDate: '2024-03-12',
      serialNumber: 'CN-0P826D-74443',
      warrantyStatus: 'Expired',
      healthScore: 98,
      riskLevel: 'Low',
      condition: 'Good',
      lastMaintenanceDays: 180,
      timelineSteps: [
        { label: 'Purchased', date: 'Mar 12, 2024', desc: 'Acquired through Dell Corporate Portal.' },
        { label: 'Allocated', date: 'Mar 15, 2024', desc: 'Deployed to Design Studio Lab.' },
        { label: 'Maintenance', date: 'Jan 12, 2026', desc: 'Color profile recalibrated by hardware team.' },
        { label: 'Current', date: 'Jul 12, 2026', desc: 'Device in active storage inventory, fully functional.' }
      ],
      aiRecommendation: 'Warranty expired. Consider extending support plan or budgeting for replacement cycle.'
    },
    'AF-0003': {
      id: 'AF-0003',
      name: 'iPhone 15 Pro Max 256GB',
      category: 'Mobile',
      department: 'Marketing',
      owner: 'John Doe',
      purchaseDate: '2025-09-22',
      serialNumber: 'G03K4829G902',
      warrantyStatus: 'Active',
      healthScore: 89,
      riskLevel: 'Low',
      condition: 'Good',
      batteryPercentage: 84,
      lastMaintenanceDays: 45,
      timelineSteps: [
        { label: 'Purchased', date: 'Sep 22, 2025', desc: 'Acquired via carrier business plan.' },
        { label: 'Allocated', date: 'Sep 24, 2025', desc: 'Provisioned to John Doe.' },
        { label: 'Maintenance', date: 'May 28, 2026', desc: 'Glass protector replaced, external audit done.' },
        { label: 'Current', date: 'Jul 12, 2026', desc: 'Device in active operation, battery displaying aging signs.' }
      ],
      aiRecommendation: 'Battery capacity currently at 84%. Schedule replacement within 6 months to maintain peak performance.'
    },
    'AF-0004': {
      id: 'AF-0004',
      name: 'Supermicro 2U Database Server',
      category: 'Server',
      department: 'Infrastructure',
      owner: 'Infrastructure Team',
      purchaseDate: '2023-05-18',
      serialNumber: 'SM-82910398',
      warrantyStatus: 'Expired',
      healthScore: 42,
      riskLevel: 'High',
      condition: 'Fair',
      lastMaintenanceDays: 4,
      timelineSteps: [
        { label: 'Purchased', date: 'May 18, 2023', desc: 'Procured for database scaling project.' },
        { label: 'Allocated', date: 'May 20, 2023', desc: 'Mounted in Data Center 1, Rack B4.' },
        { label: 'Maintenance', date: 'Jul 08, 2026', desc: 'Emergency dispatch: replaced failed cooling fan unit 3.' },
        { label: 'Current', date: 'Jul 12, 2026', desc: 'Server back online but secondary thermal sensors report elevated levels.' }
      ],
      aiRecommendation: 'Critical: System thermal levels are elevated due to fan speeds. Deploy technician for onsite air-flow audit.'
    },
    'AF-0005': {
      id: 'AF-0005',
      name: 'Sony WH-1000XM5 Headset',
      category: 'Accessories',
      department: 'HR',
      owner: 'Unassigned',
      purchaseDate: '2025-12-05',
      serialNumber: 'SN-SONY-X5918',
      warrantyStatus: 'Active',
      healthScore: 100,
      riskLevel: 'Low',
      condition: 'Excellent',
      batteryPercentage: 99,
      lastMaintenanceDays: 220,
      timelineSteps: [
        { label: 'Purchased', date: 'Dec 05, 2025', desc: 'Purchased as part of standard onboarding gear.' },
        { label: 'Allocated', date: 'Dec 10, 2025', desc: 'Stored in HR inventory vault.' },
        { label: 'Maintenance', date: 'Dec 10, 2025', desc: 'Firmware updated to v1.2 during onboarding pre-load.' },
        { label: 'Current', date: 'Jul 12, 2026', desc: 'Device in storage, pristine condition.' }
      ],
      aiRecommendation: 'Device health pristine. Ready for allocation to next team onboarding.'
    },
    'AF-0006': {
      id: 'AF-0006',
      name: 'Herman Miller Aeron Chair',
      category: 'Furniture',
      department: 'Operations',
      owner: 'Operations Team',
      purchaseDate: '2022-01-20',
      serialNumber: 'SN-HM-AERON-829',
      warrantyStatus: 'Active',
      healthScore: 91,
      riskLevel: 'Low',
      condition: 'Good',
      lastMaintenanceDays: 320,
      timelineSteps: [
        { label: 'Purchased', date: 'Jan 20, 2022', desc: 'Acquired with 12-year manufacturer warranty.' },
        { label: 'Allocated', date: 'Jan 25, 2022', desc: 'Placed in executive conference hall.' },
        { label: 'Maintenance', date: 'Aug 14, 2025', desc: 'Tightened armrest bolts and mesh integrity check.' },
        { label: 'Current', date: 'Jul 12, 2026', desc: 'Aeron chair structurally sound, mesh showing normal wear.' }
      ],
      aiRecommendation: 'Warranty active until 2034. Frame audit scheduled for late next fiscal year.'
    },
    'AF-0007': {
      id: 'AF-0007',
      name: 'iPad Pro 12.9" (M2)',
      category: 'Tablet',
      department: 'Sales',
      owner: 'Jane Austen',
      purchaseDate: '2024-08-11',
      serialNumber: 'DLX29103810',
      warrantyStatus: 'Active',
      healthScore: 87,
      riskLevel: 'Low',
      condition: 'Good',
      batteryPercentage: 81,
      lastMaintenanceDays: 90,
      timelineSteps: [
        { label: 'Purchased', date: 'Aug 11, 2024', desc: 'Acquired for mobile sales representatives.' },
        { label: 'Allocated', date: 'Aug 15, 2024', desc: 'Assigned to Jane Austen.' },
        { label: 'Maintenance', date: 'Apr 13, 2026', desc: 'OS reinstalled and diagnostic scan run.' },
        { label: 'Current', date: 'Jul 12, 2026', desc: 'Operational, screen calibration and touch responsive.' }
      ],
      aiRecommendation: 'Lithium battery health is stable but watch for discharge times under sales team heavy-travel usage.'
    },
    'AF-0008': {
      id: 'AF-0008',
      name: 'Cisco Catalyst 9300 Switch',
      category: 'Networking',
      department: 'Infrastructure',
      owner: 'Infrastructure Team',
      purchaseDate: '2023-11-04',
      serialNumber: 'SN-CSCO-9300-889',
      warrantyStatus: 'Active',
      healthScore: 78,
      riskLevel: 'Medium',
      condition: 'Good',
      lastMaintenanceDays: 140,
      timelineSteps: [
        { label: 'Purchased', date: 'Nov 04, 2023', desc: 'Purchased as part of Floor 2 network stack overhaul.' },
        { label: 'Allocated', date: 'Nov 12, 2023', desc: 'Rack-mounted and configured with primary network profiles.' },
        { label: 'Maintenance', date: 'Feb 22, 2026', desc: 'IOS software security patch v17.9.4 applied.' },
        { label: 'Current', date: 'Jul 12, 2026', desc: 'Online, port throughput averages 34Gbps, 2 alerts logged.' }
      ],
      aiRecommendation: 'System alerts report port 12 flapping. Schedule network stack cable inspection.'
    },
    'AF-0009': {
      id: 'AF-0009',
      name: 'ThinkPad X1 Carbon Gen 11',
      category: 'Workstation',
      department: 'Finance',
      owner: 'Retired',
      purchaseDate: '2023-02-15',
      serialNumber: 'PF-289D2B',
      warrantyStatus: 'Expired',
      healthScore: 35,
      riskLevel: 'Medium',
      condition: 'Poor',
      batteryPercentage: 54,
      lastMaintenanceDays: 15,
      timelineSteps: [
        { label: 'Purchased', date: 'Feb 15, 2023', desc: 'Acquired through Lenovo Business.' },
        { label: 'Allocated', date: 'Feb 18, 2023', desc: 'Assigned to Finance Director.' },
        { label: 'Maintenance', date: 'Jun 27, 2026', desc: 'Motherboard diagnostic: identified blown power regulator.' },
        { label: 'Current', date: 'Jul 12, 2026', desc: 'Retired from service queue, scheduled for secure recycling.' }
      ],
      aiRecommendation: 'E-Waste: Asset is retired. Carry out secure hard drive shredding and log recycling certificate.'
    }
  };

  // Dynamic fallback for newly registered assets (e.g. AF-0010)
  const defaultAsset = (assetId: string): AssetDetailData => {
    return {
      id: assetId,
      name: 'Newly Registered Asset',
      category: 'Workstation',
      department: 'Engineering',
      owner: 'Unassigned',
      purchaseDate: new Date().toISOString().split('T')[0],
      serialNumber: 'PENDING-GEN-01',
      warrantyStatus: 'Active',
      healthScore: 100,
      riskLevel: 'Low',
      condition: 'Excellent',
      lastMaintenanceDays: 0,
      timelineSteps: [
        { label: 'Purchased', date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), desc: 'Asset acquired.' },
        { label: 'Allocated', date: 'Pending', desc: 'Pending department allocation.' },
        { label: 'Maintenance', date: 'None', desc: 'No maintenance records registered.' },
        { label: 'Current', date: 'Active', desc: 'Asset registered in system database.' }
      ],
      aiRecommendation: 'Asset is fully optimized. No current maintenance recommendations.'
    };
  };

  const asset = id && db[id] ? db[id] : defaultAsset(id || 'AF-9999');

  // Health Score Tag helpers
  const getHealthStatus = (score: number) => {
    if (score > 80) return { label: 'Healthy', color: 'bg-green-50 text-green-700 border-green-200' };
    if (score >= 50) return { label: 'Monitor', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { label: 'Critical', color: 'bg-red-50 text-red-700 border-red-200' };
  };

  const healthStatus = getHealthStatus(asset.healthScore);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Workstation': return <Cpu size={16} />;
      case 'Mobile': return <Smartphone size={16} />;
      case 'Monitor': return <Monitor size={16} />;
      case 'Server': return <HardDrive size={16} />;
      default: return <Sparkles size={16} />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back navigation & Action bar */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/assets')}
          className="btn-secondary text-primary border-border-light hover:bg-gray-50 flex items-center gap-2 py-1.5 px-3 text-xs"
        >
          <ArrowLeft size={14} /> Back to Assets
        </button>
        <span className="font-mono text-xs font-semibold text-text-muted">Digital Twin Node: {asset.id}</span>
      </div>

      {/* Main Details Panel Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column (Static Metadata Card) */}
        <div className="card-premium p-6 space-y-6 bg-white">
          <div className="flex items-center gap-4 border-b border-border-light pb-4">
            {/* Image Placeholder Box */}
            <div className="w-16 h-16 bg-gray-50 border border-border-light rounded flex items-center justify-center text-text-muted flex-shrink-0">
              {getCategoryIcon(asset.category)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-text m-0 leading-tight">{asset.name}</h2>
              <div className="flex items-center gap-1.5 text-xs text-text-muted mt-1">
                <span>{asset.category}</span>
                <span>&bull;</span>
                <span>{asset.id}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted mb-0.5">Asset Owner</p>
              <p className="font-medium text-text">{asset.owner}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted mb-0.5">Department</p>
              <p className="font-medium text-text">{asset.department}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted mb-0.5">Purchase Date</p>
              <p className="font-mono font-medium text-text">{asset.purchaseDate}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted mb-0.5">Serial Number</p>
              <p className="font-mono font-medium text-text truncate">{asset.serialNumber}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted mb-0.5">Warranty Status</p>
              <span className={`tag-status mt-0.5 border ${asset.warrantyStatus === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                {asset.warrantyStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (Live Telemetry & Health Diagnostics Card) */}
        <div className="card-premium p-6 space-y-5 bg-white flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border-light pb-3">
              <h3 className="text-sm font-bold text-text uppercase tracking-wider">Device Health & Risk</h3>
              <span className={`tag-status border ${healthStatus.color}`}>
                {healthStatus.label}
              </span>
            </div>

            {/* Health Score Progress */}
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold text-text-muted">Health Index</span>
                <div className="text-2xl font-bold tracking-tight text-text">
                  {asset.healthScore}<span className="text-sm font-medium text-text-muted">/100</span>
                </div>
              </div>
              {/* Progress Bar (Thin, Secondary Color) */}
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-secondary h-full transition-all duration-500" 
                  style={{ width: `${asset.healthScore}%` }}
                ></div>
              </div>
            </div>

            {/* Telemetry Metrics */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-gray-50/50 p-2.5 rounded border border-border-light">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Risk Level</span>
                <span className="text-sm font-semibold text-text">{asset.riskLevel}</span>
              </div>
              <div className="bg-gray-50/50 p-2.5 rounded border border-border-light">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Condition</span>
                <span className="text-sm font-semibold text-text">{asset.condition}</span>
              </div>
              {asset.batteryPercentage !== undefined && (
                <div className="bg-gray-50/50 p-2.5 rounded border border-border-light flex items-center justify-between col-span-2">
                  <div>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Battery Health</span>
                    <span className="text-sm font-semibold text-text">{asset.batteryPercentage}% Capacity</span>
                  </div>
                  <Battery className="text-text-muted" size={20} />
                </div>
              )}
            </div>
          </div>

          <div className="text-xs text-text-muted border-t border-border-light pt-3 flex items-center gap-1.5 font-medium">
            <Wrench size={13} />
            <span>Last Maintenance: {asset.lastMaintenanceDays === 0 ? 'Never' : `${asset.lastMaintenanceDays} days ago`}</span>
          </div>
        </div>

      </div>

      {/* Horizontal Lifecycle Timeline Component */}
      <div className="card-premium p-6 bg-white space-y-6">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider border-b border-border-light pb-2">Lifecycle Timeline</h3>
        
        {/* Simple connected-dot progress line: primary dots, gray line */}
        <div className="relative">
          {/* Connector Line */}
          <div className="absolute top-3 left-[12%] right-[12%] h-0.5 bg-border-light z-0"></div>

          {/* Timeline Nodes */}
          <div className="grid grid-cols-4 relative z-10">
            {asset.timelineSteps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center space-y-2">
                {/* Connected Dot: Primary color */}
                <div className="w-6.5 h-6.5 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[10px] shadow-sm border-4 border-white">
                  {idx + 1}
                </div>
                <div className="px-2">
                  <p className="text-xs font-semibold text-text leading-tight">{step.label}</p>
                  <p className="text-[10px] text-text-muted font-mono mt-0.5">{step.date}</p>
                  <p className="text-[10px] text-text-muted leading-relaxed mt-1 hidden sm:block max-w-[160px] mx-auto">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Recommendation Panel: border accent left border (styled like dashboard AI brief) */}
      <div className="card-premium p-4 border-l-4 border-l-secondary bg-white flex items-start gap-3">
        <AlertCircle size={18} className="text-secondary mt-0.5" />
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-text uppercase tracking-wider">AI Recommender Insight</h4>
          <p className="text-sm text-text font-medium">{asset.aiRecommendation}</p>
        </div>
      </div>
    </div>
  );
}
