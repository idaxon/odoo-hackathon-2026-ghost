import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import AIAssistant from './AIAssistant';

export default function Layout() {
  return (
    <div className="min-h-screen bg-bg text-text relative">
      {/* Sidebar Nav */}
      <Sidebar />

      {/* Main Page Area */}
      <div className="pl-60 flex flex-col min-h-screen">
        {/* Topbar Info / Utilities */}
        <Topbar />

        {/* Viewport for Sub-routes */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Floating AI Assistant Widget */}
      <AIAssistant />
    </div>
  );
}
