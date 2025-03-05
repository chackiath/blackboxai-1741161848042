document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = '/index.html';
        return;
    }

    // Update UI with user information
    document.getElementById('username').textContent = user.username;

    // DOM elements
    const leadsTable = document.getElementById('leadsTable');
    const leadsTableBody = document.getElementById('leadsTableBody');
    const addLeadForm = document.getElementById('addLeadForm');
    const addLeadModal = document.getElementById('addLeadModal');
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');

    // Load leads
    const loadLeads = async () => {
        try {
            const response = await fetch('/api/leads', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            const data = await response.json();

            if (data.success) {
                leadsTableBody.innerHTML = '';
                data.leads.forEach(lead => {
                    const row = document.createElement('tr');
                    row.className = 'hover:bg-gray-50';
                    row.innerHTML = `
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm font-medium text-gray-900">${lead.companyName}</div>
                            <div class="text-sm text-gray-500">${lead.contactPerson}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm text-gray-900">${lead.email}</div>
                            <div class="text-sm text-gray-500">${lead.phone || 'N/A'}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${getStatusColor(lead.status)}">
                                ${lead.status}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            $${lead.value.toLocaleString()}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button onclick="editLead(${lead.id})" class="text-indigo-600 hover:text-indigo-900 mr-4">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button onclick="deleteLead(${lead.id})" class="text-red-600 hover:text-red-900">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </td>
                    `;
                    leadsTableBody.appendChild(row);
                });
            }
        } catch (error) {
            console.error('Error loading leads:', error);
            showNotification('Error loading leads', 'error');
        }
    };

    // Add new lead
    addLeadForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(addLeadForm);
        const leadData = {
            companyName: formData.get('companyName'),
            contactPerson: formData.get('contactPerson'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            status: formData.get('status'),
            value: parseFloat(formData.get('value')) || 0,
            notes: formData.get('notes')
        };

        try {
            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(leadData)
            });

            const data = await response.json();

            if (data.success) {
                addLeadForm.reset();
                closeModal();
                await loadLeads();
                showNotification('Lead added successfully', 'success');
            } else {
                throw new Error(data.message || 'Error adding lead');
            }
        } catch (error) {
            console.error('Error adding lead:', error);
            showNotification(error.message, 'error');
        }
    });

    // Modal functions
    const openModal = () => {
        addLeadModal.classList.remove('hidden');
    };

    const closeModal = () => {
        addLeadModal.classList.add('hidden');
        addLeadForm.reset();
    };

    openModalBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);

    // Helper functions
    const getStatusColor = (status) => {
        const colors = {
            new: 'bg-blue-100 text-blue-800',
            contacted: 'bg-yellow-100 text-yellow-800',
            qualified: 'bg-green-100 text-green-800',
            proposal: 'bg-purple-100 text-purple-800',
            negotiation: 'bg-orange-100 text-orange-800',
            won: 'bg-green-100 text-green-800',
            lost: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const showNotification = (message, type = 'success') => {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-4 py-2 rounded-lg text-white ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    };

    // Delete lead function
    window.deleteLead = async (id) => {
        if (!confirm('Are you sure you want to delete this lead?')) {
            return;
        }

        try {
            const response = await fetch(`/api/leads/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                await loadLeads();
                showNotification('Lead deleted successfully', 'success');
            } else {
                throw new Error(data.message || 'Error deleting lead');
            }
        } catch (error) {
            console.error('Error deleting lead:', error);
            showNotification(error.message, 'error');
        }
    };

    // Edit lead function
    window.editLead = async (id) => {
        // Implementation for editing lead
        // This would typically open a modal with the lead's current data
        // and allow the user to update it
        console.log('Edit lead:', id);
    };

    // Load leads on page load
    loadLeads();

    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('user');
        window.location.href = '/index.html';
    });
});
