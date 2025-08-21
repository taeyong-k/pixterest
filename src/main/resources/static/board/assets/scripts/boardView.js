// 뒤로가기 버튼
const backButton = document.querySelector('.backButton');
if (backButton) {
    backButton.addEventListener('click', () => {
        history.back();
    });
}

// 핀의 수정버튼 근처인지 확인 여부
function isInsideEditButton(target) {
    while (target && target !== document) {
        if (target.classList && target.classList.contains("pin-button")) {
            return true;
        }
        target = target.parentNode;
    }
    return false;
}

const pins = document.querySelectorAll(".pin");

pins.forEach((pin) => {
    pin.addEventListener("click", (event) => {
        if (isInsideEditButton(event.target)) return;

        const pinId = pin.dataset.pinId;
        console.log(pinId)
        if (!pinId) return;

        location.href = `${origin}/pin/?id=${pinId}`;
    });
});