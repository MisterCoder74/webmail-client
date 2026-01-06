# Webmail Client

A modern, responsive webmail client built with Bootstrap 5 and vanilla JavaScript.

## Features

- **Dashboard Layout**: Clean and intuitive interface with navigation
- **Email Management**: Inbox, Compose, Drafts, and Sent folders
- **Address Book**: Contact management with search functionality
- **Account Management**: Multi-account support with account selector
- **Responsive Design**: Mobile-friendly layout that works on all devices
- **Light Theme**: Clean Bootstrap 5 light theme throughout

## Pages

- `index.html` - Login page
- `dashboard.html` - Main dashboard with all features
- `inbox.html` - Redirects to dashboard inbox section
- `compose.html` - Redirects to dashboard compose section
- `drafts.html` - Redirects to dashboard drafts section
- `sent.html` - Redirects to dashboard sent section
- `accounts.html` - Redirects to dashboard accounts section
- `contacts.html` - Redirects to dashboard contacts section

## Navigation

The dashboard includes a sidebar with the following sections:

- **Inbox**: View received emails
- **Compose**: Write new emails
- **Drafts**: Access saved drafts
- **Sent**: View sent messages
- **Accounts**: Manage email accounts and preferences
- **Address Book**: Manage contacts

## Features

### Header
- User profile with current account display
- Account selector dropdown (for multiple accounts)
- Logout button

### Sidebar Navigation
- Icon-based navigation menu
- Badge counters for inbox and drafts
- Quick compose button
- Responsive collapse on mobile

### Main Content Area
- Dynamic content loading based on selected section
- Smooth transitions between sections
- Context-aware page titles

## Technology Stack

- **HTML5**: Semantic markup
- **CSS3**: Custom styling with Bootstrap 5
- **JavaScript**: Vanilla JS for interactivity
- **Bootstrap 5.3**: UI framework
- **Bootstrap Icons**: Icon library

## Local Storage

The application uses browser localStorage to persist:
- Current account information
- Drafts
- Sent emails
- Contacts
- Account list

## Getting Started

1. Open `index.html` in a web browser
2. Enter any email address and password to login
3. You'll be redirected to the dashboard
4. Use the sidebar navigation to explore different sections

## Responsive Design

The application is fully responsive and works on:
- Desktop browsers (1200px+)
- Tablets (768px - 1199px)
- Mobile devices (< 768px)

On mobile devices, the sidebar collapses and can be toggled with a menu button.

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License
