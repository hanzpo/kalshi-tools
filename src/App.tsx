import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation, useSearchParams } from 'react-router-dom';
import { LandingPage } from './components/layout/LandingPage';
import { Footer } from './components/layout/Footer';
import { useAnalytics } from './hooks/useAnalytics';

const ChartBuilder = lazy(() => import('./features/chart/ChartBuilder'));
const TradeSlipBuilder = lazy(() => import('./features/trade-slip/TradeSlipBuilder'));
const SearchBuilder = lazy(() => import('./features/search/SearchBuilder'));
const LinkPreviewBuilder = lazy(() => import('./features/link-preview/LinkPreviewBuilder'));
const MarketPageBuilder = lazy(() => import('./features/market-page/MarketPageBuilder'));
const OverlayBuilder = lazy(() => import('./features/overlay/OverlayBuilder'));
const BannerBuilder = lazy(() => import('./features/banner/BannerBuilder'));
const BracketBuilder = lazy(() => import('./features/bracket/BracketBuilder'));
const BracketRenderPage = lazy(() => import('./features/bracket/BracketRenderPage'));

function AppContent() {
  useAnalytics();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isOverlayViewer = location.pathname === '/overlay' && !searchParams.has('edit');
  const isBracketRender = location.pathname === '/bracket/render';

  useEffect(() => {
    if (isOverlayViewer) {
      document.documentElement.style.background = 'transparent';
      document.body.style.background = 'transparent';
    }
    return () => {
      document.documentElement.style.background = '';
      document.body.style.background = '';
    };
  }, [isOverlayViewer]);

  return (
    <div className={`flex min-h-screen flex-col${isOverlayViewer ? ' !bg-transparent' : ''}`}>
      <Suspense fallback={<div className="flex flex-1 items-center justify-center font-medium text-text-primary">Loading...</div>}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/chart" element={<ChartBuilder />} />
          <Route path="/trade-slip" element={<TradeSlipBuilder />} />
          <Route path="/search" element={<SearchBuilder />} />
          <Route path="/link-preview" element={<LinkPreviewBuilder />} />
          <Route path="/market-page" element={<MarketPageBuilder />} />
          <Route path="/overlay" element={<OverlayBuilder />} />
          <Route path="/banner" element={<BannerBuilder />} />
          <Route path="/bracket" element={<BracketBuilder />} />
          <Route path="/bracket/render" element={<BracketRenderPage />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </Suspense>
      {!isOverlayViewer && !isBracketRender && <Footer />}
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
