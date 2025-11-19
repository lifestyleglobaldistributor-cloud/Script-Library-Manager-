// Main Application Logic
const app = {
    db: null,
    currentFilter: 'all',
    currentSort: 'name',
    searchQuery: '',
    currentEditingId: null,

    async init() {
        // Initialize database
        this.db = new ScriptDatabase();
        await this.db.init();
        await this.db.initializeDefaultScripts();

        // Setup event listeners
        this.setupEventListeners();

        // Load initial data
        await this.loadScripts();
        await this.updateStats();

        // Load theme preference
        this.loadTheme();
    },

    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Add script button
        document.getElementById('addScriptBtn').addEventListener('click', () => {
            this.openAddModal();
        });

        // Search
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.loadScripts();
        });

        // Category filters
        document.querySelectorAll('.category-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                this.setFilter(category);
            });
        });

        // Sort
        document.getElementById('sortSelect').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.loadScripts();
        });

        // Modal controls
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeAddModal();
        });

        document.getElementById('cancelModal').addEventListener('click', () => {
            this.closeAddModal();
        });

        document.getElementById('closeViewModal').addEventListener('click', () => {
            this.closeViewModal();
        });

        // Form submission
        document.getElementById('scriptForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveScript();
        });

        // Insert parameter button
        document.getElementById('insertParameter').addEventListener('click', () => {
            const textarea = document.getElementById('scriptCode');
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = textarea.value;
            const before = text.substring(0, start);
            const after = text.substring(end);
            textarea.value = before + '{{PARAMETER_NAME}}' + after;
            textarea.focus();
            textarea.selectionStart = textarea.selectionEnd = start + 18;
        });

        // Export/Import
        document.getElementById('exportLibrary').addEventListener('click', () => {
            this.exportLibrary();
        });

        document.getElementById('importLibrary').addEventListener('click', () => {
            document.getElementById('importFileInput').click();
        });

        document.getElementById('importFileInput').addEventListener('change', (e) => {
            this.importLibrary(e.target.files[0]);
        });

        // View modal actions
        document.getElementById('editScript').addEventListener('click', () => {
            this.editCurrentScript();
        });

        document.getElementById('deleteScript').addEventListener('click', () => {
            this.deleteCurrentScript();
        });

        document.getElementById('copyCode').addEventListener('click', () => {
            this.copyCodeToClipboard();
        });

        document.getElementById('exportTxt').addEventListener('click', () => {
            this.exportCurrentScript('txt');
        });

        document.getElementById('exportScript').addEventListener('click', () => {
            this.exportCurrentScript('script');
        });

        // Close modals on backdrop click
        document.getElementById('scriptModal').addEventListener('click', (e) => {
            if (e.target.id === 'scriptModal') {
                this.closeAddModal();
            }
        });

        document.getElementById('viewModal').addEventListener('click', (e) => {
            if (e.target.id === 'viewModal') {
                this.closeViewModal();
            }
        });
    },

    async loadScripts() {
        let scripts;

        // Apply search filter
        if (this.searchQuery) {
            scripts = await this.db.searchScripts(this.searchQuery);
        } else if (this.currentFilter === 'all') {
            scripts = await this.db.getAllScripts();
        } else {
            scripts = await this.db.getScriptsByCategory(this.currentFilter);
        }

        // Apply sorting
        scripts = this.sortScripts(scripts, this.currentSort);

        // Render scripts
        this.renderScripts(scripts);

        // Update counts
        this.updateCategoryCounts();
    },

    sortScripts(scripts, sortBy) {
        switch (sortBy) {
            case 'name':
                return scripts.sort((a, b) => a.name.localeCompare(b.name));
            case 'date':
                return scripts.sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt));
            case 'category':
                return scripts.sort((a, b) => {
                    const catCompare = a.category.localeCompare(b.category);
                    return catCompare !== 0 ? catCompare : a.name.localeCompare(b.name);
                });
            default:
                return scripts;
        }
    },

    renderScripts(scripts) {
        const grid = document.getElementById('scriptsGrid');

        if (scripts.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3>No Scripts Found</h3>
                    <p>${this.searchQuery ? 'Try a different search term' : 'Start by adding your first script'}</p>
                    ${!this.searchQuery ? '<button class="btn btn-primary" onclick="app.openAddModal()">Add Your First Script</button>' : ''}
                </div>
            `;
            return;
        }

        grid.innerHTML = scripts.map(script => this.createScriptCard(script)).join('');

        // Add click handlers
        grid.querySelectorAll('.script-card').forEach(card => {
            card.addEventListener('click', () => {
                const scriptId = parseInt(card.dataset.scriptId);
                this.viewScript(scriptId);
            });
        });
    },

    createScriptCard(script) {
        const codePreview = script.code.split('\n')[0].substring(0, 60);
        const tagsHtml = script.tags ? script.tags.slice(0, 3).map(tag => 
            `<span class="tag">${this.escapeHtml(tag)}</span>`
        ).join('') : '';

        return `
            <div class="script-card" data-script-id="${script.id}">
                <div class="script-card-header">
                    <h3 class="script-card-title">${this.escapeHtml(script.name)}</h3>
                    <span class="script-card-category">${this.escapeHtml(script.category)}</span>
                </div>
                ${script.description ? `<p class="script-card-description">${this.escapeHtml(script.description)}</p>` : ''}
                <div class="script-card-code">${this.escapeHtml(codePreview)}...</div>
                <div class="script-card-footer">
                    <div class="script-card-tags">${tagsHtml}</div>
                    <span>${this.formatDate(script.modifiedAt)}</span>
                </div>
            </div>
        `;
    },

    async viewScript(id) {
        const script = await this.db.getScript(id);
        if (!script) return;

        // Store current viewing script
        this.currentViewingId = id;

        // Populate modal
        document.getElementById('viewScriptName').textContent = script.name;
        document.getElementById('viewCategory').textContent = script.category;
        
        if (script.description) {
            document.getElementById('viewDescription').textContent = script.description;
            document.getElementById('viewDescriptionRow').style.display = 'flex';
        } else {
            document.getElementById('viewDescriptionRow').style.display = 'none';
        }

        if (script.tags && script.tags.length > 0) {
            const tagsHtml = script.tags.map(tag => 
                `<span class="tag">${this.escapeHtml(tag)}</span>`
            ).join('');
            document.getElementById('viewTags').innerHTML = tagsHtml;
            document.getElementById('viewTagsRow').style.display = 'flex';
        } else {
            document.getElementById('viewTagsRow').style.display = 'none';
        }

        document.getElementById('viewCreated').textContent = this.formatDateTime(script.createdAt);
        document.getElementById('viewModified').textContent = this.formatDateTime(script.modifiedAt);
        document.getElementById('viewCode').textContent = script.code;

        if (script.notes) {
            document.getElementById('viewNotes').textContent = script.notes;
            document.getElementById('viewNotesSection').style.display = 'block';
        } else {
            document.getElementById('viewNotesSection').style.display = 'none';
        }

        // Show modal
        document.getElementById('viewModal').classList.add('active');
    },

    closeViewModal() {
        document.getElementById('viewModal').classList.remove('active');
        this.currentViewingId = null;
    },

    openAddModal() {
        this.currentEditingId = null;
        document.getElementById('modalTitle').textContent = 'Add New Script';
        document.getElementById('scriptForm').reset();
        document.getElementById('scriptId').value = '';
        document.getElementById('scriptModal').classList.add('active');
    },

    closeAddModal() {
        document.getElementById('scriptModal').classList.remove('active');
        this.currentEditingId = null;
    },

    async saveScript() {
        const id = document.getElementById('scriptId').value;
        const script = {
            name: document.getElementById('scriptName').value.trim(),
            category: document.getElementById('scriptCategory').value,
            description: document.getElementById('scriptDescription').value.trim(),
            tags: document.getElementById('scriptTags').value.split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0),
            code: document.getElementById('scriptCode').value,
            notes: document.getElementById('scriptNotes').value.trim()
        };

        try {
            if (id) {
                await this.db.updateScript(parseInt(id), script);
                this.showToast('Script updated successfully');
            } else {
                await this.db.addScript(script);
                this.showToast('Script added successfully');
            }

            this.closeAddModal();
            await this.loadScripts();
            await this.updateStats();
        } catch (error) {
            console.error('Error saving script:', error);
            this.showToast('Error saving script', 'error');
        }
    },

    async editCurrentScript() {
        const script = await this.db.getScript(this.currentViewingId);
        if (!script) return;

        this.currentEditingId = this.currentViewingId;
        this.closeViewModal();

        // Populate form
        document.getElementById('modalTitle').textContent = 'Edit Script';
        document.getElementById('scriptId').value = script.id;
        document.getElementById('scriptName').value = script.name;
        document.getElementById('scriptCategory').value = script.category;
        document.getElementById('scriptDescription').value = script.description || '';
        document.getElementById('scriptTags').value = script.tags ? script.tags.join(', ') : '';
        document.getElementById('scriptCode').value = script.code;
        document.getElementById('scriptNotes').value = script.notes || '';

        document.getElementById('scriptModal').classList.add('active');
    },

    async deleteCurrentScript() {
        if (!confirm('Are you sure you want to delete this script? This action cannot be undone.')) {
            return;
        }

        try {
            await this.db.deleteScript(this.currentViewingId);
            this.showToast('Script deleted successfully');
            this.closeViewModal();
            await this.loadScripts();
            await this.updateStats();
        } catch (error) {
            console.error('Error deleting script:', error);
            this.showToast('Error deleting script', 'error');
        }
    },

    async updateCategoryCounts() {
        const allScripts = await this.db.getAllScripts();
        
        document.getElementById('count-all').textContent = allScripts.length;
        
        const categories = ['PLC Communications', 'Calculations', 'Alarm Handling', 'Data Manipulation'];
        const categoryIds = ['plc', 'calc', 'alarm', 'data'];
        
        categories.forEach((category, index) => {
            const count = allScripts.filter(s => s.category === category).length;
            document.getElementById(`count-${categoryIds[index]}`).textContent = count;
        });
    },

    async updateStats() {
        const scripts = await this.db.getAllScripts();
        document.getElementById('totalScripts').textContent = scripts.length;

        if (scripts.length > 0) {
            const latest = scripts.reduce((prev, current) => 
                new Date(current.modifiedAt) > new Date(prev.modifiedAt) ? current : prev
            );
            document.getElementById('lastModified').textContent = this.formatDate(latest.modifiedAt);
        } else {
            document.getElementById('lastModified').textContent = 'Never';
        }
    },

    setFilter(category) {
        this.currentFilter = category;
        
        // Update active state
        document.querySelectorAll('.category-item').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            }
        });

        // Update title
        const titles = {
            'all': 'All Scripts',
            'PLC Communications': 'PLC Communications Scripts',
            'Calculations': 'Calculation Scripts',
            'Alarm Handling': 'Alarm Handling Scripts',
            'Data Manipulation': 'Data Manipulation Scripts'
        };
        document.getElementById('contentTitle').textContent = titles[category] || 'Scripts';

        this.loadScripts();
    },

    async exportLibrary() {
        try {
            const data = await this.db.exportLibrary();
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `script-library-${this.formatDateForFilename(new Date())}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showToast('Library exported successfully');
        } catch (error) {
            console.error('Error exporting library:', error);
            this.showToast('Error exporting library', 'error');
        }
    },

    async importLibrary(file) {
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (confirm(`Import ${data.scriptCount} scripts? This will add to your existing library.`)) {
                await this.db.importLibrary(data);
                this.showToast(`Successfully imported ${data.scriptCount} scripts`);
                await this.loadScripts();
                await this.updateStats();
            }
        } catch (error) {
            console.error('Error importing library:', error);
            this.showToast('Error importing library. Please check the file format.', 'error');
        }
    },

    async copyCodeToClipboard() {
        const code = document.getElementById('viewCode').textContent;
        try {
            await navigator.clipboard.writeText(code);
            this.showToast('Code copied to clipboard');
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            this.showToast('Error copying to clipboard', 'error');
        }
    },

    async exportCurrentScript(format) {
        const script = await this.db.getScript(this.currentViewingId);
        if (!script) return;

        const content = this.formatScriptForExport(script);
        const extension = format === 'script' ? 'script' : 'txt';
        const filename = `${this.sanitizeFilename(script.name)}.${extension}`;
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast(`Script exported as ${filename}`);
    },

    formatScriptForExport(script) {
        let content = '';
        content += `' ================================================================\n`;
        content += `' Script: ${script.name}\n`;
        content += `' Category: ${script.category}\n`;
        if (script.description) {
            content += `' Description: ${script.description}\n`;
        }
        if (script.tags && script.tags.length > 0) {
            content += `' Tags: ${script.tags.join(', ')}\n`;
        }
        content += `' Created: ${this.formatDateTime(script.createdAt)}\n`;
        content += `' Modified: ${this.formatDateTime(script.modifiedAt)}\n`;
        content += `' ================================================================\n\n`;
        content += script.code;
        if (script.notes) {
            content += `\n\n' ================================================================\n`;
            content += `' USAGE NOTES:\n`;
            content += `' ${script.notes.replace(/\n/g, '\n\' ')}\n`;
            content += `' ================================================================\n`;
        }
        return content;
    },

    toggleTheme() {
        const body = document.body;
        const currentTheme = body.classList.contains('dark-theme') ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        body.classList.remove('light-theme', 'dark-theme');
        body.classList.add(`${newTheme}-theme`);
        
        localStorage.setItem('theme', newTheme);
    },

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(`${savedTheme}-theme`);
    },

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        document.getElementById('toastMessage').textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    },

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    },

    formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    formatDateForFilename(date) {
        return date.toISOString().replace(/[:.]/g, '-').split('T')[0];
    },

    sanitizeFilename(filename) {
        return filename.replace(/[^a-z0-9_\-]/gi, '_').substring(0, 50);
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
