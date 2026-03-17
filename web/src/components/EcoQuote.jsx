import { useState, useEffect } from 'react';
import { Leaf, RefreshCw, Bookmark, BookmarkCheck, Quote } from 'lucide-react';

const ECO_QUOTES = [
    { text: "The Earth does not belong to us, we belong to the Earth.", author: "Chief Seattle" },
    { text: "Reduce, Reuse, Recycle — in that order.", author: "Eco Wisdom" },
    { text: "Every piece of plastic ever made still exists somewhere.", author: "Environmental Truth" },
    { text: "The greatest threat to our planet is the belief that someone else will save it.", author: "Robert Swan" },
    { text: "We do not inherit the earth from our ancestors; we borrow it from our children.", author: "Native Proverb" },
    { text: "Nature does not hurry, yet everything is accomplished.", author: "Lao Tzu" },
    { text: "In every walk with nature, one receives far more than he seeks.", author: "John Muir" },
    { text: "Waste is a design flaw.", author: "Kate Krebs" },
    { text: "There is no such thing as 'away'. When we throw anything away it must go somewhere.", author: "Annie Leonard" },
    { text: "The environment is where we all meet; where we all have a mutual interest.", author: "Lady Bird Johnson" },
    { text: "Act as if what you do makes a difference. It does.", author: "William James" },
    { text: "One person's trash is another person's treasure — and the planet's burden.", author: "Green Thought" },
    { text: "Buy less, choose well, make it last.", author: "Vivienne Westwood" },
    { text: "Small acts, when multiplied by millions of people, can transform the world.", author: "Howard Zinn" },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
    { text: "Plastic is forever — choose wisely.", author: "Zero Waste Movement" },
    { text: "What we do to the environment, we do to ourselves.", author: "Environmental Truth" },
    { text: "Be the change you wish to see in the world.", author: "Mahatma Gandhi" },
    { text: "Clean water, fresh air, and a livable climate are inalienable human rights.", author: "Leonardo DiCaprio" },
    { text: "Collect plastic today, gift a cleaner tomorrow.", author: "SmartWaste AI" },
    { text: "Every recycled bottle is a small victory for the planet.", author: "Green Living" },
    { text: "The Earth provides enough to satisfy every man's needs, but not every man's greed.", author: "Mahatma Gandhi" },
];

export default function EcoQuote() {
    const [quoteIndex, setQuoteIndex] = useState(0);
    const [bookmarked, setBookmarked] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('sw-bookmarked-quotes') || '[]');
        } catch { return []; }
    });
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        const dayOfYear = Math.floor(
            (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
        );
        setQuoteIndex(dayOfYear % ECO_QUOTES.length);
    }, []);

    const quote = ECO_QUOTES[quoteIndex];
    const isBookmarked = bookmarked.includes(quoteIndex);

    const handleRefresh = () => {
        setIsRefreshing(true);
        const newIndex = (quoteIndex + 1) % ECO_QUOTES.length;
        setQuoteIndex(newIndex);
        setTimeout(() => setIsRefreshing(false), 300);
    };

    const handleBookmark = () => {
        const next = isBookmarked
            ? bookmarked.filter(i => i !== quoteIndex)
            : [...bookmarked, quoteIndex];
        setBookmarked(next);
        localStorage.setItem('sw-bookmarked-quotes', JSON.stringify(next));
    };

    return (
        <div className="relative overflow-hidden bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-2xl border border-green-100 p-5 mb-6 animate-fade-in">
            {/* Decorative leaf */}
            <div className="absolute -right-3 -top-3 opacity-[0.07]">
                <Leaf className="w-28 h-28 text-green-800 rotate-12" />
            </div>
            <div className="absolute -left-2 -bottom-2 opacity-[0.05]">
                <Leaf className="w-20 h-20 text-green-700 -rotate-45" />
            </div>

            <div className="relative flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <Quote className="w-5 h-5 text-green-700" />
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-base font-medium text-green-900 leading-relaxed italic">
                        "{quote.text}"
                    </p>
                    <p className="text-sm text-green-600 mt-1.5 font-medium">
                        — {quote.author}
                    </p>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                        onClick={handleBookmark}
                        className="p-2 rounded-lg hover:bg-green-100 transition-colors"
                        title={isBookmarked ? "Remove bookmark" : "Bookmark this quote"}
                    >
                        {isBookmarked
                            ? <BookmarkCheck className="w-4 h-4 text-green-700" />
                            : <Bookmark className="w-4 h-4 text-green-500" />
                        }
                    </button>
                    <button
                        onClick={handleRefresh}
                        className="p-2 rounded-lg hover:bg-green-100 transition-colors"
                        title="New quote"
                    >
                        <RefreshCw className={`w-4 h-4 text-green-500 transition-transform ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>
        </div>
    );
}
