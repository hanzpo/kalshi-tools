import { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import './App.css';

const ChartBuilder = lazy(() => import('./pages/ChartBuilder'));
const TradeSlipBuilder = lazy(() => import('./pages/TradeSlipBuilder'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="app-loading">Loading...</div>}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/chart" element={<ChartBuilder />} />
          <Route path="/trade-slip" element={<TradeSlipBuilder />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
