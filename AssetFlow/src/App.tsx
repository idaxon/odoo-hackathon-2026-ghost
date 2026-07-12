import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import AssetDetail from './pages/AssetDetail';
import Bookings from './pages/Bookings';
import Maintenance from './pages/Maintenance';
import Reports from './pages/Reports';
import Login from './pages/Login';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="assets" element={<Assets />} />
          <Route path="assets/:id" element={<AssetDetail />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
