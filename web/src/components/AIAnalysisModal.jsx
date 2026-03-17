import { useState, useRef, useCallback } from 'react';
import { X, Upload, Camera, Loader2, Sparkles, AlertTriangle, CheckCircle2, Edit3, RotateCcw, ImagePlus } from 'lucide-react';
import toast from 'react-hot-toast';

let GoogleGenerativeAI;
try {
    const mod = await import('@google/generative-ai');
    GoogleGenerativeAI = mod.GoogleGenerativeAI;
} catch (e) {
    console.warn('Gemini AI SDK not loaded');
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

const ANALYSIS_PROMPT = `You are a waste bin image analyzer for a rural plastic waste management system.
Analyze this image of a waste bin and return a JSON object with these exact fields:
{
  "fill_level": <number 0-100, percentage of how full the bin is>,
  "waste_type": "<one of: Plastic, Mixed, Organic>",
  "urgency": "<one of: Low, Medium, High, Critical>",
  "confidence": <number 0-100, your confidence in this analysis>,
  "observations": "<brief text description of what you see, 1-2 sentences>"
}

Rules:
- fill_level: 0 = empty, 100 = overflowing
- urgency: Critical if fill_level > 90 or overflow visible, High if > 70, Medium if > 40, Low otherwise
- waste_type: default to Plastic if unsure, Mixed if multiple types visible
- Return ONLY the JSON object, no markdown or extra text`;

export default function AIAnalysisModal({ isOpen, onClose, onSubmit }) {
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [analyzing, setAnalyzing] = useState(false);
    const [results, setResults] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [progress, setProgress] = useState(0);
    const inputRef = useRef(null);

    const handleFiles = useCallback((newFiles) => {
        const imageFiles = Array.from(newFiles).filter(f => f.type.startsWith('image/'));
        if (imageFiles.length === 0) {
            toast.error('Please select image files');
            return;
        }
        setFiles(prev => [...prev, ...imageFiles]);
        imageFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviews(prev => [...prev, { url: e.target.result, name: file.name }]);
            };
            reader.readAsDataURL(file);
        });
        setResults([]);
    }, []);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        handleFiles(e.dataTransfer.files);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handlePaste = useCallback((e) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        const imageFiles = [];
        for (const item of items) {
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file) imageFiles.push(file);
            }
        }
        if (imageFiles.length > 0) handleFiles(imageFiles);
    }, [handleFiles]);

    const analyzeImages = async () => {
        if (!GEMINI_API_KEY) {
            toast.error('Gemini API key not configured. Set VITE_GEMINI_API_KEY in .env');
            return;
        }
        if (!GoogleGenerativeAI) {
            toast.error('Gemini AI SDK failed to load');
            return;
        }

        setAnalyzing(true);
        setProgress(0);
        const allResults = [];

        try {
            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

            for (let i = 0; i < files.length; i++) {
                setProgress(Math.round(((i) / files.length) * 100));
                try {
                    const base64 = await fileToBase64(files[i]);
                    const result = await model.generateContent([
                        ANALYSIS_PROMPT,
                        { inlineData: { data: base64, mimeType: files[i].type } }
                    ]);
                    const text = result.response.text();
                    const jsonMatch = text.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const parsed = JSON.parse(jsonMatch[0]);
                        allResults.push({
                            ...parsed,
                            imageIndex: i,
                            imageName: files[i].name,
                        });
                    } else {
                        allResults.push({
                            fill_level: 50, waste_type: 'Mixed', urgency: 'Medium',
                            confidence: 30, observations: 'Could not parse AI response',
                            imageIndex: i, imageName: files[i].name, error: true,
                        });
                    }
                } catch (err) {
                    allResults.push({
                        fill_level: 50, waste_type: 'Mixed', urgency: 'Medium',
                        confidence: 0, observations: `Analysis failed: ${err.message}`,
                        imageIndex: i, imageName: files[i].name, error: true,
                    });
                }
            }
            setProgress(100);
            setResults(allResults);
            toast.success(`Analyzed ${allResults.length} image(s)`);
        } catch (err) {
            toast.error('Analysis failed: ' + err.message);
        }
        setAnalyzing(false);
    };

    const updateResult = (index, field, value) => {
        setResults(prev => prev.map((r, i) =>
            i === index ? { ...r, [field]: value } : r
        ));
    };

    const handleSubmitAll = () => {
        if (onSubmit) onSubmit(results);
        toast.success('Analysis results submitted!');
        handleReset();
        onClose();
    };

    const handleReset = () => {
        setFiles([]);
        setPreviews([]);
        setResults([]);
        setEditingIndex(null);
        setProgress(0);
    };

    const removeImage = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
        setResults([]);
    };

    if (!isOpen) return null;

    const urgencyColors = {
        Critical: 'bg-red-100 text-red-700',
        High: 'bg-orange-100 text-orange-700',
        Medium: 'bg-yellow-100 text-yellow-700',
        Low: 'bg-green-100 text-green-700',
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
             onPaste={handlePaste}>
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-emerald-700" />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg text-gray-900">AI Bin Analysis</h2>
                            <p className="text-xs text-gray-500">Powered by Gemini Vision AI</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
                    {/* Upload Area */}
                    {results.length === 0 && (
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={() => setDragActive(false)}
                            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                                dragActive ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                            }`}
                            onClick={() => inputRef.current?.click()}
                        >
                            <input
                                ref={inputRef}
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => handleFiles(e.target.files)}
                                className="hidden"
                            />
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
                                    <ImagePlus className="w-8 h-8 text-emerald-500" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-700">Drop bin photos here</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Drag & drop, paste (Ctrl+V), or click to select
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Image Previews */}
                    {previews.length > 0 && results.length === 0 && (
                        <div className="mt-4">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-medium text-gray-700">{previews.length} image(s) selected</p>
                                <button onClick={handleReset} className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1">
                                    <RotateCcw className="w-3 h-3" /> Clear all
                                </button>
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                {previews.map((p, i) => (
                                    <div key={i} className="relative group">
                                        <img src={p.url} alt={p.name} className="w-full h-24 object-cover rounded-xl border border-gray-100" />
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                                            className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3 text-white" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Analyze Button */}
                            <button
                                onClick={analyzeImages}
                                disabled={analyzing}
                                className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-600/20"
                            >
                                {analyzing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Analyzing with Gemini AI... {progress}%
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        Analyze {files.length} Image{files.length > 1 ? 's' : ''}
                                    </>
                                )}
                            </button>

                            {/* Progress Bar */}
                            {analyzing && (
                                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full bg-emerald-500 transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Results */}
                    {results.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900">Analysis Results</h3>
                                <button onClick={handleReset} className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-medium">
                                    <RotateCcw className="w-3.5 h-3.5" /> Analyze new images
                                </button>
                            </div>

                            {results.map((r, i) => (
                                <div key={i} className={`rounded-2xl border p-4 ${r.error ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-white'}`}>
                                    <div className="flex gap-4">
                                        {/* Thumbnail */}
                                        {previews[r.imageIndex] && (
                                            <img
                                                src={previews[r.imageIndex].url}
                                                alt=""
                                                className="w-20 h-20 object-cover rounded-xl flex-shrink-0 border border-gray-100"
                                            />
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-sm font-medium text-gray-700 truncate">{r.imageName}</p>
                                                <button
                                                    onClick={() => setEditingIndex(editingIndex === i ? null : i)}
                                                    className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                                                >
                                                    <Edit3 className="w-3 h-3" /> {editingIndex === i ? 'Done' : 'Edit'}
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                {/* Fill Level */}
                                                <div>
                                                    <p className="text-xs text-gray-400 mb-1">Fill Level</p>
                                                    {editingIndex === i ? (
                                                        <input type="number" min="0" max="100"
                                                            value={r.fill_level}
                                                            onChange={(e) => updateResult(i, 'fill_level', parseInt(e.target.value) || 0)}
                                                            className="w-full px-2 py-1 border rounded-lg text-sm"
                                                        />
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className={`h-2 rounded-full transition-all ${
                                                                        r.fill_level >= 80 ? 'bg-red-500' :
                                                                        r.fill_level >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                                                                    }`}
                                                                    style={{ width: `${r.fill_level}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-sm font-bold font-mono-data">{r.fill_level}%</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Waste Type */}
                                                <div>
                                                    <p className="text-xs text-gray-400 mb-1">Waste Type</p>
                                                    {editingIndex === i ? (
                                                        <select value={r.waste_type}
                                                            onChange={(e) => updateResult(i, 'waste_type', e.target.value)}
                                                            className="w-full px-2 py-1 border rounded-lg text-sm">
                                                            <option>Plastic</option>
                                                            <option>Mixed</option>
                                                            <option>Organic</option>
                                                        </select>
                                                    ) : (
                                                        <span className="text-sm font-semibold">{r.waste_type}</span>
                                                    )}
                                                </div>

                                                {/* Urgency */}
                                                <div>
                                                    <p className="text-xs text-gray-400 mb-1">Urgency</p>
                                                    {editingIndex === i ? (
                                                        <select value={r.urgency}
                                                            onChange={(e) => updateResult(i, 'urgency', e.target.value)}
                                                            className="w-full px-2 py-1 border rounded-lg text-sm">
                                                            <option>Low</option>
                                                            <option>Medium</option>
                                                            <option>High</option>
                                                            <option>Critical</option>
                                                        </select>
                                                    ) : (
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${urgencyColors[r.urgency] || ''}`}>
                                                            {r.urgency}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Confidence */}
                                                <div>
                                                    <p className="text-xs text-gray-400 mb-1">Confidence</p>
                                                    <span className="text-sm font-bold font-mono-data">{r.confidence}%</span>
                                                </div>
                                            </div>

                                            {/* Observations */}
                                            <div className="mt-2">
                                                <p className="text-xs text-gray-400 mb-1">Observations</p>
                                                {editingIndex === i ? (
                                                    <textarea
                                                        value={r.observations}
                                                        onChange={(e) => updateResult(i, 'observations', e.target.value)}
                                                        className="w-full px-2 py-1 border rounded-lg text-sm h-16 resize-none"
                                                    />
                                                ) : (
                                                    <p className="text-sm text-gray-600">{r.observations}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {results.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmitAll}
                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-emerald-600/20"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Confirm & Submit {results.length} Result{results.length > 1 ? 's' : ''}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
