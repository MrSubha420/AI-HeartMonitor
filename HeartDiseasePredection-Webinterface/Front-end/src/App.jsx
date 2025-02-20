import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import Home from './pages/Home';
import PredictionPage from './pages/PredictionPage';
import ResultsPage from './pages/ResultsPage';
import Header from './homecomponents/Header';
import Footer from './homecomponents/Footer';

function App() {
  const [patientName, setPatientName] = useState('');
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePredict = async (features) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('http://192.168.0.139:5000/predict', { features });
      setPredictions(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
        {/* Header */}
        <header className="bg-gradient-to-r from-green-300 to-blue-500 text-white shadow-lg">
          <Header />
        </header>

        {/* Main Content */}
        <main className="flex-1">
          <Routes>
            <Route 
              path="/" 
              element={<Home patientName={patientName} setPatientName={setPatientName} />} 
            />
            <Route 
              path="/predict" 
              element={
                <PredictionPage 
                  patientName={patientName} 
                  onPredict={handlePredict} 
                  loading={loading}
                />
              } 
            />
            <Route 
              path="/results" 
              element={
                <ResultsPage 
                  patientName={patientName} 
                  predictions={predictions} 
                  error={error}
                />
              } 
            />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-green-400 to-blue-600 text-white mt-auto">
          <Footer />
        </footer>
      </div>
    </Router>
  );
}

export default App;