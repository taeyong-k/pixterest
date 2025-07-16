import MasonryInit from '../../../assets/scripts/libraries/masonry.js';

document.addEventListener('DOMContentLoaded', () => {
    MasonryInit();

    // home-page: 핀 저장하기
    document.querySelectorAll('.overlay .save-button').forEach(($btn) => {
        $btn.addEventListener('click', () => {
            const pinId = $btn.dataset.pinId;
            
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
                console.log(response.result)
                switch (response.result) {
                    case 'failure_session_expired':
                        window.location.href = '/user/login?loginCheck=expired'
                        break;
                    case 'failure_forbidden':
                        window.location.href = '/user/login?loginCheck=forbidden'
                        break;
                    case 'failure_board_absent':
                        toast('핀을 찾을 수 없습니다', '선택하신 핀이 존재하지 않거나 삭제된 상태입니다.');
                        break;
                    case 'failure_duplicate':
                        toast('이미 저장된 핀입니다', '선택하신 핀이 이미 내 보드에 저장되어 있습니다.');
                        break;
                    case 'success':
                        $btn.classList.add('active');
                        $btn.textContent = "저장됨"
                        sessionStorage.setItem('showToast', 'true');
                        window.location.reload();
                        break;
                    default:
                        toastAlter('핀을 저장하지 못했습니다', '일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
                }
            };
            xhr.open('POST', '/');
            xhr.send(formData);
        });
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
});









// 진행중
document.querySelectorAll('.img-wrapper').forEach(img => {
    img.addEventListener('click', (e) => {
        if (e.target.closest('.save-button') || e.target.closest('.extra-button')) return;


    });
});
