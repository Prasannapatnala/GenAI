import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (!email) {
            setError("Email is required.");
            return;
        }

        setLoading(true);
        setError("");
        setInfo("");

        try {
            const response = await axios.post("http://localhost:3001/api/users/forgot-password", { email });
            setInfo(response.data.message || "OTP sent to your email address.");
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!otp || !newPassword || !confirmPassword) {
            setError("Please fill in all fields.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        setError("");
        setInfo("");

        try {
            const response = await axios.post("http://localhost:3001/api/users/reset-password", {
                email,
                otp,
                newPassword,
                confirmPassword,
            });

            setInfo(response.data.message || "Password updated successfully.");
            setTimeout(() => navigate("/login"), 1200);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to reset password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-800">
                    {step === 1 ? "Forgot Password" : "Reset Password"}
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    {step === 1
                        ? "Enter your email and we’ll send you an OTP to reset your password."
                        : "Enter the OTP you received and choose a new password."}
                </p>

                {error && <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}
                {info && <div className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-600">{info}</div>}

                {step === 1 ? (
                    <form className="mt-6 space-y-4" onSubmit={handleSendOTP}>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                            {loading ? "Sending..." : "Send OTP"}
                        </button>
                    </form>
                ) : (
                    <form className="mt-6 space-y-4" onSubmit={handleResetPassword}>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">OTP</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter OTP"
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="New password"
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Confirm password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                            {loading ? "Updating..." : "Reset Password"}
                        </button>
                    </form>
                )}

                <div className="mt-5 text-center text-sm text-gray-600">
                    Remembered your password?{' '}
                    <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
                        Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;