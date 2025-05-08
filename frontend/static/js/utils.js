window.showNotification = (message, type) => {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.position = 'fixed';
    notification.style.top = '10px';
    notification.style.right = '10px';
    notification.style.zIndex = '1000';
    notification.innerHTML = `
        <button class="delete"></button>
        ${message}
    `;
    document.body.appendChild(notification);
    notification.querySelector('.delete').addEventListener('click', () => {
        notification.remove();
    });
    setTimeout(() => notification.remove(), 3000);
};

window.refreshAccessToken = () => {
    const refresh = getCookie('refresh');
    if (!refresh) return Promise.resolve(null);
    return fetch('/auth/v1/token/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh })
    })
    .then(response => response.json())
    .then(data => {
        if (data.access) {
            setCookie('access', data.access, 60); // Assuming 60-minute expiry
            return data.access;
        }
        return null;
    })
    .catch(() => null);
};
