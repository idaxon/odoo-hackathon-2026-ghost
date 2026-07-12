import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Cpu, Smartphone, Monitor, HardDrive, Sparkles, AlertCircle, Wrench, Battery, X, User, CheckCircle2, MapPin, Send } from 'lucide-react';
import { api } from '../api';
import { QRCodeCanvas } from 'qrcode.react';

interface ChatMessage {
  sender: 'asset' | 'user';
  text: string;
  time: string;
}

interface TimelineStep {
  label: string;
  date: string;
  desc: string;
}

interface ScanLog {
  id: number;
  asset_id: number;
  scanned_by: string;
  location_note: string;
  timestamp: string;
}

const formatTimeAgo = (timestampStr: string) => {
  try {
    const dt = new Date(timestampStr.replace(' ', 'T'));
    const now = new Date();
    const diffMs = now.getTime() - dt.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch (e) {
    return timestampStr;
  }
};

interface AssetDetailData {
  id: number;
  asset_code: string;
  name: string;
  category: string;
  department_name: string;
  assigned_to_name: string | null;
  assigned_to: number | null;
  purchase_date: string;
  serial_number: string;
  warranty_expiry: string;
  health_score: number;
  risk_level: 'Low' | 'Medium' | 'High';
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  battery_pct?: number;
  last_maintenance_date: string;
  timelineSteps: TimelineStep[];
  aiRecommendation: string;
  status: 'Available' | 'In Use' | 'Maintenance' | 'Retired';
  purchase_cost: number;
  vendor: string | null;
  repair_cost: number;
  replacement_cost: number;
}

export default function AssetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isScanned = searchParams.get('scan') === 'true';

  // Load States
  const [loading, setLoading] = useState(true);
  const [asset, setAsset] = useState<AssetDetailData | null>(null);
  const [qrOrigin, setQrOrigin] = useState(window.location.origin);

  // Interactive Chat States
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Allocation Drawer State
  const [isAllocOpen, setIsAllocOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(1);
  const [selectedDeptId, setSelectedDeptId] = useState(3);
  const [isTransferMode, setIsTransferMode] = useState(false);

  // Public Report Issue Drawer State
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportName, setReportName] = useState('Public Reporter');
  const [reportPriority, setReportPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [reportDescription, setReportDescription] = useState('');

  // Location Tracking State
  const [scanHistory, setScanHistory] = useState<ScanLog[]>([]);
  const [showCheckInAlert, setShowCheckInAlert] = useState(isScanned);
  const [checkInLocation, setCheckInLocation] = useState('');

  // Seeded database reference mappings (CORS safe database IDs)
  const employees = [
    { id: 1, name: 'Sarah Connor' },
    { id: 2, name: 'John Doe' },
    { id: 3, name: 'Alex Mercer' },
    { id: 4, name: 'Elena Rostova' },
    { id: 5, name: 'Michael Scott' },
    { id: 6, name: 'Jane Austen' }
  ];

  const departments = [
    { id: 1, name: 'Marketing' },
    { id: 2, name: 'HR' },
    { id: 3, name: 'Engineering' }
  ];

  const loadAssetDetail = async (assetId: string) => {
    try {
      setLoading(true);
      const data = await api.getAssetById(assetId);
      setAsset(data);
      
      const voiceRes = await api.getAssetVoice(assetId);
      const initialText = voiceRes.voiceText || `I'm ${data.name}. Ask me about my health score, financial value, or maintenance history!`;
      
      setChatMessages([
        {
          sender: 'asset',
          text: initialText,
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      const history = await api.getAssetScanHistory(assetId);
      setScanHistory(history || []);
    } catch (error) {
      console.error('Failed to load asset details:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAssetReply = (userInput: string) => {
    if (!asset) return 'Connecting...';
    const input = userInput.toLowerCase();
    
    if (input.includes('problem') || input.includes('health') || input.includes('feel') || input.includes('status')) {
      if (asset.health_score < 50) {
        return `Honestly, my health score has dropped to ${asset.health_score}/100. I have needed repairs ${asset.repair_cost > 0 ? 'regularly' : 'recently'}, and I feel a bit worn down. I'd appreciate some checkups!`;
      } else {
        return `I'm feeling great! My health score is currently ${asset.health_score}/100. No critical errors or failure symptoms to report.`;
      }
    }
    
    if (input.includes('history') || input.includes('maintenance') || input.includes('service') || input.includes('timeline')) {
      return `I was purchased on ${asset.purchase_date} from ${asset.vendor || 'direct partner'}. My last documented service check was on ${asset.last_maintenance_date || 'N/A'}. You can inspect my complete lifecycle timeline below.`;
    }
    
    if (input.includes('financial') || input.includes('cost') || input.includes('replace') || input.includes('repair') || input.includes('value')) {
      const bookValue = Math.round(asset.purchase_cost * (asset.health_score / 100));
      if (asset.replacement_cost < asset.repair_cost) {
        return `I cost ₹${asset.purchase_cost.toLocaleString()} initially. Replacing me costs ₹${asset.replacement_cost.toLocaleString()}, while fixing me would cost ₹${asset.repair_cost.toLocaleString()}. Replacing me makes more sense than repairing me again!`;
      } else {
        return `My current book value is estimated at ₹${bookValue.toLocaleString()}. Repairing me costs ₹${asset.repair_cost.toLocaleString()}, which is below my replacement cost of ₹${asset.replacement_cost.toLocaleString()}. I am still highly cost-effective to maintain!`;
      }
    }
    
    if (input.includes('allocate') || input.includes('where') || input.includes('owner') || input.includes('assigned') || input.includes('department')) {
      if (asset.assigned_to_name) {
        return `I am currently assigned to ${asset.assigned_to_name} in the ${asset.department_name} department. If you need to re-allocate or transfer me, please use the action button in the header.`;
      } else {
        return `I am currently available in storage. If your department needs me, click the 'Allocate / Transfer' action button at the top to check me out!`;
      }
    }
    
    return `Hello! I'm ${asset.name} (${asset.asset_code}), a ${asset.category} currently marked as ${asset.status}. Ask me about my health, maintenance history, or repair vs replacement costs!`;
  };

  const handleSendChatMessage = (text: string) => {
    if (!text.trim()) return;
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    const userMsg = { sender: 'user' as const, text, time };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      const replyText = generateAssetReply(text);
      const replyMsg = { sender: 'asset' as const, text: replyText, time };
      setChatMessages(prev => [...prev, replyMsg]);
    }, 600);
  };

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset) return;
    try {
      await api.postAssetScanLog(String(asset.id), checkInLocation || 'Unknown location', 'Public Scanner');
      setShowCheckInAlert(false);
      setCheckInLocation('');
      if (id) {
        loadAssetDetail(id);
      }
    } catch (err) {
      console.error('Failed to log scan:', err);
    }
  };

  useEffect(() => {
    if (id) {
      loadAssetDetail(id);
    }

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
  }, [id]);

  const handleAllocateOrTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !asset) return;

    try {
      if (isTransferMode || asset.assigned_to !== null) {
        // Transfer flow
        await api.transferAsset(String(asset.id), selectedEmployeeId, selectedDeptId);
      } else {
        // Allocate directly
        await api.allocateAsset(String(asset.id), selectedEmployeeId, selectedDeptId);
      }
      setIsAllocOpen(false);
      setIsTransferMode(false);
      loadAssetDetail(id); // Reload updated data
    } catch (error) {
      console.error('Failed to process allocation:', error);
    }
  };

  const handleReportIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset) return;

    try {
      await api.createMaintenanceRequest({
        asset_id: asset.id,
        raised_by: reportName,
        priority: reportPriority,
        description: reportDescription
      });
      setIsReportOpen(false);
      setReportDescription('');
      setReportName('Public Reporter');
      if (id) {
        loadAssetDetail(id); // Reload updated asset condition
      }
    } catch (err) {
      console.error('Failed to submit maintenance request:', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <div className="h-9 w-32 skeleton-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 w-full skeleton-pulse rounded-lg"></div>
          <div className="h-64 w-full skeleton-pulse rounded-lg"></div>
        </div>
        <div className="h-44 w-full skeleton-pulse rounded-lg"></div>
        <div className="h-16 w-full skeleton-pulse rounded-lg"></div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="space-y-6 max-w-5xl">
        <button onClick={() => navigate('/assets')} className="btn-secondary text-xs">
          <ArrowLeft size={14} /> Back to Inventory
        </button>
        <div className="card-premium p-8 text-center text-text-muted">
          Digital Twin Node matching ID "{id}" was not compiled in database.
        </div>
      </div>
    );
  }

  const isUnallocated = asset.assigned_to === null;
  const warrantyStatus = asset.warranty_expiry && new Date(asset.warranty_expiry) > new Date() ? 'Active' : 'Expired';
  const healthStatus = asset.health_score > 80 
    ? { label: 'Healthy', color: 'bg-green-50 text-green-700 border-green-200' }
    : asset.health_score >= 50
    ? { label: 'Monitor', color: 'bg-amber-50 text-amber-700 border-amber-200' }
    : { label: 'Critical', color: 'bg-red-50 text-red-700 border-red-200' };

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
    <div className="space-y-6 max-w-5xl relative font-sans">
      {/* Back navigation & Action bar */}
      <div className="flex items-center justify-between">
        {/* Desktop-only back navigation */}
        <button 
          onClick={() => navigate('/assets')}
          className={isScanned ? 'hidden' : 'hidden lg:flex btn-secondary text-primary border-border-light hover:bg-gray-50 items-center gap-2 py-1.5 px-3 text-xs font-semibold'}
        >
          <ArrowLeft size={14} /> Back to Assets
        </button>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          <span className="font-mono text-xs font-semibold text-text-muted">Node: {asset.asset_code}</span>
          <div className="flex items-center gap-2">
            {/* Desktop-only Admin Allocate Button */}
            <button 
              onClick={() => {
                setIsTransferMode(false);
                setIsAllocOpen(true);
              }}
              className={isScanned ? 'hidden' : 'hidden lg:block btn-primary py-1.5 px-4 text-xs font-semibold'}
            >
              Allocate / Transfer Asset
            </button>
            
            {/* Public/Mobile Report Issue Button (Shown everywhere, prominent on mobile) */}
            <button 
              onClick={() => setIsReportOpen(true)}
              className="btn-secondary text-red-600 border-red-200 hover:bg-red-50 py-1.5 px-4 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Wrench size={13} /> Report Issue
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Chat Panel with Asset */}
      {asset && chatMessages.length > 0 && (
        <div className="card-premium bg-white p-5 space-y-4 animate-appear border border-border-light shadow-sm">
          {/* Header */}
          <div className="flex items-center gap-2.5 border-b border-border-light pb-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              {getCategoryIcon(asset.category)}
            </div>
            <div>
              <h3 className="text-sm font-bold text-text flex items-center gap-1.5">
                Chat with {asset.name} <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-ping"></span>
              </h3>
              <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider">Interactive Digital Twin Voice Channel</p>
            </div>
          </div>

          {/* Messages Grid */}
          <div className="space-y-3.5 max-h-64 overflow-y-auto p-2 bg-gray-50/30 rounded border border-border-light">
            {chatMessages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[75%] rounded p-3 text-xs leading-relaxed space-y-1 ${
                    msg.sender === 'user' 
                      ? 'bg-primary text-white font-medium shadow-sm' 
                      : 'bg-white border border-border-light text-text shadow-sm'
                  }`}
                >
                  <p className={msg.sender === 'asset' ? 'italic' : ''}>{msg.text}</p>
                  <span className={`text-[9px] block text-right mt-1 ${
                    msg.sender === 'user' ? 'text-white/60' : 'text-text-muted'
                  }`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-border-light rounded px-3 py-2 text-xs text-text-muted italic flex items-center gap-1.5 shadow-sm">
                  <span className="w-1 h-1 bg-text-muted rounded-full animate-bounce"></span>
                  <span className="w-1 h-1 bg-text-muted rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1 h-1 bg-text-muted rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  <span>{asset.name} is typing...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Questions Prompts */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted block">Quick Questions:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleSendChatMessage("How are you feeling / are there any problems?")}
                className="btn-secondary py-1.5 px-2.5 text-[10px] bg-gray-50 border-border-light text-text hover:bg-gray-100 font-bold transition-all cursor-pointer"
              >
                🩺 Diagnoses & Problems?
              </button>
              <button
                type="button"
                onClick={() => handleSendChatMessage("Tell me about your maintenance history.")}
                className="btn-secondary py-1.5 px-2.5 text-[10px] bg-gray-50 border-border-light text-text hover:bg-gray-100 font-bold transition-all cursor-pointer"
              >
                📅 Service & Timeline?
              </button>
              <button
                type="button"
                onClick={() => handleSendChatMessage("What is your cost status (repair vs replace)?")}
                className="btn-secondary py-1.5 px-2.5 text-[10px] bg-gray-50 border-border-light text-text hover:bg-gray-100 font-bold transition-all cursor-pointer"
              >
                💰 Cost vs Depreciation?
              </button>
              <button
                type="button"
                onClick={() => handleSendChatMessage("Where are you currently allocated?")}
                className="btn-secondary py-1.5 px-2.5 text-[10px] bg-gray-50 border-border-light text-text hover:bg-gray-100 font-bold transition-all cursor-pointer"
              >
                🏢 Department & Owner?
              </button>
            </div>
          </div>

          {/* Chat Input form */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendChatMessage(chatInput); }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder={`Ask ${asset.name} a question...`}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="input-premium flex-1 text-xs"
            />
            <button
              type="submit"
              className="btn-primary py-1.5 px-4 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Send size={12} /> Send
            </button>
          </form>
        </div>
      )}

      {/* QR Code Scanned Inline Check-In Form */}
      {isScanned && showCheckInAlert && (
        <div className="card-premium p-4 border-l-4 border-l-secondary bg-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 animate-appear">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-secondary/15 text-secondary flex items-center justify-center flex-shrink-0">
              <MapPin size={16} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-text">QR Scan Detected!</h4>
              <p className="text-xs text-text-muted">Where is this asset currently located?</p>
            </div>
          </div>
          <form onSubmit={handleCheckInSubmit} className="flex gap-2 w-full sm:w-auto">
            <input 
              type="text" 
              placeholder="e.g. Marketing Floor 2" 
              className="input-premium py-1.5 px-3 text-xs w-full sm:w-60"
              value={checkInLocation}
              onChange={(e) => setCheckInLocation(e.target.value)}
            />
            <button type="submit" className="btn-primary py-1.5 px-4 text-xs font-semibold">
              Save Location
            </button>
            <button 
              type="button" 
              onClick={() => setShowCheckInAlert(false)}
              className="btn-secondary py-1.5 px-3 text-xs"
            >
              Skip
            </button>
          </form>
        </div>
      )}

      {/* Main Details Panel Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column (Metadata Card) */}
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
                <span>{asset.asset_code}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted mb-0.5">Asset Owner</p>
              <p className="font-medium text-text">{asset.assigned_to_name || 'Unassigned'}</p>
            </div>
            <div>
              {scanHistory.length >= 2 ? (
                <>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-secondary mb-0.5">Last Seen</p>
                  <p className="font-bold text-text truncate">
                    {scanHistory[0].location_note}{' '}
                    <span className="text-[10px] text-text-muted font-normal">
                      ({formatTimeAgo(scanHistory[0].timestamp)})
                    </span>
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted mb-0.5">Department</p>
                  <p className="font-medium text-text">{asset.department_name}</p>
                </>
              )}
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted mb-0.5">Purchase Date</p>
              <p className="font-mono font-medium text-text">{asset.purchase_date}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted mb-0.5">Serial Number</p>
              <p className="font-mono font-medium text-text truncate">{asset.serial_number}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted mb-0.5">Warranty Status</p>
              <span className={`tag-status mt-0.5 border ${warrantyStatus === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                {warrantyStatus}
              </span>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted mb-0.5">Asset Status</p>
              <span className={`tag-status mt-0.5 border ${asset.status === 'In Use' ? 'bg-blue-50 text-blue-700 border-blue-200' : asset.status === 'Available' ? 'bg-green-50 text-green-700 border-green-200' : asset.status === 'Maintenance' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                {asset.status === 'In Use' ? 'Allocated' : asset.status}
              </span>
            </div>
          </div>

          {/* Asset QR Code Block */}
          <div className="border-t border-border-light pt-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-xs font-bold text-text uppercase tracking-wider">Asset QR Node</h4>
              <p className="text-[11px] text-text-muted leading-relaxed max-w-[200px]">Scan from mobile device on same network to sync twin data instantly.</p>
              <button 
                onClick={() => {
                  const canvas = document.getElementById('twin-qr-canvas') as HTMLCanvasElement;
                  if (canvas) {
                    const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
                    const downloadLink = document.createElement('a');
                    downloadLink.href = pngUrl;
                    downloadLink.download = `QR-${asset.asset_code}.png`;
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                  }
                }}
                className={isScanned ? 'hidden' : 'hidden lg:flex btn-secondary py-1 px-2.5 text-[10px] mt-2 font-semibold items-center gap-1.5 bg-gray-50 border-border-light hover:bg-gray-100'}
              >
                Download QR Code
              </button>
            </div>
            <div className="bg-white p-2 border border-border-light rounded shadow-sm flex-shrink-0">
              <QRCodeCanvas
                id="twin-qr-canvas"
                value={`${qrOrigin}/assets/${asset.asset_code}?scan=true`}
                size={84}
                level="M"
                includeMargin={true}
              />
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
                  {asset.health_score}<span className="text-sm font-medium text-text-muted">/100</span>
                </div>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-secondary h-full transition-all duration-500" 
                  style={{ width: `${asset.health_score}%` }}
                ></div>
              </div>
            </div>

            {/* Telemetry Metrics */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-gray-50/50 p-2.5 rounded border border-border-light">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Risk Level</span>
                <span className="text-sm font-semibold text-text">{asset.risk_level || 'Low'}</span>
              </div>
              <div className="bg-gray-50/50 p-2.5 rounded border border-border-light">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Condition</span>
                <span className="text-sm font-semibold text-text">{asset.condition}</span>
              </div>
              {asset.battery_pct !== null && asset.battery_pct !== undefined && (
                <div className="bg-gray-50/50 p-2.5 rounded border border-border-light flex items-center justify-between col-span-2">
                  <div>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Battery Health</span>
                    <span className="text-sm font-semibold text-text">{asset.battery_pct}% Capacity</span>
                  </div>
                  <Battery className="text-text-muted" size={20} />
                </div>
              )}
            </div>
          </div>

          <div className="text-xs text-text-muted border-t border-border-light pt-3 flex items-center gap-1.5 font-medium">
            <Wrench size={13} />
            <span>Last Maintenance: {asset.last_maintenance_date || 'No maintenance recorded'}</span>
          </div>
        </div>

      </div>

      {/* Horizontal Lifecycle Timeline Component */}
      <div className="card-premium p-6 bg-white space-y-6">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider border-b border-border-light pb-2">Lifecycle Timeline</h3>
        
        <div className="relative">
          <div className="absolute top-3 left-[12%] right-[12%] h-0.5 bg-border-light z-0"></div>
          <div className="grid grid-cols-4 relative z-10">
            {asset.timelineSteps && asset.timelineSteps.map((step, idx) => (
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

      {/* Location Trail (QR Scan Logs) */}
      <div className="card-premium p-6 bg-white space-y-4">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider border-b border-border-light pb-2">
          Location Trail (QR Scan Logs)
        </h3>
        
        <div className="flow-root">
          <ul className="-mb-8">
            {scanHistory.map((log, idx) => (
              <li key={log.id}>
                <div className="relative pb-8">
                  {idx !== scanHistory.length - 1 && (
                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                  )}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-secondary/15 flex items-center justify-center ring-8 ring-white text-secondary">
                        <MapPin size={13} />
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-xs font-semibold text-text">
                          Checked in at <span className="font-bold text-secondary">{log.location_note}</span>
                        </p>
                        <p className="text-[10px] text-text-muted mt-0.5">
                          Actor Node: {log.scanned_by}
                        </p>
                      </div>
                      <div className="text-right text-[10px] whitespace-nowrap text-text-muted font-mono">
                        {log.timestamp}{' '}
                        <span className="text-[9px] block text-text-muted">
                          ({formatTimeAgo(log.timestamp)})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
            {scanHistory.length === 0 && (
              <div className="text-center text-xs text-text-muted py-2 font-medium">
                No scan location check-ins logged for this asset.
              </div>
            )}
          </ul>
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

          {/* Drawer Body */}
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

            {/* Scrollable Form */}
            <div className="flex-1 overflow-y-auto p-6">
              {!isUnallocated && !isTransferMode ? (
                // Conflict
                <div className="space-y-5">
                  <div className="bg-amber-50 border border-amber-200 rounded-[4px] p-4 flex items-start gap-3">
                    <AlertCircle className="text-amber-600 mt-0.5 flex-shrink-0" size={18} />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-amber-900">Asset Already Allocated</h4>
                      <p className="text-xs text-amber-700 leading-normal">
                        This asset is currently assigned to <span className="font-semibold">{asset.assigned_to_name}</span> in the <span className="font-semibold">{asset.department_name}</span> department.
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
                // Form input
                <form id="asset-allocation-form" onSubmit={handleAllocateOrTransfer} className="space-y-5">
                  {isTransferMode && (
                    <div className="bg-blue-50 border border-blue-200 rounded-[4px] p-3 text-xs text-blue-800 flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-blue-600 flex-shrink-0" />
                      <span>Authorized: Transferring asset from <strong>{asset.assigned_to_name}</strong>.</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-muted">Target Employee</label>
                    <select 
                      className="input-premium w-full text-sm"
                      value={selectedEmployeeId}
                      onChange={(e) => setSelectedEmployeeId(parseInt(e.target.value))}
                    >
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-muted">Target Department</label>
                    <select 
                      className="input-premium w-full text-sm"
                      value={selectedDeptId}
                      onChange={(e) => setSelectedDeptId(parseInt(e.target.value))}
                    >
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="p-3 bg-gray-50 border border-border-light rounded text-[11px] text-text-muted leading-relaxed">
                    <strong>Note:</strong> On confirm, this asset status tag updates to <strong>In Use (Allocated)</strong>. System activity logs will record this allocation action dynamically.
                  </div>
                </form>
              )}
            </div>

            {/* Footer buttons */}
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
      {/* Public Report Issue Side Drawer Panel */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop overlay */}
          <div 
            className="absolute inset-0 bg-black/30 transition-opacity" 
            onClick={() => setIsReportOpen(false)}
          ></div>

          {/* Drawer Body */}
          <div className="relative w-full max-w-md bg-surface shadow-xl h-full flex flex-col justify-between border-l border-border-light z-10 animate-slide-in">
            {/* Header */}
            <div className="h-16 border-b border-border-light flex items-center justify-between px-6 bg-gray-50/50">
              <h3 className="font-bold text-text text-base">Report Hardware Issue</h3>
              <button 
                onClick={() => setIsReportOpen(false)} 
                className="text-text-muted hover:text-text p-1.5 rounded hover:bg-gray-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Form */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <form id="public-report-form" onSubmit={handleReportIssue} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-muted">Reporter Name *</label>
                  <input 
                    type="text" 
                    required 
                    className="input-premium w-full text-sm" 
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-muted">Issue Severity / Priority *</label>
                  <select 
                    className="input-premium w-full text-sm"
                    value={reportPriority}
                    onChange={(e) => setReportPriority(e.target.value as any)}
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Critical">Critical Failure</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-muted">Description of Issue *</label>
                  <textarea 
                    required 
                    rows={4}
                    className="input-premium w-full text-sm" 
                    placeholder="Explain what is failing, compressor noise, screen flicker, leak, etc..."
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                  />
                </div>

                <div className="p-3 bg-red-50 border border-red-100 rounded text-[11px] text-red-700 flex items-start gap-1.5 leading-relaxed">
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  <span>On submit, this request is immediately recorded, and this asset's status tag will update to <strong>Maintenance</strong>.</span>
                </div>
              </form>
            </div>

            {/* Footer containing action buttons */}
            <div className="h-16 border-t border-border-light flex items-center justify-end px-6 gap-2 bg-gray-50/50">
              <button 
                type="button" 
                onClick={() => setIsReportOpen(false)} 
                className="btn-secondary py-1.5 px-4 text-xs font-medium"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="public-report-form" 
                className="btn-primary py-1.5 px-4 text-xs font-semibold"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
