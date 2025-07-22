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

    $emailInput.addEventListener('focusout', () =>
        validateEmail($emailInput, $emailLabel)
    );

    $passwordInput.addEventListener('focusout', () =>
        validatePassword($passwordInput, $passwordLabel)
    );

    $birthInput.addEventListener('focusout', () =>
        validateBirth($birthInput, $birthLabel)
    );


    $form.onsubmit = (e) => {
        e.preventDefault();
        const $labels = [$emailLabel, $passwordLabel, $birthLabel];
        $labels.forEach(($label) => $label.classList.remove('-invalid'));

        if (!validateEmail($emailInput, $emailLabel)) {
            $emailInput.focus();
            return;
        }
        if (!validatePassword($passwordInput, $passwordLabel)) {
            $passwordInput.focus();
            return;
        }
        if (!validateBirth($birthInput, $birthLabel)) {
            $birthInput.focus();
            return;
        }

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
                toastAlter('경고', '요청이 잘못되었습니다. 잠시 후 다시 시도해 주세요.');
                return;
            }

            const response = JSON.parse(xhr.responseText);
            switch (response['result']) {
                case 'failure':
                    toastAlter('경고', '잘못된 가입 요청입니다. \n 다시 한번 확인해 주세요.');
                    return;
                case 'failure_duplicate_email':
                    toastAlter('경고', '중복된 이메일입니다. \n 다른 이메일을 사용해 주세요.');
                    break;
                case 'success':
                    setProfile($emailInput.value, profileColor);
                    showToast({
                        title: '가입이 완료되었습니다.',
                        caption: '로그인 창으로 이동합니다.',
                        duration: 8100,
                        buttonText: '로그인 창으로 이동',
                        onButtonClick: () => {
                            window.location.href = '/user/login';  // 이동 페이지 조정 가능
                        }
                    });
                    return;
                default:
                    toastAlter('로그인에 성공하지 못했습니다', '일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
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
    $registerForm.classList.remove('-visible');
    $loginForm.classList.add('-visible');
})

// 유저 프로필 이미지 생성
function randomHexColor() {
    return `#${Math.floor(Math.random() * 0xFFFFFF)
        .toString(16)
        .padStart(6, '0')
        .toUpperCase()}`;
}

function setProfile(email, profileColor) {
    const profile = document.getElementById('profile');
    if (!profile) return; // 프로필 요소 없으면 종료

    const profileCircle = profile.querySelector(':scope > .image-wrapper > .profile-circle');
    if (!profileCircle) return;

    profileCircle.style.backgroundColor = profileColor;       // 배경색 설정
}