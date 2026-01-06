document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeAccountSelector();
    initializeCompose();
    initializeContacts();
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
    const accounts = JSON.parse(localStorage.getItem('accounts') || '[{"email": "user@example.com", "primary": true}]');
    
    if (accounts.length > 1) {
        const accountSelector = document.getElementById('accountSelectorDropdown');
        const dropdownMenu = accountSelector.querySelector('.dropdown-menu');
        
        const accountItems = accounts.map(account => `
            <li><a class="dropdown-item account-item ${account.primary ? 'active' : ''}" href="#" data-account="${escapeHtml(account.email)}">
                ${account.primary ? '<i class="bi bi-check-circle-fill me-2"></i>' : '<i class="bi bi-circle me-2"></i>'}${escapeHtml(account.email)}
            </a></li>
        `).join('');
        
        dropdownMenu.innerHTML = `
            <li><h6 class="dropdown-header">Accounts</h6></li>
            ${accountItems}
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="accounts.html">
                <i class="bi bi-gear me-2"></i>Manage Accounts
            </a></li>
        `;
        
        initializeAccountSelector();
    }
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
