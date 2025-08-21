document.addEventListener('DOMContentLoaded', () => {
    // 뒤로가기 버튼
    const backButton = document.querySelector('.backButton');
    if (backButton) {
        backButton.addEventListener('click', () => {
            history.back();
        });
    }

    // 댓글 폼 textarea 자동 높이 조절
    const commentTextarea = document.querySelector('#commentForm textarea');
    if (commentTextarea) {
        const label = commentTextarea.closest('.obj-label');
        const submitButton = label.querySelector('.submit-button');

        commentTextarea.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';

            const extraSpace = 15;
            const maxHeight = 140; // textarea max-height와 동일하게 설정
            const isMaxHeight = this.scrollHeight >= maxHeight;

            label.style.paddingBottom = isMaxHeight ? '40px' : `${extraSpace}px`;
            submitButton.style.right = isMaxHeight ? '31px' : '11px';
        });

        // commentTextarea.addEventListener('keydown', function (event) {
        //     if (event.key === 'Enter' && !event.shiftKey) {
        //         event.preventDefault();
        //         document.getElementById('commentForm').requestSubmit();
        //     }
        // });
    }

    // 대댓글 폼 textarea 자동 높이 조절
    function attachReplyTextareaAutoHeight() {
        const replyTextareas = document.querySelectorAll('.reply-form textarea');
        replyTextareas.forEach(replyTextarea => {
            const label = replyTextarea.closest('.obj-label');
            const writeButton = label.parentElement.querySelector('.button-container .write');

            replyTextarea.style.height = 'auto';
            replyTextarea.style.height = replyTextarea.scrollHeight + 'px';

            replyTextarea.oninput = null;

            replyTextarea.addEventListener('input', function () {
                this.style.height = 'auto';
                this.style.height = this.scrollHeight + 'px';
            });

            // replyTextarea.addEventListener('keydown', function (event) {
            //     if (event.key === 'Enter' && !event.shiftKey) {
            //         event.preventDefault();
            //         console.log('reply textarea value:', this.value);
            //         writeButton.click();
            //     }
            // });
        });
    }

    // 수정 폼 textarea 자동 높이 조절
    function attachModifyTextareaAutoHeight() {
        const modifyTextareas = document.querySelectorAll('.modify-form textarea');
        modifyTextareas.forEach(modifyTextarea => {
            const label = modifyTextarea.closest('.obj-label');
            const writeButton = label.parentElement.querySelector('.button-container .write');

            // 높이 초기화
            modifyTextarea.style.height = 'auto';
            modifyTextarea.style.height = modifyTextarea.scrollHeight + 'px';

            // 중복 등록 방지를 위해 기존 이벤트 리스너 제거 후 다시 등록하는게 안전
            modifyTextarea.oninput = null;

            modifyTextarea.addEventListener('input', function () {
                this.style.height = 'auto';
                this.style.height = this.scrollHeight + 'px';
            });

            // modifyTextarea.addEventListener('keydown', function (event) {
            //     if (event.key === 'Enter' && !event.shiftKey) {
            //         // shift + enter 는 줄바꿈 유지, 그냥 enter면 저장
            //         event.preventDefault();  // 줄바꿈 방지
            //         writeButton.click();     // 작성(저장) 버튼 클릭 이벤트 강제 실행
            //     }
            // });
        });
    }


    // ✅ extraFlyout(추가작업) 팝업
    const $boardFlyoutEditButton = document.querySelector('.editPin-label-board-button');

    const extraFlyout = document.getElementById('extraFlyout');
    const $extraButton = document.querySelector('.pinDetail-content .extra-button');

    $extraButton.addEventListener('click', (e) => {
        e.stopPropagation();    // 바깥 클릭 막기

        extraFlyout.style.display = 'block';

        const rect = $extraButton.getBoundingClientRect();
        const top = rect.top + window.scrollY + $extraButton.offsetHeight;
        const left = rect.left + window.scrollX + ($extraButton.offsetWidth / 2) - (extraFlyout.offsetWidth / 2);

        extraFlyout.style.top = `${top}px`;
        extraFlyout.style.left = `${left}px`;
        extraFlyout.setAttribute('aria-hidden', 'false');

        const pinId = $extraButton.dataset?.pinId;
        if (pinId) {
            extraFlyout.setAttribute('data-target-pin-id', pinId);
        }
    });

    // 팝업 외부 클릭 시 숨김
    document.addEventListener('click', () => {
        extraFlyout.style.display = 'none';
        extraFlyout.setAttribute('aria-hidden', 'true');
        extraFlyout.removeAttribute('data-target-pin-id');
    });

    // 팝업 내부 클릭 시 닫히지 않게
    extraFlyout.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // ✅ extraFlyout 팝업 > 핀 수정하기
    const $editPinButton = document.querySelector('.flyout-item.edit-pin');
    const $editPin = document.getElementById('editPin');

    const $editPinLabel = $editPin.querySelector('.editPin-label-container');   // 라벨 > 부모
    const $editPinBoardLabel = $editPin.querySelector('.editPin-label.board');  // 보드 선택 라벨
    const $boardFlyoutEdit = document.querySelector('#boardFlyout-edit');       // 보드 팝업

    // ✅ 보드 팝업 위치 계산 (스크롤 오프셋 기준)
    function updateBoardFlyoutEditPosition() {
        const wasHidden = !$boardFlyoutEdit.classList.contains('-visible');

        if (wasHidden) {
            $boardFlyoutEdit.style.visibility = 'hidden';
            $boardFlyoutEdit.style.display = 'block';
        }

        const scrollTop = $editPinLabel.scrollTop;
        const scrollLeft = $editPinLabel.scrollLeft;

        const labelRect = $editPinBoardLabel.getBoundingClientRect();
        const containerRect = $editPinLabel.getBoundingClientRect();

        const popupWidth = $boardFlyoutEdit.offsetWidth;

        // 라벨의 컨테이너 내 좌표 = 뷰포트 좌표 - 컨테이너 뷰포트 좌표 + 스크롤 위치
        const top = labelRect.bottom - containerRect.top + scrollTop - 8;
        const left = labelRect.left - containerRect.left + scrollLeft + (labelRect.width / 2) - (popupWidth / 2);

        $boardFlyoutEdit.style.top = `${top}px`;
        $boardFlyoutEdit.style.left = `${left}px`;

        if (wasHidden) {
            $boardFlyoutEdit.style.visibility = '';
            $boardFlyoutEdit.style.display = '';
        }
    }

    $boardFlyoutEditButton.addEventListener('click', (e) => {
        e.stopPropagation();
        updateBoardFlyoutEditPosition();
        $boardFlyoutEdit.classList.toggle('-visible');
    });

    window.addEventListener('resize', () => {
        if ($boardFlyoutEdit.classList.contains('-visible')) {
            updateBoardFlyoutEditPosition();
        }
    });

    // ✅ 추가작업 > 핀 수정 버튼 클릭 이벤트
    $editPinButton.addEventListener('click', (e) => {
        const pinId = e.currentTarget.getAttribute('data-pin-id');

        if (!pinId) {
            toastAlter('오류', '핀 ID를 찾을 수 없습니다.');
            return;
        }

        // 3. 필요한 핀 정보들을 (제목, 설명 등) 불러와서 input/textarea에 넣는 작업(선택사항)
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
                case 'failure_not_found':
                    toastAlter('오류', '해당 핀을 찾을 수 없습니다.');
                    break;
                case 'failure_session_expired':
                    window.location.href = '/user/login?loginCheck=expired'
                    break;
                case 'failure_forbidden':
                    window.location.href = '/user/login?loginCheck=forbidden'
                    break;
                case 'failure_absent':
                    toast('핀을 찾을 수 없습니다', '선택하신 핀이 존재하지 않거나 삭제된 상태입니다.');
                    break;
                case 'failure_not_owner':
                    toast('권한이 없습니다', '해당 핀은 본인이 작성한 핀이 아닙니다.\n수정 또는 삭제할 수 없습니다.');
                    3
                    extraFlyout.style.display = 'none';
                    break;
                case 'success':
                    const setValueExist = (selector, value) => {
                        const el = $editPin.querySelector(selector);
                        if (!el) return;
                        el.value = value || '';
                    };

                    setValueExist('input[name="title"]', response.title);
                    setValueExist('textarea[name="content"]', response.content);
                    setValueExist('input[name="link"]', response.link);
                    setValueExist('input[name="tag"]', response.tag);

                    $editPin.setAttribute('data-pin-id', response.id);
                    $editPin.classList.add('-visible');
                    document.body.style.overflow = 'hidden';
                    extraFlyout.style.display = 'none';

                    getBoardsXHR(pinId, response.boardId);
                    bindValidationEvents();
                    handleScroll();
                    break;
                default:
                    toastAlter('핀을 불러오지 못했습니다', '일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
            }
        };
        xhr.open('GET', `/pin/edit-info?pinId=${pinId}`);
        xhr.send();
    });

    // ✅ 핀 수정 > 스크롤 감지
    const $labelContainer = $editPin.querySelector('.editPin-label-container');
    const $header = $editPin.querySelector('.editPin-header');
    const $buttonContainer = $editPin.querySelector('.editPin-button-container');

    function handleScroll() {
        if ($labelContainer.scrollTop > 0) {
            $header.classList.add('-scrolled');
        } else {
            $header.classList.remove('-scrolled');
        }

        const tolerance = 1;    // 1px 오차 허용
        const atBottom = Math.abs($labelContainer.scrollTop + $labelContainer.clientHeight - $labelContainer.scrollHeight) <= tolerance;

        if (!atBottom) {
            $buttonContainer.classList.add('-scrolled');
        } else {
            $buttonContainer.classList.remove('-scrolled');
        }
    }

    if ($labelContainer) {
        $labelContainer.addEventListener('scroll', handleScroll);
    }

    // ✅ 보드 DB 데이터 땡겨오기
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

    // ✅ 보드 팝업 render 함수
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
                $boardFlyoutEditButton.setAttribute('data-board-id', b.id);
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
                $boardFlyoutEditButton.setAttribute('data-board-id', selectedBoardId);
                $boardFlyoutEdit.classList.remove('-visible');
            });
        });
    }

    // ✅ 핀 수정 > 모달 닫기
    document.querySelector('.editPin-overlay').addEventListener('click', () => {
        $editPin.classList.remove('-visible');
        document.body.style.overflow = '';
        $boardFlyoutEdit.classList.remove('-visible');
        $boardFlyoutEditButton.querySelector('.name').innerText = '보드 선택';
        $boardFlyoutEditButton.querySelector('.name').style.fontWeight = '400';
        $boardFlyoutEditButton.querySelector('img.thumbnailImg').src = '';
        $boardFlyoutEditButton.querySelector('img.thumbnailImg').style.display = "none";
        $editPinTitleLabel.classList.remove('-invalid');
        $editPinContentLabel.classList.remove('-invalid');
        $editPinLinkLabel.classList.remove('-invalid');
    });

    $editPin.querySelector('.editPin-button').addEventListener('click', () => {
        $editPin.classList.remove('-visible');
        document.body.style.overflow = '';
        $boardFlyoutEdit.classList.remove('-visible');
        $boardFlyoutEditButton.querySelector('.name').innerText = '보드 선택';
        $boardFlyoutEditButton.querySelector('.name').style.fontWeight = '400';
        $boardFlyoutEditButton.querySelector('img.thumbnailImg').src = '';
        $boardFlyoutEditButton.querySelector('img.thumbnailImg').style.display = "none";
        $editPinTitleLabel.classList.remove('-invalid');
        $editPinContentLabel.classList.remove('-invalid');
        $editPinLinkLabel.classList.remove('-invalid');
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

    // ✅ 핀 수정하기 > 삭제 버튼 처리 이벤트
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
                    sessionStorage.setItem('showToast-write', 'true');
                    window.location.href = `/pin/?id=${pinId}`;
                    break;
                default:
                    toastAlter('핀을 저장하지 못했습니다', '일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
            }
        };
        xhr.open('POST', '/pin/edit-write');
        xhr.send(formData);
    });

    // ✅ 핀 상세페이지 > '저장' 버튼 클릭 이벤트
    const $saveButton = document.querySelector('.pinDetail-content .save-button');
    $saveButton.addEventListener('click', () => {
        const pinId = $saveButton.dataset.pinId;

        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('id', pinId);
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
                    window.location.href = '/user/login?loginCheck=expired';
                    break;
                case 'failure_forbidden':
                    window.location.href = '/user/login?loginCheck=forbidden';
                    break;
                case 'failure_absent':
                    toast('핀을 찾을 수 없습니다', '선택하신 핀이 존재하지 않거나 삭제된 상태입니다.');
                    break;
                case 'failure_duplicate':
                    showToast({
                        title: '이미 저장된 핀입니다',
                        caption: '선택하신 핀이 이미 내 보드에 저장되어 있습니다.',
                        duration: 8100,
                        buttonText: '이동하기',
                        onButtonClick: () => {
                            window.location.href = '/user/myPage';
                        }
                    });
                    break;
                case 'success':
                    sessionStorage.setItem('showToast', 'true');
                    window.location.reload();
                    break;
                default:
                    toastAlter('핀을 저장하지 못했습니다', '일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
            }
        };
        xhr.open('POST', '/pin/');
        xhr.send(formData);
    });


    // ✅ add comment
    const $commentForm = document.getElementById('commentForm');
    const $commentContainer = document.getElementById('commentContainer');
    const pinId = new URL(location.href).searchParams.get('id');

    const loadComments = () => {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            if (xhr.status < 200 || xhr.status >= 300) {
                toastAlter('서버 오류', '서버 요청 중 문제가 발생했습니다.\n잠시 후 다시 시도해주세요.');
                return;
            }
            const comments = JSON.parse(xhr.responseText);

            // 댓글 개수 표시
            const commentCountElem = document.getElementById('commentCount');
            commentCountElem.textContent = comments.length;

            if (comments.length === 0) {
                $commentContainer.innerHTML = '<div class="no-comments">등록된 댓글이 없습니다.</div>';
                return;
            }
            $commentContainer.innerHTML = '';

            // 최상위 댓글 필터링
            const rootComments = comments.filter(c => !c.commentId);

            // 분리된 함수 호출
            appendComments($commentContainer, rootComments, comments);

            attachReplyTextareaAutoHeight();
            attachModifyTextareaAutoHeight();
        };
        xhr.open('GET', `/pin/comment?id=${pinId}`);
        xhr.send();
    };

    // 답글&수정 버튼 처리 로직
    $commentContainer.addEventListener('click', (e) => {

        // 답글 버튼 클릭 -> 답글 폼 열기
        if (e.target.classList.contains('reply')) {
            e.preventDefault();

            // 1. 모든 답글 폼 닫기
            document.querySelectorAll('.reply-form').forEach(form => {
                form.style.display = 'none';
                const textarea = form.querySelector('textarea');
                if (textarea) textarea.value = '';
            });

            // 2. 해당 댓글의 reply-form만 열기
            const commentDiv = e.target.closest('.comment');
            const replyForm = commentDiv.nextElementSibling;

            if (replyForm && replyForm.classList.contains('reply-form')) {
                replyForm.style.display = 'block';
                const textarea = replyForm.querySelector('textarea');
                if (textarea) {
                    textarea.focus();
                    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
                }
                attachReplyTextareaAutoHeight();
            }
            return;
        }

        if (e.target.closest('.reply-form')) {
            // 답글 취소
            if (e.target.classList.contains('cancel')) {
                e.preventDefault();
                const replyForm = e.target.closest('.reply-form');
                const textarea = replyForm.querySelector('textarea');
                textarea.value = '';
                replyForm.style.display = 'none';
                return;
            }

            // 답글 작성
            if (e.target.classList.contains('write')) {
                e.preventDefault();
                const replyForm = e.target.closest('.reply-form');
                const textarea = replyForm.querySelector('textarea');
                const replyContentRaw = textarea.value;
                const replyContent = replyContentRaw.trim();

                if (!replyContent) {
                    toast('답글이 비어있습니다', '답글을 입력해주세요.');
                    return;
                }

                // 부모 댓글 ID 얻기
                const parentCommentId = replyForm.dataset.parentId;
                if (!parentCommentId) {
                    toastAlter('오류', '부모 댓글 ID를 찾을 수 없습니다.');
                    return;
                }

                writeComment({pinId, content: replyContent, commentId: parentCommentId});
                replyForm.style.display = 'none';
                textarea.value = '';
                return;
            }
        }


        // 수정 버튼 클릭 -> 수정 폼 보이기
        if (e.target.classList.contains('modify')) {
            e.preventDefault();

            // 1. 열린 모든 수정 폼 닫기
            document.querySelectorAll('.modify-form').forEach(form => {
                form.style.display = 'none';
                const textarea = form.querySelector('textarea');
                if (textarea) textarea.value = '';
            });

            // 2. 클릭한 댓글의 수정 폼만 열기
            const commentDiv = e.target.closest('.comment');
            const modifyForm = commentDiv.nextElementSibling?.nextElementSibling;

            if (modifyForm && modifyForm.classList.contains('modify-form')) {
                modifyForm.style.display = 'block';  // 수정폼 열기

                const textarea = modifyForm.querySelector('textarea');
                if (textarea) {
                    const originalText = commentDiv.querySelector('.comment-text')?.textContent || '';
                    textarea.value = originalText;
                    textarea.focus();
                    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
                }
                attachModifyTextareaAutoHeight();
            }
            return;
        }

        if (e.target.closest('.modify-form')) {
            // 수정 폼 - 취소 버튼
            if (e.target.classList.contains('cancel')) {
                e.preventDefault();
                const modifyForm = e.target.closest('.modify-form');
                if (modifyForm) {
                    const textarea = modifyForm.querySelector('textarea');
                    textarea.value = ''; // ✨ 내용 초기화
                    modifyForm.style.display = 'none'; // 수정 폼 닫기
                }
                return;
            }

            // 수정 폼 - 작성(저장) 버튼
            if (e.target.classList.contains('write')) {
                e.preventDefault();
                const modifyForm = e.target.closest('.modify-form');
                if (!modifyForm) return;

                const textarea = modifyForm.querySelector('textarea');
                const newContent = textarea.value.trim();
                if (!newContent) {
                    toast('댓글 내용이 비어있습니다', '댓글을 입력해주세요.');
                    return;
                }

                // 수정할 댓글 ID 가져오기 (수정 버튼에서 data-id를 저장하거나 댓글 div 등에서 ID를 참조)
                const commentDiv = modifyForm.previousElementSibling.previousElementSibling;
                const commentId = commentDiv.dataset.id;
                if (!commentId) {
                    toastAlter('오류', '댓글 ID를 찾을 수 없습니다.');
                    return;
                }

                modifyComment({id: commentId, content: newContent});
                modifyForm.style.display = 'none'; // 수정 폼 닫기
                return;
            }
        }
    });
    attachModifyTextareaAutoHeight();

    // 댓글 + 대댓글 재귀 렌더링 함수 (전역 또는 모듈 최상단에)
    function appendComments(container, targetComments, allComments, depth = 0) {
        for (const comment of targetComments) {
            const paddingLeft = 24 * depth;

            const emailPrefix = (comment.nickname || '').trim().toUpperCase();

            container.insertAdjacentHTML('beforeend', `
            <div class="comment ${comment.commentId ? 'reply' : ''} ${comment.deleted ? 'deleted' : ''}" data-id="${comment.id}" style="padding-left: ${paddingLeft}px;">
                <div class="head">
                    <a aria-label="내 프로필" class="profile" href="#" tabindex="0">
                        <div class="profile-img-wrapper">
                            <div class="profile-img-circle" 
                                 style="background-color: ${comment.profileColor || '#CCC'};">
                                 ${emailPrefix}
                            </div>
                        </div>
                    </a>
                </div>
                <div class="body">
                    <div class="body-box-head">
                        <span class="username">${comment.nickname}</span>
                        <span class="comment-text">${comment.deleted ? '(삭제된 댓글입니다.)' : comment.content}</span>
                    </div>
                    <div class="body-box-body">
                        <span class="timestamp">${comment.createdAt.split('T').join(' ')}</span>
                        ${!comment.deleted ? `<a class="reply action" data-id="${comment.id}">답글</a>` : ''}
                        ${!comment.deleted && comment.mine ? `<a class="modify action" data-id="${comment.id}">수정</a>` : ''}
                        ${!comment.deleted && comment.mine ? `<a class="delete action" data-id="${comment.id}">삭제</a>` : ''}
                    </div>
                </div>
            </div>
            <form class="reply-form"  data-parent-id="${comment.id}" style="display:none; padding-left: ${paddingLeft + 24}px;">
                <label class="obj-label">
                    <textarea aria-invalid="false" class="obj-field textarea"
                              name="input" placeholder="답변을 남기세요" spellcheck="false"
                              rows="1"></textarea>
                </label>
                <div class="button-container">
                    <button class="cancel" tabindex="0" type="button">취소</button>
                    <button class="write" tabindex="0" type="button">작성</button>
                </div>
            </form>
            <form class="modify-form" style="display:none; padding-left: ${paddingLeft + 12}px;">
                <label class="obj-label">
                    <textarea aria-invalid="false" class="obj-field textarea"
                              name="input" placeholder="댓글을 입력하세요" spellcheck="false"
                              rows="1"></textarea>
                </label>
                <div class="button-container">
                    <button class="cancel" tabindex="0" type="button">취소</button>
                    <button class="write" tabindex="0" type="button">작성</button>
                </div>
            </form>
            <div class="child-comments" data-parent-id="${comment.id}" style="width: 100%"></div>
        `);

            // 자식 댓글 렌더링 위치 찾아서 재귀 호출
            const commentDiv = container.querySelector(`.comment[data-id="${comment.id}"]`);
            const childContainer = commentDiv.parentElement.querySelector(`.child-comments[data-parent-id="${comment.id}"]`);   // child-comments
            const childComments = allComments.filter(c => String(c.commentId) === String(comment.id));
            if (childComments.length > 0 && childContainer) {
                appendComments(childContainer, childComments, allComments, depth + 1);
            }
        }
    }


    const modifyComment = (args) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('id', args['id']);
        formData.append('content', args['content']);
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
                    window.location.href = '/user/login?loginCheck=expired';
                    break;
                case 'failure_forbidden':
                    window.location.href = '/user/login?loginCheck=forbidden';
                    break;
                case 'failure_absent':
                    toast('댓글을 찾을 수 없습니다', '선택하신 댓글이 존재하지 않거나 삭제된 상태입니다.');
                    break;
                case 'success':
                    loadComments();
                    break;
                default:
                    toastAlter('댓글을 수정하지 못했습니다', '일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
            }
        };
        xhr.open('PATCH', '/pin/comment');
        xhr.send(formData);
    }

    const deleteComment = (commentId) => {
        showAlertToast({
            title: '정말로 댓글을 삭제할까요?',
            caption: '삭제된 댓글은 복구가 어렵습니다.',
            duration: 10100,
            buttonText: '삭제하기',
            onButtonClick: () => {
                const xhr = new XMLHttpRequest();
                const formData = new FormData();
                formData.append('id', commentId);
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
                            window.location.href = '/user/login?loginCheck=expired';
                            break;
                        case 'failure_forbidden':
                            window.location.href = '/user/login?loginCheck=forbidden';
                            break;
                        case 'failure_absent':
                            toast('댓글을 찾을 수 없습니다', '선택하신 댓글이 존재하지 않거나 삭제된 상태입니다.');
                            break;
                        case 'success':
                            toast('삭제 완료!', '댓글이 성공적으로 삭제되었습니다.');
                            loadComments();
                            break;
                        default:
                            toastAlter('댓글을 삭제하지 못했습니다', '일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
                    }
                };
                xhr.open('DELETE', '/pin/comment');
                xhr.send(formData);
            }
        });
    }

    $commentContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete')) {
            e.preventDefault();
            const commentId = e.target.dataset.id;
            if (commentId) deleteComment(commentId);
        }
    });

    function writeComment({pinId, content, commentId = null}) {
        if (!content.trim()) {
            toast('댓글 내용이 비어있습니다', '댓글을 입력해주세요.');
            return;
        }

        const formData = new FormData();
        formData.append('pinId', pinId);
        formData.append('content', content);
        if (commentId) {
            formData.append('commentId', commentId);
        }

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
                    window.location.href = '/user/login?loginCheck=expired';
                    break;
                case 'failure_forbidden':
                    window.location.href = '/user/login?loginCheck=forbidden';
                    break;
                case 'failure_invalid':
                    toast('입력값이 올바르지 않습니다', '내용을 다시 한 번 확인해 주세요.');
                    break;
                case 'success':
                    loadComments();
                    break;
                default:
                    toastAlter('댓글을 저장하지 못했습니다', '일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
            }
        };
        xhr.open('POST', '/pin/comment');
        xhr.send(formData);
    }

    $commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const textarea = $commentForm.querySelector('textarea');
        const commentContentRaw = textarea.value;
        const commentContent = commentContentRaw.trim();
        writeComment({pinId, content: commentContent});
        textarea.value = '';
    });

    loadComments();
});

// 페이지 로드 시 저장 완료 토스트 표시
window.onload = () => {
    if (sessionStorage.getItem('showToast') === 'true') {
        showToast({
            title: '핀 저장이 완료되었습니다',
            caption: '내 보드에서 확인해 보세요.',
            duration: 8100,
            buttonText: '이동하기',
            onButtonClick: () => {
                window.location.href = '/user/myPage';
            }
        });
        sessionStorage.removeItem('showToast');
    }
    if (sessionStorage.getItem('showToast-write') === 'true') {
        toast('수정 완료', '핀 정보가 정상적으로 수정되었습니다.');
        sessionStorage.removeItem('showToast-write');
    }
};