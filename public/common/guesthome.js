document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-log').addEventListener('click', async () => {
        try {
            const response = await fetch('/login');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error fetching another page:', error);
        }
    });
});