import { Routes, Route, Link } from "react-router-dom";

function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      <h1 className="text-3xl font-bold text-primary">SahiRate</h1>
      <p className="text-muted-foreground">Select your role to continue</p>
      
      <div className="flex gap-4 mt-8">
        <Link 
          to="/collector" 
          className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90"
        >
          Collector
        </Link>
        <Link 
          to="/recycler" 
          className="px-6 py-3 rounded-lg bg-secondary text-secondary-foreground font-medium border hover:bg-secondary/80"
        >
          Recycler
        </Link>
        <Link 
          to="/admin" 
          className="px-6 py-3 rounded-lg bg-muted text-foreground font-medium border hover:bg-muted/80"
        >
          Admin
        </Link>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { createLocalLot, getLocalLots } from './services/lots';
import type { Lot } from './types';

function CollectorTest() {
  const [lots, setLots] = useState<Lot[]>([]);

  const loadLots = async () => {
    const data = await getLocalLots();
    setLots(data);
  };

  useEffect(() => {
    loadLots();
  }, []);

  const handleCreate = async () => {
    await createLocalLot({
      material_id: 'PCB',
      approx_weight_kg: 15,
      estimated_value: 1900
    });
    loadLots();
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 mt-8">
      <h1 className="text-2xl font-bold mb-4">Collector - Offline Lot Test</h1>
      
      <button 
        onClick={handleCreate}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg mb-8"
      >
        Create Test Lot (Offline)
      </button>

      <div className="w-full max-w-md">
        <h2 className="text-xl font-semibold mb-2">Local Lots ({lots.length})</h2>
        {lots.map(lot => (
          <div key={lot.id} className="p-4 mb-2 border rounded shadow-sm">
            <p><strong>ID:</strong> {lot.id}</p>
            <p><strong>Material:</strong> {lot.payload.material_id}</p>
            <p><strong>Weight:</strong> {lot.payload.approx_weight_kg} kg</p>
            <p><strong>Status:</strong> {lot.sync_status}</p>
          </div>
        ))}
      </div>

      <Link to="/" className="mt-8 text-primary hover:underline">
        &larr; Back to Home
      </Link>
    </div>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold">{title} View</h1>
      <Link to="/" className="mt-4 text-primary hover:underline">
        &larr; Back to Home
      </Link>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/collector/*" element={<CollectorTest />} />
      <Route path="/recycler/*" element={<Placeholder title="Recycler" />} />
      <Route path="/admin/*" element={<Placeholder title="Admin" />} />
    </Routes>
  );
}

export default App;
