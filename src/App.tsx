/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import WorkoutSession from './pages/WorkoutSession';
import NutritionScan from './pages/NutritionScan';
import GPSTracker from './pages/GPSTracker';
import Profile from './pages/Profile';
import Layout from './components/Layout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<Layout />}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="workout/:type" element={<WorkoutSession />} />
          <Route path="nutrition" element={<NutritionScan />} />
          <Route path="gps" element={<GPSTracker />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
