document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = '/index.html';
        return;
    }

    // Update UI with user information
    document.getElementById('username').textContent = user.username;

    // Mock data for deals (in a real app, this would come from an API)
    let deals = [
        {
            id: 1,
            companyName: 'Tech Solutions Inc',
            contactPerson: 'John Smith',
            email: 'john@techsolutions.com',
            value: 50000,
            status: 'qualified',
            assignedTo: 'sales1',
            createdAt: '2023-06-15'
        },
        {
            id: 2,
            companyName: 'Digital Innovations',
            contactPerson: 'Sarah Johnson',
            email: 'sarah@digitalinnovations.com',
            value: 25000,
            status: 'contacted',
            assignedTo: 'sales2',
            createdAt: '2023-06-16'
        }
    ];

    // DOM elements
    const kanbanColumns = document.querySelectorAll('.kanban-column');
    const cardTemplate = document.getElementById('dealCardTemplate');
    const collapseAllBtn = document.getElementById('collapseAll');
    const expandAllBtn = document.getElementById('expandAll');

    // Initialize counters
    const statusCounts = {
        new: 0,
        contacted: 0,
        qualified: 0,
        proposal: 0,
        negotiation: 0,
        won: 0,
        lost: 0
    };

    // Create a deal card from template
    function createDealCard(deal) {
        const card = cardTemplate.content.cloneNode(true);
        const cardElement = card.querySelector('.deal-card');
        
        cardElement.dataset.id = deal.id;
        cardElement.querySelector('.card-company').textContent = deal.companyName;
        cardElement.querySelector('.card-value').textContent = `$${deal.value.toLocaleString()}`;
        cardElement.querySelector('.card-contact').textContent = deal.contactPerson;
        cardElement.querySelector('.card-assigned').textContent = deal.assignedTo;
        cardElement.querySelector('.card-date').textContent = new Date(deal.createdAt).toLocaleDateString();

        // Add drag and drop event listeners
        cardElement.addEventListener('dragstart', handleDragStart);
        cardElement.addEventListener('dragend', handleDragEnd);

        return cardElement;
    }

    // Render all deals
    function renderDeals() {
        // Reset counters
        Object.keys(statusCounts).forEach(status => {
            statusCounts[status] = 0;
        });

        // Clear all columns
        kanbanColumns.forEach(column => {
            column.innerHTML = '';
        });

        // Distribute deals to columns
        deals.forEach(deal => {
            const column = document.querySelector(`.kanban-column[data-status="${deal.status}"]`);
            if (column) {
                column.appendChild(createDealCard(deal));
                statusCounts[deal.status]++;
            }
        });

        // Update counters
        Object.keys(statusCounts).forEach(status => {
            const counter = document.getElementById(`${status}Count`);
            if (counter) {
                counter.textContent = statusCounts[status];
            }
        });
    }

    // Drag and drop functionality
    let draggedCard = null;

    function handleDragStart(e) {
        draggedCard = this;
        this.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', this.dataset.id);
    }

    function handleDragEnd(e) {
        this.classList.remove('dragging');
        draggedCard = null;
        
        // Update counters after drag
        updateCounters();
    }

    function handleDragOver(e) {
        e.preventDefault();
        return false;
    }

    function handleDragEnter(e) {
        e.preventDefault();
    }

    function handleDrop(e) {
        e.preventDefault();
        if (!draggedCard) return;

        const column = this;
        const newStatus = column.dataset.status;
        const dealId = parseInt(draggedCard.dataset.id);
        
        // Update deal status
        const deal = deals.find(d => d.id === dealId);
        if (deal) {
            deal.status = newStatus;
            
            // In a real app, you would make an API call here to update the status
            console.log(`Updated deal ${dealId} status to ${newStatus}`);
            
            // Re-render the board
            renderDeals();
        }

        return false;
    }

    // Add drag and drop event listeners to columns
    kanbanColumns.forEach(column => {
        column.addEventListener('dragover', handleDragOver);
        column.addEventListener('dragenter', handleDragEnter);
        column.addEventListener('drop', handleDrop);
    });

    // Update counters
    function updateCounters() {
        Object.keys(statusCounts).forEach(status => {
            const count = deals.filter(deal => deal.status === status).length;
            const counter = document.getElementById(`${status}Count`);
            if (counter) {
                counter.textContent = count;
            }
        });
    }

    // Collapse/Expand functionality
    let isCollapsed = false;

    collapseAllBtn.addEventListener('click', () => {
        const cards = document.querySelectorAll('.deal-card');
        if (!isCollapsed) {
            cards.forEach(card => {
                const details = card.querySelector('.card-details');
                if (details) {
                    details.classList.add('hidden');
                }
            });
            isCollapsed = true;
        }
    });

    expandAllBtn.addEventListener('click', () => {
        const cards = document.querySelectorAll('.deal-card');
        if (isCollapsed) {
            cards.forEach(card => {
                const details = card.querySelector('.card-details');
                if (details) {
                    details.classList.remove('hidden');
                }
            });
            isCollapsed = false;
        }
    });

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

    // Initialize the board
    renderDeals();
});
