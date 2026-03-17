export default function StatusBadge({ status, size = 'sm' }) {
    const config = {
        critical:  { bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-500' },
        overflow:  { bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-500' },
        full:      { bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-500' },
        high:      { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
        medium:    { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
        low:       { bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500' },
        empty:     { bg: 'bg-gray-100',   text: 'text-gray-600',   dot: 'bg-gray-400' },
        collected: { bg: 'bg-emerald-800',text: 'text-white',      dot: 'bg-emerald-300' },
        pending:   { bg: 'bg-amber-100',  text: 'text-amber-700',  dot: 'bg-amber-500' },
        verified:  { bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500' },
        approved:  { bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500' },
        rejected:  { bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-500' },
        active:    { bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500' },
        complete:  { bg: 'bg-emerald-100',text: 'text-emerald-700',dot: 'bg-emerald-500' },
        not_started:{ bg: 'bg-gray-100',  text: 'text-gray-600',   dot: 'bg-gray-400' },
    };

    const s = config[status?.toLowerCase()] || config.empty;
    const sizeClasses = size === 'lg'
        ? 'px-3 py-1 text-sm'
        : 'px-2 py-0.5 text-xs';

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold capitalize ${s.bg} ${s.text} ${sizeClasses}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {(status || 'unknown').replace(/_/g, ' ')}
        </span>
    );
}
