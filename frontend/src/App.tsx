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
      <Route path="/collector/*" element={<Placeholder title="Collector" />} />
      <Route path="/recycler/*" element={<Placeholder title="Recycler" />} />
      <Route path="/admin/*" element={<Placeholder title="Admin" />} />
    </Routes>
  );
}

export default App;
