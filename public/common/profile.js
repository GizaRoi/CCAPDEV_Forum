document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('edit-profile-modal').addEventListener('click', async () => {
        try {
            const response = await fetch('/editprofile');
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