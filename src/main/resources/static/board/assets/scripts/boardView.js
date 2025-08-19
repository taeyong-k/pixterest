const pinEditButtons = document.querySelectorAll('.pin-button');
const $boardFlyoutEditButton = document.querySelector('#editPin .editPin-label-board-button');
const $boardFlyoutEdit = document.querySelector('#boardFlyout-edit');
const $editPin = document.getElementById('editPin');

// 뒤로가기 버튼
const backButton = document.querySelector('.backButton');
if (backButton) {
    backButton.addEventListener('click', () => {
        history.back();
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

            switch (response.result) {
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
                        const el = document.querySelector(selector);
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
    const boardId = document.querySelector('.board-detail')?.dataset.boardId;

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
    console.log(boardId)
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
                sessionStorage.setItem('editPin', 'true');
                location.reload();
                break;
            default:
                toastAlter('핀을 저장하지 못했습니다', '일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
        }
    };
    xhr.open('POST', '/pin/edit-write');
    xhr.send(formData);
});

window.addEventListener('load', () =>
{
    if (sessionStorage.getItem('editPin') === 'true') {
        toast('수정 완료', '핀 정보가 정상적으로 수정되었습니다.');
        sessionStorage.removeItem('editPin');
    }
})