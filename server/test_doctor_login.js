// Test script to check doctor authentication
const testDoctorLogin = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'doctor@ayurpulse.com', // Default doctor email
                password: 'doctor123' // Change this to your actual doctor password
            })
        });

        const data = await response.json();
        console.log('Doctor Login Response:', data);

        if (data.user && data.user.role === 'doctor') {
            console.log('✅ Doctor login successful!');
            console.log('Doctor ID:', data.user.id);
            console.log('Doctor Name:', data.user.name);
            return data;
        } else {
            console.log('❌ Login  failed or not a doctor account');
            return null;
        }
    } catch (error) {
        console.error('❌ Error during login:', error);
        return null;
    }
};

testDoctorLogin();
