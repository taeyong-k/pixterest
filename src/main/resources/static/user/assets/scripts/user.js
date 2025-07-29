const $header = document.getElementById('header');
const $dialog = document.getElementById('dialog');
// ?=. 이부분 최대길이 최소길이 규제하는곳
const emailRegex = /^(?=.{6,30}$)[\w.\-]{4,}@[\w\-]+\.[\w.]{2,15}$/;
const passwordRegex =/^[\w`~!@#$%^&*()\-=+[\]{}|;:'",.<>/?]{6,20}$/;
const birthRegex = /^(19[0-9]{2}|20[0-2][0-9])-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
const $loginButton = $header.querySelector('button[name="login"]');
const $registerButton = $header.querySelector('button[name="register"]');
const $cancelButtons = $dialog.querySelectorAll('.cancel');
const $registerModalForm = document.getElementById('registerModalForm');
const $loginModalForm = document.getElementById('loginModalForm');

const $modals = $dialog.querySelectorAll('.-modal');
const $userForms = $dialog.querySelectorAll('form'); // 모든 form 선택

let isDraggingFromOutside = false;

function closeModal() {
    $dialog.classList.remove('-visible');
    $modals.forEach(modal => modal.classList.remove('-visible'));

    // ✨ 모든 form 입력 초기화
    $userForms.forEach(form => form.reset());

    // ✨ 경고 메시지(-warning)도 초기화
    $userForms.forEach(form => {
        form.querySelectorAll('.-warning').forEach(warning => {
            warning.classList.remove('-visible');
        });
        form.querySelectorAll('.obj-label').forEach(label => {
            label.classList.remove('-invalid');
        });
    });
}

$dialog.addEventListener('mousedown', (e) => {
    if (![...$modals].some(modal => modal.contains(e.target))) {
        isDraggingFromOutside = true;
    }
});

$dialog.addEventListener('mouseup', (e) => {
    const isMouseUpInsideModal = [...$modals].some(modal => modal.contains(e.target));
    if (isDraggingFromOutside && !isMouseUpInsideModal) {
        closeModal();
    }
    isDraggingFromOutside = false;
});

// cancel 버튼 클릭 시도 같이 처리
$cancelButtons.forEach(($btn) =>
    $btn.addEventListener('click', () =>
    {
        closeModal();
        $dialog.classList.remove('-visible');
        $registerModalForm.classList.remove('-visible');
        $loginModalForm.classList.remove('-visible');
        $boardModalForm.classList.remove('-visible');
    })
);



function findParentByClass(element, className)
{
    let current = element.parentElement;
    while (current) {
        if (current.classList.contains(className))
        {
            return current;
        }
        current = current.parentElement;
    }
    return null;
}

function showWarning($label, message) {
    const $fieldWrapper = findParentByClass($label, 'field-wrapper');
    const $warning = $fieldWrapper.querySelector('.-warning');
    const $warningCaption = $warning.querySelector('.caption');

    $label.classList.add('-invalid');
    $warningCaption.innerText = message;
    $warning.classList.add('-visible');
}

function clearWarning($label) {
    const $fieldWrapper = findParentByClass($label, 'field-wrapper');
    const $warning = $fieldWrapper.querySelector('.-warning');

    $label.classList.remove('-invalid');
    $warning.classList.remove('-visible');
}

function validateEmail($emailInput, $emailLabel) {
    clearWarning($emailLabel);

    if (!emailRegex.test($emailInput.value)) {
        if ($emailInput.value.length < 2) {
            showWarning($emailLabel, '빠뜨린 부분이 있네요! 이메일 추가하는 것을 잊지 마세요.');
        } else {
            showWarning($emailLabel, '음... 올바른 이메일 주소가 아닙니다.');
        }
        return false;
    }
    return true;
}

function validatePassword($passwordInput, $passwordLabel) {
    clearWarning($passwordLabel);

    if (!passwordRegex.test($passwordInput.value)) {
        if ($passwordInput.value.length < 6) {
            showWarning($passwordLabel, '비밀번호가 너무 짧네요! 6자 이상 입력하세요.');
        } else {
            showWarning($passwordLabel, '음... 올바른 비밀번호가 아닙니다.');
        }
        return false;
    }
    return true;
}

function validateBirth($birthInput, $birthLabel) {
    clearWarning($birthLabel);

    if (!birthRegex.test($birthInput.value)) {
        showWarning($birthLabel, '올바르지 않은 생년월일을 입력했습니다. 다시 시도해주세요.');
        return false;
    }
    return true;
}
