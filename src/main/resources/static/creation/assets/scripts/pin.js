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

    const titleRegex = /^.{1,100}$/;
    const contentRegex = /^.{1,800}$/;
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

    // $pinTagInput.addEventListener('blur', () => {
    //     const val = $pinTagInput.value;
    //
    //     if (val !== '' && val.trim() === '') {
    //         $pinTagLabel.classList.add('-invalid');
    //     } else {
    //         $pinTagLabel.classList.remove('-invalid');
    //     }
    // });

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
            alert("이미지를 업로드 해주세요."); // ★모달로 변경★
            return;
        }

        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('link', link);
        formData.append('tag', tag);
        formData.append('image', imageFile);
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            if (xhr.status < 200 || xhr.status >= 300) {
                alert('요청: 처리 오류!!'); // ★모달로 변경★
                return;
            }
            const response =JSON.parse(xhr.responseText);
            switch (response.result) {
                case 'temp':        // ★임시로 쓰는 코드(삭제요망)★
                    alert('임시!!')
                    break;
                case 'failure_login':   // 비_로그인 상태
                    alert('결과: 비 로그인 상태'); // ★모달로 변경★
                    break;
                case 'failure_invalid': // 유효성 검사 실패
                    alert('결과: 정규표현식 실패'); // ★모달로 변경★
                    break;
                case 'failure_no_image': // 이미지 저장 실패
                    alert('결과: 이미지 미첨부'); // ★모달로 변경★
                    break;
                case 'success':
                    alert('결과: 만들기 성공!'); // ★모달로 변경★
                    window.location.reload();
                    break;
                default:
                    alert('결과: 이유 모를 오류'); // ★모달로 변경★
            }
        };
        xhr.open('POST', '/creation/pin');
        xhr.send(formData);

    };















});

























