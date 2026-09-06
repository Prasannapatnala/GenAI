import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../utils/api';
import { Trash2, Edit, Plus, X, Save, Wand2, Camera } from 'lucide-react';

const AdminDashboard = () => {
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
    const [isGeneratingFromImage, setIsGeneratingFromImage] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        image: ''
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get('http://localhost:3001/api/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.delete(`http://localhost:3001/api/products/${id}`);
                fetchProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await api.put(`http://localhost:3001/api/products/${editingProduct._id}`, formData);
            } else {
                await api.post('http://localhost:3001/api/products', formData);
            }
            setIsModalOpen(false);
            setEditingProduct(null);
            setImageFile(null);
            setFormData({ name: '', description: '', price: '', category: '', stock: '', image: '' });
            fetchProducts();
        } catch (error) {
            console.error('Error saving product:', error);
        }
    };

    const generateDescription = async () => {
        if (!formData.name && !formData.category) {
            alert('Please enter a product name or category first');
            return;
        }

        setIsGeneratingDescription(true);
        try {
            const response = await api.post('http://localhost:3001/api/products/generate-description', {
                name: formData.name,
                features: formData.category // Using category as a simple feature for now
            });
            setFormData(prev => ({ ...prev, description: response.data.description }));
        } catch (error) {
            console.error('Error generating description:', error);
            alert('Failed to generate description');
        } finally {
            setIsGeneratingDescription(false);
        }
    };

    const generateDetailsFromImage = async () => {
        if (!imageFile) {
            alert('Please upload an image first');
            return;
        }

        setIsGeneratingFromImage(true);
        const data = new FormData();
        data.append('image', imageFile);

        try {
            console.log('Generating details from image...');
            const response = await api.post('http://localhost:3001/api/products/generate-details-from-image', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const { name, description, category } = response.data.data;
            setFormData(prev => ({ ...prev, name, description, category }));
        } catch (error) {
            console.error('Error generating details:', error);
            alert('Failed to generate details from image');
        } finally {
            setIsGeneratingFromImage(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setFormData(prev => ({ ...prev, image: e.target.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setImageFile(null);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            stock: product.stock,
            image: product.image
        });
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setImageFile(null);
        setFormData({ name: '', description: '', price: '', category: '', stock: '', image: '' });
        setIsModalOpen(true);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <button
                    onClick={openAddModal}
                    className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800"
                >
                    <Plus size={20} /> Add Product
                </button>
            </div>

            <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product) => (
                            <tr key={product._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <img className="h-10 w-10 rounded-full object-cover" src={product.image || 'https://via.placeholder.com/40'} alt="" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.price}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => openEditModal(product)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                        <Edit size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-900">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handleSubmit}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            {editingProduct ? 'Edit Product' : 'Add New Product'}
                                        </h3>
                                        <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                            <X size={20} />
                                        </button>
                                    </div>

                                    {/* Image Upload */}
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="block text-sm font-medium text-gray-700">Image</label>
                                                {imageFile && (
                                                    <button
                                                        type="button"
                                                        onClick={generateDetailsFromImage}
                                                        disabled={isGeneratingFromImage}
                                                        className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 disabled:opacity-50"
                                                    >
                                                        <Camera size={14} />
                                                        {isGeneratingFromImage ? 'Analyzing...' : 'Snap & Sell'}
                                                    </button>
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Product Details */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Name</label>
                                            <input
                                                type="text"
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Category</label>
                                            <input
                                                type="text"
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                                <button
                                                    type="button"
                                                    onClick={generateDescription}
                                                    disabled={isGeneratingDescription}
                                                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 disabled:opacity-50"
                                                >
                                                    <Wand2 size={14} />
                                                    {isGeneratingDescription ? 'Generating...' : 'Generate with AI'}
                                                </button>
                                            </div>
                                            <textarea
                                                required
                                                rows={3}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Price</label>
                                                <input
                                                    type="number"
                                                    required
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                                    value={formData.price}
                                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Stock</label>
                                                <input
                                                    type="number"
                                                    required
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                                    value={formData.stock}
                                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Image URL</label>
                                            <input
                                                type="url"
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                                value={formData.image}
                                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-black text-base font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Save
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
