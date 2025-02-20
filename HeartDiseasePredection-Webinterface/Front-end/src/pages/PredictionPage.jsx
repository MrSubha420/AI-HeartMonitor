import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const featuresConfig = [
  { 
    name: 'sex', 
    label: 'Sex (0: Female, 1: Male)',
    options: [
      { value: 0, label: 'Female' },
      { value: 1, label: 'Male' }
    ]
  },
  { 
    name: 'cp', 
    label: 'Chest Pain Type (0: Typical Angina, 1: Atypical Angina, 2: Non-anginal Pain, 3: Asymptomatic)',
    options: [
      { value: 0, label: 'Typical Angina' },
      { value: 1, label: 'Atypical Angina' },
      { value: 2, label: 'Non-anginal Pain' },
      { value: 3, label: 'Asymptomatic' }
    ]
  },
  { name: 'bp', label: 'Blood Pressure (mmHg)', type: 'number' },
  { name: 'bol', label: 'Blood Oxygen Level (%)', type: 'number' },
  { 
    name: 'fbs', 
    label: 'Fasting Blood Sugar > 120mg/dl (0: No, 1: Yes)',
    options: [
      { value: 0, label: 'No' },
      { value: 1, label: 'Yes' }
    ]
  },
  { 
    name: 'restecg', 
    label: 'Resting ECG (0: Normal, 1: ST-T Wave Abnormality, 2: Left Ventricular Hypertrophy)',
    type: 'number'
  },
  { name: 'thalach', label: 'Maximum Heart Rate', type: 'number' },
  { 
    name: 'exang', 
    label: 'Exercise Induced Angina (0: No, 1: Yes)',
    options: [
      { value: 0, label: 'No' },
      { value: 1, label: 'Yes' }
    ]
  },
  { name: 'bodytemp', label: 'Body Temperature (°C)', type: 'number' },
  { 
    name: 'slope', 
    label: 'Slope of Peak Exercise ST Segment (0: Upsloping, 1: Flat, 2: Downsloping)',
    options: [
      { value: 0, label: 'Upsloping' },
      { value: 1, label: 'Flat' },
      { value: 2, label: 'Downsloping' }
    ]
  },
  { 
    name: 'pal', 
    label: 'Physical Activity Level (0: Light, 1: Moderate, 2: Vigorous, 3: Hard)',
    options: [
      { value: 0, label: 'Light' },
      { value: 1, label: 'Moderate' },
      { value: 2, label: 'Vigorous' },
      { value: 3, label: 'Hard' }
    ]
  },
  { 
    name: 'thal', 
    label: 'Thalassemia (1: Normal, 2: Fixed Defect, 3: Reversible Defect)',
    options: [
      { value: 1, label: 'Normal' },
      { value: 2, label: 'Fixed Defect' },
      { value: 3, label: 'Reversible Defect' }
    ]
  },
];

export default function PredictionPage({ patientName, onPredict, loading }) {
  const navigate = useNavigate();
  
  const [features, setFeatures] = useState(() =>
    featuresConfig.reduce((acc, curr) => {
      acc[curr.name] = '';
      return acc;
    }, {})
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const values = featuresConfig.map(f => parseFloat(features[f.name]) || 0);
    await onPredict(values);
    navigate('/results');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-r from-green-300 to-blue-500 text-white">
      <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl w-full max-w-4xl border border-gray-700 mx-4">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-green-400 mb-2">
            Patient Assessment
          </h2>
          <p className="text-lg text-green-300">
            Evaluating: <span className="font-semibold">{patientName}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {featuresConfig.map(({ name, label, options, type = 'number' }) => {
            const [mainLabel, description] = label.split(/\(([^)]+)\)/);

            return (
              <div key={name} className="space-y-1 group">
                <div className="min-h-[4rem] flex flex-col justify-end">
                  <label className="block text-sm font-semibold text-green-400 mb-1">
                    {mainLabel.trim()}
                  </label>
                  {description && (
                    <p className="text-xs text-green-500/80 italic">
                      ({description.trim()})
                    </p>
                  )}
                </div>

                <div className="relative">
                  {options ? (
                    <select
                      required
                      value={features[name]}
                      onChange={(e) => setFeatures({ ...features, [name]: e.target.value })}
                      className="w-full h-12 px-4 border-2 border-blue-400/50 rounded-lg 
                               focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30
                               bg-slate-800 text-green-300 appearance-none transition-all"
                    >
                      <option value="" disabled>Select option</option>
                      {options.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="relative">
                      <input
                        type={type}
                        required
                        value={features[name]}
                        onChange={(e) => setFeatures({ ...features, [name]: e.target.value })}
                        className="w-full h-12 px-4 border-2 border-blue-400/50 rounded-lg 
                                 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30
                                 bg-slate-800 text-green-300 placeholder-green-500/50 transition-all"
                        placeholder={`Enter ${mainLabel.toLowerCase().trim()}`}
                        style={(name === 'bodytemp' || name === 'bp') ? { paddingRight: '2.5rem' } : {}}
                      />
                      {(name === 'bodytemp' || name === 'bp') && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400/80 text-sm">
                          {name === 'bodytemp' ? '°C' : 'mmHg'}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div className="md:col-span-2 mt-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-gradient-to-r from-green-500/90 to-blue-500/90 
                       text-lg font-semibold rounded-lg hover:from-green-600 hover:to-blue-600 
                       transition-all duration-300 disabled:opacity-75 disabled:pointer-events-none
                       flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <svg 
                    className="animate-spin h-5 w-5 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    ></circle>
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Analyzing Health Data...</span>
                </>
              ) : (
                <>
                  <svg 
                    className="w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    ></path>
                  </svg>
                  <span>Generate Comprehensive Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}