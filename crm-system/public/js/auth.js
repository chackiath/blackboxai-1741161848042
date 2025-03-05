document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        window.location.href = '/dashboard.html';
        return;
    }

    const loginForm = document.querySelector('form');
    const errorMessage = document.createElement('div');
    errorMessage.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative hidden';
    errorMessage.setAttribute('role', 'alert');
    loginForm.insertBefore(errorMessage, loginForm.firstChild);

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.querySelector('input[type="text"]').value;
        const password = document.querySelector('input[type="password"]').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                // Show success message
                errorMessage.className = 'bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative';
                errorMessage.textContent = 'Login successful! Redirecting...';
                errorMessage.classList.remove('hidden');

                // Store user data
                localStorage.setItem('user', JSON.stringify({
                    ...data.user,
                    token: data.token
                }));

                // Redirect after a short delay
                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 1000);
            } else {
                errorMessage.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative';
                errorMessage.textContent = data.message || 'Invalid username or password';
                errorMessage.classList.remove('hidden');
            }
        } catch (error) {
            errorMessage.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative';
            errorMessage.textContent = 'An error occurred. Please try again.';
            errorMessage.classList.remove('hidden');
        }
    });

    // Handle "Remember me" checkbox
    const rememberMe = document.querySelector('input[type="checkbox"]');
    if (rememberMe) {
        const remembered = localStorage.getItem('rememberedUser');
        if (remembered) {
            const { username } = JSON.parse(remembered);
            document.querySelector('input[type="text"]').value = username;
            rememberMe.checked = true;
        }

        rememberMe.addEventListener('change', () => {
            if (rememberMe.checked) {
                const username = document.querySelector('input[type="text"]').value;
                localStorage.setItem('rememberedUser', JSON.stringify({ username }));
            } else {
                localStorage.removeItem('rememberedUser');
            }
        });
    }
});
