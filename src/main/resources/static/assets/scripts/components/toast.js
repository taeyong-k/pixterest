function showToast({title = '알림', caption = '내용', duration = 5100}) {
    const toast = document.querySelector('[data-toast]');
    const titleEl = toast.querySelector('[data-toast-title]');
    const captionEl = toast.querySelector('[data-toast-caption]');
    const countdown = toast.querySelector('.countdown');
    const closeBtn = toast.querySelector('.close-button');

    let remaining = Math.floor(duration / 1000);
    const animationDuration = 400; // ms (CSS 애니메이션 시간)

    titleEl.textContent = title;
    captionEl.textContent = caption;
    countdown.textContent = `${remaining}s`;

    toast.classList.remove('hide');
    toast.style.display = 'flex';

    // toast: show
    setTimeout(() => {
        toast.classList.add('show');
    }, 50);

    // 카운트다운
    const intervalId = setInterval(() => {  // setInterval(fn, interval): 지정한 시간마다(주기적으로) fn 함수를 계속 실행해 줌. (무한반복)
        remaining--;
        countdown.textContent = `${remaining}s`;

        if (remaining <= 0) {
            clearInterval(intervalId);      // 0일때 반복 중단
        }
    }, 1000);

    // 수동 닫기 눌렀을 때도 인터벌 클리어 & 토스트 숨기기
    closeBtn.onclick = () => {
        clearInterval(intervalId);
        hideToast(toast);
    };

    // 5초 후 토스트 숨기기
    setTimeout(() => {
        clearInterval(intervalId);
        hideToast(toast);
    }, duration);


    // toast: hide 함수
    function hideToast(toast) {
        toast.classList.remove('show');
        toast.classList.add('hide');
        setTimeout(() => {
            toast.style.display = 'none';
        }, animationDuration);
    }
}

function toast(title, caption, duration = 5100) {   // 기본 5초 (여유 + 0.1s)
    showToast({ title, caption, duration });
}