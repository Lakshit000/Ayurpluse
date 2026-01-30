import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const [status, setStatus] = useState('Verifying...');

    useEffect(() => {
        if (!token) {
            setStatus('Invalid Verification Token');
            return;
        }

        const verify = async () => {
            try {
                const response = await fetch(`/api/verify-email?token=${token}`);
                if (response.ok) {
                    setStatus('Verification Successful! Redirecting to login...');
                    setTimeout(() => navigate('/login'), 3000);
                } else {
                    const msg = await response.text();
                    setStatus(`Verification Failed: ${msg}`);
                }
            } catch (error) {
                setStatus('An error occurred during verification.');
            }
        };

        verify();
    }, [token, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                <h2 className="text-2xl font-bold mb-4 text-emerald-800">Email Verification</h2>
                <p className="text-gray-600 mb-6">{status}</p>
                {status.includes('Failed') && (
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition"
                    >
                        Go to Login
                    </button>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
