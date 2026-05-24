import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Builder from './pages/Builder';
import Preview from './pages/Preview';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Pricing from './pages/Pricing';
import Success from './pages/Success';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/"           element={<Landing />} />
            <Route path="/build"      element={<Builder />} />
            <Route path="/preview/:id" element={<Preview />} />
            <Route path="/login"      element={<Login />} />
            <Route path="/register"   element={<Register />} />
            <Route path="/dashboard"  element={<Dashboard />} />
            <Route path="/pricing"    element={<Pricing />} />
            <Route path="/success"    element={<Success />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
