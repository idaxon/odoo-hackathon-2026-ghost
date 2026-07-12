import { Outlet, useSearchParams, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import AIAssistant from './AIAssistant';

export default function Layout() {
  const [searchParams] = useSearchParams();
  const isScanned = searchParams.get('scan') === 'true';
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  if (!isAuthenticated && !isScanned) {
    return <Navigate to={`/login?${searchParams.toString()}`} replace />;
  }

  return (
    <div className="min-h-screen bg-bg text-text relative">
      {/* Sidebar Nav - Hide if scanned public link, otherwise desktop only */}
      <div className={isScanned ? 'hidden' : 'hidden lg:block'}>
        <Sidebar />
      </div>

      {/* Main Page Area */}
      <div className={isScanned ? 'w-full flex flex-col min-h-screen' : 'lg:pl-60 flex flex-col min-h-screen w-full'}>
        {/* Topbar Info / Utilities - Hide if scanned public link, otherwise desktop only */}
        <div className={isScanned ? 'hidden' : 'hidden lg:block'}>
          <Topbar />
        </div>

        {/* Viewport for Sub-routes */}
        <main className={isScanned ? 'flex-1 p-4 overflow-y-auto font-sans' : 'flex-1 p-4 lg:p-8 overflow-y-auto'}>
          <Outlet />
        </main>
      </div>

      {/* Floating AI Assistant Widget - Hide if scanned public link, otherwise desktop only */}
      <div className={isScanned ? 'hidden' : 'hidden lg:block'}>
        <AIAssistant />
      </div>
    </div>
  );
}
