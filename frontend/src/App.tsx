import { HashRouter, Route, Routes } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Overview } from './pages/Overview';
import { LiveMap } from './pages/LiveMap';
import { Vehicles } from './pages/Vehicles';
import { Hazards } from './pages/Hazards';
import { RoutesPage } from './pages/RoutesPage';
import { Response } from './pages/Response';
import { Simulation } from './pages/Simulation';
import { System } from './pages/System';

function App() {
  return (
    <HashRouter>
      <div className="rq-scan min-h-screen bg-bg text-text">
        <Navbar />
        <main className="mx-auto max-w-[1440px] px-4 py-4">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/map" element={<LiveMap />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/hazards" element={<Hazards />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/response" element={<Response />} />
            <Route path="/simulation" element={<Simulation />} />
            <Route path="/system" element={<System />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
