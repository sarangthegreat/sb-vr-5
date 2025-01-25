document.addEventListener('DOMContentLoaded', async () => {
    await loadProfileData();
});

async function loadProfileData() {
    try {
        const response = await fetch('http://localhost:5000/api/profile/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('profile-name').textContent = data.name || '';
            document.getElementById('profile-bio').textContent = data.bio || '';
            document.getElementById('profile-points').textContent = data.points || 0;
            document.getElementById('profile-badges-count').textContent = data.badges ? data.badges.length : 0;

            // Ensure the profile picture URL is correct
            document.getElementById('profile-image').src = data.profilePicture ? `http://localhost:5000/${data.profilePicture}` : 'default-profile.png';

            const badgeGrid = document.getElementById('badge-grid');
            badgeGrid.innerHTML = (data.badges || []).map(badge => `<div class="badge-item">${badge}</div>`).join('');

            document.getElementById('name').value = data.name || '';
            document.getElementById('email').value = data.email || '';
            document.getElementById('bio').value = data.bio || '';
        } else if (response.status === 401) {
            await handleUnauthorized();
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Error fetching profile data:', error);
    }
}

// Preview image functionality
function previewImage(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('image-preview');

    // Validate file type and size
    if (file) {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            alert('Please upload a valid image (JPEG, PNG, GIF).');
            event.target.value = ''; // Clear the input
            preview.style.display = 'none';
            return;
        }

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            alert('File size must be less than 2MB.');
            event.target.value = ''; // Clear the input
            preview.style.display = 'none';
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block'; // Show the preview
        };
        reader.readAsDataURL(file);
    }
}

async function handleUnauthorized() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
        alert('Session expired. Please log in again.');
        window.location.href = '/login';
        return;
    }

    try {
        const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            await loadProfileData();
        } else {
            alert(data.message);
            window.location.href = '/login';
        }
    } catch (error) {
        alert('An error occurred. Please log in again.');
        window.location.href = '/login';
    }
}

document.getElementById('profile-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const submitButton = event.target.querySelector('button[type="submit"]');
    submitButton.disabled = true; // Disable the button to prevent multiple submissions

    // Show loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.textContent = 'Uploading...';
    loadingIndicator.className = 'loading-indicator'; // Add a custom class for styling
    document.body.appendChild(loadingIndicator);

    const formData = new FormData();
    formData.append('name', document.getElementById('name').value);
    formData.append('email', document.getElementById('email').value);
    formData.append('bio', document.getElementById('bio').value);

    const profilePictureFile = document.getElementById('profile-picture-upload').files[0];
    if (profilePictureFile) {
        formData.append('profilePicture', profilePictureFile);
    }

    const password = document.getElementById('password').value;
    if (password) {
        formData.append('password', password);
    }

    try {
        const response = await fetch('/api/profile/update', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            alert('Profile updated successfully!');
            await loadProfileData();
        } else if (response.status === 401) {
            await handleUnauthorized();
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Error updating profile:', error);
    } finally {
        submitButton.disabled = false; // Re-enable the button
        document.body.removeChild(loadingIndicator); // Remove loading indicator
    }
});

document.getElementById('profile-picture-upload').addEventListener('change', previewImage);
