const $loading = document.getElementById('loading');

const $registerForm = document.getElementById('registerForm');



[$registerForm, $registerModalForm].forEach(($form) =>
{
    if (!$form) return;

    const $emailInput = $form['email'];
    const $passwordInput = $form['password'];
    const $birthInput = $form['birth'];
    const $emailLabel = $form.querySelector('.obj-label input[name="email"]')?.parentElement;
    const $passwordLabel = $form.querySelector('.obj-label input[name="password"]')?.parentElement;
    const $birthLabel = $form.querySelector('.obj-label input[name="birth"]')?.parentElement;
    const $emailWarning = $emailLabel?.querySelector('.-warning');
    const $passwordWarning = $passwordLabel?.querySelector('.-warning');
    const $birthWarning = $birthLabel?.querySelector('.-warning');

    $form.onsubmit = (e) =>
    {
        e.preventDefault();
        const $labels = [$emailLabel, $passwordLabel, $birthLabel];
        $labels.forEach(($label) => $label.classList.remove('-invalid'));
        if ($emailInput.value === '')
        {
            $emailLabel.classList.add('-invalid');
            $emailInput.focus()
            $emailWarning.innerText = '빠뜨린 부분이 있네요! 이메일 추가하는 것을 잊지 마세요.'
            return;
        }
        if (!emailRegex.test($emailInput.value))
        {
            $emailLabel.classList.add('-invalid');
            $emailInput.focus()
            $emailWarning.innerText ='음... 올바른 이메일 주소가 아닙니다.';
            return;
        }
        if ($passwordInput.value === '')
        {
            $passwordLabel.classList.add('-invalid');
            $passwordInput.focus()
            $passwordWarning.innerText ='비밀번호가 너무 짧네요! 6자 이상 입력하세요.';
            return;
        }
        if (!passwordRegex.test($passwordInput.value))
        {
            $passwordLabel.classList.add('-invalid');
            $passwordInput.focus()
            $passwordWarning.innerText ='음... 올바른 비밀번호가 아닙니다.';
            return;
        }
        if ($birthInput.value === '')
        {
            $birthLabel.classList.add('-invalid');
            $birthInput.focus();
            $birthWarning.innerText = '올바르지 않은 생년월일을 입력했습니다. 다시 시도하거나 비밀번호 재설정하세요.'
            return;
        }
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('email', $emailInput.value)
        formData.append('password', $passwordInput.value)
        formData.append('birth', $birthInput.value)
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE)
            {
                return;
            }
            $loading.classList.remove('-visible')
            if (xhr.status < 200 || xhr.status >= 300)
            {
                alert('요청이 잘못되었습니다. 잠시 후 다시 시도해 주세요.')
                return;
            }
            const response = JSON.parse(xhr.responseText)
            switch (response['result'])
            {
                case 'failure':
                    alert('잘못된 가입 요청입니다. 다시 한번 확인해 주세요.')
                    return;
                case 'failure_duplicate_email':
                    alert('이미 같은 이메일로 가입된 이메일이 있습니다. 다시 한번 확인해 주세요.')
                    break;
                case 'success':
                    alert('가입이 성공하였습니다. 로그인창으로 이동합니다.');
                    location.href =`${origin}/user/login`;
                    return;
                default:
                    alert('오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.')
                    return;
            }
        };
        xhr.open('POST','/user/register');
        xhr.send(formData);
        $loading.classList.add('-visible')
    }
})

const $gotoLogin = $registerForm.querySelector(':scope > .register > .link > .login')

$gotoLogin.addEventListener('click', () =>
{
    $registerForm.classList.remove('-visible');
    $loginForm.classList.add('-visible');
})