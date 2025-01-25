document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;

    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = ''; // Clear previous error messages

    // Simple client-side validation
    if (!/\S+@\S+\.\S+/.test(email)) {
        errorMessage.textContent = 'Please enter a valid email address.';
        return;
    }
    if (password.length < 6) {
        errorMessage.textContent = 'Password must be at least 6 characters.';
        return;
    }

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, phone, password }),
        });

        const data = await response.json();
        if (response.ok) {
            // Redirect to login on successful registration
            window.location.href = '/login';
        } else {
            errorMessage.textContent = data.message;
        }
    } catch (error) {
        errorMessage.textContent = 'Error occurred during registration.';
        console.error('Error:', error);
    }
});

// Add an event listener to the login button
document.getElementById('loginButton').addEventListener('click', function() {
    window.location.href = '/login.html'; // Redirect to login page
});
