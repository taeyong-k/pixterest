import MasonryInit from '../../../assets/scripts/libraries/masonry.js';

document.addEventListener('DOMContentLoaded', () => {
    MasonryInit();

    const $saveButton = document.querySelector('.overlay .save-button');

    $saveButton.addEventListener('click', () => {
        $saveButton.classList.add('active');
        $saveButton.textContent = "저장됨";
    });
});
