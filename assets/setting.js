document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('settings-form');
    const responseMessage = document.getElementById('response-message');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = {
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            oldPassword: document.getElementById('old-password').value,
            newPassword: document.getElementById('new-password').value
        };

        fetch('/api/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                responseMessage.innerHTML = '<p style="color: green;">Settings updated successfully.</p>';
            } else {
                responseMessage.innerHTML = `<p style="color: red;">${data.error}</p>`;
            }
        })
        .catch(error => {
            console.error('Error updating settings:', error);
            responseMessage.innerHTML = '<p style="color: red;">Failed to update settings.</p>';
        });
    });
});
