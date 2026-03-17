import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Truck, Loader2 } from 'lucide-react';
import { getReportStatus } from '../api/publicApi';

const steps = [
    { key: 'submitted', label: 'Submitted', icon: CheckCircle },
    { key: 'ai_verified', label: 'AI Verified', icon: CheckCircle },
    { key: 'supervisor_approved', label: 'Supervisor Approved', icon: Clock },
    { key: 'added_to_route', label: 'Added to Route', icon: Truck },
];

function getStepStatus(reportStatus, stepKey) {
    const statusMap = {
        submitted: { submitted: 'done', ai_verified: 'pending', supervisor_approved: 'pending', added_to_route: 'pending' },
        pending_verification: { submitted: 'done', ai_verified: 'done', supervisor_approved: 'pending', added_to_route: 'pending' },
        verified: { submitted: 'done', ai_verified: 'done', supervisor_approved: 'done', added_to_route: 'done' },
        rejected: { submitted: 'done', ai_verified: 'done', supervisor_approved: 'failed', added_to_route: 'pending' },
    };
    return statusMap[reportStatus]?.[stepKey] || 'pending';
}

export default function StatusTracker({ reportId, onClose }) {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let interval;
        const poll = async () => {
            try {
                const data = await getReportStatus(reportId);
                setStatus(data);
                setLoading(false);

                // Stop polling on final statuses
                if (['verified', 'rejected'].includes(data.status)) {
                    clearInterval(interval);
                }
            } catch {
                setLoading(false);
            }
        };

        poll();
        interval = setInterval(poll, 10000);
        return () => clearInterval(interval);
    }, [reportId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-sw-mid" />
            </div>
        );
    }

    const reportStatus = status?.status || 'pending_verification';

    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg max-w-md mx-auto">
            <h3 className="font-bold text-lg text-gray-900 mb-6">Report Status</h3>

            <div className="space-y-4">
                {steps.map((step, idx) => {
                    const stepState = getStepStatus(reportStatus, step.key);
                    const Icon = step.icon;

                    return (
                        <div key={step.key} className="flex items-center gap-4">
                            {/* Step Circle */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${stepState === 'done' ? 'bg-green-100' :
                                    stepState === 'failed' ? 'bg-red-100' :
                                        'bg-gray-100'
                                }`}>
                                {stepState === 'done' && <CheckCircle className="w-6 h-6 text-green-600" />}
                                {stepState === 'failed' && <XCircle className="w-6 h-6 text-red-500" />}
                                {stepState === 'pending' && <Clock className="w-6 h-6 text-gray-400" />}
                            </div>

                            {/* Label */}
                            <div className="flex-1">
                                <p className={`font-medium text-sm ${stepState === 'done' ? 'text-green-700' :
                                        stepState === 'failed' ? 'text-red-600' :
                                            'text-gray-400'
                                    }`}>
                                    {step.label}
                                </p>
                            </div>

                            {/* Connector */}
                            {idx < steps.length - 1 && (
                                <div className="absolute left-5 w-0.5 h-4 bg-gray-200" />
                            )}
                        </div>
                    );
                })}
            </div>

            {status?.ai_confidence && (
                <div className="mt-4 p-3 bg-sw-bg rounded-xl text-sm">
                    <span className="text-gray-500">AI Confidence: </span>
                    <span className="font-bold text-sw-dark">{status.ai_confidence}%</span>
                </div>
            )}

            <button
                onClick={onClose}
                className="mt-6 w-full py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
                Close
            </button>
        </div>
    );
}
