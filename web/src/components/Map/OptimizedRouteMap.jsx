import React from 'react';
import { Plus, Minus, Navigation, Map as MapIcon, Truck, Trash2 } from 'lucide-react';

const OptimizedRouteMap = () => {
  return (
    <div className="relative w-full h-[450px] bg-[#f0f4f1] rounded-xl border-4 border-white shadow-lg overflow-hidden group">
      
      {/* 
        Simulated Map Background 
        Using a combination of grid patterns and SVG paths to resemble roads/terrain 
      */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#1B4332 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />
      <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" preserveAspectRatio="none">
         {/* City Blocks Simulation */}
         <rect x="10%" y="10%" width="20%" height="20%" rx="8" fill="#52B788" />
         <rect x="40%" y="15%" width="30%" height="15%" rx="8" fill="#52B788" />
         <rect x="75%" y="8%" width="15%" height="30%" rx="8" fill="#52B788" />
         
         <rect x="15%" y="40%" width="25%" height="25%" rx="8" fill="#52B788" />
         <rect x="50%" y="35%" width="35%" height="20%" rx="8" fill="#52B788" />
         
         <rect x="5%" y="75%" width="40%" height="15%" rx="8" fill="#52B788" />
         <rect x="60%" y="65%" width="30%" height="25%" rx="8" fill="#52B788" />

         {/* Roads */}
         <path d="M 0,150 Q 200,180 300,100 T 800,200" fill="none" stroke="#2D6A4F" strokeWidth="12" strokeLinecap="round" />
         <path d="M 100,0 Q 150,250 50,350 T 400,450" fill="none" stroke="#2D6A4F" strokeWidth="10" strokeLinecap="round" />
      </svg>

      {/* The Optimized Route Line */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none z-10" 
        viewBox="0 0 800 450" 
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Background glow for route */}
        <path 
          d="M 180,140 Q 350,120 450,250 T 650,320" 
          fill="none" 
          stroke="#95D5B2" 
          strokeWidth="12" 
          strokeLinecap="round" 
          className="opacity-40 animate-pulse"
        />
        {/* Main Solid Route Line */}
        <path 
          d="M 180,140 Q 350,120 450,250 T 650,320" 
          fill="none" 
          stroke="#1B4332"  // dark green line representing optimized route
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </svg>

      {/* --- Markers --- */}
      {/* 1. Base Depot (Start) */}
      <div className="absolute z-20 top-[140px] left-[180px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <div className="relative group cursor-pointer transition-transform hover:scale-110">
            <div className="absolute -inset-2 bg-green-200 rounded-full opacity-60 animate-ping" />
            <div className="bg-green-800 text-white p-2.5 rounded-full shadow-lg border-2 border-white ring-4 ring-green-100 mb-1.5 z-10 flex items-center justify-center">
                <Truck size={22} className="fill-current" />
            </div>
        </div>
        <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-bold text-green-900 shadow-sm border border-green-100 flex items-center gap-1">
            🏢 Base Depot
        </div>
      </div>

      {/* 2. Waste Bin 1 */}
      <div className="absolute z-20 top-[250px] left-[450px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <div className="bg-green-600 text-white w-9 h-9 rounded-full shadow-lg border-[3px] border-white flex items-center justify-center hover:scale-110 transition-transform cursor-pointer relative group pointer-events-auto mb-1.5 z-10">
          <span className="font-bold text-sm">1</span>
        </div>
        <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-bold text-green-800 shadow-sm border border-green-100">
            🗑️ Waste Bin 1
        </div>
      </div>

      {/* 3. Waste Bin 2 */}
      <div className="absolute z-20 top-[320px] left-[650px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <div className="bg-green-600 text-white w-9 h-9 rounded-full shadow-lg border-[3px] border-white flex items-center justify-center hover:scale-110 transition-transform cursor-pointer relative group pointer-events-auto mb-1.5 z-10">
          <span className="font-bold text-sm">2</span>
        </div>
        <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-bold text-green-800 shadow-sm border border-green-100">
            🗑️ Waste Bin 2
        </div>
      </div>

      {/* --- Legend (Top Right) --- */}
      <div className="absolute top-5 right-5 z-30 bg-white/85 backdrop-blur-md border border-white p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        <h4 className="text-xs font-bold text-green-900 uppercase tracking-widest mb-3 flex items-center gap-1.5 border-b border-green-100 pb-2">
          <MapIcon size={14} className="text-green-700" /> Route Legend
        </h4>
        <div className="flex flex-col gap-3 text-sm text-green-900">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-7 h-7 bg-green-800 text-white rounded-[8px] shadow-sm flex-shrink-0 text-sm">🏢</span>
            <span className="font-semibold">Base Depot</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-7 h-7 bg-green-600 text-white rounded-full flex-shrink-0 text-xs shadow-sm font-bold border-2 border-white">🗑️</span>
            <span className="font-semibold">Waste Bin</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-7 h-1.5 bg-green-800 rounded-full flex-shrink-0 shadow-sm"></div>
            <span className="font-semibold">Active Route</span>
          </div>
        </div>
      </div>

      {/* --- Map Controls (Bottom Right) --- */}
      <div className="absolute bottom-5 right-5 z-30 flex flex-col gap-2">
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-md border border-green-50 overflow-hidden flex flex-col">
          <button 
            className="p-2.5 text-green-800 hover:bg-green-50 hover:text-green-900 transition-colors border-b border-green-50 focus:outline-none" 
            title="Zoom In"
          >
            <Plus size={20} strokeWidth={2.5}/>
          </button>
          <button 
            className="p-2.5 text-green-800 hover:bg-green-50 hover:text-green-900 transition-colors focus:outline-none" 
            title="Zoom Out"
          >
            <Minus size={20} strokeWidth={2.5}/>
          </button>
        </div>
        <button 
          className="bg-white/90 backdrop-blur-md p-2.5 rounded-xl shadow-md border border-green-50 text-green-800 hover:text-white hover:bg-green-700 transition-colors focus:outline-none" 
          title="Re-center Map"
        >
          <Navigation size={20} strokeWidth={2.5} className="mr-[1px] mt-[1px]" />
        </button>
      </div>

      {/* Top Left Title Overlay (Added detail) */}
      <div className="absolute top-5 left-5 z-30">
        <div className="bg-green-800 text-white px-3 py-2 rounded-lg shadow-[0_4px_12px_rgb(22,101,52,0.3)] flex items-center gap-2.5 border border-green-700/50">
           <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgb(74,222,128)]"></div>
           <span className="text-sm font-bold tracking-wide">Live Optimizing...</span>
        </div>
      </div>

    </div>
  );
};

export default OptimizedRouteMap;
