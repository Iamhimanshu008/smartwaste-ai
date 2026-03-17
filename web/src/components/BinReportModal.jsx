import { useState, useRef } from 'react';
import { X, Camera, MapPin, Upload, Loader2 } from 'lucide-react';
import { submitReport } from '../api/publicApi';

export default function BinReportModal({ bin, onClose, onSuccess }) {
    const [step, setStep] = useState(1); // 1=confirm, 2=photo, 3=submitting
    const [photo, setPhoto] = useState(null);
    const [preview, setPreview] = useState(null);
    const [gpsStatus, setGpsStatus] = useState('detecting');
    const [coords, setCoords] = useState(null);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const fileRef = useRef();

    // Get GPS on mount
    useState(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                    setGpsStatus('detected');
                },
                () => setGpsStatus('failed')
            );
        } else {
            setGpsStatus('unavailable');
        }
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(file);
            setPreview(URL.createObjectURL(file));
            setStep(2);
        }
    };

    const handleSubmit = async () => {
        if (!photo || !coords) return;
        setSubmitting(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('bin_id', bin.id);
            formData.append('reporter_lat', coords.lat);
            formData.append('reporter_lng', coords.lng);
            formData.append('photo', photo);

            const result = await submitReport(formData);
            onSuccess(result);
        } catch (err) {
            const detail = err.response?.data?.detail;
            setError(
                typeof detail === 'object'
                    ? detail.rejection_reason || JSON.stringify(detail)
                    : detail || 'Submission failed. Please try again.'
            );
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="bg-sw-dark text-white p-4 flex items-center justify-between">
                    <h3 className="font-bold text-lg">Report Full Bin</h3>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Bin Info */}
                    <div className="flex items-center gap-3 p-3 bg-sw-bg rounded-xl mb-4">
                        <MapPin className="w-5 h-5 text-sw-mid" />
                        <div>
                            <p className="font-semibold text-sm text-gray-900">{bin?.label}</p>
                            <p className="text-xs text-gray-500">{bin?.address || 'No address'}</p>
                        </div>
                    </div>

                    {/* GPS Status */}
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-4 ${gpsStatus === 'detected' ? 'bg-green-50 text-green-700' :
                            gpsStatus === 'detecting' ? 'bg-blue-50 text-blue-700' :
                                'bg-red-50 text-red-700'
                        }`}>
                        <MapPin className="w-4 h-4" />
                        {gpsStatus === 'detected' && 'GPS location detected'}
                        {gpsStatus === 'detecting' && 'Detecting GPS location...'}
                        {gpsStatus === 'failed' && 'GPS detection failed. Please enable location.'}
                        {gpsStatus === 'unavailable' && 'GPS not available on this device.'}
                    </div>

                    {/* Photo Section */}
                    {!preview ? (
                        <button
                            onClick={() => fileRef.current?.click()}
                            className="w-full border-2 border-dashed border-sw-accent rounded-xl p-8 flex flex-col items-center gap-3 hover:bg-sw-bg transition-colors"
                        >
                            <Camera className="w-10 h-10 text-sw-mid" />
                            <span className="text-sm font-medium text-gray-600">Upload bin photo</span>
                            <span className="text-xs text-gray-400">JPG, PNG up to 10MB</span>
                        </button>
                    ) : (
                        <div className="relative rounded-xl overflow-hidden mb-4">
                            <img src={preview} alt="Bin" className="w-full h-48 object-cover" />
                            <button
                                onClick={() => { setPhoto(null); setPreview(null); setStep(1); }}
                                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    {/* Error */}
                    {error && (
                        <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl">
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={!photo || !coords || submitting}
                        className="mt-4 w-full py-3 bg-sw-mid text-white font-semibold rounded-xl hover:bg-sw-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Upload className="w-5 h-5" />
                                Submit Report
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
