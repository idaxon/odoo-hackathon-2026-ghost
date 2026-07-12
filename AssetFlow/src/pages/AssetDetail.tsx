import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Cpu, Smartphone, Monitor, HardDrive, Sparkles, AlertCircle, Wrench, Battery, X, User, CheckCircle2 } from 'lucide-react';

interface TimelineStep {
  label: string;
  date: string;
  desc: string;
}

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
  batteryPercentage?: number;
  lastMaintenanceDays: number;
  timelineSteps: TimelineStep[];
  aiRecommendation: string;
  status: 'Available' | 'In Use' | 'Maintenance' | 'Retired';
}

export default function AssetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Allocation Drawer State
  const [isAllocOpen, setIsAllocOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('Sarah Connor');
  const [selectedDept, setSelectedDept] = useState('Engineering');
  const [isTransferMode, setIsTransferMode] = useState(false);

  // Loaded Asset details
  const [asset, setAsset] = useState<AssetDetailData | null>(null);

  const employees = ['Sarah Connor', 'John Doe', 'Alex Mercer', 'Elena Rostova', 'Michael Scott', 'Jane Austen'];
  const departments = ['Engineering', 'Design', 'Marketing', 'Infrastructure', 'HR', 'Operations', 'Sales', 'Finance'];

  // Base list of detailed mock database matching standard inventory
  const baseDb: Record<string, AssetDetailData> = {
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
      aiRecommendation: 'Battery health and storage are optimal. No action required.',
      status: 'In Use'
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
      aiRecommendation: 'Warranty expired. Consider extending support plan or budgeting for replacement cycle.',
      status: 'Available'
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
      aiRecommendation: 'Battery capacity currently at 84%. Schedule replacement within 6 months to maintain peak performance.',
      status: 'In Use'
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
      aiRecommendation: 'Critical: System thermal levels are elevated due to fan speeds. Deploy technician for onsite air-flow audit.',
      status: 'Maintenance'
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
      aiRecommendation: 'Device health pristine. Ready for allocation to next team onboarding.',
      status: 'Available'
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
      aiRecommendation: 'Warranty active until 2034. Frame audit scheduled for late next fiscal year.',
      status: 'In Use'
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
      aiRecommendation: 'Lithium battery health is stable but watch for discharge times under sales team heavy-travel usage.',
      status: 'Available'
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
      aiRecommendation: 'System alerts report port 12 flapping. Schedule network stack cable inspection.',
      status: 'In Use'
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
      aiRecommendation: 'E-Waste: Asset is retired. Carry out secure hard drive shredding and log recycling certificate.',
      status: 'Retired'
    }
  };

  const getFallbackAsset = (assetId: string): AssetDetailData => {
    // If it exists in Assets catalog but not details, make a helper lookup
    const savedAssets = localStorage.getItem('assetflow_assets');
    let name = 'Newly Registered Asset';
    let cat = 'Workstation';
    let dept = 'Engineering';
    let stat: AssetDetailData['status'] = 'Available';
    let health = 100;

    if (savedAssets) {
      const parsed = JSON.parse(savedAssets) as any[];
      const matched = parsed.find(a => a.id === assetId);
      if (matched) {
        name = matched.name;
        cat = matched.category;
        dept = matched.department;
        stat = matched.status;
        health = matched.healthScore;
      }
    }

    return {
      id: assetId,
      name,
      category: cat,
      department: dept,
      owner: 'Unassigned',
      purchaseDate: new Date().toISOString().split('T')[0],
      serialNumber: 'PENDING-GEN-01',
      warrantyStatus: 'Active',
      healthScore: health,
      riskLevel: 'Low',
      condition: 'Excellent',
      lastMaintenanceDays: 0,
      timelineSteps: [
        { label: 'Purchased', date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), desc: 'Asset acquired.' },
        { label: 'Allocated', date: 'Pending', desc: 'Pending department allocation.' },
        { label: 'Maintenance', date: 'None', desc: 'No maintenance records registered.' },
        { label: 'Current', date: 'Active', desc: 'Asset registered in system database.' }
      ],
      aiRecommendation: 'Asset is fully optimized. No current maintenance recommendations.',
      status: stat
    };
  };

  // Load details from LocalStorage (or seed from baseDb)
  useEffect(() => {
    if (!id) return;
    const detailKey = `assetflow_detail_${id}`;
    const savedDetail = localStorage.getItem(detailKey);

    if (savedDetail) {
      setAsset(JSON.parse(savedDetail));
    } else {
      const initialDetail = baseDb[id] || getFallbackAsset(id);
      localStorage.setItem(detailKey, JSON.stringify(initialDetail));
      setAsset(initialDetail);
    }
  }, [id]);

  if (!asset) {
    return <div className="text-sm text-text-muted p-8">Loading digital twin node...</div>;
  }

  // Check if unallocated
  const isUnallocated = asset.owner === 'Unassigned' || asset.owner === 'Retired';

  const handleAllocateOrTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const oldOwner = asset.owner;
    const isTransfer = !isUnallocated;

    // Build timeline details
    const stepLabel = isTransfer ? 'Transferred' : 'Allocated';
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const stepDesc = isTransfer 
      ? `Transferred from ${oldOwner} to ${selectedEmployee} (${selectedDept} dept).` 
      : `Allocated directly to ${selectedEmployee} in the ${selectedDept} department.`;

    const updatedTimeline = [
      ...asset.timelineSteps.filter(s => s.label !== 'Current'),
      { label: stepLabel, date: dateStr, desc: stepDesc },
      { label: 'Current', date: dateStr, desc: `Operational under ${selectedEmployee}.` }
    ];

    const updatedAsset: AssetDetailData = {
      ...asset,
      owner: selectedEmployee,
      department: selectedDept,
      status: 'In Use',
      timelineSteps: updatedTimeline
    };

    // 1. Save updated details locally & in localStorage
    setAsset(updatedAsset);
    localStorage.setItem(`assetflow_detail_${id}`, JSON.stringify(updatedAsset));

    // 2. Sync general Assets inventory list in localStorage
    const savedAssets = localStorage.getItem('assetflow_assets');
    if (savedAssets) {
      const parsed = JSON.parse(savedAssets) as any[];
      const index = parsed.findIndex(a => a.id === id);
      if (index !== -1) {
        parsed[index].status = 'In Use';
        parsed[index].department = selectedDept;
        localStorage.setItem('assetflow_assets', JSON.stringify(parsed));
      }
    }

    // 3. Log to shared activity log
    const savedLogs = localStorage.getItem('assetflow_activity_log');
    const logs = savedLogs ? JSON.parse(savedLogs) : [];
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    // Message format as specified: "Daksh allocated Laptop-04 — 11:42 AM"
    const actionMsg = isTransfer 
      ? `Daksh transferred ${asset.name} from ${oldOwner} to ${selectedEmployee} — ${timeStr}`
      : `Daksh allocated ${asset.name} to ${selectedEmployee} — ${timeStr}`;

    const newLogs = [...logs, actionMsg];
    localStorage.setItem('assetflow_activity_log', JSON.stringify(newLogs));

    // Close panel
    setIsAllocOpen(false);
    setIsTransferMode(false);
  };

  // Health Score helpers
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
    <div className="space-y-6 max-w-5xl relative">
      {/* Back navigation & Action bar */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/assets')}
          className="btn-secondary text-primary border-border-light hover:bg-gray-50 flex items-center gap-2 py-1.5 px-3 text-xs"
        >
          <ArrowLeft size={14} /> Back to Assets
        </button>

        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-semibold text-text-muted hidden sm:inline">Node: {asset.id}</span>
          <button 
            onClick={() => {
              setIsTransferMode(false);
              setIsAllocOpen(true);
            }}
            className="btn-primary py-1.5 px-4 text-xs font-semibold"
          >
            Allocate / Transfer Asset
          </button>
        </div>
      </div>

      {/* Main Details Panel Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column (Static Metadata Card) */}
        <div className="card-premium p-6 space-y-6 bg-white">
          <div className="flex items-center gap-4 border-b border-border-light pb-4">
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
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted mb-0.5">Asset Status</p>
              <span className={`tag-status mt-0.5 border ${asset.status === 'In Use' ? 'bg-blue-50 text-blue-700 border-blue-200' : asset.status === 'Available' ? 'bg-green-50 text-green-700 border-green-200' : asset.status === 'Maintenance' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                {asset.status === 'In Use' ? 'Allocated' : asset.status}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (Live Telemetry Card) */}
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
        
        <div className="relative">
          <div className="absolute top-3 left-[12%] right-[12%] h-0.5 bg-border-light z-0"></div>
          <div className="grid grid-cols-4 relative z-10">
            {asset.timelineSteps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center space-y-2">
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

      {/* AI Recommendation Panel */}
      <div className="card-premium p-4 border-l-4 border-l-secondary bg-white flex items-start gap-3">
        <AlertCircle size={18} className="text-secondary mt-0.5" />
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-text uppercase tracking-wider">AI Recommender Insight</h4>
          <p className="text-sm text-text font-medium">{asset.aiRecommendation}</p>
        </div>
      </div>

      {/* Allocation / Transfer Side Panel Drawer */}
      {isAllocOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop overlay */}
          <div 
            className="absolute inset-0 bg-black/30 transition-opacity" 
            onClick={() => {
              setIsAllocOpen(false);
              setIsTransferMode(false);
            }}
          ></div>

          {/* Drawer Body Container */}
          <div className="relative w-full max-w-md bg-surface shadow-xl h-full flex flex-col justify-between border-l border-border-light z-10 animate-slide-in">
            {/* Header */}
            <div className="h-16 border-b border-border-light flex items-center justify-between px-6 bg-gray-50/50">
              <h3 className="font-bold text-text text-base">
                {!isUnallocated && !isTransferMode ? 'Allocation Conflict' : 'Allocate Asset'}
              </h3>
              <button 
                onClick={() => {
                  setIsAllocOpen(false);
                  setIsTransferMode(false);
                }} 
                className="text-text-muted hover:text-text p-1.5 rounded hover:bg-gray-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Form Area */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Conflict State (Asset is already allocated) */}
              {!isUnallocated && !isTransferMode ? (
                <div className="space-y-5">
                  <div className="bg-amber-50 border border-amber-200 rounded-[4px] p-4 flex items-start gap-3">
                    <AlertCircle className="text-amber-600 mt-0.5 flex-shrink-0" size={18} />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-amber-900">Asset Already Allocated</h4>
                      <p className="text-xs text-amber-700 leading-normal">
                        This asset is currently assigned to <span className="font-semibold">{asset.owner}</span> in the <span className="font-semibold">{asset.department}</span> department.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-white border border-border-light rounded-lg space-y-4 text-center">
                    <p className="text-sm text-text-muted leading-relaxed">
                      To reassign this device, you must start the transfer authorization sequence. This will create a transfer node in the lifecycle log.
                    </p>
                    <button 
                      onClick={() => setIsTransferMode(true)}
                      className="btn-primary w-full py-2 flex items-center justify-center gap-1.5 text-xs font-semibold"
                    >
                      <User size={14} /> Transfer Instead?
                    </button>
                  </div>
                </div>
              ) : (
                // Allocation / Transfer Form
                <form id="asset-allocation-form" onSubmit={handleAllocateOrTransfer} className="space-y-5">
                  {isTransferMode && (
                    <div className="bg-blue-50 border border-blue-200 rounded-[4px] p-3 text-xs text-blue-800 flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-blue-600 flex-shrink-0" />
                      <span>Authorized: Transferring asset from <strong>{asset.owner}</strong>.</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-muted">Target Employee</label>
                    <select 
                      className="input-premium w-full text-sm"
                      value={selectedEmployee}
                      onChange={(e) => setSelectedEmployee(e.target.value)}
                    >
                      {employees.map(emp => (
                        <option key={emp} value={emp}>{emp}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-muted">Target Department</label>
                    <select 
                      className="input-premium w-full text-sm"
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
                    >
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div className="p-3 bg-gray-50 border border-border-light rounded text-[11px] text-text-muted leading-relaxed">
                    <strong>Note:</strong> On confirm, this asset status tag updates to <strong>In Use (Allocated)</strong>. System activity logs will record this allocation action dynamically.
                  </div>
                </form>
              )}
            </div>

            {/* Footer with actions (only for form input state) */}
            {(isUnallocated || isTransferMode) && (
              <div className="h-16 border-t border-border-light flex items-center justify-end px-6 gap-2 bg-gray-50/50">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsAllocOpen(false);
                    setIsTransferMode(false);
                  }} 
                  className="btn-secondary py-1.5 px-4 text-xs font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  form="asset-allocation-form" 
                  className="btn-primary py-1.5 px-4 text-xs font-semibold"
                >
                  Confirm {isTransferMode ? 'Transfer' : 'Allocation'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
