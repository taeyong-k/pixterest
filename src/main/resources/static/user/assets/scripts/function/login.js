const $loginForm = document.getElementById('loginForm');

// 쿼리 파라미터 확인
const urlParams = new URLSearchParams(window.location.search);
const isRegister = urlParams.get('register');

if (isRegister === 'true') {
    // 로그인 폼 숨기고
    $loginForm.classList.remove('-visible');
    // 가입 폼 보여주기
    $registerForm.classList.add('-visible');
}

[$loginForm, $loginModalForm].forEach(($form) =>
{
    if (!$form) return;

    const $emailInput = $form['email'];
    const $passwordInput = $form['password'];
    const $emailLabel = $form.querySelector('.obj-label input[name="email"]')?.parentElement;
    const $passwordLabel = $form.querySelector('.obj-label input[name="password"]')?.parentElement;


    $emailInput.addEventListener('focusout', () =>
        validateEmail($emailInput, $emailLabel)
    );

    $passwordInput.addEventListener('focusout', () =>
        validatePassword($passwordInput, $passwordLabel)
    );


    $form.onsubmit = (e) =>
    {
        e.preventDefault();

        [$emailLabel, $passwordLabel].forEach(($label) =>
        {
            $label.classList.remove('-invalid');
        });
        if (!validateEmail($emailInput, $emailLabel))
        {
            $emailInput.focus();
            return;
        }
        if (!validatePassword($passwordInput, $passwordLabel))
        {
            $passwordInput.focus();
            return;
        }


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
                toastAlter('요청 실패', '잠시 후 다시 시도해 주세요.')
                return;
            }
            const response = JSON.parse(xhr.responseText);
            switch (response['result'])
            {
                case 'failure_suspended':
                    toastAlter('계정 정지', '정지된 계정의 로그인 요청입니다\n 자세한 사항은 관리자에게 문의 주세요.')
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

const $gotoRegister = $loginForm.querySelector(':scope > .register > .link > .caption')

$gotoRegister.addEventListener('click', () =>
{
    $loginForm.classList.remove('-visible');
    $registerForm.classList.add('-visible')
})