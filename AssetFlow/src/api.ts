const hostname = window.location.hostname;
const BASE_URL = `http://${hostname}:3001/api`;

async function request(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    if (res.status === 409) {
      // Return details for conflict logic
      return res.json();
    }
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP error ${res.status}`);
  }
  return res.json();
}

export const api = {
  getDashboardSummary: () => request('/dashboard/summary'),
  getAssets: () => request('/assets'),
  getAssetById: (id: string) => request(`/assets/${id}`),
  createAsset: (data: any) => request('/assets', { method: 'POST', body: JSON.stringify(data) }),
  allocateAsset: (id: string, employeeId: number, departmentId: number) => 
    request(`/assets/${id}/allocate`, { method: 'PATCH', body: JSON.stringify({ employeeId, departmentId }) }),
  transferAsset: (id: string, employeeId: number, departmentId: number) => 
    request(`/assets/${id}/transfer`, { method: 'PATCH', body: JSON.stringify({ employeeId, departmentId }) }),
  getBookings: () => request('/bookings'),
  createBooking: (data: any) => request('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  deleteBooking: (id: number) => request(`/bookings/${id}`, { method: 'DELETE' }),
  getMaintenanceRequests: () => request('/maintenance'),
  createMaintenanceRequest: (data: any) => request('/maintenance', { method: 'POST', body: JSON.stringify(data) }),
  resolveMaintenanceRequest: (id: number, data?: any) => request(`/maintenance/${id}/resolve`, { method: 'PATCH', body: data ? JSON.stringify(data) : undefined }),
  getActivityLogs: () => request('/activity-logs'),
  
  // AI recommendations
  getAIIdleAssets: () => request('/ai/idle-assets'),
  getAIReplaceCandidates: () => request('/ai/replace-candidates'),
  getAIAvailableCategory: (category: string) => request(`/ai/available/${category}`),
  getAIMaintenanceToday: () => request('/ai/maintenance-today'),
  getSystemIp: () => request('/system/ip'),
  getAssetVoice: (id: string) => request(`/assets/${id}/voice`),
  postAssetScanLog: (id: string, locationNote: string, scannedBy: string) => 
    request(`/assets/${id}/scan-log`, { method: 'POST', body: JSON.stringify({ location_note: locationNote, scanned_by: scannedBy }) }),
  getAssetScanHistory: (id: string) => request(`/assets/${id}/scan-history`),
  getAssetRequests: () => request('/asset-requests'),
  createAssetRequest: (data: any) => request('/asset-requests', { method: 'POST', body: JSON.stringify(data) }),
  approveAssetRequest: (id: number) => request(`/asset-requests/${id}/approve`, { method: 'PATCH' }),
  rejectAssetRequest: (id: number) => request(`/asset-requests/${id}/reject`, { method: 'PATCH' })
};
