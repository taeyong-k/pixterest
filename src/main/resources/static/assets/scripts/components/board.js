const $board = document.getElementById('board');
const $boardName = document.querySelector('.board-label-name');
const $boardNameLabel = $boardName.querySelector(':scope > .board-label-wrapper > .board-label');
const $boardNameInput = $boardNameLabel.querySelector(':scope > .input');
const $warningEmpty = $boardNameLabel.querySelector('.caption.empty');
const $warningLength = $boardNameLabel.querySelector('.caption.length');
const $boardButton = document.querySelector('.board-button .button');

const NameRegex = /^.{1,50}$/;

// warning: 1~50자, 빈칸
$boardNameInput.addEventListener('input', () => {
    if ($boardNameInput.value.trim() === '') {            // 빈칸 (경고)
        $boardNameLabel.classList.add('-invalid');
        $warningEmpty.hidden = false;
        $warningLength.hidden = true;
        $boardButton.classList.remove('-visible');
    } else if (!NameRegex.test($boardNameInput.value)) {
        $boardNameLabel.classList.add('-invalid');        // 50자 초과 (경고)
        $warningEmpty.hidden = true;
        $warningLength.hidden = false;
        $boardButton.classList.remove('-visible');
    } else {
        $boardNameLabel.classList.remove('-invalid');     // 정상 범위 (1~50자)
        $warningEmpty.hidden = true;
        $warningLength.hidden = true;
        $boardButton.classList.add('-visible');
    }
});

$boardButton.addEventListener('click', () => {
    const name = $boardNameInput.value.trim();

    if (name && !NameRegex.test(name)) {
        $boardNameLabel.classList.add('-invalid');
        $boardNameLabel.focus();
        $boardNameInput.select();
        return;
    }
    
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('name', name);
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
            case 'failure_duplicate':
                toast('이미 사용 중인 이름입니다', '다른 보드 이름을 입력해 주세요.');
                break;
            case 'success':
                $board.style.display = "none";
                showToast({
                    title: '보드 생성이 완료되었습니다',
                    caption: '내 보드에서 확인해 보세요.',
                    duration: 8100,
                    buttonText: '이동하기',
                    onButtonClick: () => {
                        window.location.href = '/user/myPage';       // ★핀 모여있는 페이지로 변경하기!!★
                    }
                });
                break;
            default:
                toastAlter('보드를 생성하지 못했습니다', '일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
        }
    };
    xhr.open('POST', '/creation/board');
    xhr.send(formData);
});













