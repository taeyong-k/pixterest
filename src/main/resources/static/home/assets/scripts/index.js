import MasonryInit from '../../../assets/scripts/libraries/masonry.js';

document.addEventListener('DOMContentLoaded', () => {
    const loading = document.getElementById('loading');
    const grid = document.querySelector('.grid');
    if (!grid) return;

    // 초기 숨김
    grid.style.display= 'none';
    grid.style.opacity = '0';

    const startTime = performance.now(); // 로딩 시작 시간

    window.imagesLoaded(grid, () => {
        const elapsed = performance.now() - startTime;

        const showGrid = () => {
            loading.classList.remove('-visible');  // 스피너 제거
            grid.style.display = 'block';         // 그리드 보이기
            grid.style.opacity = '1';             // 부드럽게 나타나게

            // Masonry 안정적 계산
            requestAnimationFrame(() => {
                MasonryInit();
                requestAnimationFrame(() => MasonryInit());
            });
        };

        if (elapsed > 100) {
            loading.classList.add('-visible');    // 스피너 최소 표시
            setTimeout(showGrid, 100);
        } else {
            setTimeout(showGrid, 90);            // 빠르게 끝나면 바로 보여주기
        }
    });

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
                        sessionStorage.setItem('showToast-save', 'true');
                        window.location.reload();
                        break;
                    default:
                        toastAlter('핀을 저장하지 못했습니다', '일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
                }
            };
            xhr.open('POST', '/');
            xhr.send(formData);
        });
    });

    // 핀 - 상세페이지
    document.querySelectorAll('.img-wrapper').forEach(wrapper => {
        wrapper.addEventListener('click', (e) => {
            // 저장 버튼이나 추가 버튼 클릭 시 상세 페이지 이동 막기
            if (e.target.closest('.save-button') || e.target.closest('.extra-button')) return;

            // .img-wrapper 내부의 save-button에서 pinId 가져오기
            const saveButton = wrapper.querySelector('.save-button');
            if (!saveButton) {
                console.warn('save-button 요소가 없습니다.');
                return;
            }
            const pinId = saveButton.dataset.pinId;
            if (!pinId) {
                console.warn('pinId가 없습니다.');
                return;
            }

            // 상세 페이지로 이동 (id 쿼리 파라미터 전달)
            window.location.href = `/pin/?id=${pinId}`;
        });
    });


});

window.onload = () => {
    if (sessionStorage.getItem('showToast-save') === 'true') {
        showToast({
            title: '핀 저장이 완료되었습니다',
            caption: '내 보드에서 확인해 보세요.',
            duration: 8100,
            buttonText: '이동하기',
            onButtonClick: () => {
                window.location.href = '/user/myPage';
            }
        });
        sessionStorage.removeItem('showToast-save');
    }
};








