import React, { useState, useEffect, useContext } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { ShopContext } from '../context/ShopContext';
import { Plus } from 'lucide-react';

const SemanticSearch = () => {
    const location = useLocation();
    const query = new URLSearchParams(location.search).get('q');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useContext(ShopContext);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) return;
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:3001/api/products/search/semantic?q=${encodeURIComponent(query)}`);
                setResults(response.data);
            } catch (error) {
                console.error("Error fetching semantic search results:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    if (loading) return <div className="flex justify-center items-center h-screen">Searching...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold mb-8">Results for "{query}"</h1>

                {results.length === 0 ? (
                    <p className="text-gray-500">No matching products found.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {results.map((product) => (
                            <div key={product._id} className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow group">
                                <Link to={`/product/${product._id}`}>
                                    <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 h-64 relative">
                                        <img
                                            src={product.image || 'https://via.placeholder.com/300'}
                                            alt={product.name}
                                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                                        />
                                        {/* Display Semantic Score if interested */}
                                        {/* <span className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded-full">
                                            {(product.score * 100).toFixed(0)}% Match
                                        </span> */}
                                    </div>
                                </Link>
                                <div className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">{product.category}</p>
                                            <Link to={`/product/${product._id}`}>
                                                <h3 className="text-lg font-bold text-gray-900 mb-1 hover:text-gray-600 truncate">{product.name}</h3>
                                            </Link>
                                        </div>
                                        <p className="text-lg font-semibold text-gray-900">${product.price}</p>
                                    </div>
                                    <button
                                        onClick={() => addToCart(product)}
                                        className="mt-4 w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Plus size={18} /> Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SemanticSearch;
