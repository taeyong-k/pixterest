let toastTimeout = null;        // 토스트 자동 숨김 타이머
let toastInterval = null;       // 초 카운트다운을 담당 타이머

function showToast({
                       title = '알림',
                       caption = '내용',
                       duration = 5100,
                       showButton = true,
                       buttonText = '이동하기',
                       onButtonClick = null
                   }) {
    const toast = document.querySelector('[data-toast]');
    const titleEl = toast.querySelector('[data-toast-title]');
    const captionEl = toast.querySelector('[data-toast-caption]');
    const countdown = toast.querySelector('.countdown');
    const closeBtn = toast.querySelector('.close-button');
    const buttonContainer = toast.querySelector('.button-container');
    const ctaButton = toast.querySelector('.cta-button');

    clearInterval(toastInterval);
    clearTimeout(toastTimeout);

    let remaining = Math.floor(duration / 1000);
    const animationDuration = 400; // ms (CSS 애니메이션 시간)

    titleEl.textContent = title;
    captionEl.textContent = caption;
    countdown.textContent = `${remaining}s`;

    // 버튼 표시 여부 처리
    if (showButton) {
        buttonContainer.classList.add('-visible');
        ctaButton.textContent = buttonText;
        ctaButton.onclick = () => {
            if (typeof onButtonClick === 'function') {
                onButtonClick();
            }
            closeBtn.click();
        };
    } else {
        buttonContainer.classList.remove('-visible');
        ctaButton.onclick = null;
    }

    const isShowing = toast.classList.contains('show'); // 토스트가 보여질때 애니메이션 재실행 방지
    toast.classList.remove('hide');         // 안전하게 '확실히' hide가 없도록 하기 위함
    toast.style.display = 'flex';

    if (!isShowing) {
        // "애니메이션 재실행을 위해 애니메이션 상태를 초기화하는 작업"
        toast.classList.remove('show', 'hide'); // 애니메이션 없는 기본상태로 리셋
        void toast.offsetWidth;                 // 강제 리플로우: 클래스가 완전히 제거되어 반영된 상태

        // toast: show
        setTimeout(() => {
            toast.classList.add('show');
        }, 20);
    }

    // 카운트다운
    toastInterval = setInterval(() => {  // setInterval(fn, interval): 지정한 시간마다(주기적으로) fn 함수를 계속 실행해 줌. (무한반복)
        remaining--;
        countdown.textContent = `${remaining}s`;

        if (remaining <= 0) {
            clearInterval(toastInterval);      // 0일때 반복 중단
        }
    }, 1000);

    // 수동 닫기 눌렀을 때도 인터벌 클리어 & 토스트 숨기기
    closeBtn.onclick = () => {
        clearInterval(toastInterval);
        clearTimeout(toastTimeout);
        hideToast(toast);
    };

    // 5초 후 토스트 숨기기
    toastTimeout = setTimeout(() => {
        clearInterval(toastTimeout);
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

let alertToastTimeout = null;
let alertToastInterval = null;

// 경고 toast 메시지
function showAlertToast({
                            title = '경고',
                            caption = '중요 알림',
                            duration = 8100,
                            showButton = true,
                            buttonText = '이동하기',
                            onButtonClick = null
                        }) {
    const toastAlter = document.querySelector('[data-toast-alert]');
    const titleEl = toastAlter.querySelector('[data-toast-alter-title]');
    const captionEl = toastAlter.querySelector('[data-toast-alter-caption]');
    const countdown = toastAlter.querySelector('.countdown');
    const closeBtn = toastAlter.querySelector('.close-button');
    const buttonContainer = toastAlter.querySelector('.button-container');
    const ctaButton = toastAlter.querySelector('.cta-button');
    const animationDuration = 400;

    // ✅ 기존 토스트 타이머 정리
    clearTimeout(alertToastTimeout);
    clearInterval(alertToastInterval);

    // ✅ 텍스트 설정
    titleEl.textContent = title;
    captionEl.textContent = caption;

    // ✅ 텍스트 설정
    if (showButton) {
        buttonContainer.classList.add('-visible');
        ctaButton.textContent = buttonText;
        ctaButton.onclick = () => {
            if (typeof onButtonClick === 'function') {
                onButtonClick();
            }
            closeBtn.click();
        };
    } else {
        buttonContainer.classList.remove('-visible');
        ctaButton.onclick = null;
    }

    // ✅ 토스트가 이미 실행되있다면 등장 애니메이션 재실행 하지 않기
    const isShowing = toastAlter.classList.contains('show');
    toastAlter.style.display = 'flex';

    if (!isShowing) {
        // ✅ 트랜지션 재적용 위한 리셋
        toastAlter.classList.remove('show', 'hide');
        void toastAlter.offsetWidth; // ⭐ 리플로우: 트랜지션 재시작 트릭

        // ✅ 토스트 보여주기
        setTimeout(() => {
            toastAlter.classList.add('show');
        }, 20);
    }

    // ✅ 카운트다운 시작
    let remaining = Math.floor(duration / 1000);
    countdown.textContent = `${remaining}s`;

    alertToastInterval = setInterval(() => {
        remaining--;
        countdown.textContent = `${remaining}s`;
        if (remaining <= 0) clearInterval(alertToastInterval);
    }, 1000);

    // ✅ 닫기 버튼
    closeBtn.onclick = () => {
        clearInterval(alertToastInterval);
        clearTimeout(alertToastTimeout);
        hide();
    };

    // ✅ 자동 닫기 타이머 저장
    alertToastTimeout = setTimeout(() => {
        clearInterval(alertToastInterval);
        hide();
    }, duration);

    // ✅ 닫힘 애니메이션
    function hide() {
        toastAlter.classList.remove('show');
        toastAlter.classList.add('hide');
        setTimeout(() => {
            toastAlter.style.display = 'none';
        }, animationDuration);
    }
}

function toast(title, caption, duration = 5100, showButton = false) {   // 기본 5초 (여유 + 0.1s)
    showToast({title, caption, duration, showButton});
}

function toastAlter(title, caption, duration = 8100, showButton = false) {
    showAlertToast({title, caption, duration, showButton});
}

// 페이지 이동 + toast 띄우기
function checkToastParam() {
    const params = new URLSearchParams(window.location.search);
    const valLogin = params.get('loginCheck');       // 로그인 관련
    const valPin = params.get('pin');                // 핀 관련

    if (valLogin === 'false') {
        toast('로그인이 필요합니다', '서비스 이용을 위해 로그인이 필요합니다.');
        cleanUrl();
    } else if (valLogin === 'expired') {
        toast('로그인이 필요합니다', '세션이 만료되었거나 로그인 상태가 아닙니다.\n다시 로그인해주세요.');
        cleanUrl();
    } else if (valLogin === 'forbidden') {
        toastAlter('접근이 제한되었습니다', '회원님의 계정은 현재 이용이 불가능합니다.\n관리자에게 문의해주세요.');
        cleanUrl();
    }

    if (valPin === 'error') {
        toast('잘못된 접근입니다', '핀 정보가 정상적으로 전달되지 않았습니다.\n다시 시도해주세요.');
        cleanUrl();
    } else if (valPin === 'false') {
        toast('존재하지 않는 핀입니다', '삭제되었거나 존재하지 않는 핀입니다.\n홈으로 이동되었습니다.');
        cleanUrl();
    }

    if (valPin === 'hide') {
        toast('핀 숨기기 완료', '숨긴 핀은 더 이상 보이지 않습니다.');
        cleanUrl();
    }
}

// 페이지 새로고침 시 중복 토스트 방지 (주소지 clean)
function cleanUrl() {
    const clean = window.location.origin + window.location.pathname;
    window.history.replaceState({}, '', clean);
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', checkToastParam);
