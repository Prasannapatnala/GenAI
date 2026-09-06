import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import api from '../utils/api';
import { ShopContext } from '../context/ShopContext';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductDetails = () => {
    const { id } = useParams();
    const { addToCart } = useContext(ShopContext);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await api.get(`/products/${id}`);
                setProduct(response.data);
            } catch (error) {
                console.error('Error fetching product:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (!product) return <div className="flex justify-center items-center h-screen">Product not found</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Link to="/" className="inline-flex items-center text-gray-500 hover:text-black mb-8">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Shopping
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Image */}
                <div className="rounded-2xl overflow-hidden bg-gray-100">
                    <img
                        src={product.image || 'https://via.placeholder.com/600'}
                        alt={product.name}
                        className="w-full h-full object-cover object-center"
                    />
                </div>

                {/* Details */}
                <div className="flex flex-col justify-center">
                    <span className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-2">
                        {product.category}
                    </span>
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{product.name}</h1>
                    <p className="text-3xl text-gray-900 font-bold mb-6">${product.price}</p>

                    <div className="prose prose-sm text-gray-600 mb-8">
                        <p>{product.description}</p>
                    </div>

                    <div className="border-t border-b border-gray-200 py-4 mb-8">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Availability</span>
                            <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                        className={`w-full py-4 px-8 rounded-full flex items-center justify-center text-lg font-bold transition-colors ${product.stock > 0
                                ? 'bg-black text-white hover:bg-gray-800'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        <ShoppingBag className="mr-2 h-5 w-5" />
                        {product.stock > 0 ? 'Add to Cart' : 'Sold Out'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
