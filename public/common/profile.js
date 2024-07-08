document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-profile').addEventListener('click', async () => {
        try {
            const response = await fetch('/profile');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const profileHtml = await response.text();
            document.getElementById('content').innerHTML = profileHtml;
        } catch (error) {
            console.error('Error fetching the profile page:', error);
        }
    });
});