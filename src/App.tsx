/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import HomeForest from './pages/HomeForest';
import TreeBuilder from './pages/TreeBuilder';
import DailyQuest from './pages/DailyQuest';
import LanguageMap from './pages/LanguageMap';
import Profile from './pages/Profile';
import Layout from './components/Layout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<Layout />}>
          <Route index element={<HomeForest />} />
          <Route path="tree/:id" element={<TreeBuilder />} />
          <Route path="quest" element={<DailyQuest />} />
          <Route path="map" element={<LanguageMap />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
