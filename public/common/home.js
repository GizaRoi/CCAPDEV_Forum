document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('op-username').addEventListener('click', async () => {
        try {
            const response = await fetch('/profile');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error fetching another page:', error);
        }
    });
});