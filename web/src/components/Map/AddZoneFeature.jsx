import React, { useState } from 'react';
import { Plus, X, Map as MapIcon, ArrowRight, ArrowLeft, Check, Hexagon, Crosshair, MapPin } from 'lucide-react';

const AddZoneFeature = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    direction: '',
    supervisor: 'unassigned'
  });

  const nextStep = () => setStep((s) => Math.min(3, s + 1));
  const prevStep = () => setStep((s) => Math.max(1, s - 1));
  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => {
        setStep(1);
        setFormData({ name: '', direction: '', supervisor: 'unassigned' });
    }, 300);
  };

  const STEPS = [
    { num: 1, label: 'Details' },
    { num: 2, label: 'Boundaries' },
    { num: 3, label: 'Review' }
  ];

  return (
    <>
      {/* --- Part 1: The Trigger Button --- */}
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3.5 mt-4 rounded-xl border-2 border-dashed border-sw-mid text-sw-mid font-semibold bg-transparent hover:bg-green-50 transition-colors focus:outline-none"
      >
        <Plus size={20} strokeWidth={2.5} />
        Add New Zone
      </button>

      {/* --- Part 2: The Multi-Step Modal --- */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col animate-slide-up">
            
            {/* Modal Header & Progress */}
            <div className="bg-gray-50 border-b border-gray-100 px-6 py-5">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 font-display flex items-center gap-2">
                  <MapPin className="text-sw-mid" /> Create New Zone
                </h2>
                <button 
                  onClick={closeModal} 
                  className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-lg transition-colors focus:outline-none"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Progress Tracker */}
              <div className="flex items-center justify-between relative px-2">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-sw-mid -z-10 rounded-full transition-all duration-300"
                  style={{ width: `${((step - 1) / 2) * 100}%` }}
                ></div>
                
                {STEPS.map((s) => (
                  <div key={s.num} className="flex flex-col items-center gap-2 bg-gray-50">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                      step >= s.num 
                        ? 'bg-sw-mid border-sw-mid text-white' 
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {step > s.num ? <Check size={16} strokeWidth={3} /> : s.num}
                    </div>
                    <span className={`text-xs font-semibold ${step >= s.num ? 'text-gray-900' : 'text-gray-400'}`}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex-1 bg-white min-h-[360px]">
              
              {/* Step 1: Zone Details */}
              {step === 1 && (
                <div className="space-y-5 animate-fade-in">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Zone Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Zone 5"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sw-light focus:border-transparent text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Directional Area</label>
                    <input 
                      type="text" 
                      placeholder="e.g. North/South, City Center"
                      value={formData.direction}
                      onChange={(e) => setFormData({...formData, direction: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sw-light focus:border-transparent text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Supervisor Assigned</label>
                    <div className="relative">
                      <select 
                        value={formData.supervisor}
                        onChange={(e) => setFormData({...formData, supervisor: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sw-light focus:border-transparent text-gray-800 appearance-none bg-white"
                      >
                        <option value="unassigned">-- Select a Supervisor --</option>
                        <option value="john_doe">John Doe</option>
                        <option value="jane_smith">Jane Smith</option>
                        <option value="admin">System Admin</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Map Boundaries */}
              {step === 2 && (
                <div className="animate-fade-in flex flex-col h-full">
                  <p className="text-sm text-gray-600 mb-3 font-medium">Draw the boundaries for your new zone on the map below.</p>
                  
                  <div className="relative flex-1 w-full border border-gray-200 rounded-xl overflow-hidden bg-emerald-50 max-h-[260px] min-h-[260px]">
                    {/* Simulated Map Grid */}
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#1B4332 1.5px, transparent 1.5px)', backgroundSize: '20px 20px' }}></div>
                    
                    {/* Simulated Polygon Boundary */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 600 260">
                       <polygon 
                         points="100,50 400,80 500,200 200,240 50,150" 
                         fill="rgba(82, 183, 136, 0.3)" 
                         stroke="#1B4332" 
                         strokeWidth="3" 
                         strokeDasharray="6 4"
                       />
                       {/* Polygon nodes */}
                       <circle cx="100" cy="50" r="4" fill="#fff" stroke="#1B4332" strokeWidth="2" />
                       <circle cx="400" cy="80" r="4" fill="#fff" stroke="#1B4332" strokeWidth="2" />
                       <circle cx="500" cy="200" r="4" fill="#fff" stroke="#1B4332" strokeWidth="2" />
                       <circle cx="200" cy="240" r="4" fill="#fff" stroke="#1B4332" strokeWidth="2" />
                       <circle cx="50" cy="150" r="4" fill="#fff" stroke="#1B4332" strokeWidth="2" />
                    </svg>

                    {/* Left Drawing Toolbar */}
                    <div className="absolute left-3 top-3 bg-white p-1 rounded-lg shadow-md border border-gray-100 flex flex-col gap-1">
                      <button className="p-2 text-sw-mid bg-green-50 rounded-md hover:bg-green-100 transition-colors" title="Draw Polygon">
                        <Hexagon size={18} />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-sw-mid hover:bg-green-50 rounded-md transition-colors" title="Center Location">
                        <Crosshair size={18} />
                      </button>
                    </div>
                    
                    {/* Informative overlay */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm text-xs font-semibold text-gray-700 border border-gray-100">
                      Area: ~1.2 sq km
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <div className="animate-fade-in space-y-6">
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4 text-base border-b border-gray-200 pb-2">Zone Configuration Summary</h3>
                    
                    <div className="grid grid-cols-2 gap-y-4 text-sm">
                      <div>
                        <p className="text-gray-500 mb-1 text-xs uppercase font-bold tracking-wide">Zone Name</p>
                        <p className="font-semibold text-gray-900">{formData.name || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1 text-xs uppercase font-bold tracking-wide">Area / Direction</p>
                        <p className="font-semibold text-gray-900">{formData.direction || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1 text-xs uppercase font-bold tracking-wide">Supervisor</p>
                        <p className="font-semibold text-gray-900 capitalize">{formData.supervisor === 'unassigned' ? 'None' : formData.supervisor.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1 text-xs uppercase font-bold tracking-wide">Boundaries</p>
                        <p className="font-semibold text-green-600 flex items-center gap-1">
                          <Check size={14} /> 5 Points Set
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                    <MapIcon className="text-blue-500 shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-blue-800">
                      Once created, the system will automatically allocate routing capacity for this zone and prompt you to assign new bins.
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer Controls */}
            <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex justify-between items-center">
              <button 
                onClick={step === 1 ? closeModal : prevStep}
                className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 rounded-xl transition-colors"
              >
                {step === 1 ? 'Cancel' : 'Back'}
              </button>

              <button 
                onClick={step === 3 ? closeModal : nextStep}
                className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all shadow-sm
                  ${step === 3 
                    ? 'bg-sw-mid hover:bg-sw-dark text-white shadow-green-600/20' 
                    : 'bg-gray-900 hover:bg-gray-800 text-white'}`}
              >
                {step === 3 ? 'Save Zone' : 'Next Step'}
                {step < 3 && <ArrowRight size={16} />}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default AddZoneFeature;
