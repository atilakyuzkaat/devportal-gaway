document.addEventListener('DOMContentLoaded', () => {
    // --- UI Elements ---
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    const authView = document.getElementById('auth-view');
    const dashboardView = document.getElementById('dashboard-view');
    const userEmailSpan = document.getElementById('user-email');
    const logoutBtn = document.getElementById('logout-btn');

    // --- Theme Logic ---
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        updateThemeIcon(true);
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('light-mode');
            const isLight = body.classList.contains('light-mode');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            updateThemeIcon(isLight);
        });
    }

    function updateThemeIcon(isLight) {
        if (!themeToggle) return;
        themeToggle.innerHTML = isLight ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }

    // Auth Forms
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const authTabs = document.querySelectorAll('.auth-tab');
    const authError = document.getElementById('auth-error');

    // --- State Management ---
    let currentUser = null;
    let gamesData = []; // Store fetched games for sorting

    // --- Authentication Logic ---

    // Listen for Auth State Changes
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            userEmailSpan.textContent = user.email;
            userEmailSpan.style.display = 'inline';
            logoutBtn.style.display = 'inline';
            switchView('dashboard');
            loadGames(); // Fetch games when user logs in
        } else {
            currentUser = null;
            userEmailSpan.style.display = 'none';
            logoutBtn.style.display = 'none';
            switchView('auth');
        }
    });

    // Login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        auth.signInWithEmailAndPassword(email, password)
            .catch(error => {
                showAuthError(error.message);
            });
    });

    // Register
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Save user to Firestore
                return db.collection('users').doc(userCredential.user.uid).set({
                    email: email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    role: 'developer'
                });
            })
            .then(() => {
                // Auth listener handles redirect
            })
            .catch(error => {
                showAuthError(error.message);
            });
    });

    // Logout
    logoutBtn.addEventListener('click', () => {
        auth.signOut();
    });

    // Auth Tab Switching
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update Tab UI
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Show correct form
            const target = tab.dataset.tab;
            if (target === 'login') {
                loginForm.classList.add('active');
                registerForm.classList.remove('active');
            } else {
                loginForm.classList.remove('active');
                registerForm.classList.add('active');
            }
            // Clear errors
            authError.textContent = '';
        });
    });

    function showAuthError(msg) {
        authError.textContent = msg;
    }

    function switchView(viewName) {
        if (viewName === 'auth') {
            authView.classList.add('active');
            dashboardView.remove('active');
            // Force display styles for fade animation
            dashboardView.style.display = 'none';
            authView.style.display = 'block';
        } else if (viewName === 'dashboard') {
            authView.classList.remove('active');
            dashboardView.classList.add('active');
            authView.style.display = 'none';
            dashboardView.style.display = 'block';
        }
    }


    // --- Dashboard Logic: Upload & Listing ---

    const uploadSection = document.getElementById('upload-section');
    const newUploadBtn = document.getElementById('new-upload-btn');
    const closeUploadBtn = document.getElementById('close-upload');
    const uploadForm = document.getElementById('upload-form');
    const progressBarContainer = document.querySelector('.progress-bar-container');
    const progressBar = document.getElementById('upload-progress');

    // Modal Controls
    newUploadBtn.addEventListener('click', () => {
        uploadSection.style.display = 'flex';
    });

    closeUploadBtn.addEventListener('click', () => {
        uploadSection.style.display = 'none';
        resetUploadForm();
    });

    // Close modal on outside click
    uploadSection.addEventListener('click', (e) => {
        if (e.target === uploadSection) {
            uploadSection.style.display = 'none';
            resetUploadForm();
        }
    });

    // File Input UI Sync
    const fileInput = document.getElementById('game-file');
    const filePlaceholder = document.querySelector('.file-upload-placeholder span');

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            filePlaceholder.textContent = e.target.files[0].name;
        } else {
            filePlaceholder.textContent = 'Drag & drop or click to browse';
        }
    });

    // Upload Logic
    uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!currentUser) return;

        const title = document.getElementById('game-title').value;
        const description = document.getElementById('game-desc').value;
        const file = fileInput.files[0];

        if (!file) return;

        // Show Progress
        progressBarContainer.style.display = 'block';

        // 1. Upload File to Storage
        const fileRef = storage.ref(`games/${currentUser.uid}/${Date.now()}_${file.name}`);
        const uploadTask = fileRef.put(file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                progressBar.style.width = progress + '%';
            },
            (error) => {
                console.error("Upload error:", error);
                alert("Upload failed: " + error.message);
                progressBarContainer.style.display = 'none';
            },
            () => {
                // Upload Complete
                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                    saveGameMetadata(title, description, downloadURL, file.size);
                });
            }
        );
    });

    function saveGameMetadata(title, description, downloadURL, sizeBytes) {
        db.collection('games').add({
            userId: currentUser.uid,
            title: title,
            description: description,
            downloadUrl: downloadURL,
            size: formatBytes(sizeBytes),
            uploadedAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'pending' // Default status
        })
            .then(() => {
                alert('Game published successfully!');
                uploadSection.style.display = 'none';
                resetUploadForm();
                loadGames(); // Refresh list
            })
            .catch((error) => {
                console.error("Error writing document: ", error);
                alert("Error saving game data: " + error.message);
            });
    }

    function resetUploadForm() {
        uploadForm.reset();
        progressBar.style.width = '0%';
        progressBarContainer.style.display = 'none';
        filePlaceholder.textContent = 'Drag & drop or click to browse';
    }

    // --- Game Listing Logic & Sorting ---
    const gamesTableBody = document.getElementById('games-table-body');
    const loadingGames = document.getElementById('loading-games');
    const sortHeaders = document.querySelectorAll('th.sortable');
    let currentSort = { field: 'date', dir: 'desc' };

    // Sort Event Listeners
    sortHeaders.forEach(th => {
        th.addEventListener('click', () => {
            const field = th.dataset.sort;
            if (currentSort.field === field) {
                currentSort.dir = currentSort.dir === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.field = field;
                currentSort.dir = 'asc'; // Default new sort to asc
            }
            renderGames();
            updateSortIcons();
        });
    });

    function loadGames() {
        if (!currentUser) return;

        gamesTableBody.innerHTML = '';
        loadingGames.style.display = 'block';

        db.collection('games')
            .where('userId', '==', currentUser.uid)
            .get()
            .then((querySnapshot) => {
                loadingGames.style.display = 'none';
                gamesData = []; // Reset local data

                if (querySnapshot.empty) {
                    renderGames(); // Will render empty state
                    return;
                }

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    gamesData.push({
                        id: doc.id,
                        ...data,
                        // Parse extra fields for sorting if needed
                        uploadTimestamp: data.uploadedAt ? data.uploadedAt.toMillis() : 0,
                        sizeBytes: parseSizeBytes(data.size)
                    });
                });

                // Initial sort
                renderGames();
            })
            .catch((error) => {
                console.error("Error getting games: ", error);
                loadingGames.style.display = 'none';
            });
    }

    // Helper for parsing size string back to bytes for sorting (rough approximation)
    function parseSizeBytes(sizeStr) {
        if (!sizeStr) return 0;
        const parts = sizeStr.split(' ');
        const num = parseFloat(parts[0]);
        const unit = parts[1];
        let multiplier = 1;
        if (unit === 'KB') multiplier = 1024;
        if (unit === 'MB') multiplier = 1024 * 1024;
        if (unit === 'GB') multiplier = 1024 * 1024 * 1024;
        return num * multiplier;
    }

    function renderGames() {
        gamesTableBody.innerHTML = '';

        if (gamesData.length === 0) {
            gamesTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 30px; color: var(--text-secondary);">No games uploaded yet.</td></tr>';
            return;
        }

        // Sort Data
        gamesData.sort((a, b) => {
            let valA, valB;

            if (currentSort.field === 'title') {
                valA = a.title.toLowerCase();
                valB = b.title.toLowerCase();
            } else if (currentSort.field === 'size') {
                valA = a.sizeBytes;
                valB = b.sizeBytes;
            } else { // date
                valA = a.uploadTimestamp;
                valB = b.uploadTimestamp;
            }

            if (valA < valB) return currentSort.dir === 'asc' ? -1 : 1;
            if (valA > valB) return currentSort.dir === 'asc' ? 1 : -1;
            return 0;
        });

        // Render Rows
        gamesData.forEach(game => {
            const date = game.uploadedAt ? new Date(game.uploadedAt.toDate()).toLocaleDateString() : 'Just now';

            const row = `
                <tr>
                    <td>
                        <div style="font-weight: 600;">${game.title}</div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary);">${game.description}</div>
                    </td>
                    <td>${game.size}</td>
                    <td>${date}</td>
                    <td><span class="status-badge active">Active</span></td>
                    <td>
                        <div style="display: flex; gap: 10px;">
                            <button class="action-btn" title="Download" onclick="window.open('${game.downloadUrl}')">
                                <i class="fas fa-download"></i>
                            </button>
                                <button class="action-btn" title="Delete" style="color: var(--error-color);" onclick="deleteGame('${game.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            gamesTableBody.insertAdjacentHTML('beforeend', row);
        });
    }

    function updateSortIcons() {
        sortHeaders.forEach(th => {
            const icon = th.querySelector('i');
            icon.className = 'fas fa-sort'; // Reset
            if (th.dataset.sort === currentSort.field) {
                icon.className = currentSort.dir === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
                icon.style.opacity = '1';
                icon.style.color = 'var(--primary-color)';
            } else {
                icon.style.opacity = '0.5';
                icon.style.color = '';
            }
        });
    }

    // Helper: Format Bytes
    function formatBytes(bytes, decimals = 2) {
        if (!+bytes) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    }

    // Expose delete function to window so onclick works
    window.deleteGame = function (docId) {
        if (confirm('Are you sure you want to delete this game?')) {
            db.collection('games').doc(docId).delete().then(() => {
                loadGames();
            }).catch((error) => {
                console.error("Error removing document: ", error);
            });
        }
    };
});
