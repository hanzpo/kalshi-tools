import { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { LandingPage } from './components/layout/LandingPage';
import { Footer } from './components/layout/Footer';
import { useAnalytics } from './hooks/useAnalytics';
import './App.css';
import './components/layout/Footer.css';

const ChartBuilder = lazy(() => import('./features/chart/ChartBuilder'));
const TradeSlipBuilder = lazy(() => import('./features/trade-slip/TradeSlipBuilder'));
const SearchBuilder = lazy(() => import('./features/search/SearchBuilder'));
const LinkPreviewBuilder = lazy(() => import('./features/link-preview/LinkPreviewBuilder'));
const MarketPageBuilder = lazy(() => import('./features/market-page/MarketPageBuilder'));
const OverlayBuilder = lazy(() => import('./features/overlay/OverlayBuilder'));

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
          <Route path="/market-page" element={<MarketPageBuilder />} />
          <Route path="/overlay" element={<OverlayBuilder />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </Suspense>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
