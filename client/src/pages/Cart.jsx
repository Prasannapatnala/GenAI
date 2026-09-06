import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Trash2, Minus, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, clearCart } = useContext(ShopContext);

    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const handleCheckout = () => {
        alert('Order Placed Successfully! (This is a demo)');
        clearCart();
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
                <h2 className="text-3xl font-bold mb-4">Your Cart is Empty</h2>
                <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
                <Link to="/" className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

            <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
                {/* Cart Items */}
                <div className="lg:col-span-7">
                    <ul className="border-t border-b border-gray-200 divide-y divide-gray-200">
                        {cart.map((item) => (
                            <li key={item._id} className="flex py-6 sm:py-10">
                                <div className="flex-shrink-0">
                                    <img
                                        src={item.image || 'https://via.placeholder.com/150'}
                                        alt={item.name}
                                        className="w-24 h-24 rounded-md object-center object-cover sm:w-48 sm:h-48"
                                    />
                                </div>

                                <div className="ml-4 flex-1 flex flex-col justify-between sm:ml-6">
                                    <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                                        <div>
                                            <div className="flex justify-between">
                                                <h3 className="text-sm">
                                                    <Link to={`/product/${item._id}`} className="font-medium text-gray-700 hover:text-gray-800">
                                                        {item.name}
                                                    </Link>
                                                </h3>
                                            </div>
                                            <p className="mt-1 text-sm font-medium text-gray-900">${item.price}</p>
                                            <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                                        </div>

                                        <div className="mt-4 sm:mt-0 sm:pr-9">
                                            <div className="flex items-center border border-gray-300 rounded-md w-max">
                                                <button
                                                    onClick={() => updateQuantity(item._id, -1)}
                                                    className="p-2 hover:bg-gray-100"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="px-4 font-medium">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item._id, 1)}
                                                    className="p-2 hover:bg-gray-100"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>

                                            <div className="absolute top-0 right-0">
                                                <button
                                                    onClick={() => removeFromCart(item._id)}
                                                    className="-m-2 p-2 inline-flex text-gray-400 hover:text-gray-500"
                                                >
                                                    <span className="sr-only">Remove</span>
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-5 mt-16 lg:mt-0 bg-gray-50 rounded-lg px-4 py-6 sm:p-6 lg:p-8">
                    <h2 className="text-lg font-medium text-gray-900">Order summary</h2>

                    <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                            <div className="text-base font-medium text-gray-900">Order total</div>
                            <div className="text-base font-medium text-gray-900">${total.toFixed(2)}</div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <button
                            onClick={handleCheckout}
                            className="w-full bg-black border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-black flex items-center justify-center"
                        >
                            Checkout <ArrowRight className="ml-2 h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
