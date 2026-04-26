import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import client from '../api/client';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';

const TAG_OPTIONS = ['Success Story', 'Policy', 'Community', 'Innovation', 'Alert', 'Update'];
const TAG_COLORS = {
    'Success Story': '#16a34a',
    'Policy': '#3b82f6',
    'Community': '#f59e0b',
    'Innovation': '#8b5cf6',
    'Alert': '#ef4444',
    'Update': '#6b7280'
};

export default function NewsManagement() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        summary: '',
        emoji: '📰',
        tag: 'Update',
        tag_color: '#6b7280',
        is_published: true
    });

    const fetchNews = async () => {
        try {
            setLoading(true);
            const res = await client.get('/news/admin/all');
            setNews(res.data);
        } catch (error) {
            toast.error('Failed to load news');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingId(item.id);
            setFormData({
                title: item.title,
                summary: item.summary,
                emoji: item.emoji,
                tag: item.tag,
                tag_color: item.tag_color,
                is_published: item.is_published
            });
        } else {
            setEditingId(null);
            setFormData({
                title: '',
                summary: '',
                emoji: '📰',
                tag: 'Update',
                tag_color: '#6b7280',
                is_published: true
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    const handleTagChange = (e) => {
        const selectedTag = e.target.value;
        setFormData({
            ...formData,
            tag: selectedTag,
            tag_color: TAG_COLORS[selectedTag] || '#16a34a'
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await client.put(`/news/${editingId}`, formData);
                toast.success('News updated successfully');
            } else {
                await client.post('/news/', formData);
                toast.success('News created successfully');
            }
            handleCloseModal();
            fetchNews();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to save news');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this news post?')) {
            try {
                await client.delete(`/news/${id}`);
                toast.success('News deleted successfully');
                fetchNews();
            } catch (error) {
                toast.error('Failed to delete news');
            }
        }
    };

    const handleTogglePublish = async (id, currentStatus) => {
        try {
            await client.put(`/news/${id}`, { is_published: !currentStatus });
            toast.success(`News ${!currentStatus ? 'published' : 'unpublished'}`);
            fetchNews();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />
            <div className="flex-1 ml-20 lg:ml-64 p-8 transition-all">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 font-display">News Management</h1>
                            <p className="text-gray-500 mt-1">Manage community updates and news feed</p>
                        </div>
                        <button
                            onClick={() => handleOpenModal()}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium shadow-lg shadow-emerald-600/20 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Post Karo
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {news.map((item) => (
                                <div key={item.id} className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col ${!item.is_published ? 'opacity-60 grayscale-[30%]' : ''}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div 
                                            className="px-3 py-1 rounded-full text-xs font-bold"
                                            style={{ backgroundColor: `${item.tag_color}20`, color: item.tag_color }}
                                        >
                                            {item.tag}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => handleTogglePublish(item.id, item.is_published)}
                                                className={`text-xs px-2 py-1 rounded border ${item.is_published ? 'border-emerald-600 text-emerald-600' : 'border-gray-400 text-gray-500'}`}
                                            >
                                                {item.is_published ? 'Published' : 'Draft'}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-4 mb-4 flex-1">
                                        <span className="text-4xl">{item.emoji}</span>
                                        <div>
                                            <h3 className="font-bold text-gray-900 line-clamp-2">{item.title}</h3>
                                            <p className="text-sm text-gray-500 mt-1 line-clamp-3">{item.summary}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                                        <button 
                                            onClick={() => handleOpenModal(item)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold font-display text-gray-900">
                                {editingId ? 'Edit News Post' : 'Create News Post'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="flex gap-4">
                                <div className="w-24">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Emoji</label>
                                    <input
                                        type="text"
                                        value={formData.emoji}
                                        onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                                        className="w-full text-center text-2xl p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        required
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        placeholder="Enter news title"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
                                <textarea
                                    value={formData.summary}
                                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 h-24 resize-none"
                                    placeholder="Enter brief description"
                                    required
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tag Category</label>
                                    <select
                                        value={formData.tag}
                                        onChange={handleTagChange}
                                        className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                                    >
                                        {TAG_OPTIONS.map(tag => (
                                            <option key={tag} value={tag}>{tag}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tag Color</label>
                                    <div className="flex items-center gap-2 p-2 border border-gray-300 rounded-xl bg-gray-50 h-10">
                                        <input
                                            type="color"
                                            value={formData.tag_color}
                                            onChange={(e) => setFormData({ ...formData, tag_color: e.target.value })}
                                            className="w-6 h-6 rounded cursor-pointer"
                                        />
                                        <span className="text-sm font-mono">{formData.tag_color}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Publish immediately?</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer"
                                        checked={formData.is_published}
                                        onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                </label>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
                                >
                                    <Save className="w-5 h-5" />
                                    {editingId ? 'Update Post' : 'Save Post'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
