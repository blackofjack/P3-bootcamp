document.addEventListener('DOMContentLoaded', () => {

    const aiBtn = document.getElementById('aiBtn');
    const aiSection = document.getElementById('aiSection');

    aiBtn.addEventListener('click', () => {

        if (aiSection.style.display === 'none') {
            aiSection.style.display = 'block';
        } else {
            aiSection.style.display = 'none';
        }

    });

});