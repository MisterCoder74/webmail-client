document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeAccountSelector();
    initializeCompose();
    initializeContacts();
    initializeAccountManagement();
    initializeLogout();
    loadUserData();
});

function initializeNavigation() {
    const navLinks = document.querySelectorAll('.sidebar .nav-link[data-section]');
    const newMessageBtn = document.querySelector('.sidebar button[data-section="compose"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            navigateToSection(section);
        });
    });
    
    if (newMessageBtn) {
        newMessageBtn.addEventListener('click', function(e) {
            e.preventDefault();
            navigateToSection('compose');
        });
    }
}

function navigateToSection(section) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(s => s.style.display = 'none');
    
    const targetSection = document.getElementById(`${section}-section`);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
    
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    
    const activeLink = document.querySelector(`.sidebar .nav-link[data-section="${section}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    const titles = {
        'inbox': 'Inbox',
        'compose': 'Compose Message',
        'drafts': 'Drafts',
        'sent': 'Sent Messages',
        'accounts': 'Account Settings',
        'contacts': 'Address Book'
    };
    
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        pageTitle.textContent = titles[section] || 'Dashboard';
    }
    
    const sidebarCollapse = document.getElementById('sidebarMenu');
    if (window.innerWidth < 768 && sidebarCollapse) {
        const bsCollapse = bootstrap.Collapse.getInstance(sidebarCollapse);
        if (bsCollapse) {
            bsCollapse.hide();
        }
    }
    
    if (section === 'inbox') {
        loadInbox();
    } else if (section === 'drafts') {
        loadDrafts();
    } else if (section === 'sent') {
        loadSent();
    } else if (section === 'contacts') {
        loadContacts();
    }
}

function initializeAccountSelector() {
    const accountItems = document.querySelectorAll('.account-item');
    accountItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const account = this.getAttribute('data-account');
            switchAccount(account);
        });
    });
    
    loadAccounts();
}

function switchAccount(account) {
    const currentAccountDisplay = document.getElementById('currentAccount');
    if (currentAccountDisplay) {
        currentAccountDisplay.textContent = account;
    }
    
    const accountItems = document.querySelectorAll('.account-item');
    accountItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-account') === account) {
            item.classList.add('active');
        }
    });
    
    localStorage.setItem('currentAccount', account);
    
    navigateToSection('inbox');
}

function initializeCompose() {
    const composeForm = document.getElementById('composeForm');
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    const discardBtn = document.getElementById('discardBtn');
    
    if (composeForm) {
        composeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            sendEmail();
        });
    }
    
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', function() {
            saveDraft();
        });
    }
    
    if (discardBtn) {
        discardBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to discard this message?')) {
                composeForm.reset();
                navigateToSection('inbox');
            }
        });
    }
}

function sendEmail() {
    const to = document.getElementById('composeTo').value;
    const subject = document.getElementById('composeSubject').value;
    const body = document.getElementById('composeBody').value;
    
    const email = {
        to,
        cc: document.getElementById('composeCc').value,
        bcc: document.getElementById('composeBcc').value,
        subject,
        body,
        sentAt: new Date().toISOString()
    };
    
    const sentEmails = JSON.parse(localStorage.getItem('sentEmails') || '[]');
    sentEmails.unshift(email);
    localStorage.setItem('sentEmails', JSON.stringify(sentEmails));
    
    alert('Email sent successfully!');
    
    document.getElementById('composeForm').reset();
    navigateToSection('inbox');
}

function saveDraft() {
    const to = document.getElementById('composeTo').value;
    const subject = document.getElementById('composeSubject').value;
    const body = document.getElementById('composeBody').value;
    
    if (!to && !subject && !body) {
        alert('Nothing to save as draft.');
        return;
    }
    
    const draft = {
        id: Date.now(),
        to,
        cc: document.getElementById('composeCc').value,
        bcc: document.getElementById('composeBcc').value,
        subject,
        body,
        savedAt: new Date().toISOString()
    };
    
    const drafts = JSON.parse(localStorage.getItem('drafts') || '[]');
    drafts.unshift(draft);
    localStorage.setItem('drafts', JSON.stringify(drafts));
    
    updateDraftsCount();
    
    alert('Draft saved successfully!');
    
    document.getElementById('composeForm').reset();
    navigateToSection('drafts');
}

function initializeContacts() {
    const saveContactBtn = document.getElementById('saveContactBtn');
    const contactSearch = document.getElementById('contactSearch');
    
    if (saveContactBtn) {
        saveContactBtn.addEventListener('click', function() {
            saveContact();
        });
    }
    
    if (contactSearch) {
        contactSearch.addEventListener('input', function() {
            filterContacts(this.value);
        });
    }
}

function saveContact() {
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const phone = document.getElementById('contactPhone').value;
    const notes = document.getElementById('contactNotes').value;
    
    if (!name || !email) {
        alert('Name and email are required.');
        return;
    }
    
    const contact = {
        id: Date.now(),
        name,
        email,
        phone,
        notes,
        createdAt: new Date().toISOString()
    };
    
    const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
    contacts.push(contact);
    localStorage.setItem('contacts', JSON.stringify(contacts));
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('addContactModal'));
    modal.hide();
    
    document.getElementById('addContactForm').reset();
    
    loadContacts();
}

function loadContacts() {
    const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
    const contactsList = document.getElementById('contactsList');
    
    if (!contactsList) return;
    
    if (contacts.length === 0) {
        contactsList.innerHTML = '';
        return;
    }
    
    const alertElement = document.querySelector('#contacts-section .alert');
    if (alertElement) {
        alertElement.style.display = 'none';
    }
    
    contactsList.innerHTML = contacts.map(contact => `
        <div class="list-group-item" data-contact-id="${contact.id}">
            <div class="d-flex w-100 justify-content-between align-items-center">
                <div>
                    <h6 class="mb-1">${escapeHtml(contact.name)}</h6>
                    <p class="mb-1 text-muted">${escapeHtml(contact.email)}</p>
                    ${contact.phone ? `<small class="text-muted"><i class="bi bi-telephone me-1"></i>${escapeHtml(contact.phone)}</small>` : ''}
                </div>
                <div>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="composeToContact('${escapeHtml(contact.email)}')">
                        <i class="bi bi-envelope"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteContact(${contact.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function filterContacts(searchTerm) {
    const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
    const filtered = contacts.filter(contact => 
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const contactsList = document.getElementById('contactsList');
    if (!contactsList) return;
    
    contactsList.innerHTML = filtered.map(contact => `
        <div class="list-group-item" data-contact-id="${contact.id}">
            <div class="d-flex w-100 justify-content-between align-items-center">
                <div>
                    <h6 class="mb-1">${escapeHtml(contact.name)}</h6>
                    <p class="mb-1 text-muted">${escapeHtml(contact.email)}</p>
                    ${contact.phone ? `<small class="text-muted"><i class="bi bi-telephone me-1"></i>${escapeHtml(contact.phone)}</small>` : ''}
                </div>
                <div>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="composeToContact('${escapeHtml(contact.email)}')">
                        <i class="bi bi-envelope"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteContact(${contact.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function composeToContact(email) {
    document.getElementById('composeTo').value = email;
    navigateToSection('compose');
}

function deleteContact(contactId) {
    if (!confirm('Are you sure you want to delete this contact?')) {
        return;
    }
    
    const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
    const filtered = contacts.filter(c => c.id !== contactId);
    localStorage.setItem('contacts', JSON.stringify(filtered));
    
    loadContacts();
}

function initializeLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                logout();
            }
        });
    }
}

function logout() {
    localStorage.removeItem('currentAccount');
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'index.html';
}

function loadUserData() {
    const currentAccount = localStorage.getItem('currentAccount') || 'user@example.com';
    const currentAccountDisplay = document.getElementById('currentAccount');
    if (currentAccountDisplay) {
        currentAccountDisplay.textContent = currentAccount;
    }
    
    updateInboxCount();
    updateDraftsCount();
}

function updateInboxCount() {
    const inboxCount = document.getElementById('inboxCount');
    if (inboxCount) {
        const count = 1;
        inboxCount.textContent = count;
    }
}

function updateDraftsCount() {
    const drafts = JSON.parse(localStorage.getItem('drafts') || '[]');
    const draftsCount = document.getElementById('draftsCount');
    if (draftsCount) {
        draftsCount.textContent = drafts.length;
    }
}

function loadInbox() {
    updateInboxCount();
}

function loadDrafts() {
    const drafts = JSON.parse(localStorage.getItem('drafts') || '[]');
    const draftsList = document.getElementById('draftsList');
    
    if (!draftsList) return;
    
    if (drafts.length === 0) {
        draftsList.innerHTML = '';
        return;
    }
    
    const alertElement = document.querySelector('#drafts-section .alert');
    if (alertElement) {
        alertElement.style.display = 'none';
    }
    
    draftsList.innerHTML = drafts.map(draft => `
        <a href="#" class="list-group-item list-group-item-action" onclick="editDraft(${draft.id}); return false;">
            <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1">${escapeHtml(draft.subject || '(No subject)')}</h5>
                <small>${formatDate(draft.savedAt)}</small>
            </div>
            <p class="mb-1">${escapeHtml(draft.body?.substring(0, 100) || '')}${draft.body?.length > 100 ? '...' : ''}</p>
            <small>To: ${escapeHtml(draft.to || '(No recipient)')}</small>
        </a>
    `).join('');
}

function editDraft(draftId) {
    const drafts = JSON.parse(localStorage.getItem('drafts') || '[]');
    const draft = drafts.find(d => d.id === draftId);
    
    if (!draft) return;
    
    document.getElementById('composeTo').value = draft.to || '';
    document.getElementById('composeCc').value = draft.cc || '';
    document.getElementById('composeBcc').value = draft.bcc || '';
    document.getElementById('composeSubject').value = draft.subject || '';
    document.getElementById('composeBody').value = draft.body || '';
    
    const updatedDrafts = drafts.filter(d => d.id !== draftId);
    localStorage.setItem('drafts', JSON.stringify(updatedDrafts));
    updateDraftsCount();
    
    navigateToSection('compose');
}

function loadSent() {
    const sentEmails = JSON.parse(localStorage.getItem('sentEmails') || '[]');
    const sentList = document.getElementById('sentList');
    
    if (!sentList) return;
    
    if (sentEmails.length === 0) {
        sentList.innerHTML = '';
        return;
    }
    
    const alertElement = document.querySelector('#sent-section .alert');
    if (alertElement) {
        alertElement.style.display = 'none';
    }
    
    sentList.innerHTML = sentEmails.map((email, index) => `
        <div class="list-group-item">
            <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1">${escapeHtml(email.subject)}</h5>
                <small>${formatDate(email.sentAt)}</small>
            </div>
            <p class="mb-1">${escapeHtml(email.body?.substring(0, 100) || '')}${email.body?.length > 100 ? '...' : ''}</p>
            <small>To: ${escapeHtml(email.to)}</small>
        </div>
    `).join('');
}

function loadAccounts() {
    let accounts = JSON.parse(localStorage.getItem('accounts'));
    if (!accounts) {
        accounts = [{"id": 1, "email": "user@example.com", "primary": true}];
        localStorage.setItem('accounts', JSON.stringify(accounts));
    }
    
    const accountSelector = document.getElementById('accountSelectorDropdown');
    if (!accountSelector) return;
    
    const dropdownMenu = accountSelector.querySelector('.dropdown-menu');
    if (!dropdownMenu) return;
    
    const accountItems = accounts.map(account => `
        <li><a class="dropdown-item account-item ${account.primary ? 'active' : ''}" href="#" data-account="${escapeHtml(account.email)}">
            ${account.primary ? '<i class="bi bi-check-circle-fill me-2"></i>' : '<i class="bi bi-circle me-2"></i>'}${escapeHtml(account.email)}
        </a></li>
    `).join('');
    
    dropdownMenu.innerHTML = `
        <li><h6 class="dropdown-header">Accounts</h6></li>
        ${accountItems}
        <li><hr class="dropdown-divider"></li>
        <li><a class="dropdown-item" href="#" data-section="accounts">
            <i class="bi bi-gear me-2"></i>Manage Accounts
        </a></li>
    `;
    
    // Re-initialize account selector listeners
    const newAccountItems = dropdownMenu.querySelectorAll('.account-item');
    newAccountItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const account = this.getAttribute('data-account');
            switchAccount(account);
        });
    });

    // Handle "Manage Accounts" click in dropdown
    const manageLink = dropdownMenu.querySelector('[data-section="accounts"]');
    if (manageLink) {
        manageLink.addEventListener('click', function(e) {
            e.preventDefault();
            navigateToSection('accounts');
        });
    }
}

function initializeAccountManagement() {
    const addNewAccountBtn = document.getElementById('addNewAccountBtn');
    const saveAccountActionBtn = document.getElementById('saveAccountActionBtn');
    
    if (addNewAccountBtn) {
        addNewAccountBtn.addEventListener('click', function() {
            openAccountModal();
        });
    }
    
    if (saveAccountActionBtn) {
        saveAccountActionBtn.addEventListener('click', function() {
            saveAccount();
        });
    }

    renderAccountsList();
}

function openAccountModal(accountId = null) {
    const modalTitle = document.getElementById('accountModalLabel');
    const form = document.getElementById('accountForm');
    form.reset();
    document.getElementById('accountId').value = '';

    if (accountId) {
        modalTitle.textContent = 'Edit Account';
        const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
        const account = accounts.find(a => a.id === accountId);
        if (account) {
            document.getElementById('accountId').value = account.id;
            document.getElementById('accountEmail').value = account.email;
            document.getElementById('accountProtocol').value = account.protocol || 'imap';
            document.getElementById('incomingHost').value = account.incomingHost || '';
            document.getElementById('incomingPort').value = account.incomingPort || '';
            document.getElementById('incomingUser').value = account.incomingUser || '';
            document.getElementById('incomingPass').value = account.incomingPass || '';
            document.getElementById('outgoingHost').value = account.outgoingHost || '';
            document.getElementById('outgoingPort').value = account.outgoingPort || '';
            document.getElementById('outgoingUser').value = account.outgoingUser || '';
            document.getElementById('outgoingPass').value = account.outgoingPass || '';
        }
    } else {
        modalTitle.textContent = 'Add New Account';
    }

    const modal = new bootstrap.Modal(document.getElementById('accountModal'));
    modal.show();
}

function saveAccount() {
    const email = document.getElementById('accountEmail').value;
    if (!email) {
        alert('Email address is required.');
        return;
    }

    const accountId = document.getElementById('accountId').value;
    const accountData = {
        id: accountId ? parseInt(accountId) : Date.now(),
        email: email,
        protocol: document.getElementById('accountProtocol').value,
        incomingHost: document.getElementById('incomingHost').value,
        incomingPort: document.getElementById('incomingPort').value,
        incomingUser: document.getElementById('incomingUser').value,
        incomingPass: document.getElementById('incomingPass').value,
        outgoingHost: document.getElementById('outgoingHost').value,
        outgoingPort: document.getElementById('outgoingPort').value,
        outgoingUser: document.getElementById('outgoingUser').value,
        outgoingPass: document.getElementById('outgoingPass').value,
        primary: false
    };

    let accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    
    if (accounts.length === 0) {
        accountData.primary = true;
    }

    if (accountId) {
        const index = accounts.findIndex(a => a.id === parseInt(accountId));
        if (index !== -1) {
            accountData.primary = accounts[index].primary;
            accounts[index] = accountData;
        }
    } else {
        accounts.push(accountData);
    }

    localStorage.setItem('accounts', JSON.stringify(accounts));
    
    const modalElement = document.getElementById('accountModal');
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) {
        modal.hide();
    } else {
        // Fallback if getInstance fails
        const bsModal = bootstrap.Modal.getOrCreateInstance(modalElement);
        bsModal.hide();
    }

    renderAccountsList();
    loadAccounts();
}

function renderAccountsList() {
    const accountsList = document.getElementById('accountsList');
    if (!accountsList) return;

    let accounts = JSON.parse(localStorage.getItem('accounts'));
    if (!accounts) {
        accounts = [{"id": 1, "email": "user@example.com", "primary": true}];
    }
    
    accountsList.innerHTML = accounts.map(account => `
        <div class="list-group-item">
            <div class="d-flex w-100 justify-content-between align-items-center">
                <div>
                    <h6 class="mb-1">${escapeHtml(account.email)}</h6>
                    <small class="text-muted">${account.primary ? 'Primary Account' : 'Secondary Account'}</small>
                </div>
                <div>
                    <span class="badge bg-success">Active</span>
                    <button class="btn btn-sm btn-outline-primary ms-2" onclick="openAccountModal(${account.id})">
                        <i class="bi bi-pencil"></i> Edit
                    </button>
                    ${!account.primary ? `
                    <button class="btn btn-sm btn-outline-danger ms-1" onclick="deleteAccount(${account.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function deleteAccount(accountId) {
    if (!confirm('Are you sure you want to delete this account?')) {
        return;
    }
    
    let accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    accounts = accounts.filter(a => a.id !== accountId);
    localStorage.setItem('accounts', JSON.stringify(accounts));
    
    renderAccountsList();
    loadAccounts();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
