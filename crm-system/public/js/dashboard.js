document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = '/index.html';
        return;
    }

    // Update UI with user information
    const usernameElement = document.getElementById('username');
    const welcomeUserElement = document.getElementById('welcomeUser');
    usernameElement.textContent = user.username;
    welcomeUserElement.textContent = user.username;

    // Show/hide admin section based on role
    const adminSection = document.getElementById('adminSection');
    if (user.role === 'admin') {
        adminSection.classList.remove('hidden');
    }

    // Mobile menu functionality
    const sidebar = document.getElementById('sidebar');
    const mobileMenuBtn = document.getElementById('mobile-menu');
    const mobileCloseBtn = document.getElementById('mobile-close');

    mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.remove('-translate-x-full');
    });

    mobileCloseBtn.addEventListener('click', () => {
        sidebar.classList.add('-translate-x-full');
    });

    // User dropdown functionality
    const userDropdown = document.getElementById('userDropdown');
    const userMenu = document.getElementById('userMenu');

    userDropdown.addEventListener('click', () => {
        userMenu.classList.toggle('hidden');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!userDropdown.contains(e.target)) {
            userMenu.classList.add('hidden');
        }
    });

    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('user');
        window.location.href = '/index.html';
    });

    // Mock data update function (in a real app, this would fetch from an API)
    function updateDashboardStats() {
        // You could add real-time updates here
        // For now, we'll use static data as shown in the HTML
    }

    // Initialize dashboard
    updateDashboardStats();

    // Role-based content adjustments
    function adjustContentBasedOnRole() {
        const role = user.role;
        
        // Hide certain elements based on role
        const elements = document.querySelectorAll('[data-role]');
        elements.forEach(element => {
            const allowedRoles = element.dataset.role.split(',');
            if (!allowedRoles.includes(role)) {
                element.style.display = 'none';
            }
        });

        // Adjust navigation based on role
        if (role === 'accountant') {
            // Hide leads and kanban links for accountant
            document.querySelector('a[href="/leads.html"]').style.display = 'none';
            document.querySelector('a[href="/kanban.html"]').style.display = 'none';
        } else if (role === 'sales_agent') {
            // Hide admin and settings for sales agents
            document.querySelector('a[href="/users.html"]')?.style.display = 'none';
            document.querySelector('a[href="/settings.html"]')?.style.display = 'none';
        }
    }

    // Apply role-based adjustments
    adjustContentBasedOnRole();

    // Simulate real-time updates (in a real app, this would use WebSocket)
    setInterval(() => {
        const randomIncrease = Math.floor(Math.random() * 5);
        const currentLeads = parseInt(document.querySelector('.stats-leads').textContent);
        document.querySelector('.stats-leads').textContent = currentLeads + randomIncrease;
    }, 30000); // Update every 30 seconds
});
