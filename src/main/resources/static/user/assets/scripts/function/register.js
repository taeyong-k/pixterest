const $loading = document.getElementById('loading');


$registerButton.addEventListener('click', () =>
{
    $dialog.classList.add('-visible');
    $registerModalForm.classList.add('-visible');
    $loginModalForm.classList.remove('-visible');
});

[$registerForm, $registerModalForm].forEach(($form) =>
{
    if (!$form) return;

    const $emailInput = $form['email'];
    const $passwordInput = $form['password'];
    const $birthInput = $form['birth'];
    const $emailLabel = $form.querySelector('.obj-label input[name="email"]')?.parentElement;
    const $passwordLabel = $form.querySelector('.obj-label input[name="password"]')?.parentElement;
    const $birthLabel = $form.querySelector('.obj-label input[name="birth"]')?.parentElement;

    setupValidation({
        $input: $emailInput,
        $label: $emailLabel,
        maxLength: 30,
        regexValidator: (value) =>
        {
            if (value.length < 6) {
                showWarning($emailLabel, '이메일이 너무 짧네요! 6자 이상 입력하세요.');
                return false;
            }
            return emailRegex.test(value)
        },
        invalidMessage: '이메일 형식이 올바르지 않습니다.',
        lengthMessage: '이메일은 최대 30자까지 입력할 수 있어요.'
    });

    setupValidation({
        $input: $passwordInput,
        $label: $passwordLabel,
        maxLength: 20,
        regexValidator: (value) =>
        {
            if (value.length < 6) {
                showWarning($passwordLabel, '비밀번호가 너무 짧네요! 6자 이상 입력하세요.');
                return false;
            }
            return passwordRegex.test(value)
        },
        invalidMessage: '비밀번호는 6~20자이며 특수문자를 포함할 수 있습니다.',
        lengthMessage: '비밀번호는 최대 20자까지 입력할 수 있어요.'
    });

    setupValidation({
        $input: $birthInput,
        $label: $birthLabel,
        maxLength: 10, // yyyy-mm-dd 형식
        regexValidator: (value) =>
        {
            return birthRegex.test(value)
        },
        invalidMessage: '올바르지 않은 생년월일을 입력했습니다. 다시 시도해주세요.',
        lengthMessage: '생년월일은 yyyy-mm-dd 형식으로 입력해야 해요.'
    });



    $form.onsubmit = (e) => {
        e.preventDefault();
        const $labels = [$emailLabel, $passwordLabel, $birthLabel];
        $labels.forEach(($label) => $label.classList.remove('-invalid'));

        validateInput($emailInput, $emailLabel, emailRegex, '음... 올바른 이메일 주소가 아닙니다.')

        validateInput($passwordInput, $passwordLabel, passwordRegex, '올바르지 않은 비밀번호를 입력했습니다. 다시 시도하거나 비밀번호 재설정하세요.')

        validateInput($birthInput, $birthLabel, birthRegex, '올바른 생년월일이 아닙니다.')

        //프로필 색상 항상 새로 랜덤 생성
        const profileColor = randomHexColor();


        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('email', $emailInput.value);
        formData.append('password', $passwordInput.value);
        formData.append('birth', $birthInput.value);
        formData.append('profileColor', profileColor);  // ★ 프로필 색상 같이 보내기 ★

        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            $loading.classList.remove('-visible');

            if (xhr.status < 200 || xhr.status >= 300) {
                toastAlter('서버 오류', '서버 요청 중 문제가 발생했습니다.\n잠시 후 다시 시도해주세요.');
                return;
            }

            const response = JSON.parse(xhr.responseText);
            switch (response['result']) {
                case 'failure':
                    toast('회원가입', '잘못된 가입 요청입니다. \n 다시 한번 확인해 주세요.');
                    return;
                case 'failure_duplicate_email':
                    toast('회원가입', '중복된 이메일입니다. \n 다른 이메일을 사용해 주세요.');
                    break;
                case 'success':
                    setProfile($emailInput.value, profileColor);
                    sessionStorage.setItem('showToastSignup', 'true');
                    location.reload();
                    return;
                default:
                    toastAlter('회원가입에 실패하였습니다.', '일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
                    return;
            }
        };

        xhr.open('POST', '/user/register');
        xhr.send(formData);
        $loading.classList.add('-visible');
    };

})

const $gotoLogin = $registerForm.querySelector(':scope > .register > .link > .login')

$gotoLogin.addEventListener('click', () =>
{
    switchForm($registerForm, $loginForm)
})

const $gotoLoginModal = $registerModalForm.querySelector(':scope > .register > .link > .login');
$gotoLoginModal.addEventListener('click', () => {
    switchForm($registerModalForm, $loginModalForm)
});

// 유저 프로필 이미지 생성
function randomHexColor() {
    return `#${Math.floor(Math.random() * 0xFFFFFF)
        .toString(16)
        .padStart(6, '0')
        .toUpperCase()}`;
}

// 이미지 색깔 저장
function setProfile(email, profileColor)
{
    const profile = document.getElementById('profile');
    if (!profile) return; // 프로필 요소 없으면 종료

    const profileCircle = profile.querySelector(':scope > .image-wrapper > .profile-circle');
    if (!profileCircle) return;

    profileCircle.style.backgroundColor = profileColor;       // 배경색 설정
}

window.addEventListener('load', () => {
    if (sessionStorage.getItem('showToastSignup') === 'true') {
        toast('가입 완료', '환영합니다! 로그인해서 시작해보세요.');
        sessionStorage.removeItem('showToastSignup');
    }
});

// 가입 폼에서 로그인 폼으로 전환할 때
$registerModalForm.querySelector('.register > .link').addEventListener('click', e =>
{
    e.preventDefault();

    // 가입폼 숨기고 로그인폼 보이기
    $registerModalForm.classList.remove('-visible');
    $loginModalForm.classList.add('-visible');

    // 여기서 폼 초기화 (입력값 및 경고문 초기화)
    $registerModalForm.reset();
    $registerModalForm.querySelectorAll('.-warning').forEach(w => w.classList.remove('-visible'));
    $registerModalForm.querySelectorAll('.obj-label').forEach(l => l.classList.remove('-invalid'));
});