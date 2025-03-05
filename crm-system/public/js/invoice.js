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
    const invoiceForm = document.getElementById('invoiceForm');
    const clientSelect = document.getElementById('clientSelect');
    const invoiceDate = document.getElementById('invoiceDate');
    const lineItems = document.getElementById('lineItems');
    const addItemBtn = document.getElementById('addItemBtn');
    const previewBtn = document.getElementById('previewBtn');
    const printBtn = document.getElementById('printBtn');
    const invoicePreview = document.getElementById('invoicePreview');
    const lineItemTemplate = document.getElementById('lineItemTemplate');

    // Set default date to today
    invoiceDate.valueAsDate = new Date();

    // Load and populate client select with leads
    async function loadClients() {
        try {
            const response = await fetch('/api/leads', {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            const data = await response.json();

            if (data.success) {
                clientSelect.innerHTML = '<option value="">Select a client</option>';
                data.leads.forEach(lead => {
                    const option = document.createElement('option');
                    option.value = lead.id;
                    option.textContent = `${lead.companyName} (${lead.contactPerson})`;
                    option.dataset.email = lead.email;
                    option.dataset.phone = lead.phone || '';
                    option.dataset.address = lead.address || '';
                    clientSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading clients:', error);
            alert('Error loading clients. Please try again.');
        }
    }

    // Load clients on page load
    loadClients();

    // Add line item
    function addLineItem() {
        const newItem = lineItemTemplate.content.cloneNode(true);
        const itemDiv = newItem.querySelector('.line-item');
        
        // Add event listeners for calculations
        const quantityInput = itemDiv.querySelector('.item-quantity');
        const priceInput = itemDiv.querySelector('.item-price');
        const totalInput = itemDiv.querySelector('.item-total');
        
        function calculateLineTotal() {
            const quantity = parseFloat(quantityInput.value) || 0;
            const price = parseFloat(priceInput.value) || 0;
            const total = quantity * price;
            totalInput.value = '$' + total.toFixed(2);
            calculateTotals();
        }

        quantityInput.addEventListener('input', calculateLineTotal);
        priceInput.addEventListener('input', calculateLineTotal);

        // Remove item button
        const removeBtn = itemDiv.querySelector('.remove-item');
        removeBtn.addEventListener('click', () => {
            itemDiv.remove();
            calculateTotals();
        });

        lineItems.appendChild(itemDiv);
    }

    // Calculate totals
    function calculateTotals() {
        let subtotal = 0;
        
        // Calculate subtotal from line items
        document.querySelectorAll('.line-item').forEach(item => {
            const quantity = parseFloat(item.querySelector('.item-quantity').value) || 0;
            const price = parseFloat(item.querySelector('.item-price').value) || 0;
            subtotal += quantity * price;
        });

        const tax = subtotal * 0.20; // 20% tax rate
        const total = subtotal + tax;

        // Update form totals
        document.getElementById('subtotal').textContent = '$' + subtotal.toFixed(2);
        document.getElementById('tax').textContent = '$' + tax.toFixed(2);
        document.getElementById('total').textContent = '$' + total.toFixed(2);

        return { subtotal, tax, total };
    }

    // Preview invoice
    function previewInvoice() {
        const selectedOption = clientSelect.options[clientSelect.selectedIndex];
        if (!selectedOption.value) {
            alert('Please select a client');
            return;
        }

        // Update preview client information
        document.getElementById('previewClientName').textContent = selectedOption.textContent;
        document.getElementById('previewClientAddress').textContent = selectedOption.dataset.address || 'No address provided';
        document.getElementById('previewClientEmail').textContent = selectedOption.dataset.email;

        // Update preview date
        document.getElementById('previewInvoiceDate').textContent = 'Date: ' + invoiceDate.value;

        // Clear and populate items
        const previewItems = document.getElementById('previewItems');
        previewItems.innerHTML = '';

        document.querySelectorAll('.line-item').forEach(item => {
            const description = item.querySelector('.item-description').value;
            const quantity = parseFloat(item.querySelector('.item-quantity').value) || 0;
            const price = parseFloat(item.querySelector('.item-price').value) || 0;
            const total = quantity * price;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="py-2">${description}</td>
                <td class="text-right py-2">${quantity}</td>
                <td class="text-right py-2">$${price.toFixed(2)}</td>
                <td class="text-right py-2">$${total.toFixed(2)}</td>
            `;
            previewItems.appendChild(row);
        });

        // Update preview totals
        const { subtotal, tax, total } = calculateTotals();
        document.getElementById('previewSubtotal').textContent = '$' + subtotal.toFixed(2);
        document.getElementById('previewTax').textContent = '$' + tax.toFixed(2);
        document.getElementById('previewTotal').textContent = '$' + total.toFixed(2);

        // Update preview notes
        document.getElementById('previewNotes').textContent = document.getElementById('notes').value;

        // Show preview
        invoicePreview.classList.remove('hidden');
        document.querySelector('main').classList.add('print-only');
    }

    // Event listeners
    addItemBtn.addEventListener('click', addLineItem);
    previewBtn.addEventListener('click', previewInvoice);
    printBtn.addEventListener('click', () => {
        previewInvoice();
        window.print();
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

    // Add initial line item
    addLineItem();
});
