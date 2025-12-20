// Admin Console Logic

document.addEventListener('DOMContentLoaded', () => {
    // UI References
    const adminTableBody = document.getElementById('admin-table-body');
    const usersTableBody = document.getElementById('users-table-body');
    const loadingText = document.getElementById('loading-text');
    const loadingUsers = document.getElementById('loading-users');
    const refreshBtn = document.getElementById('refresh-btn');
    const adminEmailSpan = document.getElementById('admin-email');
    const logoutBtn = document.getElementById('logout-btn');
    const themeToggle = document.getElementById('theme-toggle');

    // Views
    const viewGames = document.getElementById('view-games');
    const viewUsers = document.getElementById('view-users');
    const btnViewGames = document.getElementById('btn-view-games');
    const btnViewUsers = document.getElementById('btn-view-users');

    // Theme Logic
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

    // Auth & Security Check
    const ALLOWED_ADMIN_EMAIL = "gaadmin@gamesaway.com";

    auth.onAuthStateChanged(user => {
        if (user) {
            // STRICT SECURITY CHECK
            if (user.email !== ALLOWED_ADMIN_EMAIL) {
                alert("Access Denied: You are not authorized to view this page.");
                window.location.href = 'index.html';
                return;
            }

            adminEmailSpan.textContent = user.email;
            loadAllGames();
            loadAllUsers();
        } else {
            window.location.href = 'index.html';
        }
    });

    logoutBtn.addEventListener('click', () => {
        auth.signOut().then(() => window.location.href = 'index.html');
    });

    refreshBtn.addEventListener('click', () => {
        loadAllGames();
        loadAllUsers();
    });

    // Tab Switching
    btnViewGames.addEventListener('click', () => {
        viewGames.style.display = 'block';
        viewUsers.style.display = 'none';
        btnViewGames.classList.add('btn-primary');
        btnViewGames.classList.remove('btn-outline');
        btnViewUsers.classList.add('btn-outline');
        btnViewUsers.classList.remove('btn-primary');
    });

    btnViewUsers.addEventListener('click', () => {
        viewGames.style.display = 'none';
        viewUsers.style.display = 'block';
        btnViewUsers.classList.add('btn-primary');
        btnViewUsers.classList.remove('btn-outline');
        btnViewGames.classList.add('btn-outline');
        btnViewGames.classList.remove('btn-primary');
    });

    // --- Core Logic ---

    function loadAllGames() {
        adminTableBody.innerHTML = '';
        loadingText.style.display = 'block';
        loadingText.textContent = "Loading all games...";

        db.collection('games')
            .orderBy('uploadedAt', 'desc')
            .get()
            .then(snapshot => {
                loadingText.style.display = 'none';
                if (snapshot.empty) {
                    loadingText.textContent = "No uploads found.";
                    loadingText.style.display = 'block';
                    return;
                }
                snapshot.forEach(doc => renderGameRow(doc));
            })
            .catch(error => {
                console.error("Error loading games:", error);
                loadingText.textContent = "Error: " + error.message;
            });
    }

    function renderGameRow(doc) {
        const data = doc.data();
        const tr = document.createElement('tr');

        const dateStr = data.uploadedAt ? new Date(data.uploadedAt.toDate()).toLocaleDateString() : 'Just now';
        const statusClass = `badge-${data.status.toLowerCase()}`;

        // Disable buttons if already in that state
        const isApproved = data.status === 'approved';
        const isRejected = data.status === 'rejected';

        tr.innerHTML = `
            <td>
                <div style="font-weight: 600;">${data.title}</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary);"><a href="${data.downloadUrl}" target="_blank" style="color: var(--primary-color);">Download Zip</a></div>
            </td>
            <td style="font-family: monospace; font-size: 0.9em;">${data.userId.substring(0, 8)}...</td>
            <td>${dateStr}</td>
            <td><span class="status-badge ${statusClass}">${data.status.toUpperCase()}</span></td>
            <td>
                <div class="admin-controls">
                    <button class="action-btn btn-approve" ${isApproved ? 'disabled style="opacity:0.3"' : ''} onclick="updateStatus('${doc.id}', 'approved')" title="Approve">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="action-btn btn-reject" ${isRejected ? 'disabled style="opacity:0.3"' : ''} onclick="updateStatus('${doc.id}', 'rejected')" title="Reject">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </td>
        `;
        adminTableBody.appendChild(tr);
    }

    function loadAllUsers() {
        usersTableBody.innerHTML = '';
        loadingUsers.style.display = 'block';

        db.collection('users')
            .orderBy('createdAt', 'desc')
            .get()
            .then(snapshot => {
                loadingUsers.style.display = 'none';
                if (snapshot.empty) {
                    loadingUsers.textContent = "No users found in database.";
                    loadingUsers.style.display = 'block';
                    return;
                }
                snapshot.forEach(doc => renderUserRow(doc));
            })
            .catch(error => {
                console.error("Error loading users:", error);
                // Fail gracefully (maybe index missing)
                loadingUsers.textContent = "Could not load users (Index might be building).";
            });
    }

    function renderUserRow(doc) {
        const data = doc.data();
        const tr = document.createElement('tr');
        const dateStr = data.createdAt ? new Date(data.createdAt.toDate()).toLocaleDateString() : 'Unknown';

        tr.innerHTML = `
            <td style="font-family: monospace;">${doc.id}</td>
            <td>${data.email}</td>
            <td>${data.role || 'Developer'}</td>
            <td>${dateStr}</td>
        `;
        usersTableBody.appendChild(tr);
    }

    // Global Action
    window.updateStatus = function (docId, newStatus) {
        if (!confirm(`Are you sure you want to mark this game as ${newStatus}?`)) return;

        db.collection('games').doc(docId).update({
            status: newStatus
        })
            .then(() => {
                loadAllGames(); // Refresh to show status update
            })
            .catch(error => {
                alert("Error: " + error.message);
            });
    };
});
