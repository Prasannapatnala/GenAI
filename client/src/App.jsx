
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { ShopProvider } from './context/ShopContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import AdminDashboard from './pages/AdminDashboard';
import SemanticSearch from './pages/SemanticSearch';
import ShopMateChatbot from './components/ShopMateChatbot';
import Logout from './pages/Logout';
import Registerpage from './pages/Registerpage';
import Loginpage from './pages/Loginpage';
import ForgotPassword from './pages/ForgotPassword';
import BlogAdmin from './pages/BlogAdmin';
import BlogReview from './pages/BlogReview';

// Wraps layout so we can use useLocation inside Router
function AppLayout() {
    const location = useLocation();
    const hideNav = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-password';

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
            {!hideNav && <Navbar />}

            <Routes>
                {/* Public routes */}
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Loginpage />} />
                <Route path="/register" element={<Registerpage />} />
                <Route path="/logout" element={<Logout />} />
                <Route path = "/forgot-password" element = {<ForgotPassword/>}/>
                <Route path = "/BlogAdmin" element = {<BlogAdmin/>}/>
                <Route path = "/BlogReview" element = {<BlogReview/>}/>

                {/* Protected: any logged-in user (admin or user) */}
                <Route path="/home" element={
                    <ProtectedRoute>
                        <Home />
                    </ProtectedRoute>
                } />
                <Route path="/product/:id" element={
                    <ProtectedRoute>
                        <ProductDetails />
                    </ProtectedRoute>
                } />
                <Route path="/cart" element={
                    <ProtectedRoute>
                        <Cart />
                    </ProtectedRoute>
                } />
                <Route path="/semantic-search" element={
                    <ProtectedRoute>
                        <SemanticSearch />
                    </ProtectedRoute>
                } />

               

                {/* Protected: admin only */}
                <Route path="/admin" element={
                    <ProtectedRoute role="admin">
                        <AdminDashboard />
                    </ProtectedRoute>
                } />
              <Route path = "/admin/blogs" element={
                    <ProtectedRoute role="admin"> <BlogAdmin/> </ProtectedRoute>
              }/>

              <Route path = "/admin/blogs/:id/review" element ={
                    <ProtectedRoute role = "admin">
                        <BlogReview/>
                    </ProtectedRoute>
              }/>
            </Routes>


            {!hideNav && <ShopMateChatbot />}
        </div>
    );
}

function App() {
    return (
        <ShopProvider>
            <Router>
                <AppLayout />
            </Router>
        </ShopProvider>
    );
}

export default App;