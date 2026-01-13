import { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { Footer } from './components/Footer';
import { useAnalytics } from './hooks/useAnalytics';
import './App.css';
import './components/Footer.css';

const ChartBuilder = lazy(() => import('./pages/ChartBuilder'));
const TradeSlipBuilder = lazy(() => import('./pages/TradeSlipBuilder'));
const SearchBuilder = lazy(() => import('./pages/SearchBuilder'));
const LinkPreviewBuilder = lazy(() => import('./pages/LinkPreviewBuilder'));

function AppContent() {
  useAnalytics();
  return (
    <div className="app-wrapper">
      <Suspense fallback={<div className="app-loading">Loading...</div>}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/chart" element={<ChartBuilder />} />
          <Route path="/trade-slip" element={<TradeSlipBuilder />} />
          <Route path="/search" element={<SearchBuilder />} />
          <Route path="/link-preview" element={<LinkPreviewBuilder />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </Suspense>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
