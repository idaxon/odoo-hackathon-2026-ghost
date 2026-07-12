import { Plus, Check, X } from 'lucide-react';

interface Booking {
  id: string;
  assetName: string;
  assetId: string;
  requestedBy: string;
  startDate: string;
  endDate: string;
  status: 'Approved' | 'Pending' | 'Active' | 'Rejected';
}

export default function Bookings() {
  const bookings: Booking[] = [
    { id: 'BKG-101', assetName: 'HQ Boardroom Projector v2', assetId: 'AST-PRJ-09', requestedBy: 'Michael Scott', startDate: '2026-07-15 09:00', endDate: '2026-07-15 13:00', status: 'Pending' },
    { id: 'BKG-102', assetName: 'MacBook Pro 16" (M3 Max)', assetId: 'AST-2026-001', requestedBy: 'Sarah Connor', startDate: '2026-07-10 09:00', endDate: '2026-10-10 18:00', status: 'Active' },
    { id: 'BKG-103', assetName: 'Testing Lab Rack #4 (Dedicated)', assetId: 'AST-LCK-12', requestedBy: 'David Lightman', startDate: '2026-07-12 12:00', endDate: '2026-07-19 12:00', status: 'Approved' },
    { id: 'BKG-104', assetName: 'iPhone 15 Pro Max 512GB', assetId: 'AST-2026-003', requestedBy: 'John Doe', startDate: '2026-07-05 09:00', endDate: '2026-07-25 18:00', status: 'Active' },
    { id: 'BKG-105', assetName: 'Oculus Rift Development Kit', assetId: 'AST-VR-002', requestedBy: 'Palmer Luckey', startDate: '2026-07-01 08:00', endDate: '2026-07-03 17:00', status: 'Rejected' },
  ];

  const getStatusStyle = (status: Booking['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Approved':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Rejected':
        return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Resource Bookings</h1>
          <p className="text-sm text-text-muted">Schedule and manage bookings of shared equipment, machinery, and workstations.</p>
        </div>
        <button className="btn-primary">
          <Plus size={16} /> New Booking
        </button>
      </div>

      {/* Booking Status Tabs */}
      <div className="border-b border-border-light flex gap-4 text-sm">
        <button className="border-b-2 border-primary pb-2 font-medium text-text">All Bookings</button>
        <button className="text-text-muted hover:text-text pb-2 font-medium">Pending Approval</button>
        <button className="text-text-muted hover:text-text pb-2 font-medium">Active Reservations</button>
        <button className="text-text-muted hover:text-text pb-2 font-medium">History</button>
      </div>

      {/* Bookings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="card-premium p-4 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-text-muted">{booking.id}</span>
                <span className={`tag-status border ${getStatusStyle(booking.status)}`}>
                  {booking.status}
                </span>
              </div>
              <div>
                <h4 className="font-semibold text-text text-base leading-snug">{booking.assetName}</h4>
                <p className="text-xs text-text-muted">Asset ID: {booking.assetId}</p>
              </div>
            </div>

            <div className="bg-gray-50/50 p-2.5 rounded border border-border-light text-xs space-y-1.5 text-text">
              <div className="flex justify-between">
                <span className="text-text-muted">Requested By:</span>
                <span className="font-medium">{booking.requestedBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Start:</span>
                <span className="font-medium">{booking.startDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">End:</span>
                <span className="font-medium">{booking.endDate}</span>
              </div>
            </div>

            {booking.status === 'Pending' && (
              <div className="flex gap-2 pt-2">
                <button className="btn-primary py-1.5 px-3 text-xs flex-1">
                  <Check size={14} /> Approve
                </button>
                <button className="btn-secondary py-1.5 px-3 text-xs flex-1 text-red-600 border-red-200 hover:bg-red-50/50">
                  <X size={14} /> Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
