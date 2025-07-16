const $loginForm = document.getElementById('loginForm');

[$loginForm, $loginModalForm].forEach(($form) =>
{
    if (!$form) return;

    const $emailInput = $form['email'];
    const $passwordInput = $form['password'];
    const $emailLabel = $form.querySelector('.obj-label input[name="email"]')?.parentElement;
    const $passwordLabel = $form.querySelector('.obj-label input[name="password"]')?.parentElement;
    const $emailWarning = $emailLabel?.querySelector('.-warning');
    const $passwordWarning = $passwordLabel?.querySelector('.-warning');

    $form.onsubmit = (e) =>
    {
        e.preventDefault();

        [$emailLabel, $passwordLabel].forEach(($label) =>
        {
            $label.classList.remove('-invalid');
        });
        if ($emailInput.value === '')
        {
            $emailInput.focus();
            $emailLabel.classList.add('-invalid');
            $emailWarning.innerText = '빠뜨린 부분이 있네요! 이메일 추가하는 것을 잊지 마세요.';
            return;
        }

        if (!emailRegex.test($emailInput.value))
        {
            $emailLabel.classList.add('-invalid');
            $emailInput.focus();
            $emailWarning.innerText = '음... 올바른 이메일 주소가 아닙니다.';
            return;
        }

        if ($passwordInput.value === '')
        {
            console.log($passwordLabel)
            $passwordLabel.classList.add('-invalid');
            $passwordInput.focus();
            $passwordWarning.innerText = '올바르지 않은 비밀번호를 입력했습니다. 다시 시도하거나 비밀번호 재설정하세요.';
            return;
        }

        if (!passwordRegex.test($passwordInput.value))
        {
            $passwordLabel.classList.add('-invalid');
            $passwordInput.focus();
            $passwordWarning.innerText = '올바르지 않은 비밀번호를 입력했습니다. 다시 시도하거나 비밀번호 재설정하세요.';
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
                alert('요청 실패. 잠시 후 다시 시도해주세요.');
                return;
            }
            const response = JSON.parse(xhr.responseText);
            switch (response['result'])
            {
                case 'failure_suspended':
                    alert('정지된 계정의 로그인 요청입니다 자세한 사항은 관리자에게 문의 주세요.');
                    return;
                case 'success':
                    alert('로그인 성공! 메인으로 이동합니다.');
                    location.href = `${origin}/`;
                    return;
                default:
                    alert('이메일 혹은 비밀번호가 올바르지 않습니다. 다시 한번 확인해 주세요.');
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
