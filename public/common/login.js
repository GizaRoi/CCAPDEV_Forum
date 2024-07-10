document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('signIn').addEventListener('click', async () => {
        try {
            const response = await fetch('/home');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error fetching another page:', error);
        }
    });
});