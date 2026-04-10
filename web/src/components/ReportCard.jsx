import { CheckCircle, XCircle, Clock, MapPin } from 'lucide-react';

/**
 * Resolve image URLs that may be internal Docker/MinIO paths or relative paths.
 * Production on Render uses local /uploads/ fallback (no MinIO), so the URL is
 * a relative path like "/uploads/abc.jpg" that needs the backend origin prepended.
 */
function getValidImageUrl(url) {
    if (!url) return null;

    // Derive the backend origin from VITE_API_URL (e.g. "https://smartwaste-ai-xxx.onrender.com/api" → "https://smartwaste-ai-xxx.onrender.com")
    const apiBase = import.meta.env.VITE_API_URL || '';
    const backendOrigin = apiBase.replace(/\/api\/?$/, '');

    // Case 1: Relative path (e.g. "/uploads/photo.jpg") — prepend backend origin
    if (url.startsWith('/uploads') || url.startsWith('/static')) {
        return backendOrigin ? `${backendOrigin}${url}` : url;
    }

    // Case 2: Internal MinIO/Docker URLs — replace with backend origin
    if (url.includes('localhost:9000') || url.includes('minio:9000') || url.includes('172.') || url.includes('192.168.')) {
        return url.replace(/https?:\/\/[^/]+/, backendOrigin || '');
    }

    // Case 3: Already a valid full URL
    return url;
}

export default function ReportCard({ report, onVerify, onReject }) {
    const imgSrc = getValidImageUrl(report.image_url);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="flex">
                {/* Photo Thumbnail */}
                {imgSrc && (
                    <div className="w-32 h-32 flex-shrink-0">
                        <img
                            src={imgSrc}
                            alt="Bin report"
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    </div>
                )}

                {/* Details */}
                <div className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <h4 className="font-semibold text-gray-900 text-sm">
                                Bin #{report.bin_id}
                            </h4>
                            {report.created_at && (
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {new Date(report.created_at).toLocaleString()}
                                </p>
                            )}
                        </div>
                        {/* AI Confidence Badge */}
                        {report.ai_confidence != null && (
                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${report.ai_confidence >= 80 ? 'bg-green-100 text-green-700' :
                                    report.ai_confidence >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-600'
                                }`}>
                                AI: {report.ai_confidence}%
                            </span>
                        )}
                    </div>

                    {/* Fill Level */}
                    {report.ai_fill_level != null && (
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs text-gray-500">Fill:</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                    className="h-2 rounded-full bg-sw-gold"
                                    style={{ width: `${report.ai_fill_level}%` }}
                                />
                            </div>
                            <span className="text-xs font-bold text-gray-700">{report.ai_fill_level}%</span>
                        </div>
                    )}

                    {/* Actions / Status */}
                    {report.status === 'pending' ? (
                        <div className="flex gap-2">
                            <button
                                onClick={() => onVerify(report.id)}
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-500 text-white text-xs font-semibold rounded-xl hover:bg-green-600 transition-colors"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Verify
                            </button>
                            <button
                                onClick={() => onReject(report.id)}
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-500 text-white text-xs font-semibold rounded-xl hover:bg-red-600 transition-colors"
                            >
                                <XCircle className="w-4 h-4" />
                                Reject
                            </button>
                        </div>
                    ) : (
                        <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${
                            report.status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                            {report.status === 'verified' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                            <span className="capitalize">{report.status}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
