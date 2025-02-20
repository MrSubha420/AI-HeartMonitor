import { Link } from 'react-router-dom';

export default function Home({ patientName, setPatientName }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-green-300 to-blue-500 text-white shadow-lg">
      <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 transition-all duration-300 hover:shadow-3xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-green-400">
          Heart Disease Prediction Model
        </h1>
        
        <div className="space-y-6">
          <div>
            <label className="block text-green-400 mb-3 text-lg">Patient Name</label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full p-3 border-2 border-blue-400 rounded-xl bg-gray-800 text-green-400
                       focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-900
                       placeholder-green-700"
              placeholder="Enter patient name"
            />
          </div>
          
          {patientName ? (
            <Link
              to="/predict"
              className="block w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-4 px-6 
                        rounded-xl text-center font-semibold hover:from-green-600 hover:to-blue-600 
                        transition-all duration-300 transform hover:scale-105"
            >
              Continue to Assessment
            </Link>
          ) : (
            <button
              disabled
              className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white py-4 px-6 
                        rounded-xl text-center font-semibold cursor-not-allowed opacity-75"
            >
              Continue to Assessment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}