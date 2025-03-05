document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = '/index.html';
        return;
    }

    // Update UI with user information
    document.getElementById('username').textContent = user.username;

    // Kanban columns
    const columns = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
    
    // Initialize drag and drop
    function initializeDragAndDrop() {
        const draggables = document.querySelectorAll('.draggable');
        const containers = document.querySelectorAll('.kanban-column');

        draggables.forEach(draggable => {
            draggable.addEventListener('dragstart', () => {
                draggable.classList.add('dragging');
            });

            draggable.addEventListener('dragend', async () => {
                draggable.classList.remove('dragging');
                const newStatus = draggable.closest('.kanban-column').dataset.status;
                const leadId = draggable.dataset.id;
                
                try {
                    const response = await fetch(`/api/leads/${leadId}/status`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${user.token}`
                        },
                        body: JSON.stringify({ status: newStatus })
                    });

                    const data = await response.json();
                    if (!data.success) {
                        throw new Error(data.message);
                    }

                    showNotification('Lead status updated successfully', 'success');
                } catch (error) {
                    console.error('Error updating lead status:', error);
                    showNotification('Failed to update lead status', 'error');
                    loadLeads(); // Reload to revert to original position
                }
            });
        });

        containers.forEach(container => {
            container.addEventListener('dragover', e => {
                e.preventDefault();
                const draggable = document.querySelector('.dragging');
                if (draggable) {
                    const afterElement = getDragAfterElement(container, e.clientY);
                    if (afterElement) {
                        container.insertBefore(draggable, afterElement);
                    } else {
                        container.appendChild(draggable);
                    }
                }
            });
        });
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // Load leads and populate kanban board
    async function loadLeads() {
        try {
            const response = await fetch('/api/leads', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            const data = await response.json();
            if (data.success) {
                // Clear existing cards
                columns.forEach(status => {
                    const column = document.querySelector(`[data-status="${status}"]`);
                    const cardsContainer = column.querySelector('.kanban-cards');
                    cardsContainer.innerHTML = '';
                });

                // Add leads to appropriate columns
                data.leads.forEach(lead => {
                    const column = document.querySelector(`[data-status="${lead.status}"]`);
                    if (column) {
                        const cardsContainer = column.querySelector('.kanban-cards');
                        const card = createLeadCard(lead);
                        cardsContainer.appendChild(card);
                    }
                });

                // Initialize drag and drop after adding cards
                initializeDragAndDrop();
            }
        } catch (error) {
            console.error('Error loading leads:', error);
            showNotification('Error loading leads', 'error');
        }
    }

    // Create lead card element
    function createLeadCard(lead) {
        const card = document.createElement('div');
        card.className = 'draggable bg-white p-4 rounded-lg shadow mb-3 cursor-move';
        card.draggable = true;
        card.dataset.id = lead.id;

        const value = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(lead.value);

        card.innerHTML = `
            <div class="font-medium text-gray-900 mb-1">${lead.companyName}</div>
            <div class="text-sm text-gray-600 mb-2">${lead.contactPerson}</div>
            <div class="text-sm font-medium text-indigo-600">${value}</div>
        `;

        return card;
    }

    // Show notification
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-4 py-2 rounded-lg text-white ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('user');
        window.location.href = '/index.html';
    });

    // Load leads on page load
    loadLeads();
});
