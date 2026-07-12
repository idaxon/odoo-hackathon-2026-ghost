import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import AIAssistant from './AIAssistant';

export default function Layout() {
  return (
    <div className="min-h-screen bg-bg text-text relative">
      {/* Sidebar Nav - Desktop only */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main Page Area */}
      <div className="lg:pl-60 flex flex-col min-h-screen w-full">
        {/* Topbar Info / Utilities - Desktop only */}
        <div className="hidden lg:block">
          <Topbar />
        </div>

        {/* Viewport for Sub-routes */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Floating AI Assistant Widget - Desktop only */}
      <div className="hidden lg:block">
        <AIAssistant />
      </div>
    </div>
  );
}
