// Add at the top of app.js or in a separate utils.js
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