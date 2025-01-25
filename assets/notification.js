document.addEventListener('DOMContentLoaded', function () {
    const notificationList = document.getElementById('notification-list');

    // Fetch notifications from the backend
    const token = localStorage.getItem('token'); // Retrieve the JWT from local storage
    console.log('Token:', token); // Log the token for debugging

   
    
    fetch('/api/notifications', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
            if (response.status === 401) {
                console.error('Unauthorized: Token may be missing, invalid, or expired.');
            }
            throw new Error('Failed to fetch notifications');
        }
        return response.json();
    })
    .then(data => {
        console.log('Fetched notifications:', data);
        if (!data.notifications || data.notifications.length === 0) {
            notificationList.innerHTML = '<li>No new notifications</li>';
        } else {
            data.notifications.forEach(notification => {
                const notificationItem = document.createElement('li');
                notificationItem.className = 'notification-item';
                notificationItem.innerHTML = `
                    <strong>${notification.title}</strong><br>
                    ${notification.message}<br>
                    <small>${new Date(notification.date).toLocaleString()}</small>
                `;
                notificationList.appendChild(notificationItem);
            });
        }
    })
    .catch(error => {
        console.error('Error fetching notifications:', error);
        notificationList.innerHTML = '<li>Failed to load notifications</li>';
    });
    });