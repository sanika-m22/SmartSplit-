import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';

export const Layout: React.FC = () => {
  return (
    <div className="app-container">
      <div className="app-wrapper">
        <Navigation />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
