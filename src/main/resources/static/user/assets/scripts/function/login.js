$loginButton.addEventListener('click', () =>
{
    $dialog.classList.add('-visible');
    $loginModalForm.classList.add('-visible');
    $registerModalForm.classList.remove('-visible');
});


const label = document.querySelector('.obj-label');
const dateInput = document.querySelector('input[name="birth"]');

label.addEventListener('click', () => {
    if (dateInput.showPicker) {
        dateInput.showPicker(); // 최신 브라우저에서 달력 띄움
    } else {
        dateInput.focus(); // fallback: 일부 브라우저는 focus로도 달력 뜸
    }
});


// 폼제출 및 검사
[$loginForm, $loginModalForm].forEach(($form) =>
{
    if (!$form) return;

    const $emailInput = $form['email'];
    const $passwordInput = $form['password'];
    const $emailLabel = $form.querySelector('.obj-label input[name="email"]')?.parentElement;
    const $passwordLabel = $form.querySelector('.obj-label input[name="password"]')?.parentElement;


    setupValidation({
        $input: $emailInput,
        $label: $emailLabel,
        maxLength: 30,
        regexValidator: emailRegex,
        invalidMessage: '음... 올바른 이메일 주소가 아닙니다.',
        MinMessage: '이메일이 너무 짧네요! 6자 이상 입력하세요.',
        MaxMessage: '이메일은 최대 30자까지 입력할 수 있어요.'
    });

    setupValidation({
        $input: $passwordInput,
        $label: $passwordLabel,
        maxLength: 20,
        regexValidator: passwordRegex,
        invalidMessage: '비밀번호는 6~20자이며 특수문자를 포함할 수 있습니다.',
        MinMessage: '비밀번호가 너무 짧네요! 6자 이상 입력하세요.',
        MaxMessage: '비밀번호는 최대 20자까지 입력할 수 있어요.'
    });

    $form.onsubmit = (e) =>
    {
        e.preventDefault();

        [$emailLabel, $passwordLabel].forEach(($label) =>
        {
            $label.classList.remove('-invalid');
        });
        validateInput($emailInput, $emailLabel, emailRegex, '음... 올바른 이메일 주소가 아닙니다.')

        validateInput($passwordInput, $passwordLabel, passwordRegex, '올바르지 않은 비밀번호를 입력했습니다. 다시 시도하거나 비밀번호 재설정하세요.')

        const formData = new FormData();
        formData.append('email', $emailInput.value);
        formData.append('password', $passwordInput.value);

        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () =>
        {
            if (xhr.readyState !== XMLHttpRequest.DONE)

                return;
            $loading.classList.remove('-visible')
            if (xhr.status < 200 || xhr.status >= 300)
            {
                toastAlter('서버 오류', '서버 요청 중 문제가 발생했습니다.\n잠시 후 다시 시도해주세요.');
                return;
            }
            const response = JSON.parse(xhr.responseText);
            switch (response['result'])
            {
                case 'failure_suspended':
                    toast('계정 정지', '정지된 계정의 로그인 요청입니다\n 자세한 사항은 관리자에게 문의 주세요.')
                    return;
                case 'success':
                    location.href = `${origin}/`
                    return;
                default:
                    toastAlter('로그인에 실패하였습니다.', '일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
                    return;
            }
        };
        xhr.open('POST', '/user/login');
        xhr.send(formData);
        $loading.classList.add('-visible')
    };
});


// 탐색 누르면 홈으로 이동
$header.querySelector(':scope > .search').addEventListener('click', () => location.href = `${origin}/`)


// 로그인창에서 회원가입 창으로 너어가는 함수
const $gotoRegister = $loginForm.querySelector(':scope > .register > .link > .caption');
$gotoRegister.addEventListener('click', () => {
    switchForm($loginForm, $registerForm)
});


// 로그인 모달창에서 회원가입 모달창으로 너어가는 로직
const $gotoRegisterModal = $loginModalForm.querySelector(':scope > .register > .link > .caption');
$gotoRegisterModal.addEventListener('click', () => {
    switchForm($loginModalForm, $registerModalForm)
});

// 로딩시 토스트 띄우는 로직
window.addEventListener('load', () => {
    if (sessionStorage.getItem('showToast') === 'true') {
        toast('로그아웃 성공', '안전하게 로그아웃되었습니다.');
        sessionStorage.removeItem('showToast');
    }
    if (sessionStorage.getItem('showToastDeactivated') === 'true') {
        toast('계정이 비활성화되었습니다.', '원하실 때 언제든 다시 로그인하실 수 있습니다.');
        sessionStorage.removeItem('showToastDeactivated');
    }
    if (sessionStorage.getItem('showToastDeleted') === 'true') {
        toast('계정이 삭제되었습니다.', '그동안 서비스를 이용해주셔서 감사합니다.');
        sessionStorage.removeItem('showToastDeleted');
    }
});

// 로그인 폼에서 가입 폼으로 전환할 때
$loginModalForm.querySelector('.register > .link').addEventListener('click', e =>
{
    e.preventDefault();

    // 로그인폼 숨기고 가입폼 보이기
    $loginModalForm.classList.remove('-visible');
    $registerModalForm.classList.add('-visible');

    // 폼 초기화
    $loginModalForm.reset();
    $loginModalForm.querySelectorAll('.-warning').forEach(w => w.classList.remove('-visible'));
    $loginModalForm.querySelectorAll('.obj-label').forEach(l => l.classList.remove('-invalid'));
});
