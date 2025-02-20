import { useNavigate } from 'react-router-dom';

export default function ResultsPage({ patientName, predictions, error }) {
  const navigate = useNavigate();
  
  const formatModelName = (name) => {
    return name
      .replace(/_/g, ' ')
      .replace(/(?:^|\s)\S/g, a => a.toUpperCase());
  };

  const handleRestart = () => {
    navigate('/');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Results for: <span className="text-blue-600">{patientName}</span>
        </h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {predictions && (
          <div className="space-y-4 mb-6">
            {Object.entries(predictions).map(([model, result]) => (
              <div
                key={model}
                className={`p-4 rounded-lg ${
                  result === "Heart Disease Detected" 
                    ? 'bg-red-50 border-l-4 border-red-500' 
                    : 'bg-green-50 border-l-4 border-green-500'
                }`}
              >
                <h3 className="font-medium text-gray-800">
                  {formatModelName(model)}:
                </h3>
                <p className={`mt-1 ${
                  result === "Heart Disease Detected" ? 'text-red-600' : 'text-green-600'
                }`}>
                  {result}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-4 justify-between mt-6">
          <button
            onClick={handleRestart}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Restart
          </button>
          
          <button
            onClick={handlePrint}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Print Results
          </button>
        </div>
      </div>
    </div>
  );
}