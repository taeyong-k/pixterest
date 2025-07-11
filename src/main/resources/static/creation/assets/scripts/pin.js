document.addEventListener('DOMContentLoaded', () => {
    // ✅ 팝업 기능
    const $boardFlyoutButton = document.querySelector('.pin-label-board-button');
    const $boardFlyout = document.querySelector('#boardFlyout');

    $boardFlyoutButton.addEventListener('click', (e) => {
        e.stopPropagation(); // 다른 클릭 이벤트에 영향 주지 않도록 방지
        $boardFlyout.classList.toggle('-visible');
    });

    // 팝업 바깥 클릭 시 닫기
    document.addEventListener('click', (e) => {
        const isClickInsideButton = $boardFlyoutButton.contains(e.target);
        const isClickInsideFlyout = $boardFlyout.contains(e.target);

        if (!isClickInsideButton && !isClickInsideFlyout) {
            $boardFlyout.classList.remove('-visible');
        }
    });

    // ✅ 팝업 요소 저장 setting
    const $boardInfo = document.querySelectorAll('.board-info');
    let selectedBoardId = null;

    $boardInfo.forEach($board => {
        $board.addEventListener('click', () => {
            selectedBoardId = $board.dataset.boardId;       // [선택한] 보드 data-id
                                                            // [선택한] 보드 name
            const $boardName = $board.querySelector(':scope > .board-name > .name')?.innerText;
            const $boardUrl = $board.dataset.boardUrl;      // [선택한] 보드 data-url

            const $boardFlyoutButtonText = $boardFlyoutButton.querySelector('.name');           // [화면] 보드 name
            if ($boardFlyoutButtonText) {
                $boardFlyoutButtonText.innerText = $boardName;
                $boardFlyoutButtonText.style.fontWeight = "700";
            }

            const $boardFlyoutButtonImg = $boardFlyoutButton.querySelector('img.thumbnailImg'); // [화면] 보드 img
            if ($boardFlyoutButtonImg) {
                if ($boardUrl) {
                    $boardFlyoutButtonImg.src = $boardUrl;
                    $boardFlyoutButtonImg.style.display = "block";
                } else {
                    $boardFlyoutButtonImg.style.display = "none";
                }
            }

            $boardFlyout.classList.remove('-visible');
        });
    });

    // ✅ 파일 업로드 기능
    const $fileUpload = document.getElementById('file-upload');
    const $preview = document.querySelector('.pin-upload-preview');
    const $pinLabelLayout = document.querySelector('.pin-label-layout');
    const $previewClearBtn = $preview.querySelector('.preview-clear-btn');
    const $pinPost = document.querySelector('.pin-post');

    $fileUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];         // 선택한 파일 선택 (event.target - 이벤트가 일어날 객체를 말한다)

        const reader = new FileReader();        // FileReader 객체로 화면에 이미지 보여주기
        reader.onload = function () {
            $preview.style.backgroundImage = `url(${reader.result})`;
            document.querySelector('.pin-upload-wrapper').classList.add('-hidden');
            $preview.classList.add('-visible');
            $previewClearBtn.classList.add('-visible');
            $pinLabelLayout.style.opacity = "1";
            $pinLabelLayout.style.pointerEvents = "auto";
            $pinPost.classList.add('-visible');
        };
        reader.readAsDataURL(file);
    });

    // ✅ 파일 업로드 삭제 버튼
    $previewClearBtn.addEventListener("click", () => {
        $fileUpload.value = "";
        $preview.style.backgroundImage = "none";
        document.querySelector('.pin-upload-wrapper').classList.remove('-hidden');
        $preview.classList.remove('-visible');
        $previewClearBtn.classList.remove('-visible');
        $pinLabelLayout.style.opacity = "0.4";
        $pinLabelLayout.style.pointerEvents = "none";
        $pinPost.classList.remove('-visible');
    });

    // ✅ 정규표현식 & -warning 기능
    const $pinTitle = document.querySelector('.pin-label-title');
    const $pinTitleLabel = $pinTitle.querySelector(':scope > .pin-label');
    const $pinTitleInput = $pinTitleLabel.querySelector(':scope > .input');

    const $pinContent = document.querySelector('.pin-label-content');
    const $pinContentLabel = $pinContent.querySelector(':scope > .pin-label-wrapper > .pin-label');
    const $pinContentTextarea = $pinContentLabel.querySelector(':scope > .textarea');

    const $pinUrl = document.querySelector('.pin-label-link');
    const $pinUrlLabel = $pinUrl.querySelector(':scope > .pin-label-wrapper > .pin-label');
    const $pinUrlInput = $pinUrlLabel.querySelector(':scope > .input');

    const $pinTag = document.querySelector('.pin-label-tag');
    const $pinTagLabel = $pinTag.querySelector(':scope > .pin-label-wrapper > .pin-label');
    const $pinTagInput = $pinTagLabel.querySelector(':scope > .input');

    const titleRegex = /^.{0,100}$/;
    const contentRegex = /^.{0,800}$/;
    const urlRegex = /^(https?):\/\/([a-z0-9-]+\.)+[a-z0-9]{2,}(\/.*)?$/i;

    $pinTitleInput.addEventListener('input', () => {
        if ($pinTitleInput.value.trim() !== '' && !titleRegex.test($pinTitleInput.value)) {
            $pinTitleLabel.classList.add('-invalid');
        } else {
            $pinTitleLabel.classList.remove('-invalid');
        }
    });

    $pinContentTextarea.addEventListener('input', () => {   // 입력 중 실시간 검사
        if ($pinContentTextarea.value.trim() !== '' && !contentRegex.test($pinContentTextarea.value)) {
            $pinContentLabel.classList.add('-invalid');
        } else {
            $pinContentLabel.classList.remove('-invalid');
        }
    });

    $pinUrlInput.addEventListener('blur', () => {           // 입력 끝나고 포커스 빠질 때 검사
        if ($pinUrlInput.value.trim() !== '' && !urlRegex.test($pinUrlInput.value)) {
            $pinUrlLabel.classList.add('-invalid');
        } else {
            $pinUrlLabel.classList.remove('-invalid');
        }
    });

    // ✅ 핀 만들기
    const $pinPostBtn = document.getElementById('pin-post-btn');

    $pinPostBtn.onsubmit = (e) => {
        e.preventDefault();

        const title = $pinTitleInput.value.trim();
        const content = $pinContentTextarea.value.trim();
        const link = $pinUrlInput.value.trim();
        const tag = $pinTagInput.value.trim();
        const imageFile = $fileUpload.files[0];

        if (title && !titleRegex.test(title)) {
            $pinTitleLabel.classList.add('-invalid');
            $pinTitleLabel.focus();
            $pinTitleInput.select();
            return;
        }

        if (content && !contentRegex.test(content)) {
            $pinContentLabel.classList.add('-invalid');
            $pinContentLabel.focus();
            $pinContentTextarea.select();
            return;
        }

        if (link && !urlRegex.test(link)) {
            $pinUrlLabel.classList.add('-invalid');
            $pinUrlLabel.focus();
            $pinUrlInput.select();
            return;
        }

        if (!imageFile) {
            toast('이미지가 필요합니다', '이미지를 업로드 해주세요.');
            return;
        }

        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('link', link);
        formData.append('tag', tag);
        // formData.append('image', imageFile);
        if (selectedBoardId) {
            formData.append('boardId', selectedBoardId);
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
                case 'failure_invalid':
                    toast('입력값이 올바르지 않습니다', '내용을 다시 한 번 확인해 주세요.');
                    break;
                // case 'failure_no_image':
                //     toast('이미지가 필요합니다', '핀을 등록하려면 이미지를 첨부해 주세요.');
                //     break;
                case 'failure_board_absent':
                    toast('보드를 찾을 수 없습니다', '선택하신 보드가 존재하지 않거나 삭제된 상태입니다.');
                    break;
                case 'failure_board_forbidden':
                    toastAlter('보드 접근 불가', '선택한 보드에 접근 권한이 없습니다.\n다시 선택해 주세요.');
                    break;
                case 'success':
                    sessionStorage.setItem('showToast', 'true');
                    window.location.reload();
                    break;
                default:
                    toastAlter('핀을 저장하지 못했습니다', '일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
            }
        };
        xhr.open('POST', '/creation/pin');
        xhr.send(formData);
    };
    // 페이지가 다시 로드될 때 (페이지 새로고침)
    window.onload = () => {
        if (sessionStorage.getItem('showToast') === 'true') {
            showToast({
                title: '핀 저장이 완료되었습니다',
                caption: '내 보드에서 확인해 보세요.',
                duration: 8100,
                buttonText: '이동하기',
                onButtonClick: () => {
                    window.location.href = '/user/login';       // ★핀 모여있는 페이지로 변경하기!!★
                }
            });
            sessionStorage.removeItem('showToast');
        }   // sessionStorage = 임시 저장 공간 (탭 안에서는 데이터가 유지)
    };


});