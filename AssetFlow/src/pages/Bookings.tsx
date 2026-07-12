import { useState, useEffect } from 'react';
import { Plus, X, AlertTriangle, ArrowRight } from 'lucide-react';
import { api } from '../api';

interface Booking {
  id: number;
  resource_name: string;
  resource_type: string;
  booked_by: string;
  start_time: string;
  end_time: string;
}

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Form State
  const [formResource, setFormResource] = useState('Meeting Room B');
  const [formType, setFormType] = useState('Room');
  const [formUser, setFormUser] = useState('Daksh Mishra');
  const [formStart, setFormStart] = useState('2026-07-12T15:00');
  const [formEnd, setFormEnd] = useState('2026-07-12T17:00');

  // Conflict State
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [suggestedResource, setSuggestedResource] = useState<string | null>(null);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await api.getBookings();
      setBookings(data || []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const getBookingStatus = (start: string, end: string) => {
    try {
      const now = new Date();
      // Replace space with T to allow iOS Safari date parsing
      const startDate = new Date(start.replace(' ', 'T'));
      const endDate = new Date(end.replace(' ', 'T'));
      if (endDate < now) return 'Completed';
      if (startDate <= now && endDate >= now) return 'Active';
      return 'Approved';
    } catch (e) {
      return 'Approved';
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Completed':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  // Logic to find a free alternative resource of same type that does not overlap start/end time
  const findAlternativeResource = (type: string, start: string, end: string) => {
    const rooms = ['Boardroom', 'Meeting Room A', 'Meeting Room C'];
    const equipments = ['Design Lab Projector', 'Testing Rack B1', 'Virtual VR headset'];

    const candidates = type === 'Room' ? rooms : equipments;
    
    // Convert inputs to date objects
    const newStart = new Date(start.replace(' ', 'T'));
    const newEnd = new Date(end.replace(' ', 'T'));

    // Check which candidate has no overlapping bookings in this range
    for (const resName of candidates) {
      const hasOverlap = bookings.some(b => {
        if (b.resource_name !== resName) return false;
        const bStart = new Date(b.start_time.replace(' ', 'T'));
        const bEnd = new Date(b.end_time.replace(' ', 'T'));
        return newStart < bEnd && newEnd > bStart;
      });

      if (!hasOverlap) {
        return resName;
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);
    setSuggestedResource(null);

    // Format times to YYYY-MM-DD HH:MM
    const formattedStart = formStart.replace('T', ' ');
    const formattedEnd = formEnd.replace('T', ' ');

    const payload = {
      resource_name: formResource,
      resource_type: formType,
      booked_by: formUser,
      start_time: formattedStart,
      end_time: formattedEnd
    };

    try {
      const response = await api.createBooking(payload);
      if (response && response.conflict) {
        setConflictError(response.message || 'Conflict detected.');
        
        // Find alternative resource of same type
        const alt = findAlternativeResource(formType, formattedStart, formattedEnd);
        if (alt) {
          setSuggestedResource(alt);
        }
      } else {
        // Success
        setIsPanelOpen(false);
        setFormResource('Meeting Room B');
        loadBookings();
      }
    } catch (err: any) {
      console.error('Failed to create booking:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Resource Bookings</h1>
          <p className="text-sm text-text-muted">Schedule and manage bookings of shared equipment, machinery, and workstations.</p>
        </div>
        <button 
          onClick={() => {
            setConflictError(null);
            setSuggestedResource(null);
            setIsPanelOpen(true);
          }}
          className="btn-primary"
        >
          <Plus size={16} /> New Booking
        </button>
      </div>

      {/* Booking Status Tabs */}
      <div className="border-b border-border-light flex gap-4 text-sm">
        <button className="border-b-2 border-primary pb-2 font-medium text-text">All Bookings</button>
        <button className="text-text-muted hover:text-text pb-2 font-medium">History</button>
      </div>

      {/* Bookings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          // Bookings Loading Skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 w-full skeleton-pulse rounded-lg"></div>
          ))
        ) : (
          bookings.map((booking) => {
            const status = getBookingStatus(booking.start_time, booking.end_time);
            return (
              <div key={booking.id} className="card-premium p-4 flex flex-col justify-between space-y-4 bg-white">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-text-muted">BKG-00{booking.id}</span>
                    <span className={`tag-status border ${getStatusStyle(status)}`}>
                      {status}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-text text-base leading-snug">{booking.resource_name}</h4>
                    <p className="text-xs text-text-muted">Type: {booking.resource_type}</p>
                  </div>
                </div>

                <div className="bg-gray-50/50 p-2.5 rounded border border-border-light text-xs space-y-1.5 text-text">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Booked By:</span>
                    <span className="font-medium">{booking.booked_by}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Start:</span>
                    <span className="font-medium font-mono">{booking.start_time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">End:</span>
                    <span className="font-medium font-mono">{booking.end_time}</span>
                  </div>
                </div>
              </div>
            );
          })
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
              <h3 className="font-bold text-text text-base">New Resource Booking</h3>
              <button 
                onClick={() => setIsPanelOpen(false)} 
                className="text-text-muted hover:text-text p-1.5 rounded hover:bg-gray-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Form */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Conflict Alert Banner */}
              {conflictError && (
                <div className="bg-red-50 border border-red-200 rounded-[4px] p-4 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="text-red-600 mt-0.5 flex-shrink-0" size={16} />
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-red-900">Scheduling Overlap Conflict</h4>
                      <p className="text-xs text-red-700 leading-normal">{conflictError}</p>
                    </div>
                  </div>

                  {/* Suggestion Box: same type, free alternative */}
                  {suggestedResource && (
                    <div className="pt-2 border-t border-red-200/50 flex flex-col gap-2">
                      <p className="text-xs text-red-950 font-medium">Alternative resource option available:</p>
                      <button 
                        type="button"
                        onClick={() => {
                          setFormResource(suggestedResource);
                          setConflictError(null);
                          setSuggestedResource(null);
                        }}
                        className="bg-white border border-red-200 hover:bg-red-50 text-red-800 text-[11px] py-1.5 px-3 rounded-[4px] font-bold flex items-center justify-between transition-colors shadow-sm"
                      >
                        <span>{suggestedResource} Available</span>
                        <span className="flex items-center gap-0.5 text-[10px] text-red-600 uppercase tracking-wider font-extrabold">
                          Book Instead <ArrowRight size={12} />
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              <form id="resource-booking-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-muted font-medium">Booked By *</label>
                  <input 
                    type="text" 
                    required 
                    className="input-premium w-full text-sm" 
                    value={formUser}
                    onChange={(e) => setFormUser(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-muted font-medium">Resource Type *</label>
                    <select 
                      className="input-premium w-full text-sm" 
                      value={formType}
                      onChange={(e) => {
                        setFormType(e.target.value);
                        setFormResource(e.target.value === 'Room' ? 'Meeting Room B' : 'Design Lab Projector');
                      }}
                    >
                      <option value="Room">Room</option>
                      <option value="Equipment">Equipment</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-muted font-medium">Resource Name *</label>
                    <input 
                      type="text" 
                      required 
                      className="input-premium w-full text-sm" 
                      value={formResource}
                      onChange={(e) => setFormResource(e.target.value)}
                      placeholder="e.g. Meeting Room B"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-muted font-medium">Start Time *</label>
                  <input 
                    type="datetime-local" 
                    required 
                    className="input-premium w-full text-sm font-mono" 
                    value={formStart}
                    onChange={(e) => setFormStart(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-muted font-medium">End Time *</label>
                  <input 
                    type="datetime-local" 
                    required 
                    className="input-premium w-full text-sm font-mono" 
                    value={formEnd}
                    onChange={(e) => setFormEnd(e.target.value)}
                  />
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
                form="resource-booking-form" 
                className="btn-primary py-1.5 px-4 text-xs font-semibold"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
