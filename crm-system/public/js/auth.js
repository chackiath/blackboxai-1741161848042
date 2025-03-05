document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');

    // Mock user data (In a real application, this would be handled by the backend)
    const mockUsers = [
        { username: 'admin', password: 'admin123', role: 'admin' },
        { username: 'manager', password: 'manager123', role: 'manager' },
        { username: 'accountant', password: 'accountant123', role: 'accountant' },
        { username: 'sales1', password: 'sales123', role: 'sales_agent' }
    ];

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            // Simulate API call with mock authentication
            const user = mockUsers.find(u => u.username === username && u.password === password);

            if (user) {
                // Store user info in localStorage (in a real app, we'd store a JWT token)
                localStorage.setItem('user', JSON.stringify({
                    username: user.username,
                    role: user.role
                }));

                // Show success message
                errorMessage.classList.remove('hidden');
                errorMessage.classList.remove('bg-red-50', 'border-red-500');
                errorMessage.classList.add('bg-green-50', 'border-green-500');
                errorText.classList.remove('text-red-700');
                errorText.classList.add('text-green-700');
                errorText.textContent = 'Login successful! Redirecting...';

                // Redirect to dashboard after a brief delay
                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 1500);
            } else {
                throw new Error('Invalid username or password');
            }
        } catch (error) {
            // Show error message
            errorMessage.classList.remove('hidden');
            errorText.textContent = error.message;
        }
    });

    // Check if user is already logged in
    const user = localStorage.getItem('user');
    if (user) {
        window.location.href = '/dashboard.html';
    }
});
