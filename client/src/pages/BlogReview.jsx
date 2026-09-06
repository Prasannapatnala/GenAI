import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, RotateCcw, ArrowLeft } from 'lucide-react';

const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
});

const API = 'http://localhost:3001/api/blogs';

const BlogReview = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchBlog = async () => {
        try {
            const response = await axios.get(`${API}/${id}`, { headers: getAuthHeaders() });
            setBlog(response.data);
        } catch (error) {
            console.error('Error fetching blog:', error);
        }
    };

    useEffect(() => {
        fetchBlog();
    }, [id]);

    const submitDecision = async (action) => {
        if (action === 'reject' && !feedback.trim()) {
            alert('Please provide feedback describing what to change.');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await axios.post(
                `${API}/${id}/decision`,
                { action, feedback },
                { headers: getAuthHeaders() }
            );
            const updatedBlog = response.data || {};
            setBlog(updatedBlog);
            setFeedback('');

            if (action === 'approve') {
                setTimeout(() => navigate('/admin/blogs'), 400);
            }
        } catch (error) {
            console.error('Error submitting decision:', error);
            alert('Failed to submit decision');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!blog) {
        return <div className="max-w-4xl mx-auto px-4 py-12 text-gray-400">Loading…</div>;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <button
                onClick={() => navigate('/admin/blogs')}
                className="text-gray-500 hover:text-black text-sm inline-flex items-center gap-1 mb-6"
            >
                <ArrowLeft size={16} /> Back to blogs
            </button>

            <div className="flex justify-between items-start mb-2">
                <h1 className="text-3xl font-bold">{blog.seoTitle || blog.topic}</h1>
                {blog.status === 'published' ? (
                    <span className="text-xs font-medium bg-green-100 text-green-800 px-3 py-1 rounded-full whitespace-nowrap">
                        Published
                    </span>
                ) : (
                    <span className="text-xs font-medium bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full whitespace-nowrap">
                        Revision {blog.revisionCount}
                    </span>
                )}
            </div>
            <p className="text-sm text-gray-500 mb-8">Topic: {blog.topic}</p>

            {/* SEO metadata */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-semibold mb-3">SEO Metadata</h2>
                <dl className="space-y-2 text-sm">
                    <div><dt className="inline font-medium text-gray-700">Meta description: </dt><dd className="inline text-gray-600">{blog.metaDescription}</dd></div>
                    <div><dt className="inline font-medium text-gray-700">Slug: </dt><dd className="inline text-gray-600">/{blog.slug}</dd></div>
                </dl>
            </div>

            {/* Outline */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-semibold mb-3">Outline</h2>
                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">{blog.outline}</pre>
            </div>

            {/* Draft */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-semibold mb-3">Draft</h2>
                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed">{blog.draft}</pre>
            </div>

            {/* Decision — only while awaiting review */}
            {blog.status !== 'published' && (
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold mb-3">Your Decision</h2>
                <textarea
                    rows={3}
                    placeholder="Feedback for regeneration (required to reject)…"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm mb-4"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                />
                <div className="flex gap-3">
                    <button
                        onClick={() => submitDecision('approve')}
                        disabled={isSubmitting}
                        className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 disabled:opacity-50"
                    >
                        <Check size={18} /> Approve & Publish
                    </button>
                    <button
                        onClick={() => submitDecision('reject')}
                        disabled={isSubmitting}
                        className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 disabled:opacity-50"
                    >
                        <RotateCcw size={18} /> {isSubmitting ? 'Regenerating…' : 'Reject & Regenerate'}
                    </button>
                </div>
            </div>
            )}
        </div>
    );
};

export default BlogReview;
