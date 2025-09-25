/**
 * Faculty Room & Equipment Management System - Main JavaScript
 * 
 * This file contains all client-side functionality for enhanced user experience
 * including form validation, AJAX operations, animations, and interactive features.
 */

'use strict';

// ============================================================================
// Global Variables & Configuration
// ============================================================================

const FacultySystem = {
    // Configuration
    config: {
        animationDuration: 300,
        alertAutoHideDelay: 5000,
        searchDebounceDelay: 500,
        apiEndpoints: {
            resources: '/api/resources',
            statusUpdate: '/api/resources/{id}/status'
        }
    },
    
    // State management
    state: {
        currentView: 'cards',
        searchTimeout: null,
        isLoading: false
    },
    
    // Cache for performance
    cache: {
        resources: null,
        lastSearch: null
    }
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Debounce function to limit API calls
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Show loading state
 */
function showLoading(element, message = 'Loading...') {
    if (typeof element === 'string') {
        element = document.querySelector(element);
    }
    
    if (element) {
        const originalText = element.innerHTML;
        element.dataset.originalText = originalText;
        element.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i>${message}`;
        element.disabled = true;
        element.classList.add('loading');
    }
}

/**
 * Hide loading state
 */
function hideLoading(element) {
    if (typeof element === 'string') {
        element = document.querySelector(element);
    }
    
    if (element && element.dataset.originalText) {
        element.innerHTML = element.dataset.originalText;
        element.disabled = false;
        element.classList.remove('loading');
        delete element.dataset.originalText;
    }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info', duration = 3000) {
    const toastContainer = getOrCreateToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} alert-dismissible fade show toast-notification`;
    toast.style.cssText = 'position: relative; margin-bottom: 0.5rem; animation: slideInRight 0.3s ease;';
    
    const iconMap = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    
    toast.innerHTML = `
        <i class="fas fa-${iconMap[type]} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after duration
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }, duration);
}

/**
 * Get or create toast container
 */
function getOrCreateToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 1060; max-width: 350px;';
        document.body.appendChild(container);
    }
    return container;
}

/**
 * Confirm delete with enhanced dialog
 */
function confirmDelete(resourceName, resourceType = 'resource') {
    const message = `Are you sure you want to delete "${resourceName}"?\n\nThis ${resourceType} will be permanently removed and cannot be recovered.`;
    return confirm(message);
}

/**
 * Format date for display
 */
function formatDate(dateString, format = 'short') {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const options = {
        short: { year: 'numeric', month: 'short', day: 'numeric' },
        long: { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' },
        time: { hour: '2-digit', minute: '2-digit' }
    };
    
    return date.toLocaleDateString('en-US', options[format] || options.short);
}

// ============================================================================
// Search and Filter Functionality
// ============================================================================

/**
 * Enhanced search functionality
 */
class SearchManager {
    constructor() {
        this.searchInput = document.getElementById('search');
        this.typeFilter = document.getElementById('type');
        this.statusFilter = document.getElementById('status');
        this.form = document.querySelector('.search-form form');
        
        this.init();
    }
    
    init() {
        if (!this.searchInput) return;
        
        // Debounced search
        const debouncedSearch = debounce(this.performSearch.bind(this), FacultySystem.config.searchDebounceDelay);
        
        // Event listeners
        this.searchInput.addEventListener('input', (e) => {
            this.updateSearchState(e.target.value);
            debouncedSearch();
        });
        
        if (this.typeFilter) {
            this.typeFilter.addEventListener('change', this.performSearch.bind(this));
        }
        
        if (this.statusFilter) {
            this.statusFilter.addEventListener('change', this.performSearch.bind(this));
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
        
        // Initialize search suggestions
        this.initSearchSuggestions();
    }
    
    updateSearchState(value) {
        if (value.length > 0) {
            this.searchInput.classList.add('border-primary');
        } else {
            this.searchInput.classList.remove('border-primary');
        }
    }
    
    performSearch() {
        if (this.form && window.location.pathname.includes('/resources')) {
            this.form.submit();
        }
    }
    
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.searchInput?.focus();
        }
        
        // Escape to clear search
        if (e.key === 'Escape' && document.activeElement === this.searchInput) {
            this.clearSearch();
        }
    }
    
    clearSearch() {
        if (this.searchInput) {
            this.searchInput.value = '';
            this.updateSearchState('');
            this.performSearch();
        }
    }
    
    initSearchSuggestions() {
        // Future enhancement: Add search suggestions dropdown
        if (this.searchInput) {
            this.searchInput.setAttribute('placeholder', 'Search resources... (Ctrl+K)');
        }
    }
}

// ============================================================================
// Form Enhancement and Validation
// ============================================================================

/**
 * Enhanced form handling
 */
class FormManager {
    constructor() {
        this.forms = document.querySelectorAll('form[method="POST"]');
        this.init();
    }
    
    init() {
        this.forms.forEach(form => {
            this.enhanceForm(form);
        });
    }
    
    enhanceForm(form) {
        // Add real-time validation
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
        
        // Form submission handler
        form.addEventListener('submit', (e) => {
            if (!this.validateForm(form)) {
                e.preventDefault();
                showToast('Please correct the errors below', 'error');
            } else {
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) {
                    showLoading(submitBtn, 'Saving...');
                }
            }
        });
        
        // Auto-save for drafts (future enhancement)
        this.initAutoSave(form);
    }
    
    validateField(input) {
        const value = input.value.trim();
        const isRequired = input.hasAttribute('required');
        const fieldType = input.type || input.tagName.toLowerCase();
        
        // Clear previous errors
        this.clearFieldError(input);
        
        // Required field validation
        if (isRequired && !value) {
            this.showFieldError(input, 'This field is required');
            return false;
        }
        
        // Type-specific validation
        switch (fieldType) {
            case 'email':
                if (value && !this.isValidEmail(value)) {
                    this.showFieldError(input, 'Please enter a valid email address');
                    return false;
                }
                break;
                
            case 'number':
                if (value && (isNaN(value) || parseFloat(value) < 0)) {
                    this.showFieldError(input, 'Please enter a valid positive number');
                    return false;
                }
                break;
                
            case 'select':
                if (isRequired && (!value || value === '')) {
                    this.showFieldError(input, 'Please select an option');
                    return false;
                }
                break;
                
            case 'textarea':
                if (input.hasAttribute('data-min-length')) {
                    const minLength = parseInt(input.getAttribute('data-min-length'));
                    if (value.length < minLength) {
                        this.showFieldError(input, `Please enter at least ${minLength} characters`);
                        return false;
                    }
                }
                break;
        }
        
        // Custom validation rules
        if (input.name === 'capacity' && value) {
            const capacity = parseInt(value);
            if (capacity < 1 || capacity > 1000) {
                this.showFieldError(input, 'Capacity must be between 1 and 1000');
                return false;
            }
        }
        
        // Mark as valid
        input.classList.add('is-valid');
        return true;
    }
    
    validateForm(form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    showFieldError(input, message) {
        input.classList.remove('is-valid');
        input.classList.add('is-invalid');
        
        // Remove existing error message
        const existingError = input.parentNode.querySelector('.invalid-feedback');
        if (existingError) {
            existingError.remove();
        }
        
        // Add new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = message;
        input.parentNode.appendChild(errorDiv);
        
        // Animate error
        errorDiv.style.animation = 'shake 0.3s ease-in-out';
    }
    
    clearFieldError(input) {
        input.classList.remove('is-invalid', 'is-valid');
        const errorDiv = input.parentNode.querySelector('.invalid-feedback');
        if (errorDiv) {
            errorDiv.remove();
        }
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    initAutoSave(form) {
        // Future enhancement: Auto-save form data to localStorage
        const formId = form.id || 'form-' + Date.now();
        let autoSaveTimer;
        
        const inputs = form.querySelectorAll('input:not([type="submit"]), select, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                clearTimeout(autoSaveTimer);
                autoSaveTimer = setTimeout(() => {
                    this.saveFormData(formId, form);
                }, 2000);
            });
        });
    }
    
    saveFormData(formId, form) {
        // Save form data to localStorage for recovery
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        localStorage.setItem(`form-${formId}`, JSON.stringify(data));
    }
    
    restoreFormData(formId, form) {
        // Restore form data from localStorage
        const savedData = localStorage.getItem(`form-${formId}`);
        if (savedData) {
            const data = JSON.parse(savedData);
            Object.keys(data).forEach(key => {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) {
                    input.value = data[key];
                }
            });
        }
    }
}

// ============================================================================
// Table Enhancement
// ============================================================================

/**
 * Enhanced table functionality
 */
class TableManager {
    constructor() {
        this.tables = document.querySelectorAll('.table-sortable');
        this.init();
    }
    
    init() {
        this.tables.forEach(table => {
            this.enhanceTable(table);
        });
    }
    
    enhanceTable(table) {
        // Add sorting functionality
        const headers = table.querySelectorAll('th[data-sort]');
        headers.forEach(header => {
            header.style.cursor = 'pointer';
            header.classList.add('sortable');
            
            // Add sort icon
            const icon = document.createElement('i');
            icon.className = 'fas fa-sort ms-1 text-muted';
            header.appendChild(icon);
            
            header.addEventListener('click', () => this.sortTable(table, header));
        });
        
        // Add row hover effects
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            row.addEventListener('mouseenter', () => {
                row.style.backgroundColor = '#f8f9fa';
                row.style.transform = 'scale(1.01)';
                row.style.transition = 'all 0.2s ease';
            });
            
            row.addEventListener('mouseleave', () => {
                row.style.backgroundColor = '';
                row.style.transform = '';
            });
        });
    }
    
    sortTable(table, header) {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        const columnIndex = Array.from(header.parentNode.children).indexOf(header);
        const sortType = header.getAttribute('data-sort');
        const currentOrder = header.getAttribute('data-order') || 'asc';
        const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
        
        // Update header attributes and icons
        table.querySelectorAll('th[data-sort]').forEach(th => {
            th.removeAttribute('data-order');
            const icon = th.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-sort ms-1 text-muted';
            }
        });
        
        header.setAttribute('data-order', newOrder);
        const icon = header.querySelector('i');
        if (icon) {
            icon.className = `fas fa-sort-${newOrder === 'asc' ? 'up' : 'down'} ms-1 text-primary`;
        }
        
        // Sort rows
        rows.sort((a, b) => {
            let aVal = a.cells[columnIndex].textContent.trim();
            let bVal = b.cells[columnIndex].textContent.trim();
            
            if (sortType === 'number') {
                aVal = parseFloat(aVal) || 0;
                bVal = parseFloat(bVal) || 0;
            } else if (sortType === 'date') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            }
            
            let comparison = 0;
            if (aVal > bVal) comparison = 1;
            if (aVal < bVal) comparison = -1;
            
            return newOrder === 'asc' ? comparison : -comparison;
        });
        
        // Animate sorting
        tbody.style.opacity = '0.5';
        
        setTimeout(() => {
            rows.forEach(row => tbody.appendChild(row));
            tbody.style.opacity = '1';
            tbody.style.transition = 'opacity 0.3s ease';
        }, 150);
    }
}

// ============================================================================
// Status Management
// ============================================================================

/**
 * Resource status management
 */
class StatusManager {
    constructor() {
        this.statusButtons = document.querySelectorAll('.status-toggle');
        this.init();
    }
    
    init() {
        this.statusButtons.forEach(button => {
            button.addEventListener('click', this.handleStatusChange.bind(this));
        });
    }
    
    async handleStatusChange(e) {
        const button = e.target;
        const resourceId = button.getAttribute('data-resource-id');
        const newStatus = button.getAttribute('data-new-status');
        
        if (!resourceId || !newStatus) return;
        
        try {
            showLoading(button, 'Updating...');
            
            // Simulate API call (replace with actual endpoint when available)
            await this.updateResourceStatus(resourceId, newStatus);
            
            // Update UI
            this.updateStatusDisplay(button, newStatus);
            showToast(`Resource status updated to ${newStatus}`, 'success');
            
        } catch (error) {
            console.error('Status update failed:', error);
            showToast('Failed to update status. Please try again.', 'error');
        } finally {
            hideLoading(button);
        }
    }
    
    async updateResourceStatus(resourceId, status) {
        // Simulate API call - replace with actual implementation
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) { // 90% success rate
                    resolve({ success: true });
                } else {
                    reject(new Error('Network error'));
                }
            }, 1000);
        });
    }
    
    updateStatusDisplay(button, newStatus) {
        const statusBadge = button.closest('.card, tr').querySelector('.status-badge');
        if (statusBadge) {
            statusBadge.className = `badge status-badge bg-${this.getStatusColor(newStatus)}`;
            statusBadge.textContent = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
        }
    }
    
    getStatusColor(status) {
        const colorMap = {
            'available': 'success',
            'maintenance': 'warning',
            'booked': 'danger',
            'inactive': 'secondary'
        };
        return colorMap[status] || 'secondary';
    }
}

// ============================================================================
// View Toggle (Cards/Table)
// ============================================================================

/**
 * View toggle functionality
 */
class ViewManager {
    constructor() {
        this.viewButtons = document.querySelectorAll('.view-toggle');
        this.contentArea = document.querySelector('.resources-content');
        this.init();
    }
    
    init() {
        this.viewButtons.forEach(button => {
            button.addEventListener('click', this.handleViewChange.bind(this));
        });
        
        // Set initial view from localStorage or default
        const savedView = localStorage.getItem('preferred-view') || 'cards';
        this.setView(savedView);
    }
    
    handleViewChange(e) {
        const button = e.target.closest('.view-toggle');
        const view = button.getAttribute('data-view');
        this.setView(view);
        localStorage.setItem('preferred-view', view);
    }
    
    setView(view) {
        FacultySystem.state.currentView = view;
        
        // Update button states
        this.viewButtons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-view') === view);
        });
        
        // Update content display
        if (this.contentArea) {
            this.contentArea.className = `resources-content view-${view}`;
            
            // Animate transition
            this.contentArea.style.opacity = '0';
            setTimeout(() => {
                this.contentArea.style.opacity = '1';
                this.contentArea.style.transition = 'opacity 0.3s ease';
            }, 150);
        }
    }
}

// ============================================================================
// Delete Confirmation Enhancement
// ============================================================================

/**
 * Enhanced delete confirmation
 */
class DeleteManager {
    constructor() {
        this.deleteButtons = document.querySelectorAll('.btn-delete, .delete-btn');
        this.init();
    }
    
    init() {
        this.deleteButtons.forEach(button => {
            button.addEventListener('click', this.handleDelete.bind(this));
        });
    }
    
    handleDelete(e) {
        e.preventDefault();
        
        const button = e.target.closest('.btn-delete, .delete-btn');
        const resourceName = button.getAttribute('data-resource-name') || 'this resource';
        const resourceType = button.getAttribute('data-resource-type') || 'resource';
        const deleteUrl = button.href || button.getAttribute('data-url');
        
        this.showDeleteModal(resourceName, resourceType, deleteUrl);
    }
    
    showDeleteModal(resourceName, resourceType, deleteUrl) {
        // Create modal HTML
        const modalHTML = `
            <div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content border-danger">
                        <div class="modal-header bg-danger text-white">
                            <h5 class="modal-title" id="deleteModalLabel">
                                <i class="fas fa-exclamation-triangle me-2"></i>
                                Confirm Deletion
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="text-center mb-3">
                                <i class="fas fa-trash-alt fa-3x text-danger"></i>
                            </div>
                            <p class="text-center">
                                Are you sure you want to delete <strong>${resourceName}</strong>?
                            </p>
                            <div class="alert alert-warning">
                                <i class="fas fa-exclamation-triangle me-2"></i>
                                This ${resourceType} will be permanently removed and cannot be recovered.
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                <i class="fas fa-times me-1"></i>
                                Cancel
                            </button>
                            <a href="${deleteUrl}" class="btn btn-danger" id="confirmDeleteBtn">
                                <i class="fas fa-trash-alt me-1"></i>
                                Delete ${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal
        const existingModal = document.getElementById('deleteModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
        modal.show();
        
        // Add loading state to delete button
        document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
            showLoading(this, 'Deleting...');
        });
        
        // Cleanup on hide
        document.getElementById('deleteModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }
}

// ============================================================================
// Animation and UI Enhancements
// ============================================================================

/**
 * Animation utilities
 */
class AnimationManager {
    static fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        const start = performance.now();
        
        function animate(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = progress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    static slideIn(element, direction = 'left', duration = 300) {
        const translateValue = direction === 'left' ? '-100%' : 
                               direction === 'right' ? '100%' : 
                               direction === 'up' ? '-100%' : '100%';
        
        const property = (direction === 'left' || direction === 'right') ? 'translateX' : 'translateY';
        
        element.style.transform = `${property}(${translateValue})`;
        element.style.transition = `transform ${duration}ms ease`;
        
        setTimeout(() => {
            element.style.transform = `${property}(0)`;
        }, 10);
    }
    
    static pulse(element) {
        element.style.animation = 'pulse 0.6s ease-in-out';
        setTimeout(() => {
            element.style.animation = '';
        }, 600);
    }
}

// ============================================================================
// Initialization and Event Binding
// ============================================================================

/**
 * Initialize all components when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Faculty Management System initialized');
    
    // Initialize all managers
    try {
        new SearchManager();
        new FormManager();
        new TableManager();
        new StatusManager();
        new ViewManager();
        new DeleteManager();
        
        // Initialize Bootstrap tooltips and popovers
        initBootstrapComponents();
        
        // Initialize keyboard shortcuts
        initKeyboardShortcuts();
        
        // Initialize auto-hide alerts
        initAutoHideAlerts();
        
        // Initialize smooth scrolling
        initSmoothScrolling();
        
        // Initialize loading states
        initLoadingStates();
        
        console.log('All components initialized successfully');
        
    } catch (error) {
        console.error('Error initializing components:', error);
        showToast('Some features may not work properly. Please refresh the page.', 'error');
    }
});

/**
 * Initialize Bootstrap components
 */
function initBootstrapComponents() {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function(popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
}

/**
 * Initialize keyboard shortcuts
 */
function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Alt + N: New resource
        if (e.altKey && e.key === 'n') {
            e.preventDefault();
            const newButton = document.querySelector('a[href*="/create"]');
            if (newButton) {
                newButton.click();
            }
        }
        
        // Alt + H: Go home
        if (e.altKey && e.key === 'h') {
            e.preventDefault();
            window.location.href = '/';
        }
        
        // Alt + R: Refresh
        if (e.altKey && e.key === 'r') {
            e.preventDefault();
            window.location.reload();
        }
    });
}

/**
 * Initialize auto-hide alerts
 */
function initAutoHideAlerts() {
    const alerts = document.querySelectorAll('.alert:not(.alert-dismissible)');
    alerts.forEach(alert => {
        if (alert.classList.contains('alert-success') || alert.classList.contains('alert-info')) {
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.style.opacity = '0';
                    alert.style.transition = 'opacity 0.3s ease';
                    setTimeout(() => {
                        if (alert.parentNode) {
                            alert.remove();
                        }
                    }, 300);
                }
            }, FacultySystem.config.alertAutoHideDelay);
        }
    });
}

/**
 * Initialize smooth scrolling
 */
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Initialize loading states for navigation
 */
function initLoadingStates() {
    const navLinks = document.querySelectorAll('a:not([href^="#"]):not([href^="mailto:"]):not([href^="tel:"])');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (this.hostname === window.location.hostname) {
                showLoading(this, 'Loading...');
            }
        });
    });
}

// ============================================================================
// CSS Animations (injected via JavaScript)
// ============================================================================

/**
 * Inject CSS animations
 */
const animationCSS = `
<style>
@keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
    20%, 40%, 60%, 80% { transform: translateX(10px); }
}

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

/* Loading animation */
.loading::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    margin: -10px 0 0 -10px;
    width: 20px;
    height: 20px;
    border: 2px solid transparent;
    border-top: 2px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

/* Hover effects */
.card-hover {
    transition: all 0.3s ease;
}

.card-hover:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

/* Status badge animations */
.status-badge {
    transition: all 0.3s ease;
}

.status-badge:hover {
    transform: scale(1.1);
}

/* Form field animations */
.form-control, .form-select {
    transition: all 0.3s ease;
}

.form-control:focus, .form-select:focus {
    transform: scale(1.02);
}

/* Button animations */
.btn {
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.btn:hover {
    transform: translateY(-2px);
}

.btn::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transition: width 0.6s, height 0.6s;
    transform: translate(-50%, -50%);
}

.btn:active::before {
    width: 300px;
    height: 300px;
}

/* Table animations */
.table tbody tr {
    transition: all 0.3s ease;
}

.table tbody tr:hover {
    background-color: #f8f9fa !important;
}

/* Toast animations */
.toast-notification {
    animation: slideInRight 0.3s ease;
}

/* Search input animations */
.form-control[type="search"] {
    transition: all 0.3s ease;
}

.form-control[type="search"]:focus {
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

/* Card flip animation for resource cards */
.resource-card {
    perspective: 1000px;
}

.resource-card-inner {
    transition: transform 0.6s;
    transform-style: preserve-3d;
}

.resource-card:hover .resource-card-inner {
    transform: rotateY(180deg);
}

.resource-card-front,
.resource-card-back {
    backface-visibility: hidden;
}

.resource-card-back {
    transform: rotateY(180deg);
}

/* View transition animations */
.view-cards .resource-item {
    animation: fadeInUp 0.5s ease forwards;
}

.view-table .table {
    animation: fadeInUp 0.3s ease forwards;
}

/* Loading spinner */
.spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

/* Sortable table headers */
.sortable:hover {
    background-color: rgba(0, 123, 255, 0.1);
}

/* Progress bar animations */
.progress-bar {
    transition: width 0.6s ease;
}

/* Modal animations */
.modal.fade .modal-dialog {
    transform: scale(0.8);
    transition: transform 0.3s ease;
}

.modal.show .modal-dialog {
    transform: scale(1);
}

/* Success/Error state animations */
.is-valid {
    animation: pulse 0.3s ease;
}

.is-invalid {
    animation: shake 0.3s ease;
}

/* Navigation animations */
.nav-link {
    transition: all 0.3s ease;
}

.nav-link:hover {
    transform: translateY(-2px);
}

/* Badge animations */
.badge {
    transition: all 0.3s ease;
}

.badge:hover {
    transform: scale(1.1);
}

/* Responsive animations - disable on mobile for performance */
@media (max-width: 768px) {
    .card-hover:hover,
    .btn:hover,
    .nav-link:hover {
        transform: none;
    }
    
    .resource-card:hover .resource-card-inner {
        transform: none;
    }
}
</style>
`;

// Inject the CSS into the document head
document.head.insertAdjacentHTML('beforeend', animationCSS);

// ============================================================================
// Performance Monitoring and Error Handling
// ============================================================================

/**
 * Performance monitoring
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            pageLoadTime: 0,
            domReadyTime: 0,
            resourceCount: 0,
            searchResponseTime: 0
        };
        this.init();
    }
    
    init() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            this.metrics.pageLoadTime = performance.now();
            this.logPerformanceMetrics();
        });
        
        // Monitor DOM ready time
        document.addEventListener('DOMContentLoaded', () => {
            this.metrics.domReadyTime = performance.now();
        });
        
        // Monitor search performance
        this.monitorSearchPerformance();
    }
    
    monitorSearchPerformance() {
        const searchInput = document.getElementById('search');
        if (searchInput) {
            let searchStartTime;
            
            searchInput.addEventListener('input', () => {
                searchStartTime = performance.now();
            });
            
            // Monitor form submission or page updates
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
                form.addEventListener('submit', () => {
                    if (searchStartTime) {
                        this.metrics.searchResponseTime = performance.now() - searchStartTime;
                    }
                });
            });
        }
    }
    
    logPerformanceMetrics() {
        console.group('Performance Metrics');
        console.log(`Page Load Time: ${this.metrics.pageLoadTime.toFixed(2)}ms`);
        console.log(`DOM Ready Time: ${this.metrics.domReadyTime.toFixed(2)}ms`);
        console.log(`Resource Count: ${document.querySelectorAll('[data-resource-id]').length}`);
        console.groupEnd();
        
        // Send metrics to analytics (future enhancement)
        this.sendMetricsToAnalytics();
    }
    
    sendMetricsToAnalytics() {
        // Placeholder for analytics integration
        // Could send to Google Analytics, Mixpanel, etc.
        if (window.gtag) {
            window.gtag('event', 'performance', {
                'page_load_time': Math.round(this.metrics.pageLoadTime),
                'dom_ready_time': Math.round(this.metrics.domReadyTime)
            });
        }
    }
}

/**
 * Error handling and reporting
 */
class ErrorHandler {
    constructor() {
        this.errors = [];
        this.init();
    }
    
    init() {
        // Global error handler
        window.addEventListener('error', (event) => {
            this.handleError({
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error,
                type: 'javascript'
            });
        });
        
        // Promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                message: event.reason.message || 'Unhandled Promise Rejection',
                error: event.reason,
                type: 'promise'
            });
        });
    }
    
    handleError(errorInfo) {
        this.errors.push({
            ...errorInfo,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        });
        
        console.error('Error captured:', errorInfo);
        
        // Show user-friendly error message
        if (errorInfo.type === 'javascript') {
            showToast('An error occurred. Please refresh the page if problems persist.', 'error');
        }
        
        // Send error to logging service (future enhancement)
        this.reportError(errorInfo);
    }
    
    reportError(errorInfo) {
        // Placeholder for error reporting service
        // Could send to Sentry, LogRocket, etc.
        if (this.errors.length > 10) {
            // Prevent memory leaks by limiting stored errors
            this.errors = this.errors.slice(-10);
        }
    }
}

// ============================================================================
// Accessibility Enhancements
// ============================================================================

/**
 * Accessibility manager
 */
class AccessibilityManager {
    constructor() {
        this.init();
    }
    
    init() {
        // Add skip links
        this.addSkipLinks();
        
        // Enhance keyboard navigation
        this.enhanceKeyboardNavigation();
        
        // Add ARIA labels where missing
        this.enhanceARIALabels();
        
        // Focus management
        this.manageFocus();
        
        // High contrast mode detection
        this.detectHighContrastMode();
    }
    
    addSkipLinks() {
        const skipLinks = `
            <div class="skip-links">
                <a href="#main-content" class="skip-link">Skip to main content</a>
                <a href="#navigation" class="skip-link">Skip to navigation</a>
                <a href="#search" class="skip-link">Skip to search</a>
            </div>
        `;
        
        document.body.insertAdjacentHTML('afterbegin', skipLinks);
        
        // Add CSS for skip links
        const skipLinkCSS = `
            <style>
            .skip-links {
                position: absolute;
                top: -100px;
                left: 0;
                z-index: 9999;
            }
            
            .skip-link {
                position: absolute;
                left: -10000px;
                top: auto;
                width: 1px;
                height: 1px;
                overflow: hidden;
                background: #000;
                color: #fff;
                padding: 8px 16px;
                text-decoration: none;
                border-radius: 0 0 4px 0;
            }
            
            .skip-link:focus {
                position: static;
                width: auto;
                height: auto;
                left: 0;
                top: 0;
            }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', skipLinkCSS);
    }
    
    enhanceKeyboardNavigation() {
        // Add tabindex to interactive elements
        const interactiveElements = document.querySelectorAll('.card, .btn:not([tabindex]), .form-control:not([tabindex])');
        interactiveElements.forEach((el, index) => {
            if (!el.hasAttribute('tabindex')) {
                el.setAttribute('tabindex', '0');
            }
        });
        
        // Handle Enter key on card elements
        const cards = document.querySelectorAll('.card[tabindex]');
        cards.forEach(card => {
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const link = card.querySelector('a');
                    if (link) {
                        link.click();
                    }
                }
            });
        });
    }
    
    enhanceARIALabels() {
        // Add aria-label to buttons without text
        const iconButtons = document.querySelectorAll('button:not([aria-label]) i, a:not([aria-label]) i');
        iconButtons.forEach(icon => {
            const button = icon.parentElement;
            if (button.tagName === 'BUTTON' || button.tagName === 'A') {
                const classList = Array.from(icon.classList);
                let label = 'Button';
                
                if (classList.includes('fa-edit')) label = 'Edit';
                else if (classList.includes('fa-trash')) label = 'Delete';
                else if (classList.includes('fa-eye')) label = 'View';
                else if (classList.includes('fa-plus')) label = 'Add';
                else if (classList.includes('fa-search')) label = 'Search';
                
                button.setAttribute('aria-label', label);
            }
        });
        
        // Add aria-describedby to form fields
        const formFields = document.querySelectorAll('.form-control, .form-select');
        formFields.forEach(field => {
            const help = field.parentElement.querySelector('.form-text');
            if (help && !field.hasAttribute('aria-describedby')) {
                const helpId = 'help-' + Math.random().toString(36).substr(2, 9);
                help.id = helpId;
                field.setAttribute('aria-describedby', helpId);
            }
        });
    }
    
    manageFocus() {
        // Focus trap for modals
        document.addEventListener('shown.bs.modal', (e) => {
            const modal = e.target;
            const focusableElements = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            
            if (focusableElements.length > 0) {
                focusableElements[0].focus();
            }
        });
        
        // Return focus when modal closes
        let lastFocusedElement;
        document.addEventListener('show.bs.modal', (e) => {
            lastFocusedElement = document.activeElement;
        });
        
        document.addEventListener('hidden.bs.modal', (e) => {
            if (lastFocusedElement) {
                lastFocusedElement.focus();
            }
        });
    }
    
    detectHighContrastMode() {
        // Detect Windows High Contrast Mode
        const isHighContrast = window.matchMedia('(prefers-contrast: high)').matches ||
                               window.matchMedia('(-ms-high-contrast: active)').matches;
        
        if (isHighContrast) {
            document.body.classList.add('high-contrast');
            
            // Add high contrast styles
            const highContrastCSS = `
                <style>
                .high-contrast .card {
                    border: 2px solid !important;
                }
                
                .high-contrast .btn {
                    border: 2px solid !important;
                    font-weight: bold !important;
                }
                
                .high-contrast .form-control,
                .high-contrast .form-select {
                    border: 2px solid !important;
                }
                </style>
            `;
            
            document.head.insertAdjacentHTML('beforeend', highContrastCSS);
        }
    }
}

// ============================================================================
// Mobile Optimizations
// ============================================================================

/**
 * Mobile-specific optimizations
 */
class MobileManager {
    constructor() {
        this.isMobile = window.innerWidth <= 768;
        this.init();
    }
    
    init() {
        if (this.isMobile) {
            this.optimizeForMobile();
        }
        
        // Listen for orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });
        
        // Listen for resize events
        window.addEventListener('resize', debounce(() => {
            this.handleResize();
        }, 250));
    }
    
    optimizeForMobile() {
        // Add touch-friendly classes
        document.body.classList.add('mobile-optimized');
        
        // Increase touch target sizes
        const mobileCss = `
            <style>
            .mobile-optimized .btn {
                min-height: 44px;
                min-width: 44px;
            }
            
            .mobile-optimized .form-control,
            .mobile-optimized .form-select {
                min-height: 44px;
            }
            
            .mobile-optimized .card {
                margin-bottom: 1rem;
            }
            
            .mobile-optimized .table-responsive {
                font-size: 0.875rem;
            }
            
            /* Disable hover effects on mobile */
            .mobile-optimized .card-hover:hover {
                transform: none;
                box-shadow: none;
            }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', mobileCss);
        
        // Add swipe gestures for cards
        this.addSwipeGestures();
        
        // Optimize search for mobile
        this.optimizeMobileSearch();
    }
    
    addSwipeGestures() {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            let startX, startY, distX, distY;
            const threshold = 50;
            
            card.addEventListener('touchstart', (e) => {
                const touch = e.touches[0];
                startX = touch.clientX;
                startY = touch.clientY;
            });
            
            card.addEventListener('touchmove', (e) => {
                if (!startX || !startY) return;
                
                const touch = e.touches[0];
                distX = touch.clientX - startX;
                distY = touch.clientY - startY;
                
                // Show swipe indicator
                if (Math.abs(distX) > 20) {
                    card.style.transform = `translateX(${distX * 0.3}px)`;
                    card.style.transition = 'none';
                }
            });
            
            card.addEventListener('touchend', (e) => {
                if (Math.abs(distX) > threshold) {
                    // Swipe action - could trigger delete or edit
                    if (distX > 0) {
                        // Swipe right - edit
                        const editBtn = card.querySelector('.btn-primary');
                        if (editBtn) editBtn.click();
                    } else {
                        // Swipe left - delete
                        const deleteBtn = card.querySelector('.btn-danger');
                        if (deleteBtn) deleteBtn.click();
                    }
                }
                
                // Reset card position
                card.style.transform = '';
                card.style.transition = '';
                
                startX = startY = distX = distY = null;
            });
        });
    }
    
    optimizeMobileSearch() {
        const searchInput = document.getElementById('search');
        if (searchInput) {
            // Add search button for mobile
            const searchButton = document.createElement('button');
            searchButton.type = 'button';
            searchButton.className = 'btn btn-outline-secondary d-md-none';
            searchButton.innerHTML = '<i class="fas fa-search"></i>';
            searchButton.setAttribute('aria-label', 'Search');
            
            searchInput.parentNode.appendChild(searchButton);
            
            // Toggle search visibility on mobile
            searchButton.addEventListener('click', () => {
                searchInput.focus();
            });
        }
    }
    
    handleOrientationChange() {
        // Refresh layout after orientation change
        const tables = document.querySelectorAll('.table-responsive');
        tables.forEach(table => {
            table.style.width = '100%';
        });
        
        // Adjust modal sizes
        const modals = document.querySelectorAll('.modal-dialog');
        modals.forEach(modal => {
            if (window.innerHeight < window.innerWidth) {
                modal.classList.add('modal-lg');
            } else {
                modal.classList.remove('modal-lg');
            }
        });
    }
    
    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;
        
        if (wasMobile !== this.isMobile) {
            if (this.isMobile) {
                this.optimizeForMobile();
            } else {
                document.body.classList.remove('mobile-optimized');
            }
        }
    }
}

// ============================================================================
// Final Initialization
// ============================================================================

/**
 * Initialize all systems
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('Faculty Management System - Advanced JavaScript Loaded');
    
    try {
        // Initialize performance monitoring
        new PerformanceMonitor();
        
        // Initialize error handling
        new ErrorHandler();
        
        // Initialize accessibility features
        new AccessibilityManager();
        
        // Initialize mobile optimizations
        new MobileManager();
        
        // Initialize service worker for offline support (future enhancement)
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then(() => {
                console.log('Service Worker registered');
            }).catch((error) => {
                console.log('Service Worker registration failed:', error);
            });
        }
        
        // Show system ready notification
        setTimeout(() => {
            showToast('System ready! Press Ctrl+K to search', 'success', 2000);
        }, 1000);
        
        console.log('All advanced features initialized successfully');
        
    } catch (error) {
        console.error('Error initializing advanced features:', error);
    }
});

// ============================================================================
// Export for global access
// ============================================================================

// Make utilities available globally
window.FacultySystem = {
    ...FacultySystem,
    showToast,
    showLoading,
    hideLoading,
    confirmDelete,
    formatDate,
    AnimationManager
};

// Development helpers (only in development)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.FacultySystemDebug = {
        clearCache: () => {
            localStorage.clear();
            sessionStorage.clear();
            console.log('Cache cleared');
        },
        
        showPerformance: () => {
            console.table(FacultySystem.cache);
        },
        
        simulateError: () => {
            throw new Error('Test error for debugging');
        }
    };
    
    console.log('Development mode enabled. Use FacultySystemDebug for debugging.');
}