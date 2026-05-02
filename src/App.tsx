import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';

// Placeholder imports for screens
import { LandingPage } from './screens/LandingPage';
import { Dashboard } from './screens/Dashboard';
import { CreateGroup } from './screens/CreateGroup';
import { AddExpense } from './screens/AddExpense';
import { Settlement } from './screens/Settlement';
import { Analytics } from './screens/Analytics';
import { Profile } from './screens/Profile';
import { AIInsights } from './screens/AIInsights';
import { Auth } from './screens/Auth';
import { Groups } from './screens/Groups';
import { Settings } from './screens/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page doesn't have the navigation layout */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Auth />} />
        
        {/* App routes with navigation */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/create-group" element={<CreateGroup />} />
          <Route path="/add-expense" element={<AddExpense />} />
          <Route path="/settlement" element={<Settlement />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/ai-insights" element={<AIInsights />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
