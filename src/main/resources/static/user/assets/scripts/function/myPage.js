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

// ✅ 가져온 보드 수정 핀 이미지 리스트 렌더링
function renderPinImages(pins) {
    const $pinsContainer = document.querySelector('.pins');
    $pinsContainer.innerHTML = ''; // 초기화

    pins.forEach(pin => {
        const $pin = document.createElement('div');
        $pin.className = 'pin';
        $pin.dataset.pinId = pin.id;

        const $img = document.createElement('img');
        $img.className = 'image';
        $img.src = `/images/${pin.image}`;
        $img.alt = pin.title || '핀 이미지';

        const $buttonContainer = document.createElement('div');
        $buttonContainer.className = 'button-container';

        const $button = document.createElement('button');
        $button.type = 'button';
        $button.className = 'obj-button pin-button';
        $button.dataset.pinId = pin.id;
        $button.textContent = '핀 삭제';

        // 이벤트 연결
        $button.addEventListener('click', () => {
            console.log('삭제할 pin ID:', pin.id);
            deletePinXHR(pin.id);
        });

        $buttonContainer.appendChild($button);
        $pin.appendChild($img);
        $pin.appendChild($buttonContainer);
        $pinsContainer.appendChild($pin);
    });

}

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

// 보드 수정 관련 함수
function modifyBoards() {
    $dialog.classList.add('-visible');
    $boardModalForm.classList.add('-visible');
    const $board = $main.querySelector(':scope > .content > .space > .boards > .board > .image')
    const $boardDelete = $boardModalForm.querySelector(':scope > .button-container > button[name="delete"]');
    const $boardId = $board.dataset.boardId;
    getBoardXHR($boardId);
    getPinsXHR($boardId);
    $boardDelete.addEventListener('click', () =>
    {
        deleteBoardXHR($boardId)
    })

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

// 보드 삭제 xhr
function deleteBoardXHR(boardId)
{
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("boardId", boardId)
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) return;

        if (xhr.status < 200 || xhr.status >= 300) {
            toastAlter('서버 오류', '서버 요청 중 문제가 발생했습니다.\n잠시 후 다시 시도해주세요.');
            return;
        }
        const response = JSON.parse(xhr.responseText)
        switch (response.result) {
            case 'failure_session_expired':
                window.location.href = '/user/login?loginCheck=expired'
                break;
            case 'failure_not_found':
                toast('보드 조회 실패', '해당 보드를 찾을 수 없습니다.');
                break;
            case 'failure_deleted':
                toast('삭제된 보드', '삭제된 보드입니다.');
                break;
            case 'failure_no_permission':
                toast('보드 권한 없음', '권한이 없습니다.');
                break;
            case 'success':
                sessionStorage.setItem('showToast', 'true');
                location.reload();
                break;
            default:
                toastAlter('삭제에 실패하였습니다.', '일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
        }
    };

    // DELETE 메서드를 지원하지 않으면 POST로도 가능 (서버 설정에 따라)
    xhr.open('POST', `/user/board/delete`);
    xhr.send(formData);
}

// ✅ 핀 ID로 보드에서 삭제 요청
function deletePinXHR(pinId)
{
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
            case 'failure_session_expired':
                window.location.href = '/user/login?loginCheck=expired'
                break;
            case 'failure_not_found':
                toast('없는 핀', '삭제할 핀을 찾을 수 없습니다.');
                break;
            case 'failure_deleted':
                toast('삭제된 핀', '이미 삭제된 핀입니다.');
                break;
            case 'failure_no_permission':
                toast('권한 없는 핀', '핀 삭제 권한이 없습니다.');
                break;
            case 'success':
                toast('핀 삭제', '보드에서 정상적으로 핀이 삭제되었습니다.');
                location.reload();
                break;
            default:
                toastAlter('핀 삭제', '일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
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
            case 'failure_session_expired':
                window.location.href = '/user/login?loginCheck=expired'
                break;
            case 'failure_not_found':
                toast('보드 없음', '보드를 찾을 수 없습니다.');
                break;
            case 'failure_board_update_fail': // 필요 시 추가
                toast('업데이트 실패', '보드 업데이트에 실패했습니다.');
                break;
            case 'success':
                toast('저장 성공', '보드 저장에 성공하였습니다.');
                updateBoardUI(response.board);
                $boardModalForm.classList.remove('-visible');
                $dialog.classList.remove('-visible');
                location.reload();
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

const pinEditButtons = $main.querySelectorAll('.pin-button');
const $boardFlyoutEditButton = document.querySelector('.editPin-label-board-button');
const $boardFlyoutEdit = document.querySelector('#boardFlyout-edit');
const $editPin = document.getElementById('editPin');
// 핀 수정 버튼 클릭시 핀 수정 창 띄우기
pinEditButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const pinId = e.currentTarget.getAttribute('data-pin-id');

        if (!pinId) {
            toastAlter('오류', '핀 ID를 찾을 수 없습니다.');
            return;
        }

        // 핀 정보 요청
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) return;

            if (xhr.status < 200 || xhr.status >= 300) {
                toastAlter('서버 오류', '서버 요청 중 문제가 발생했습니다.\n잠시 후 다시 시도해주세요.');
                return;
            }

            const response = JSON.parse(xhr.responseText);

            switch (response.result)
            {
                case 'failure_not_found':
                    toastAlter('오류', '해당 핀을 찾을 수 없습니다.');
                    break;
                case 'failure_session_expired':
                    window.location.href = '/user/login?loginCheck=expired';
                    break;
                case 'failure_forbidden':
                    window.location.href = '/user/login?loginCheck=forbidden';
                    break;
                case 'failure_absent':
                    toast('핀을 찾을 수 없습니다', '선택하신 핀이 존재하지 않거나 삭제된 상태입니다.');
                    break;
                case 'failure_not_owner':
                    toast('권한이 없습니다', '해당 핀은 본인이 작성한 핀이 아닙니다.\n수정 또는 삭제할 수 없습니다.');
                    break;
                case 'success':
                    const modal = document.getElementById('editPin');

                    if (!modal) {
                        toastAlter('오류', '수정 모달을 찾을 수 없습니다.');
                        return;
                    }
                    const setValueIfExists = (selector, value) => {
                        const el = $main.querySelector(selector);
                        if (el) el.value = value || '';
                    };

                    setValueIfExists('input[name="title"]', response.title);
                    setValueIfExists('textarea[name="content"]', response.content);
                    setValueIfExists('input[name="link"]', response.link);
                    setValueIfExists('input[name="tag"]', response.tag);

                    // 혹시 필요하면 현재 핀 ID 저장
                    button.setAttribute('data-pin-id', response.id);

                    // 핀 ID 설정
                    modal.setAttribute('data-pin-id', response.id);

                    // ✅ 모달 열기 (CSS 클래스 조작 또는 style 속성)
                    modal.classList.add('-visible')

                    // ✅ 보드 팝업
                    if ($boardFlyoutEditButton && $boardFlyoutEdit) {
                        $boardFlyoutEditButton.addEventListener('click', (e) => {
                            e.stopPropagation();
                            $boardFlyoutEdit.classList.toggle('-visible');
                        });

                        // 팝업 바깥 클릭 시 닫기
                        document.addEventListener('click', (e) => {
                            const isClickInsideButton = $boardFlyoutEditButton.contains(e.target);
                            const isClickInsideFlyout = $boardFlyoutEdit.contains(e.target);

                            if (!isClickInsideButton && !isClickInsideFlyout) {
                                $boardFlyoutEdit.classList.remove('-visible');
                            }
                        });
                    }

                    getBoardsXHR(pinId, response.boardId);
                    bindValidationEvents();
                    break;
                default:
                    toastAlter('핀을 불러오지 못했습니다', '일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
            }
        };

        xhr.open('GET', `/pin/edit-info?pinId=${pinId}`);
        xhr.send();
    });
    function getBoardsXHR(pinId, selectedBoardId) {
        const xhr = new XMLHttpRequest();
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
                case 'failure_session_expired':
                    window.location.href = '/user/login?loginCheck=expired'
                    break;
                case 'failure_forbidden':
                    window.location.href = '/user/login?loginCheck=forbidden'
                    break;
                case 'failure_board_absent':
                    toast('보드를 찾을 수 없습니다', '선택하신 보드가 존재하지 않거나 삭제된 상태입니다.');
                    break;
                case 'empty':
                    renderBoards([], null);
                    break;
                case 'success':
                    renderBoards(response.boards || [], selectedBoardId);
                    break;
                default:
                    toastAlter('보드 데이터를 불러오지 못했습니다', '일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
            }
        };
        xhr.open('GET', `/pin/edit-boards?pinId=${pinId}`);
        xhr.send();
    }

    function renderBoards(boards, selectedBoardId) {
        const $content = $boardFlyoutEdit.querySelector('.boardFlyout-content');
        $content.innerHTML = '';

        if (boards.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'empty-message';
            emptyMsg.textContent = '생성된 보드가 없습니다. 먼저 보드를 만들어주세요!';
            $content.appendChild(emptyMsg);
            return;
        }

        boards.forEach(b => {
            const item = document.createElement('div');
            item.className = 'item';

            if (parseInt(b.id) === parseInt(selectedBoardId)) {
                const $boardFlyoutButtonText = $boardFlyoutEditButton.querySelector('.name');
                if ($boardFlyoutButtonText) {
                    $boardFlyoutButtonText.innerText = b.name;
                    $boardFlyoutButtonText.style.fontWeight = "700";
                }

                const $boardFlyoutButtonImg = $boardFlyoutEditButton.querySelector('img.thumbnailImg');
                if ($boardFlyoutButtonImg) {
                    if (b.coverImage) {
                        $boardFlyoutButtonImg.src = `/images/${b.coverImage}`;
                    } else {
                        $boardFlyoutButtonImg.src = '/assets/images/default.png';
                    }
                    $boardFlyoutButtonImg.style.display = "block";
                }
            }

            item.innerHTML = `
                <div class="board-info" data-board-id="${b.id}" data-board-url="${b.coverImage || ''}">
                    <div class="board-thumbnail">
                        <div class="thumbnail">
                            <img alt class="thumbnailImg ${!b.coverImage ? 'default-img' : ''}" loading="auto" src="${b.coverImage ? `/images/${b.coverImage}` : '/assets/images/default.png'}">
                        </div>
                    </div>
                    <div class="board-name">
                        <div class="name" title="${b.name}">${b.name}</div>
                    </div>
                </div>`;
            $content.appendChild(item);
        });

        attachBoardClickEvents();   // 함수-동적 클릭 이벤트 부여
    }
});

let selectedBoardId = null;

// ✅ 팝업 요소 저장 setting
function attachBoardClickEvents() {
    const $boardInfo = document.querySelectorAll('.board-info');

    $boardInfo.forEach($board => {
        $board.addEventListener('click', () => {
            selectedBoardId = $board.dataset.boardId;           // [선택한] 보드 data-id
                                                                // [선택한] 보드 name
            const $boardName = $board.querySelector(':scope > .board-name > .name')?.innerText;
            const $boardUrl = $board.dataset.boardUrl;          // [선택한] 보드 data-url

            const $boardFlyoutButtonText = $boardFlyoutEditButton.querySelector('.name');           // [화면] 보드 name
            if ($boardFlyoutButtonText) {
                $boardFlyoutButtonText.innerText = $boardName;
                $boardFlyoutButtonText.style.fontWeight = "700";
            }

            const $boardFlyoutButtonImg = $boardFlyoutEditButton.querySelector('img.thumbnailImg'); // [화면] 보드 img
            if ($boardFlyoutButtonImg) {
                if ($boardUrl) {
                    $boardFlyoutButtonImg.src = `/images/${$boardUrl}`;
                } else {
                    $boardFlyoutButtonImg.src = '/assets/images/default.png';
                }
                $boardFlyoutButtonImg.style.display = "block";
            }

            $boardFlyoutEdit.classList.remove('-visible');
        });
    });
}

document.querySelector('.editPin-overlay').addEventListener('click', () => {
    $editPin.classList.remove('-visible');
    document.body.style.overflow = '';
});

$editPin.querySelector('.editPin-button').addEventListener('click', () => {
    $editPin.classList.remove('-visible');
    document.body.style.overflow = '';
});

// ✅ 정규식 + 입력 검사
const titleRegex = /^.{0,100}$/;
const contentRegex = /^.{0,800}$/;
const urlRegex = /^(https?):\/\/([a-z0-9-]+\.)+[a-z0-9]{2,}(\/.*)?$/i;

const $editPinTitleLabel = $editPin.querySelector('.editPin-label.title');
const $editPinTitleInput = $editPinTitleLabel.querySelector('input[name="title"]');
const $editPinContentLabel = $editPin.querySelector('.editPin-label.content');
const $editPinContentTextarea = $editPinContentLabel.querySelector('textarea[name="content"]');
const $editPinLinkLabel = $editPin.querySelector('.editPin-label.link');
const $editPinLinkInput = $editPinLinkLabel.querySelector('input[name="link"]');
const $editPinTagLabel = $editPin.querySelector('.editPin-label.tag');
const $editPinTagInput = $editPinTagLabel.querySelector('input[name="tag"]');

function bindValidationEvents() {
    $editPinTitleInput.addEventListener('input', () => {
        if ($editPinTitleInput.value.trim() !== '' && !titleRegex.test($editPinTitleInput.value)) {
            $editPinTitleLabel.classList.add('-invalid');
        } else {
            $editPinTitleLabel.classList.remove('-invalid');
        }
    });

    $editPinContentTextarea.addEventListener('input', () => {
        const contentValue = $editPinContentTextarea.value;
        const contentLength = contentValue.length;

        if (contentLength > 800) {
            $editPinContentLabel.classList.add('-invalid');
        } else {
            $editPinContentLabel.classList.remove('-invalid');
        }
    });

    $editPinLinkInput.addEventListener('blur', () => {
        if ($editPinLinkInput.value.trim() !== '' && !urlRegex.test($editPinLinkInput.value)) {
            $editPinLinkLabel.classList.add('-invalid');
        } else {
            $editPinLinkLabel.classList.remove('-invalid');
        }
    });
}

// ✅ 핀 수정하기 > 숨김 버튼 처리 이벤트
$editPin.querySelector('.button.delete').addEventListener('click', () => {
    showAlertToast({
        title: '정말로 핀을 숨기실까요?',
        caption: '숨긴 핀은 내 보드와 피드에서 보이지 않게 됩니다.',
        duration: 10100,
        buttonText: '숨기기',
        onButtonClick: () => {
            const pinId = $editPin.getAttribute('data-pin-id');
            if (!pinId) return;

            const xhr = new XMLHttpRequest();
            const formData = new FormData();
            formData.append('pinId', pinId);

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
                    case 'failure_session_expired':
                        window.location.href = '/user/login?loginCheck=expired'
                        break;
                    case 'failure_forbidden':
                        window.location.href = '/user/login?loginCheck=forbidden'
                        break;
                    case 'failure_absent':
                        toast('핀을 찾을 수 없습니다', '선택하신 핀이 존재하지 않거나 삭제된 상태입니다.');
                        break;
                    case 'success':
                        window.location.href = '/?pin=hide'
                        break;
                    default:
                        toastAlter('핀을 저장하지 못했습니다', '일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
                }
            };
            xhr.open('POST', '/pin/edit-hide');
            xhr.send(formData);
        }
    });
});

// ✅ 핀 수정하기 > 작성 버튼 처리 이벤트
$editPin.querySelector('.button.write').addEventListener('click', () => {
    const pinId = $editPin.getAttribute('data-pin-id');
    if (!pinId) return;

    const title = $editPinTitleInput.value.trim();
    const content = $editPinContentTextarea.value.trim();
    const link = $editPinLinkInput.value.trim();
    const tag = $editPinTagInput.value.trim();
    const boardId = $boardFlyoutEditButton.getAttribute('data-board-id');

    if (title && !titleRegex.test(title)) {
        $editPinTitleLabel.classList.add('-invalid');
        $editPinTitleLabel.focus();
        $editPinTitleInput.select();
        return;
    }

    if (content && !contentRegex.test(content)) {
        $editPinContentLabel.classList.add('-invalid');
        $editPinContentLabel.focus();
        $editPinContentTextarea.select();
        return;
    }

    if (link && !urlRegex.test(link)) {
        $editPinLinkLabel.classList.add('-invalid');
        $editPinLinkLabel.focus();
        $editPinLinkInput.select();
        return;
    }

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('pinId', pinId);
    formData.append('title', title);
    formData.append('content', content);
    formData.append('link', link);
    formData.append('tag', tag);
    if (boardId) {
        formData.append('boardId', boardId);
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
            case 'failure_session_expired':
                window.location.href = '/user/login?loginCheck=expired'
                break;
            case 'failure_forbidden':
                window.location.href = '/user/login?loginCheck=forbidden'
                break;
            case 'failure_absent':
                toast('핀을 찾을 수 없습니다', '선택하신 핀이 존재하지 않거나 삭제된 상태입니다.');
                break;
            case 'success':
                toast('수정 완료', '핀 정보가 정상적으로 수정되었습니다.');
                location.reload();
                break;
            default:
                toastAlter('핀을 저장하지 못했습니다', '일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
        }
    };
    xhr.open('POST', '/pin/edit-write');
    xhr.send(formData);
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

$passwordInputs.forEach(input =>
{
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

    validateInput($passwordInput, $passwordLabel, passwordRegex, '올바르지 않은 비밀번호를 입력했습니다. \n다시 시도하거나 비밀번호 재설정하세요.')

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
                toast('비밀번호 변경 성공', '비밀번호가 성공적으로 변경되었습니다.');
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
                    switch (response.result)
                    {
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

                    switch (response.result)
                    {
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

window.addEventListener('load', () =>
{
    if (sessionStorage.getItem('showToast') === 'true') {
        toast('보드 삭제', '보드가 정상적으로 삭제되었습니다.');
        sessionStorage.removeItem('showToast');
    }
    if (sessionStorage.getItem('showProfile') === 'true') {
        toast('프로필 저장', '프로필 정보가 성공적으로 저장되었습니다.');
        sessionStorage.removeItem('showProfile');
    }
})