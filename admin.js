// Admin Console Logic

document.addEventListener('DOMContentLoaded', () => {
    // UI References
    const adminTableBody = document.getElementById('admin-table-body');
    const loadingText = document.getElementById('loading-text');
    const refreshBtn = document.getElementById('refresh-btn');
    const adminEmailSpan = document.getElementById('admin-email');
    const logoutBtn = document.getElementById('logout-btn');
    const themeToggle = document.getElementById('theme-toggle');

    // Theme Logic (Shared)
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        themeToggle.innerHTML = isLight ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });

    // Auth Check
    auth.onAuthStateChanged(user => {
        if (user) {
            adminEmailSpan.textContent = user.email;
            loadPendingGames();
        } else {
            // Redirect to login if not authenticated
            window.location.href = 'index.html';
        }
    });

    logoutBtn.addEventListener('click', () => {
        auth.signOut().then(() => window.location.href = 'index.html');
    });

    refreshBtn.addEventListener('click', loadPendingGames);

    // --- Core Logic ---

    function loadPendingGames() {
        adminTableBody.innerHTML = '';
        loadingText.style.display = 'block';

        // Query all games where status is 'pending'
        // Note: This requires a composite index if we sort by date. 
        // For now, simple filtering.
        db.collection('games')
            .where('status', '==', 'pending')
            .get()
            .then(snapshot => {
                loadingText.style.display = 'none';

                if (snapshot.empty) {
                    loadingText.textContent = "No pending submissions.";
                    loadingText.style.display = 'block';
                    return;
                }

                snapshot.forEach(doc => {
                    renderAdminRow(doc);
                });
            })
            .catch(error => {
                console.error("Error loading games:", error);
                loadingText.textContent = "Error loading data. See console.";
                loadingText.style.color = "var(--error-color)";
            });
    }

    function renderAdminRow(doc) {
        const data = doc.data();
        const tr = document.createElement('tr');

        const dateStr = data.uploadedAt ? new Date(data.uploadedAt.toDate()).toLocaleDateString() : 'Just now';

        tr.innerHTML = `
            <td>
                <div style="font-weight: 600;">${data.title}</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary);"><a href="${data.downloadUrl}" target="_blank" style="color: var(--primary-color);">Download Zip</a></div>
            </td>
            <td style="font-family: monospace; font-size: 0.9em;">${data.userId.substring(0, 8)}...</td>
            <td>${dateStr}</td>
            <td><span class="status-badge badge-pending">PENDING</span></td>
            <td>
                <div class="admin-controls">
                    <button class="action-btn btn-approve" onclick="updateStatus('${doc.id}', 'approved')" title="Approve">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="action-btn btn-reject" onclick="updateStatus('${doc.id}', 'rejected')" title="Reject">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </td>
        `;
        adminTableBody.appendChild(tr);
    }

    // Expose updateStatus to global scope for onclick handlers
    window.updateStatus = function (docId, newStatus) {
        if (!confirm(`Are you sure you want to mark this game as ${newStatus}?`)) return;

        const row = document.querySelector(`button[onclick*="${docId}"]`).closest('tr');
        row.style.opacity = '0.5';
        row.style.pointerEvents = 'none';

        db.collection('games').doc(docId).update({
            status: newStatus
        })
            .then(() => {
                // Remove row on success
                row.remove();

                // Check if empty
                if (adminTableBody.children.length === 0) {
                    loadingText.textContent = "No pending submissions.";
                    loadingText.style.display = 'block';
                }
            })
            .catch(error => {
                console.error("Error updating status:", error);
                alert("Failed to update status: " + error.message);
                row.style.opacity = '1';
                row.style.pointerEvents = 'auto';
            });
    };
});
