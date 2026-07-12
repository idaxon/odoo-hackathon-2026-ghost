import { useState, useEffect } from 'react';
import { Plus, X, AlertTriangle, ArrowRight, Trash2, Calendar as CalendarIcon, Clock } from 'lucide-react';
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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

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

  const findAlternativeResource = (type: string, start: string, end: string) => {
    const rooms = ['Boardroom', 'Meeting Room A', 'Meeting Room C'];
    const equipments = ['Design Lab Projector', 'Testing Rack B1', 'Virtual VR headset'];
    const candidates = type === 'Room' ? rooms : equipments;
    
    const newStart = new Date(start.replace(' ', 'T'));
    const newEnd = new Date(end.replace(' ', 'T'));

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

    // Validate inputs
    const errors: Record<string, string> = {};
    if (!formUser.trim()) errors.user = 'Booked-by name is required.';
    if (!formResource.trim()) errors.resource = 'Please select a resource.';
    if (!formStart) errors.start = 'Start time is required.';
    if (!formEnd) errors.end = 'End time is required.';
    if (formStart && formEnd && formStart >= formEnd) errors.end = 'End time must be after start time.';
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});

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
        const alt = findAlternativeResource(formType, formattedStart, formattedEnd);
        if (alt) {
          setSuggestedResource(alt);
        }
      } else {
        setIsPanelOpen(false);
        setFormResource('Meeting Room B');
        loadBookings();
      }
    } catch (err: any) {
      console.error('Failed to create booking:', err);
    }
  };

  const handleCancelBooking = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel and release this reservation?')) return;
    try {
      await api.deleteBooking(id);
      loadBookings();
    } catch (err) {
      console.error('Failed to cancel booking:', err);
    }
  };

  // Helper to determine who is booking a resource at a specific hour on 2026-07-12
  const getBookingForHour = (resourceName: string, hour: number) => {
    return bookings.find(b => {
      if (b.resource_name.toLowerCase() !== resourceName.toLowerCase()) return false;
      if (!b.start_time.startsWith('2026-07-12')) return false;
      
      const startHour = parseInt(b.start_time.split(' ')[1].split(':')[0]);
      const endHour = parseInt(b.end_time.split(' ')[1].split(':')[0]);
      return hour >= startHour && hour < endHour;
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const trackResources = [
    { name: 'Meeting Room B', type: 'Room' },
    { name: 'Boardroom', type: 'Room' },
    { name: 'Design Lab Projector', type: 'Equipment' }
  ];
  
  const hoursRange = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

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

      {/* Visual Schedule Timeline Grid */}
      <div className="card-premium p-5 bg-white space-y-4">
        <div className="flex items-center justify-between border-b border-border-light pb-2.5">
          <h3 className="font-semibold text-text text-sm flex items-center gap-1.5">
            <CalendarIcon size={15} className="text-primary" /> Today's Resource Schedule (July 12, 2026)
          </h3>
          <span className="text-[10px] uppercase font-bold text-text-muted">Hourly Occupancy Grid</span>
        </div>

        <div className="space-y-3.5">
          {/* Timeline Hours Header */}
          <div className="grid grid-cols-12 gap-1 text-[9px] font-bold text-text-muted uppercase tracking-wider text-center pl-[150px] hidden sm:grid">
            {hoursRange.map(h => (
              <div key={h}>{h > 12 ? `${h-12} PM` : h === 12 ? '12 PM' : `${h} AM`}</div>
            ))}
          </div>

          {/* Resource occupancy rows */}
          <div className="space-y-3">
            {trackResources.map(res => (
              <div key={res.name} className="flex flex-col sm:flex-row sm:items-center gap-2">
                {/* Resource Info Label */}
                <div className="w-[145px] flex-shrink-0">
                  <p className="text-xs font-bold text-text truncate">{res.name}</p>
                  <span className="text-[9px] uppercase font-bold text-text-muted">{res.type}</span>
                </div>

                {/* 12-Hour occupancy bar */}
                <div className="grid grid-cols-12 gap-1.5 flex-1 w-full">
                  {hoursRange.map(hour => {
                    const activeBkg = getBookingForHour(res.name, hour);
                    return activeBkg ? (
                      <div 
                        key={hour} 
                        title={`Booked by ${activeBkg.booked_by} (${activeBkg.start_time.split(' ')[1]} - ${activeBkg.end_time.split(' ')[1]})`}
                        className="bg-red-50 text-red-700 border border-red-200 h-8 flex flex-col items-center justify-center rounded text-[9px] font-bold cursor-help transition-all shadow-sm select-none"
                      >
                        <span className="text-[10px] font-extrabold">{getInitials(activeBkg.booked_by)}</span>
                      </div>
                    ) : (
                      <div 
                        key={hour}
                        title={`${hour > 12 ? `${hour-12} PM` : `${hour} AM`} - Available`}
                        className="bg-gray-50 border border-border-light h-8 flex items-center justify-center rounded text-[9px] font-semibold text-text-muted hover:bg-green-50/50 hover:border-green-300 hover:text-green-700 cursor-default transition-all select-none"
                      >
                        <Clock size={10} className="opacity-30" />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking List Section Header */}
      <div className="border-b border-border-light flex gap-4 text-sm">
        <button className="border-b-2 border-primary pb-2 font-medium text-text">All Active Reservations</button>
      </div>

      {/* Bookings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 w-full skeleton-pulse rounded-lg"></div>
          ))
        ) : bookings.length === 0 ? (
          <div className="col-span-full card-premium p-8 text-center text-text-muted text-sm bg-white">
            No bookings registered. Click 'New Booking' to reserve a resource.
          </div>
        ) : (
          bookings.map((booking) => {
            const status = getBookingStatus(booking.start_time, booking.end_time);
            return (
              <div key={booking.id} className="card-premium p-4 flex flex-col justify-between space-y-4 bg-white hover:border-border-medium transition-all">
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
                    <span className="text-text-muted font-medium">Booked By:</span>
                    <span className="font-semibold">{booking.booked_by}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted font-medium">Start:</span>
                    <span className="font-semibold font-mono">{booking.start_time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted font-medium">End:</span>
                    <span className="font-semibold font-mono">{booking.end_time}</span>
                  </div>
                </div>

                {status !== 'Completed' && (
                  <button 
                    onClick={() => handleCancelBooking(booking.id)}
                    className="w-full text-center text-xs text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 py-1.5 rounded font-bold transition-all flex items-center justify-center gap-1 mt-1 cursor-pointer"
                  >
                    <Trash2 size={13} /> Cancel & Release
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Sliding Side Panel Drawer (Right-aligned) */}
      {isPanelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="absolute inset-0 bg-black/30 transition-opacity" 
            onClick={() => setIsPanelOpen(false)}
          ></div>

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

              {/* Demo Helper Presets */}
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded text-xs space-y-2.5">
                <span className="font-bold text-amber-900 block flex items-center gap-1">
                  💡 Presentation Demo Hotkeys
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormResource('Meeting Room B');
                      setFormType('Room');
                      setFormUser('Michael Scott');
                      setFormStart('2026-07-12T14:00');
                      setFormEnd('2026-07-12T16:00');
                    }}
                    className="bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 py-1 px-2 rounded font-bold transition-all text-[10px] shadow-sm"
                  >
                    Simulate Room B Conflict
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormResource('Boardroom');
                      setFormType('Room');
                      setFormUser('Pam Beesly');
                      setFormStart('2026-07-12T08:00');
                      setFormEnd('2026-07-12T10:00');
                    }}
                    className="bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 py-1 px-2 rounded font-bold transition-all text-[10px] shadow-sm"
                  >
                    Fill 8:00-10:00 Slot
                  </button>
                </div>
              </div>

              <form id="resource-booking-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-muted font-medium">Booked By *</label>
                  <input 
                    type="text" 
                    required 
                    className={`input-premium w-full text-sm ${validationErrors.user ? 'border-red-400' : ''}`}
                    value={formUser}
                    onChange={(e) => setFormUser(e.target.value)}
                  />
                  {validationErrors.user && <p className="text-[10px] text-red-500 font-semibold mt-0.5">{validationErrors.user}</p>}
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
                      className={`input-premium w-full text-sm ${validationErrors.resource ? 'border-red-400' : ''}`}
                      value={formResource}
                      onChange={(e) => setFormResource(e.target.value)}
                      placeholder="e.g. Meeting Room B"
                    />
                    {validationErrors.resource && <p className="text-[10px] text-red-500 font-semibold mt-0.5">{validationErrors.resource}</p>}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-muted font-medium">Start Time *</label>
                  <input 
                    type="datetime-local" 
                    required 
                    className={`input-premium w-full text-sm font-mono ${validationErrors.start ? 'border-red-400' : ''}`}
                    value={formStart}
                    onChange={(e) => setFormStart(e.target.value)}
                  />
                  {validationErrors.start && <p className="text-[10px] text-red-500 font-semibold mt-0.5">{validationErrors.start}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-muted font-medium">End Time *</label>
                  <input 
                    type="datetime-local" 
                    required 
                    className={`input-premium w-full text-sm font-mono ${validationErrors.end ? 'border-red-400' : ''}`}
                    value={formEnd}
                    onChange={(e) => setFormEnd(e.target.value)}
                  />
                  {validationErrors.end && <p className="text-[10px] text-red-500 font-semibold mt-0.5">{validationErrors.end}</p>}
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
