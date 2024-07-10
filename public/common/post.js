document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('editdelete').addEventListener('click', async () => {
        try {
            const response = await fetch('/editcomment');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error fetching another page:', error);
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('editdelete').addEventListener('click', async () => {
        try {
            const response = await fetch('/editpost');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error fetching another page:', error);
        }
    });
});
