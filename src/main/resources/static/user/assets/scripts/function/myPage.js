const $items = document.querySelectorAll('.menu .item');
const $profileForms = document.querySelectorAll('.form-container > form');
const $main = document.getElementById('main')
const $edit = document.getElementById('edit-page');
const $buttons = $edit.querySelectorAll(':scope > .button-container > button');
const $deleteButtons = $edit.querySelectorAll('.account-delete button');
const $modifyForm = document.getElementById('modifyForm');
const $accountForm = document.getElementById('accountForm');
const $accountEmail = $accountForm.querySelector(':scope > .field-wrapper > .field > .obj-label > input[name="email"]')
let initialFormData = {}; // ✅ 초기 데이터 저장

// 프로필 정보 세팅
function setProfileValues(userInfo) {
    const profile = document.getElementById('profile');
    const image = profile.querySelector('.image-wrapper .profile-circle');
    const name = profile.querySelector('.nickname-wrapper .caption');
    const site = profile.querySelector('.info-wrapper .link .caption');
    const introduce = profile.querySelector('.info-wrapper .introduce .caption');
    const idCaption = profile.querySelector('.id-wrapper .logo .caption');

    name.innerText = userInfo.name.trim();
    site.innerText = userInfo.site || '';
    introduce.innerText = userInfo.introduce || '';
    idCaption.innerText = userInfo.nickname || userInfo.nickname || '';

    const infoWrapper = profile.querySelector('.info-wrapper');
    if (userInfo.site || userInfo.introduce) {
        infoWrapper.classList.add('-visible');
    } else {
        infoWrapper.classList.remove('-visible');
    }

    if (image && userInfo.profileColor && userInfo.email) {
        image.style.backgroundColor = userInfo.profileColor;
        image.textContent = userInfo.email.split('@')[0].toUpperCase();
    }
}

// 보드 자세히 보기
const $boardImages = $main.querySelectorAll(':scope > .content > .space > .boards > .board > .image')
$boardImages.forEach(($image) => {
    $image.addEventListener('click', (e) => {
        if (e.target.closest('.board-button')) return;
        const boardId = $image.dataset.boardId;

        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) return;
            if (xhr.status < 200 || xhr.status >= 300) return;

            window.location.href = `/board?boardId=${boardId}`;

        };
        xhr.open('GET', `/board?boardId=${boardId}`);
        xhr.send();
    });
});

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

// 수정 페이지 표시
function showEditPage($formId, userInfo) {
    document.getElementById('main-page').classList.remove('-visible');
    $edit.classList.add('-visible');

    // 메뉴 active 처리
    $items.forEach(i => i.classList.remove('active'));
    const activeItem = Array.from($items).find(item => item.dataset.path === $formId);
    if (activeItem) activeItem.classList.add('active');

    activateForm($formId, userInfo);
}

// 활성화된 폼 정보
function activateForm($formId, userInfo) {
    $profileForms.forEach($form => $form.classList.remove('-visible'));
    const targetForm = document.getElementById($formId);
    if (targetForm) {
        targetForm.classList.add('-visible');
        setFormValues($formId, userInfo);
        saveInitialFormData(targetForm); // 초기 데이터 저장
        updateButtonState();             // 버튼 상태 초기화
    }
}

// 폼 기초 값 설정
function setFormValues($formId, data) {
    const $form = document.getElementById($formId);
    if (!$form) return;

    $form.querySelectorAll('[name]').forEach(input => {
        input.value = data[input.name] || '';
    });

}

// 폼 초기데이터 저장(입력시 버튼 동작 위한)
function saveInitialFormData($form) {
    initialFormData = {};
    $form.querySelectorAll('[name]').forEach(input => {
        initialFormData[input.name] = input.value;
    });
}

// 보이는 폼 되돌려주기
function getVisibleForm() {
    return $edit.querySelector('.form-container > form.-visible');
}

// 폼 변화 감지
function isFormChanged($form) {
    return Array.from($form.querySelectorAll('[name]'))
        .some(input => input.value !== initialFormData[input.name]);
}

// 버튼 활성/비활성 상태를 클래스 및 스타일로 조절하는 함수
function setButtonState(buttons, enabled) {
    buttons.forEach(button => {
        if (enabled) {
            button.classList.remove('disabled');
        } else {
            button.classList.add('disabled');
        }
    });
}

// 입력시 버튼 변화
function updateButtonState() {
    const changed = isFormChanged(getVisibleForm());
    setButtonState($buttons, changed);
    const $form = getVisibleForm();
    const valid = !$form.querySelector('.-invalid'); // invalid가 없으면 통과

    setButtonState($buttons, changed && valid);
}

// 유저 프로필 정보 가져오기
const xhr = new XMLHttpRequest();
xhr.onreadystatechange = () => {
    if (xhr.readyState !== XMLHttpRequest.DONE) {
        return;
    }
    if (xhr.status < 200 || xhr.status >= 300) {
        toastAlter('서버 오류', '서버 요청 중 문제가 발생했습니다.\n잠시 후 다시 시도해주세요.');
        return;
    }
    const response = JSON.parse(xhr.responseText)

    switch (response.result) {
        case 'failure_session_expired':
            toastAlter('정보 가져오기', '유저 정보가 일치하지 않거나 세션이 만료 되었습니다. 로그인으로 이동합니다.')
            window.location.href = '/user/login?loginCheck=expired'
            break;
        case 'success':
            const profile = document.getElementById('profile')
            const userInfo = response.userInfo;
            setProfileValues(userInfo)


            const editButton = profile.querySelector('.button-container > button[name = "edit"]');
            editButton.addEventListener('click', () => {
                showEditPage('modifyForm', userInfo);
            })

            $items.forEach(item => {
                item.addEventListener('click', () => {
                    showEditPage(item.dataset.path, userInfo);
                });
            });
            break;
        default:
            toastAlter('정보 가져오기에 실패하였습니다.', '일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
            break;
    }
};
xhr.open('GET', '/user/info');
xhr.send();

// 보드 수정시 보드 수정 모달 창 띄우기
const boardEditButtons = $main.querySelectorAll('.board-button');
boardEditButtons.forEach(button => {
    button.addEventListener('click', () => {
        // 보드 수정 모달 열기
        modifyBoards()
    });
});


function setupModifyFormValidation() {
    if (!$modifyForm) return;
    // --- 이름 ---
    const $nameInput = $modifyForm.querySelector('[name="name"]');
    const $nameLabel = $modifyForm.querySelector('.obj-label input[name="name"]')?.parentElement;
    setupValidation({
        $input: $nameInput,
        $label: $nameLabel,
        maxLength: 20,
        regexValidator: /^[가-힣a-zA-Z0-9]{2,20}$/, // 한글, 영문, 숫자 허용
        invalidMessage: '이름은 한글/영문 2~20자여야 합니다.',
        MinMessage: '이름은 최소 2자 이상이어야 합니다.',
        MaxMessage: '이름은 최대 20자까지 입력 가능합니다.'
    });

    // --- 소개 ---
    const $introduce = $modifyForm.querySelector('[name="introduce"]');
    const $introduceLabel = $modifyForm.querySelector('.obj-label input[name="introduce"]')?.parentElement;
    setupValidation({
        $input: $introduce,
        $label: $introduceLabel,
        maxLength: 100,
        regexValidator: /^.{0,100}$/,
        invalidMessage: '소개는 최대 100자까지 입력 가능합니다.',
        MinMessage: '',
        MaxMessage: '소개는 최대 100자까지 입력 가능합니다.'
    });

    // --- 웹사이트 ---
    const $site = $modifyForm.querySelector('[name="site"]');
    const $siteLabel = $modifyForm.querySelector('.obj-label input[name="site"]')?.parentElement;
    setupValidation({
        $input: $site,
        $label: $siteLabel,
        maxLength: 100,
        regexValidator: /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-]*)*\/?$/,
        invalidMessage: '올바른 웹사이트 주소를 입력해주세요.',
        MinMessage: '',
        MaxMessage: '웹사이트 주소가 너무 깁니다.'
    });

    // --- 사용자 이름 ---
    const $nickname = $modifyForm.querySelector('[name="nickname"]');
    const $nicknameLabel = $modifyForm.querySelector('.obj-label input[name="nickname"]')?.parentElement;
    setupValidation({
        $input: $nickname,
        $label: $nicknameLabel,
        maxLength: 15,
        regexValidator: /^[가-힣a-zA-Z0-9]{3,15}$/, // 한글, 영문, 숫자 허용
        invalidMessage: '사용자 이름은 영문+숫자 3~15자여야 합니다.',
        MinMessage: '사용자 이름은 최소 3자 이상이어야 합니다.',
        MaxMessage: '사용자 이름은 최대 15자까지 입력 가능합니다.'
    });

    // --- 버튼 상태 업데이트 연결 ---
    $modifyForm.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', updateButtonState);
        input.addEventListener('blur', updateButtonState);
    });
}

// --- 초기화 실행 ---
setupModifyFormValidation();

// 입력 변경 감지 → 버튼 상태 갱신
$edit.querySelector('.form-container').addEventListener('input', e => {
    const target = e.target;
    if (target.name === 'email' ||
        target.name === 'password' ||
        target.name === 'newPassword') {
        return;
    }

    updateButtonState();
});

const $changeButton = $accountForm.querySelector('button[name="change"]');
const $passwordInputs = $accountForm.querySelectorAll('input[name="password"], input[name="newPassword"]');

const toggleChangeButton = () => {
    const passwordFilled = $accountForm.querySelector('input[name="password"]').value.trim() !== '';
    const newPasswordFilled = $accountForm.querySelector('input[name="newPassword"]').value.trim() !== '';

    if (!passwordFilled || !newPasswordFilled) {
        $changeButton.classList.add('disabled');
    } else {
        $changeButton.classList.remove('disabled');
    }
};

// ✅ 입력 시 체크
$passwordInputs.forEach(input => {
    input.addEventListener('input', toggleChangeButton);
});

// ✅ 페이지 로드 직후에도 체크
toggleChangeButton();

$passwordInputs.forEach(input => {
    // label 찾기
    const $label = input.parentElement;

    // 실시간 유효성 검사
    setupValidation({
        $input: input,
        $label: $label,
        maxLength: 20,
        regexValidator: passwordRegex,
        invalidMessage: input.name === 'password'
            ? '비밀번호는 6~20자이며 특수문자를 포함할 수 있습니다.'
            : '새 비밀번호는 6~20자이며 특수문자를 포함할 수 있습니다.',
        MinMessage: '6자 이상 입력하세요.',
        MaxMessage: '20자까지 입력할 수 있어요.'
    });
});

// 비밀번호 변경
$changeButton.addEventListener('click', (e) => {
    e.preventDefault()
    const $passwordInput = $accountForm['password'];
    const $passwordLabel = $accountForm.querySelector('.obj-label input[name="password"]')?.parentElement;

    validateInput($passwordInput, $passwordLabel, passwordRegex, '올바르지 않은 비밀번호를 입력했습니다. 다시 시도하거나 비밀번호 재설정하세요.')

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('password', $accountForm.querySelector('input[name="password"]').value);
    formData.append('newPassword', $accountForm.querySelector('input[name="newPassword"]').value);

    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        if (xhr.status < 200 || xhr.status >= 300) {
            toastAlter('서버 오류', '서버 요청 중 문제가 발생했습니다.\n잠시 후 다시 시도해주세요.');
            return;
        }

        const response = JSON.parse(xhr.responseText);

        switch (response.result) {
            // ✅ 성공
            case 'success': // CommonResult.SUCCESS
                sessionStorage.setItem('password', 'true');
                $accountForm.querySelector('input[name="password"]').value = '';
                $accountForm.querySelector('input[name="newPassword"]').value = '';
                location.reload();
                break;

            // ✅ 세션 만료
            case 'failure_session_expired': // CommonResult.FAILURE_SESSION_EXPIRED
                window.location.href = '/user/login?loginCheck=expired'
                // location.href = `${origin}/user/login`;
                break;

            // 🔹 기존 비밀번호 관련 오류
            case 'current_password_invalid': // ChangePasswordFailure.CURRENT_PASSWORD_INVALID
                toast('기존 비밀번호가 유효하지 않습니다.', '현재 비밀번호 형식이 올바르지 않습니다.');
                break;
            case 'current_password_mismatch': // ChangePasswordFailure.CURRENT_PASSWORD_MISMATCH
                toast('비밀번호가 일치하지 않음', '현재 비밀번호가 일치하지 않습니다.');
                break;

            // 🔹 새 비밀번호 관련 오류
            case 'new_password_invalid': // ChangePasswordFailure.NEW_PASSWORD_INVALID
                toast('새 비밀번호가 유효하지 않습니다.', '새 비밀번호 형식이 올바르지 않습니다.');
                break;
            case 'password_same': // ChangePasswordFailure.PASSWORD_SAME
                toast('중복된 비밀번호', '기존 비밀번호와 새 비밀번호가 같습니다.');
                break;

            // 🔹 DB 관련 오류
            case 'user_not_found': // ChangePasswordFailure.USER_NOT_FOUND
                toast('사용자 찾기 불가', '사용자를 찾을 수 없습니다.');
                break;
            case 'update_failed': // ChangePasswordFailure.UPDATE_FAILED
                toast('처리 오류', '비밀번호 변경에 실패했습니다. 잠시 후 다시 시도해주세요.');
                break;

            // ✅ 예외 처리
            default:
                toastAlter('비밀번호 변경에 실패하였습니다.', '일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
                break;
        }
    };
    xhr.open('POST', '/user/password');
    xhr.send(formData);
});

// 삭제 및 비활성화 토스트
function getToastConfig(name) {
    if (name === 'deactivate') {
        return {
            url: '/user/deactivate',
            confirmText: '계정 비활성화',
            confirmMessage: '정말로 계정을 비활성화하시겠습니까?',
            successToast: {
                title: '알림',
                caption: '계정 비활성화가 완료되었습니다. 로그인창으로 이동합니다.',
                duration: 8100,
                showButton: true,
                buttonText: '로그인창으로 이동하기',
                onButtonClick: () => location.href = `${origin}/user/login`
            }
        };
    } else if (name === 'remove') {
        return {
            url: '/user/delete',
            confirmText: '계정 삭제',
            confirmMessage: '정말로 계정을 삭제하시겠습니까?',
            successToast: {
                title: '알림',
                caption: '계정 삭제가 완료되었습니다.',
                duration: 8100,
                showButton: true,
                buttonText: '확인',
                onButtonClick: () => location.href = `${origin}/user/login`
            }
        };
    }
    return null;
}

// 삭제 및 비활성화 버튼
$deleteButtons.forEach(($button) => {
    $button.addEventListener('click', () => {
        const config = getToastConfig($button.name);
        if (!config) {
            console.error('알 수 없는 버튼:', $button.name);
            return;
        }

        let isProcessing = false;

        showAlertToast({
            title: '경고',
            caption: config.confirmMessage,
            duration: 8100,
            showButton: true,
            buttonText: config.confirmText,
            onButtonClick: () => {
                if (isProcessing) return;
                isProcessing = true;

                const xhr = new XMLHttpRequest();
                const formData = new FormData();
                formData.append('email', $accountEmail.value);

                xhr.onreadystatechange = () => {
                    if (xhr.readyState !== XMLHttpRequest.DONE) return;

                    if (xhr.status < 200 || xhr.status >= 300) {
                        toastAlter('서버 오류', '서버 요청 중 문제가 발생했습니다.\n잠시 후 다시 시도해주세요.');
                        return;
                    }

                    const response = JSON.parse(xhr.responseText);
                    switch (response.result) {
                        case 'failure_session_expired':
                            window.location.href = '/user/login?loginCheck=expired'
                            break;

                        case 'failure_no_permission':
                            toast('권한 없음', '이 작업을 수행할 권한이 없습니다.');
                            break;

                        case 'failure_invalid_email':
                            toast('잘못된 이메일', '입력된 이메일 형식이 올바르지 않습니다.');
                            break;

                        case 'failure_user_not_found':
                            toast('사용자 없음', '해당 사용자를 찾을 수 없습니다.');
                            break;

                        case 'failure_user_already_deleted':
                            toast('이미 삭제된 계정', '이미 삭제된 사용자 계정입니다.');
                            break;

                        case 'failure_user_already_suspended':
                            toast('이미 정지된 계정', '이미 정지된 사용자 계정입니다.');
                            break;

                        case 'failure_db_update':
                            toast('DB 오류', '계정 처리 중 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
                            break;

                        case 'failure':
                            toast('실패', '알 수 없는 오류가 발생했습니다. 다시 시도해 주세요.');
                            break;

                        case 'success':
                            if ($button.name === 'deactivate') {
                                sessionStorage.setItem('showToastDeactivated', 'true');
                            } else if ($button.name === 'remove') {
                                sessionStorage.setItem('showToastDeleted', 'true');
                            }
                            location.href = `${origin}/user/login`;
                            break;

                        default:
                            toastAlter('계정 처리 실패', '일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
                    }
                };

                xhr.open('POST', config.url);
                xhr.send(formData);
            }
        });
    });
});

// 초기화 & 저장
$buttons.forEach(button => {
    switch (button.name) {
        case 'reset':
            button.addEventListener('click', () => {
                const $visibleForm = getVisibleForm();
                $visibleForm.querySelectorAll('[name]').forEach(input => {
                    input.value = initialFormData[input.name];
                });
                updateButtonState();
            });
            break;
        case 'save':
            button.addEventListener('click', () => {
                const $visibleForm = getVisibleForm();
                const formData = new FormData();

                $visibleForm.querySelectorAll('[name]').forEach(input => {
                    formData.append(input.name, input.value);
                });

                const xhr = new XMLHttpRequest();
                xhr.onreadystatechange = () => {
                    if (xhr.readyState !== XMLHttpRequest.DONE) return;

                    if (xhr.status < 200 || xhr.status >= 300) {
                        toastAlter('서버 오류', '서버 요청 중 문제가 발생했습니다.\n잠시 후 다시 시도해주세요.');
                        return;
                    }

                    const response = JSON.parse(xhr.responseText);

                    switch (response.result) {
                        case 'failure_session_expired': // CommonResult
                            window.location.href = '/user/login?loginCheck=expired'
                            break;

                        case 'success': // CommonResult
                            sessionStorage.setItem('showProfile', 'true');
                            saveInitialFormData($visibleForm);
                            updateButtonState();
                            location.reload();
                            break;

                        case 'invalid_name': // ProfileUpdateResult
                            toast('유효하지 않은 이름', '이름이 유효하지 않습니다. 한글/영문/숫자 2~20자로 입력해주세요.');
                            break;

                        case 'invalid_nickname': // ProfileUpdateResult
                            toast('유효하지 않은 사용자 이름', '사용자 이름이 유효하지 않습니다. 한글/영문/숫자 3~15자로 입력해주세요.');
                            break;

                        case 'invalid_site': // ProfileUpdateResult
                            toast('올바르지 않은 주소', '웹사이트 주소가 올바르지 않습니다.');
                            break;

                        case 'invalid_introduce': // ProfileUpdateResult
                            toast('유효하지 않은 소개', '소개는 최대 100자까지 입력 가능합니다.');
                            break;

                        case 'invalid_birth': // ProfileUpdateResult
                            toast('올바르지 않은 생년월일', '생일이 올바르지 않습니다. 1900년 이후, 오늘 이전 날짜여야 합니다.');
                            break;

                        case 'db_update_failed': // ProfileUpdateResult
                            toastAlter('db 업데이트 오류', '일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
                            break;

                        default:
                            toastAlter('저장에 실패하였습니다.', '일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
                            break;
                    }
                };
                xhr.open('POST', '/user/profile');
                xhr.send(formData);
            });
            break;
    }
});

window.addEventListener('load', () => {
    if (sessionStorage.getItem('showToast') === 'true') {
        toast('보드 삭제', '보드가 정상적으로 삭제되었습니다.');
        sessionStorage.removeItem('showToast');
    }
    if (sessionStorage.getItem('showProfile') === 'true') {
        toast('프로필 저장', '프로필 정보가 성공적으로 저장되었습니다.');
        sessionStorage.removeItem('showProfile');
    }

    if (sessionStorage.getItem('password') === 'true') {
        toast('비밀번호 변경 성공', '비밀번호가 성공적으로 변경되었습니다.');
        sessionStorage.removeItem('password');
    }
})