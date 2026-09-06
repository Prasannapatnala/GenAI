import React, { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

const Home = () => {
    const { products, loading, addToCart } = useContext(ShopContext);
    const [filter, setFilter] = useState('All');
    const [filteredProducts, setFilteredProducts] = useState([]);

    const categories = ['All', 'Electronics', 'Clothing', 'Accessories', 'Furniture', 'Home'];

    useEffect(() => {
        if (filter === 'All') {
            setFilteredProducts(products);
        } else {
            setFilteredProducts(products.filter(p => p.category === filter));
        }
    }, [products, filter]);

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-black text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
                        New Arrivals
                    </h1>
                    <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                        Discover the latest trends in technology, fashion, and home essentials.
                        Quality you can trust, prices you'll love.
                    </p>
                    <button
                        onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}
                        className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors"
                    >
                        Shop Now
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Filter */}
                <div className="flex overflow-x-auto pb-4 mb-8 space-x-2 no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === cat
                                    ? 'bg-black text-white'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-black'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredProducts.map((product) => (
                        <div key={product._id} className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow group">
                            <Link to={`/product/${product._id}`}>
                                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 h-64 relative">
                                    <img
                                        src={product.image || 'https://via.placeholder.com/300'}
                                        alt={product.name}
                                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                                    />
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

                {filteredProducts.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        No products found in this category.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
