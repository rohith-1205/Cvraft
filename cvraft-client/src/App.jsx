import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Builder from './pages/Builder';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Preview from './pages/Preview';
import Pricing from './pages/Pricing';
import Success from './pages/Success';
import Navbar from './components/Navbar';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"          element={<Landing />} />
        <Route path="/build"     element={<Builder />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/register"  element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/preview/:id" element={<Preview />} />
        <Route path="/pricing"   element={<Pricing />} />
        <Route path="/success"   element={<Success />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
