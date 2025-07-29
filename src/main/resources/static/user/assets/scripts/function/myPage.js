const $items = document.querySelectorAll('.menu .item');
const $profileForms = document.querySelectorAll('.form-container > form');
const $main = document.getElementById('main')
const $edit = document.getElementById('edit-page');
const $buttons = $edit.querySelectorAll(':scope > .button-container > button');
const $deleteButtons = $edit.querySelectorAll('.account-delete button');
const $accountForm = document.getElementById('accountForm');
const $accountEmail = $accountForm.querySelector(':scope > .field-wrapper > .field > .obj-label > input[name="email"]');
let initialFormData = {}; // ✅ 초기 데이터 저장

// 프로필 정보 세팅
function setProfileValues(userInfo)
{
    const profile = document.getElementById('profile');
    const image = profile.querySelector('.image-wrapper .profile-circle');
    const nickname = profile.querySelector('.nickname-wrapper .caption');
    const site = profile.querySelector('.info-wrapper .link .caption');
    const introduce = profile.querySelector('.info-wrapper .introduce .caption');
    const idCaption = profile.querySelector('.id-wrapper .logo .caption');

    nickname.innerText = userInfo.nickname.trim();
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

// 핀의 수정버튼 근처인지 확인 여부
function isInsideEditButton(target) {
    while (target && target !== document) {
        if (target.classList && target.classList.contains("edit-button")) {
            return true;
        }
        target = target.parentNode;
    }
    return false;
}

//아래 부분 추가
const pins = document.querySelectorAll(".pin");

pins.forEach((pin) => {
    pin.addEventListener("click", (event) => {
        if (isInsideEditButton(event.target)) return;

        const pinId = pin.dataset.pinId;
        if (!pinId) return;

        location.href = `${origin}/pin/?id=${pinId}`;
    });
});

// 수정 페이지 표시
    function showEditPage($formId, userInfo)
    {
        document.getElementById('main-page').classList.remove('-visible');
        $edit.classList.add('-visible');

        // 메뉴 active 처리
        $items.forEach(i => i.classList.remove('active'));
        const activeItem = Array.from($items).find(item => item.dataset.path === $formId);
        if (activeItem) activeItem.classList.add('active');

        activateForm($formId, userInfo);
    }

// 활성화된 폼 정보
function activateForm($formId, userInfo)
{
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
function setFormValues($formId, data)
{
    const $form = document.getElementById($formId);
    if (!$form) return;

    $form.querySelectorAll('[name]').forEach(input => {
        input.value = data[input.name] || '';
    });

}

// 폼 초기데이터 저장(입력시 버튼 동작 위한)
function saveInitialFormData($form)
{
    initialFormData = {};
    $form.querySelectorAll('[name]').forEach(input => {
        initialFormData[input.name] = input.value;
    });
}

// 보이는 폼 되돌려주기
function getVisibleForm()
{
    return $edit.querySelector('.form-container > form.-visible');
}

// 폼 변화 감지
function isFormChanged($form)
{
    return Array.from($form.querySelectorAll('[name]'))
        .some(input => input.value !== initialFormData[input.name]);
}

// 입력시 버튼 변화
function updateButtonState()
{
    const changed = isFormChanged(getVisibleForm());
    $buttons.forEach(button => {
        button.disabled = !changed;
    });
}

// 유저 프로필 정보 가져오기
const xhr = new XMLHttpRequest();
xhr.onreadystatechange = () =>
{
    if (xhr.readyState !== XMLHttpRequest.DONE) {
        return;
    }
    if (xhr.status < 200 || xhr.status >= 300) {
        alert('요청이 잘못 되었습니다. 잠시 후 다시 시도해 주세요.');
        return;
    }
    const response = JSON.parse(xhr.responseText)

    switch (response.result) {
        case 'failure_session_expired':
            toastAlter('정보 가져오기', '유저 정보가 일치하지 않거나 세션이 만료 되었습니다. 로그인으로 이동합니다.')
            location.href = `${origin}/user/login`;
            break;
        case 'success':
            const profile = document.getElementById('profile')
            const userInfo = response.userInfo;
            setProfileValues(userInfo)



            const editButton = profile.querySelector('.button-container > button[name = "edit"]');
            editButton.addEventListener('click', () =>
            {
                showEditPage('modifyForm', userInfo);
            })

            $items.forEach(item => {
                item.addEventListener('click', () => {
                    showEditPage(item.dataset.path, userInfo);
                });
            });
            break;
        default:
            toastAlter('가져오기 실패', '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.')
            break;
    }
};
xhr.open('GET', '/user/info');
xhr.send();

$main.querySelectorAll(':scope > .content > .space > .boards > .board > .image > .edit-button')
    .forEach(button => {
        button.addEventListener('click', () => {
            modifyBoards();
        });
    });

$main.querySelectorAll(':scope > .content > .space > .pins > .pin > .edit-button')
    .forEach(button => {
        button.addEventListener('click', () => {
            modifyBoards();
        });
    });

// 입력 변경 감지 → 버튼 상태 갱신
$edit.querySelector('.form-container').addEventListener('input', e =>
{
    const target = e.target;
    if (target.name === 'email' ||
        target.name === 'password' ||
        target.name === 'newPassword')
    {
        return;
    }

    updateButtonState();
});

const $changeButton = $accountForm.querySelector('button[name="change"]');
const $passwordInputs = $accountForm.querySelectorAll('input[name="password"], input[name="newPassword"]');

// 비밀번호 입력시 버튼 활성화 시키기
$passwordInputs.forEach(input =>
{
    input.addEventListener('input', () => {
        const passwordFilled = $accountForm.querySelector('input[name="password"]').value.trim() !== '';
        const newPasswordFilled = $accountForm.querySelector('input[name="newPassword"]').value.trim() !== '';

        $changeButton.disabled = !(passwordFilled && newPasswordFilled);
    });
});

// 아래부분 추가
// 공통 함수: 토스트 설정 반환
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

// 버튼 이벤트 연결
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
                            toastAlter('요청 실패', '잠시 후 다시 시도해 주세요.');
                            return;
                        }

                        const response = JSON.parse(xhr.responseText);
                        switch (response.result) {
                            case 'failure_session_expired':
                                toast('계정 처리 실패', '유저 정보가 잘못 되었거나 세션이 만료되었습니다. 다시 시도해 주세요.');
                                break;
                            case 'failure':
                                toast('계정 처리 실패', '정보가 잘못되었습니다. 다시 확인해 주세요.');
                                break;
                            case 'success':
                                // 이 부분 수정 ⬇
                                if ($button.name === 'deactivate') {
                                    sessionStorage.setItem('showToastDeactivated', 'true');
                                } else if ($button.name === 'remove') {
                                    sessionStorage.setItem('showToastDeleted', 'true');
                                }
                                location.href = `${origin}/user/login`;
                                break;
                            default:
                                toast('계정 처리 실패', '오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
                        }
                    };

                    xhr.open('POST', config.url);
                    xhr.send(formData);
                }
            });
        });
    });


// 비밀번호 변경
$changeButton.addEventListener('click', (e) =>
{
    e.preventDefault()
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('password', $accountForm.querySelector('input[name="password"]').value);
    formData.append('newPassword', $accountForm.querySelector('input[name="newPassword"]').value);

    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        if (xhr.status < 200 || xhr.status >= 300) {
            toastAlter('비밀번호 변경 실패', '잠시 후 다시 시도해 주세요.');
            return;
        }

        const response = JSON.parse(xhr.responseText);

        switch (response.result) {
            case 'failure_duplicate':
                toastAlter('비밀번호 변경 실패', '이미 사용된 비밀번호입니다 다른 비밀번호를 입력해 주세요.');
                break;
            case 'failure_session_expired':
                toastAlter('비밀번호 변경 실패', '세션이 만료되었습니다.\n로그인창으로 이동합니다.');
                // location.href = `${origin}/user/login`;
                break;
            case 'failure':
                toastAlter('비밀번호 변경 실패', '잘못된 정보가 있습니다. 다시 한번 확인해 주세요.');
                break;
            case 'success':
                toast('비밀번호 변경 성공', '비밀번호가 성공적으로 변경되었습니다.');
                $accountForm.querySelector('input[name="password"]').value = '';
                $accountForm.querySelector('input[name="newPassword"]').value = '';
                $changeButton.disabled = true; // 다시 비활성화
                break;
            default:
                toastAlter('비밀번호 변경 실패', '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
        }
    };
    xhr.open('POST', '/user/password');
    xhr.send(formData);
});

// 재설정 & 저장
$buttons.forEach(button =>
{
    switch (button.name)
    {
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
                xhr.onreadystatechange = () =>
                {
                    if (xhr.readyState !== XMLHttpRequest.DONE) return;

                    if (xhr.status < 200 || xhr.status >= 300) {
                        toastAlter('요청 실패', '잠시 후 다시 시도해 주세요.')
                        return;
                    }

                    const response = JSON.parse(xhr.responseText);

                    switch (response.result) {
                        case 'failure_session_expired':
                            toastAlter('저장 실패', '로그인된 유저의 정보가 잘못되었거나 세션이 만료되었습니다.\n로그인창으로 이동합니다.')
                            location.href = `${origin}/user/login`
                            break;
                        case 'failure':
                            toastAlter('저장 실패', '잘못된 정보가 있습니다. 다시 한번 확인해 주세요.')
                            break;
                        case 'success':
                            toast('저장 성공', '프로필 정보가 성공적으로 저장되었습니다.');
                            saveInitialFormData($visibleForm);
                            updateButtonState();
                            break;
                        default:
                            toastAlter('저장 실패', '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.')
                    }
                };
                xhr.open('POST', '/user/profile');
                xhr.send(formData);
            });
            break;
    }
});




