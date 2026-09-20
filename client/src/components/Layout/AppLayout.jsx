import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import Sidebar from '../Sidebar/Sidebar';

export default function AppLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <TopBar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="app-body">
        <div className={`app-sidebar-container ${isSidebarOpen ? 'open' : ''}`}>
          <Sidebar />
        </div>
        <main className="app-main">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
