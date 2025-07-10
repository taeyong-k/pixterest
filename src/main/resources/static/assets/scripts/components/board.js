const $pinName = document.querySelector('.pin-label-name');
const $pinNameLabel = $pinName.querySelector(':scope > .pin-label-wrapper > .pin-label');
const $pinNameInput = $pinNameLabel.querySelector(':scope > .input');

const NameRegex = /^.{1,50}$/;

// warning: 50자 이하
$pinNameInput.addEventListener('input', () => {
    if ($pinNameInput.value.trim() !== '' && !NameRegex.test($pinNameInput.value)) {
        $pinNameLabel.classList.add('-invalid');
    } else {
        $pinNameLabel.classList.remove('-invalid');
    }
});

// warning: 보드 이름 입력
$pinNameInput.addEventListener('blur', () => {
    if ($pinNameInput.value.trim() === '') {
        $pinNameLabel.classList.add('-invalid');
    } else if (NameRegex.test($pinNameInput.value)) {
        $pinNameLabel.classList.remove('-invalid');
    }
});














