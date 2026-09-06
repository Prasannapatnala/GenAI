import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Wand2, Eye } from 'lucide-react';

const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
});

const API = 'http://localhost:3001/api/blogs';

const BlogAdmin = () => {
    const [topic, setTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [inReview, setInReview] = useState([]);
    const [published, setPublished] = useState([]);
    const navigate = useNavigate();

    const fetchBlogs = async () => {
        try {
            const [r1, r2] = await Promise.all([
                axios.get(`${API}?status=in_review`, { headers: getAuthHeaders() }),
                axios.get(`${API}?status=published`, { headers: getAuthHeaders() }),
            ]);
            setInReview(r1.data);
            setPublished(r2.data);
        } catch (error) {
            console.error('Error fetching blogs:', error);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!topic.trim()) return;

        setIsGenerating(true);
        try {
            const response = await axios.post(
                `${API}/generate`,
                { topic },
                { headers: getAuthHeaders() }
            );
            setTopic('');
            navigate(`/admin/blogs/${response.data._id}/review`);
        } catch (error) {
            console.error('Error generating blog:', error);
            alert('Failed to generate blog');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold mb-8">AI Blog Generator</h1>

            {/* Generate form */}
            <form onSubmit={handleGenerate} className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 mb-10">
                <label className="block text-sm font-medium text-gray-700 mb-1">Blog Topic</label>
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="e.g. Best budget wireless earbuds in 2026"
                        className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={isGenerating}
                        className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 disabled:opacity-50"
                    >
                        <Wand2 size={18} />
                        {isGenerating ? 'Generating...' : 'Generate'}
                    </button>
                </div>
            </form>

            {/* In-review table */}
            <BlogTable
                title="Awaiting Review"
                blogs={inReview}
                emptyText="No drafts awaiting review."
                actionLabel="Review"
                onAction={(id) => navigate(`/admin/blogs/${id}/review`)}
            />

            {/* Published table */}
            <div className="mt-10">
                <BlogTable
                    title="Published"
                    blogs={published}
                    emptyText="No published blogs yet."
                    actionLabel="View"
                    onAction={(id) => navigate(`/admin/blogs/${id}/review`)}
                />
            </div>
        </div>
    );
};

const BlogTable = ({ title, blogs, emptyText, actionLabel, onAction }) => (
    <div>
        <h2 className="text-xl font-semibold mb-3">{title}</h2>
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rev</th>
                        {actionLabel && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {blogs.length === 0 ? (
                        <tr>
                            <td colSpan={actionLabel ? 4 : 3} className="px-6 py-6 text-center text-sm text-gray-400">{emptyText}</td>
                        </tr>
                    ) : (
                        blogs.map((blog) => (
                            <tr key={blog._id}>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{blog.topic}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{blog.seoTitle || '—'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{blog.revisionCount}</td>
                                {actionLabel && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => onAction(blog._id)}
                                            className="text-indigo-600 hover:text-indigo-900 inline-flex items-center gap-1"
                                        >
                                            <Eye size={16} /> {actionLabel}
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

export default BlogAdmin;