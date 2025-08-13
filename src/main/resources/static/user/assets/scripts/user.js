const $header = document.getElementById('header');
const $dialog = document.getElementById('dialog');
// ?=. 이부분 최대길이 최소길이 규제하는곳
const emailRegex = /^(?=.{6,30}$)[\w.\-]{4,}@[\w\-]+\.[\w.]{2,15}$/;
const passwordRegex =/^[\w`~!@#$%^&*()\-=+[\]{}|;:'",.<>/?]{6,20}$/;
const birthRegex = /^(19[0-9]{2}|20[0-2][0-9])-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
const $loginButton = $header.querySelector('button[name="login"]');
const $registerButton = $header.querySelector('button[name="register"]');
const $cancelButtons = $dialog.querySelectorAll('.cancel');
const $registerForm = document.getElementById('registerForm');
const $loginForm = document.getElementById('loginForm');
const $registerModalForm = document.getElementById('registerModalForm');
const $loginModalForm = document.getElementById('loginModalForm');
const $boardModalForm = document.getElementById('boardModalForm');

const $modals = $dialog.querySelectorAll('.-modal');
const $userForms = $dialog.querySelectorAll('form'); // 모든 form 선택

let isDraggingFromOutside = false;

// 쿼리 파라미터 확인
const urlParams = new URLSearchParams(window.location.search);
const isRegister = urlParams.get('register');

if (isRegister === 'true')
{
    // 로그인 폼 숨기고
    $loginForm.classList.remove('-visible');
    // 가입 폼 보여주기
    $registerForm.classList.add('-visible');
}

function closeModal()
{
    $dialog.classList.remove('-visible');
    $modals.forEach(modal => modal.classList.remove('-visible'));

    // ✨ 경고 메시지(-warning)도 초기화
    $userForms.forEach(form => {
        form.reset()
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
        if ($registerModalForm)
        {
            $registerModalForm.classList.remove('-visible');
        }
        if ($loginModalForm)
        {
            $loginModalForm.classList.remove('-visible');
        }
        if ($boardModalForm)
        {
            $boardModalForm.classList.remove('-visible');
        }
    })
);

function findParentByClass(element, className) {
    if (!element) { // element가 null/undefined면 바로 종료
        return null;
    }

    let current = element.parentElement;

    while (current) {
        if (current.classList.contains(className)) {
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
    if (!$fieldWrapper) return; // 부모 래퍼 없으면 그냥 종료

    const $warning = $fieldWrapper.querySelector('.-warning');

    $label.classList.remove('-invalid');
    if ($warning) {
        $warning.classList.remove('-visible');
    }
}


// 1. 개별 검사 함수 분리
function validateInput($input, $label, regexValidator, invalidMessage) {
    const value = $input.value.trim();

    if (value === '') {
        clearWarning($label);
        $label.classList.remove('-invalid');
        return true; // 빈 값은 통과(필요에 따라 조정)
    }
    if (!regexValidator.test(value)) {
        showWarning($label, invalidMessage);
        $label.classList.add('-invalid');
        return false;
    }

    clearWarning($label);
    $label.classList.remove('-invalid');
    return true;
}

// 2. setupValidation 함수는 이벤트용으로 그대로 유지 (내부에서 validateInput 호출)
function setupValidation({$input, $label, maxLength, regexValidator, invalidMessage, MinMessage, MaxMessage}) {
    $input.addEventListener('blur', () => {
        validateInput($input, $label, regexValidator, invalidMessage);
    });

    $input.addEventListener('input', () => {
        // input 이벤트 때는 길이만 검사해도 됨
        const value = $input.value.trim();
        if (value.length < 6)
        {
            showWarning($label, MinMessage)
        }
        if (value.length > maxLength) {
            showWarning($label, MaxMessage);
            $label.classList.add('-invalid');
        } else {
            clearWarning($label);
            $label.classList.remove('-invalid');
        }
    });
}


// 로그인 및 회원가입 창 변환 함수
function switchForm($fromForm, $toForm) {
    if (!$fromForm || !$toForm) return;

    // 1. 값 초기화
    if (typeof $fromForm.reset === 'function') {
        $fromForm.reset();
    }

    // 2. -invalid 제거
    $fromForm.querySelectorAll('.-invalid').forEach(el => {
        el.classList.remove('-invalid');
    });

    // 3. 경고 메시지 숨기기
    $fromForm.querySelectorAll('.-warning').forEach(el => {
        el.classList.remove('-visible');
    });

    // 4. 폼 전환
    $fromForm.classList.remove('-visible');
    $toForm.classList.add('-visible');
}