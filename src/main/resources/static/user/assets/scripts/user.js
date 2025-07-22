const $header = document.getElementById('header');
const $dialog = document.getElementById('dialog');
const emailRegex = /^[\w.\-]{4,}@[\w\-]+\.[\w.]{2,}$/;
const passwordRegex =/^[\w`~!@#$%^&*()\-=+[\]{}|;:'",.<>/?]{8,50}$/;
const $loginButton = $header.querySelector('button[name="login"]');
const $registerButton = $header.querySelector('button[name="register"]');
const $cancelButtons = $dialog.querySelectorAll('.cancel');
const $registerModalForm = document.getElementById('registerModalForm');
const $loginModalForm = document.getElementById('loginModalForm');



$loginButton.addEventListener('click', () =>
{
    $dialog.classList.add('-visible');
    $loginModalForm.classList.add('-visible');
});

$registerButton.addEventListener('click', () =>
{
    $dialog.classList.add('-visible');
    $registerModalForm.classList.add('-visible');
});

$cancelButtons.forEach(($btn) =>
    $btn.addEventListener('click', () => {
        $dialog.classList.remove('-visible');
        $registerModalForm.classList.remove('-visible');
        $loginModalForm.classList.remove('-visible');
    })
);

function findParentByClass(element, className) {
    let current = element.parentElement;
    while (current) {
        if (current.classList.contains(className)) {
            return current;
        }
        current = current.parentElement;
    }
    return null;
}

function validateEmail($emailInput, $emailLabel) {
    const $fieldWrapper = findParentByClass($emailLabel, 'field-wrapper');
    const $warning = $fieldWrapper.querySelector('.-warning');
    const $warningCaption = $warning.querySelector('.caption');

    // 초기화
    $emailLabel.classList.remove('-invalid');
    $warning.classList.remove('-visible');

    if ($emailInput.value === '') {
        $emailLabel.classList.add('-invalid');
        $warningCaption.innerText = '빠뜨린 부분이 있네요! 이메일 추가하는 것을 잊지 마세요.';
        $warning.classList.add('-visible');
        return false;
    }

    if (!emailRegex.test($emailInput.value)) {
        $emailLabel.classList.add('-invalid');
        $warningCaption.innerText = '음... 올바른 이메일 주소가 아닙니다.';
        $warning.classList.add('-visible');
        return false;
    }

    return true;
}

function validatePassword($passwordInput, $passwordLabel) {
    const $fieldWrapper = findParentByClass($passwordLabel, 'field-wrapper');
    const $passwordWarning = $fieldWrapper.querySelector('.-warning');
    const $warningCaption = $passwordWarning.querySelector('.caption');

    // 초기화
    $passwordLabel.classList.remove('-invalid');
    $passwordWarning.classList.remove('-visible');

    if ($passwordInput.value === '') {
        $passwordLabel.classList.add('-invalid');
        $warningCaption.innerText = '비밀번호가 너무 짧네요! 6자 이상 입력하세요.';
        $passwordWarning.classList.add('-visible');
        return false;
    }
    if (!passwordRegex.test($passwordInput.value)) {
        $passwordLabel.classList.add('-invalid');
        $warningCaption.innerText = '음... 올바른 비밀번호가 아닙니다.';
        $passwordWarning.classList.add('-visible');
        return false;
    }
    return true;
}

function validateBirth($birthInput, $birthLabel) {
    const $fieldWrapper = findParentByClass($birthLabel, 'field-wrapper');
    const $birthWarning = $fieldWrapper.querySelector('.-warning');
    const $warningCaption = $birthWarning.querySelector('.caption');

    // 초기화
    $birthLabel.classList.remove('-invalid');
    $birthWarning.classList.remove('-visible');

    if ($birthInput.value === '') {
        $birthLabel.classList.add('-invalid');
        $warningCaption.innerText = '올바르지 않은 생년월일을 입력했습니다. 다시 시도해주세요.';
        $birthWarning.classList.add('-visible');
        return false;
    }
    return true;
}
