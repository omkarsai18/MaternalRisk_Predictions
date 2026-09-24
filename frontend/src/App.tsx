import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import About from '@/pages/About';
import Prediction from '@/pages/Prediction';
import PredictionResult from '@/pages/PredictionResult';
import BulkPrediction from '@/pages/BulkPrediction';
import ModelPerformance from '@/pages/ModelPerformance';
import FeatureImportance from '@/pages/FeatureImportance';
import AblationStudy from '@/pages/AblationStudy';

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/predict" element={<Prediction />} />
            <Route path="/predict/result" element={<PredictionResult />} />
            <Route path="/bulk-predict" element={<BulkPrediction />} />
            <Route path="/model-performance" element={<ModelPerformance />} />
            <Route path="/feature-importance" element={<FeatureImportance />} />
            <Route path="/ablation-study" element={<AblationStudy />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
