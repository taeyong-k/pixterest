const $items = document.querySelectorAll('.menu .item');
const $profileForms = document.querySelectorAll('.form-container > form');
const $main = document.getElementById('main')
const $edit = document.getElementById('edit-page');
const $buttons = $edit.querySelectorAll(':scope > .button-container > button');
const $deleteButtons = $edit.querySelectorAll('.account-delete button');
const $accountForm = document.getElementById('accountForm');
const $accountEmail = $accountForm.querySelector(':scope > .field-wrapper > .field > .obj-label > input[name="email"]')
let initialFormData = {}; // ✅ 초기 데이터 저장

// 프로필 정보 세팅
function setProfileValues(userInfo) {
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

// 보드 자세히 보기
const $boardImages = $main.querySelectorAll(':scope > .content > .space > .boards > .board > .image')
$boardImages.forEach(($image) => {
    $image.addEventListener('click', (e) => {
        if (e.target.closest('.edit-button')) return;
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
        if (target.classList && target.classList.contains("edit-button")) {
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
        if (!pinId) return;

        location.href = `${origin}/pin/?id=${pinId}`;
    });
});

function modifyBoards() {
    $dialog.classList.add('-visible');
    $boardModalForm.classList.add('-visible');
    const $board = $main.querySelector(':scope > .content > .space > .boards > .board > .image')
    const $boardId = $board.dataset.boardId;
    getBoardXHR($boardId);
    getPinsXHR($boardId)
}

const $boardFlyoutButton = document.querySelector('.coverImage');
const $pinFlyout = document.querySelector('#pinFlyout');

// 드롭다운 열기
$boardFlyoutButton.addEventListener('click', (e) => {
    e.stopPropagation();
    $pinFlyout.classList.toggle('-visible');
});

// 바깥 클릭 시 닫기
document.addEventListener('click', (e) => {
    const isClickInsideButton = $boardFlyoutButton.contains(e.target);
    const isClickInsideFlyout = $pinFlyout.contains(e.target);

    if (!isClickInsideButton && !isClickInsideFlyout) {
        $pinFlyout.classList.remove('-visible');
    }
});

// 보드 ID로 보드 정보 요청
function getBoardXHR(boardId) {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) return;

        if (xhr.status < 200 || xhr.status >= 300) {
            toastAlter('서버 오류', '서버 요청 중 문제가 발생했습니다.\n잠시 후 다시 시도해주세요.');
            return;
        }
        const response = JSON.parse(xhr.responseText);
        const boardName = response.boardName;

        const $nameInput = $boardModalForm.querySelector('input[name="name"]');
        $nameInput.value = boardName || '';


    };
    xhr.open('GET', `/user/board?boardId=${boardId}`);
    xhr.send();
}

// ✅ 보드 ID로 핀 이미지 요청
function getPinsXHR(boardId) {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) return;

        if (xhr.status < 200 || xhr.status >= 300) {
            toastAlter('서버 오류', '서버 요청 중 문제가 발생했습니다.\n잠시 후 다시 시도해주세요.');
            return;
        }

        const response = JSON.parse(xhr.responseText);
        switch (response.result) {
            case 'failure':
                toast('핀 가져오기', ' 알 수 없는 오류로 가져오지 못했습니다. 다시 한번 시도해 주세요.');
                break;
            case 'success':
                renderCoverPinImages(response.pins || []);
                renderPinImages(response.pins || [])
                break;
            default:
                toastAlter('핀 가져오기에 실패하였습니다.', '일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
        }
    };
    xhr.open('GET', `/user/pins?boardId=${boardId}`);
    xhr.send();
}

// 커버 이미지 렌더링 함수
function renderCoverPinImages(pins) {
    const $list = document.querySelector('.pin-flyout__list');
    const $coverImageInput = document.querySelector('#coverImageInput');
    $list.innerHTML = '';

    pins.forEach(pin => {
        const pinItem = document.createElement('div');
        pinItem.className = 'pin-item';

        const imageUrl = `/images/${pin.image}`;
        pinItem.innerHTML = `
                <div class="pin-item__info"
                     data-board-id="${pin.boardId || ''}"
                     data-image-url="${pin.image}">
                    <div class="pin-item__thumbnail">
                        <div class="pin-item__thumbnail-box">
                            <img alt class="pin-item__img" loading="auto" src="${imageUrl}">
                        </div>
                    </div>
                    <div class="pin-item__name-box">
                        <div class="pin-item__name" title="${pin.title || ''}">${pin.title || pin.image}</div>
                    </div>
                </div>
            `;

        const $info = pinItem.querySelector('.pin-item__info');

        // 이전 선택값과 현재 핀 이미지가 같으면 -selected 클래스 추가
        if ($coverImageInput.value === pin.image) {
            $info.classList.add('-selected');
        }

        // 클릭 시 처리
        $info.addEventListener('click', () => {
            // 숨겨진 input에 클릭한 이미지 데이터 넣기
            $coverImageInput.value = $info.dataset.imageUrl;

            // 기존 선택 해제
            document.querySelectorAll('.pin-item__info.-selected').forEach(el => {
                el.classList.remove('-selected');
            });

            // 선택 표시 추가
            $info.classList.add('-selected');

            // flyout 닫기
            const $flyout = document.querySelector('#pinFlyout');
            if ($flyout) {
                $flyout.classList.remove('-visible');
            }
        });

        $list.appendChild(pinItem);
    });
}

// ✅ 가져온 핀 이미지 리스트 렌더링
function renderPinImages(pins) {
    const $pinsContainer = document.querySelector('.pins');
    $pinsContainer.innerHTML = ''; // 초기화

    $pinsContainer.innerHTML = pins.map(pin => `
            <div class="pin" data-pin-id="${pin.id}">
                <img alt="img" class="image" src="/images/${pin.image}">
                <div class="button-container">
                    <button type="button" class="obj-button edit-button" data-id="${pin.id}">핀 삭제</button>
                </div>
            </div>
        `);

    // 삭제 버튼 이벤트 바인딩 (한 번 더 처리해줘야 함)
    const $buttons = $pinsContainer.querySelectorAll('.edit-button');
    $buttons.forEach($btn => {
        const pinId = $btn.dataset.id;
        $btn.addEventListener('click', () => {
            deletePinXHR(pinId)
        });
    });
}

// ✅ 핀 ID로 보드에서 삭제 요청
function deletePinXHR(pinId) {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("pinId", pinId)
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) return;

        if (xhr.status < 200 || xhr.status >= 300) {
            toastAlter('서버 오류', '서버 요청 중 문제가 발생했습니다.\n잠시 후 다시 시도해주세요.');
            return;
        }
        const response = JSON.parse(xhr.responseText)
        switch (response.result) {

            case 'failure':
                toast('핀 삭제', '핀 삭제에 정보가 잘못되었습니다. 다시 한번 확인해 주세요.');
                break;
            case 'success':
                toast('핀 삭제', '보드에서 정상적으로 핀이 삭제되었습니다.');
                break;
            default:
                toastAlter('삭제에 실패하였습니다.', '일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
        }
    };

    // DELETE 메서드를 지원하지 않으면 POST로도 가능 (서버 설정에 따라)
    xhr.open('POST', `/user/pin/delete`);
    xhr.send(formData);
}

// 보드 수정 폼 저장 버튼 클릭 로직
$boardModalForm.onsubmit = (e) => {
    e.preventDefault();
    const $board = $main.querySelector(':scope > .content > .space > .boards > .board > .image')
    const $boardId = $board.dataset.boardId;
    const $name = $boardModalForm.querySelector('input[name="name"]').value.trim();
    const $coverImage = document.getElementById('coverImageInput').value.trim();
    console.log($coverImage)

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("id", $boardId)
    formData.append("name", $name);
    if ($coverImage) {
        formData.append("coverImage", $coverImage)
    }
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
            case 'failure':
                toast('저장 실패', '잘못된 정보가 있습니다. 다시 한번 확인해 주세요.')
                break;
            case 'success':
                toast('보드 저장', '보드 저장에 성공하였습니다.');
                updateBoardUI(response.board);
                $boardModalForm.classList.remove('-visible');
                $dialog.classList.remove('-visible');
                break;
            default:
                toastAlter('저장에 실패하였습니다.', '일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
                break;
        }
    };
    xhr.open('POST', '/user/board');
    xhr.send(formData);
}

// 저장 성공 후 UI 갱신
function updateBoardUI(board) {
    // board.id에 해당하는 .image 요소 찾기
    const $boardImageDiv = document.querySelector(`.board .image[data-board-id="${board.id}"]`);
    if (!$boardImageDiv) return;

    // 기존 이미지 태그 다 제거 (서버에서 렌더링할 때 두 개 중 하나만 있었던 거라)
    $boardImageDiv.querySelectorAll('img.background').forEach(img => img.remove());

    // 새로 이미지 엘리먼트 생성
    const newImg = document.createElement('img');
    newImg.alt = '보드 이미지';
    newImg.className = 'background';

    // 커버 이미지 있으면 경로 설정, 없으면 기본 이미지로 설정
    if (board.coverImage) {
        newImg.src = `/images/${board.coverImage}?v=${Date.now()}`; // 캐시 방지 timestamp
    } else {
        newImg.src = '/assets/images/default.png';
    }

    // image div에 새 이미지 추가
    $boardImageDiv.prepend(newImg);
}

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
            location.href = `${origin}/user/login`;
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

// 비밀번호 입력시 버튼 활성화 시키기
$passwordInputs.forEach(input => {
    input.addEventListener('input', () => {
        const passwordFilled = $accountForm.querySelector('input[name="password"]').value.trim() !== '';
        const newPasswordFilled = $accountForm.querySelector('input[name="newPassword"]').value.trim() !== '';

        $changeButton.disabled = !(passwordFilled && newPasswordFilled);
    });
});

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
                        toastAlter('서버 오류', '서버 요청 중 문제가 발생했습니다.\n잠시 후 다시 시도해주세요.');
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
                            if ($button.name === 'deactivate') {
                                sessionStorage.setItem('showToastDeactivated', 'true');
                            } else if ($button.name === 'remove') {
                                sessionStorage.setItem('showToastDeleted', 'true');
                            }
                            location.href = `${origin}/user/login`;
                            break;
                        default:
                            toastAlter('계정 처리에 실패하였습니다.', '일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
                    }
                };

                xhr.open('POST', config.url);
                xhr.send(formData);
            }
        });
    });
});

// 비밀번호 변경
$changeButton.addEventListener('click', (e) => {
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
            toastAlter('서버 오류', '서버 요청 중 문제가 발생했습니다.\n잠시 후 다시 시도해주세요.');
            return;
        }

        const response = JSON.parse(xhr.responseText);

        switch (response.result) {
            case 'failure_duplicate':
                toastAlter('비밀번호 변경 실패', '이미 사용된 비밀번호입니다 다른 비밀번호를 입력해 주세요.');
                break;
            case 'failure_session_expired':
                toast('비밀번호 변경 실패', '세션이 만료되었습니다.\n로그인창으로 이동합니다.');
                // location.href = `${origin}/user/login`;
                break;
            case 'failure':
                toast('비밀번호 변경 실패', '잘못된 정보가 있습니다. 다시 한번 확인해 주세요.');
                break;
            case 'success':
                toast('비밀번호 변경 성공', '비밀번호가 성공적으로 변경되었습니다.');
                $accountForm.querySelector('input[name="password"]').value = '';
                $accountForm.querySelector('input[name="newPassword"]').value = '';
                $changeButton.disabled = true; // 다시 비활성화
                location.href = `${origin}/user/login`;
                break;
            default:
                toastAlter('비밀번호 변경에 실패하였습니다.', '일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
        }
    };
    xhr.open('POST', '/user/password');
    xhr.send(formData);
});

// 재설정 & 저장
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
                            toastAlter('저장에 실패하였습니다.', '일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
                    }
                };
                xhr.open('POST', '/user/profile');
                xhr.send(formData);
            });
            break;
    }
});




