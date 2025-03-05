document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = '/index.html';
        return;
    }

    // Update UI with user information
    document.getElementById('username').textContent = user.username;

    // Mock data for leads (in a real app, this would come from an API)
    let leads = [
        {
            id: 1,
            companyName: 'Tech Solutions Inc',
            contactPerson: 'John Smith',
            email: 'john@techsolutions.com',
            phone: '(555) 123-4567',
            status: 'qualified',
            value: 50000,
            assignedTo: 'sales1',
            notes: 'Interested in enterprise package',
            createdAt: '2023-06-15'
        },
        {
            id: 2,
            companyName: 'Digital Innovations',
            contactPerson: 'Sarah Johnson',
            email: 'sarah@digitalinnovations.com',
            phone: '(555) 987-6543',
            status: 'contacted',
            value: 25000,
            assignedTo: 'sales2',
            notes: 'Follow up scheduled for next week',
            createdAt: '2023-06-16'
        }
    ];

    // DOM elements
    const leadsTableBody = document.getElementById('leadsTableBody');
    const addLeadBtn = document.getElementById('addLeadBtn');
    const leadModal = document.getElementById('leadModal');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const leadForm = document.getElementById('leadForm');
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const assignedFilter = document.getElementById('assignedFilter');
    const sortBy = document.getElementById('sortBy');

    // Modal state
    let isEditing = false;
    let editingLeadId = null;

    // Status badge colors
    const statusColors = {
        new: 'bg-blue-100 text-blue-800',
        contacted: 'bg-yellow-100 text-yellow-800',
        qualified: 'bg-green-100 text-green-800',
        proposal: 'bg-purple-100 text-purple-800',
        negotiation: 'bg-indigo-100 text-indigo-800'
    };

    // Render leads table
    function renderLeads(leadsToRender = leads) {
        leadsTableBody.innerHTML = '';
        
        leadsToRender.forEach(lead => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${lead.companyName}</div>
                    <div class="text-sm text-gray-500">Created ${new Date(lead.createdAt).toLocaleDateString()}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${lead.contactPerson}</div>
                    <div class="text-sm text-gray-500">${lead.email}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[lead.status]}">
                        ${lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    $${lead.value.toLocaleString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${lead.assignedTo}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-indigo-600 hover:text-indigo-900 mr-3" onclick="editLead(${lead.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-900" onclick="deleteLead(${lead.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            leadsTableBody.appendChild(row);
        });
    }

    // Filter and sort leads
    function filterAndSortLeads() {
        let filteredLeads = [...leads];

        // Apply search filter
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            filteredLeads = filteredLeads.filter(lead => 
                lead.companyName.toLowerCase().includes(searchTerm) ||
                lead.contactPerson.toLowerCase().includes(searchTerm) ||
                lead.email.toLowerCase().includes(searchTerm)
            );
        }

        // Apply status filter
        const statusValue = statusFilter.value;
        if (statusValue) {
            filteredLeads = filteredLeads.filter(lead => lead.status === statusValue);
        }

        // Apply assigned filter
        const assignedValue = assignedFilter.value;
        if (assignedValue) {
            filteredLeads = filteredLeads.filter(lead => lead.assignedTo === assignedValue);
        }

        // Apply sorting
        const sortValue = sortBy.value;
        filteredLeads.sort((a, b) => {
            switch (sortValue) {
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'name':
                    return a.companyName.localeCompare(b.companyName);
                case 'value':
                    return b.value - a.value;
                default:
                    return 0;
            }
        });

        renderLeads(filteredLeads);
    }

    // Event listeners for filters
    searchInput.addEventListener('input', filterAndSortLeads);
    statusFilter.addEventListener('change', filterAndSortLeads);
    assignedFilter.addEventListener('change', filterAndSortLeads);
    sortBy.addEventListener('change', filterAndSortLeads);

    // Show modal for adding/editing lead
    function showModal(lead = null) {
        isEditing = !!lead;
        editingLeadId = lead ? lead.id : null;
        
        document.getElementById('modalTitle').textContent = isEditing ? 'Edit Lead' : 'Add New Lead';
        
        if (lead) {
            document.getElementById('companyName').value = lead.companyName;
            document.getElementById('contactPerson').value = lead.contactPerson;
            document.getElementById('email').value = lead.email;
            document.getElementById('phone').value = lead.phone;
            document.getElementById('status').value = lead.status;
            document.getElementById('value').value = lead.value;
            document.getElementById('notes').value = lead.notes;
        } else {
            leadForm.reset();
        }
        
        leadModal.classList.remove('hidden');
    }

    // Hide modal
    function hideModal() {
        leadModal.classList.add('hidden');
        leadForm.reset();
        isEditing = false;
        editingLeadId = null;
    }

    // Add new lead
    function addLead(formData) {
        const newLead = {
            id: leads.length + 1,
            ...formData,
            assignedTo: user.username,
            createdAt: new Date().toISOString().split('T')[0]
        };
        
        leads.unshift(newLead);
        filterAndSortLeads();
    }

    // Edit lead
    function editLead(id) {
        const lead = leads.find(l => l.id === id);
        if (lead) {
            showModal(lead);
        }
    }

    // Update lead
    function updateLead(formData) {
        const index = leads.findIndex(l => l.id === editingLeadId);
        if (index !== -1) {
            leads[index] = {
                ...leads[index],
                ...formData
            };
            filterAndSortLeads();
        }
    }

    // Delete lead
    function deleteLead(id) {
        if (confirm('Are you sure you want to delete this lead?')) {
            leads = leads.filter(lead => lead.id !== id);
            filterAndSortLeads();
        }
    }

    // Form submission
    leadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = {
            companyName: document.getElementById('companyName').value,
            contactPerson: document.getElementById('contactPerson').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            status: document.getElementById('status').value,
            value: parseFloat(document.getElementById('value').value),
            notes: document.getElementById('notes').value
        };

        if (isEditing) {
            updateLead(formData);
        } else {
            addLead(formData);
        }

        hideModal();
    });

    // Event listeners
    addLeadBtn.addEventListener('click', () => showModal());
    closeModal.addEventListener('click', hideModal);
    cancelBtn.addEventListener('click', hideModal);

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

    // Initialize the page
    renderLeads();

    // Make functions available globally
    window.editLead = editLead;
    window.deleteLead = deleteLead;
});
