let visibleFlyoutSelector = null;
let visibleTriggerSelector = null;
let offsetX = 0;        // 위치 미세 조정을 위한 X축 값
let offsetY = 0;        // 위치 미세 조정을 위한 Y축 값

let currentIconToggleInfo = null;  // 현재 토글된 아이콘 정보 저장

// 이전 토글된 아이콘 원상복구 함수 ✨ 수정 및 추가
function resetPreviousIcon() {
    if (!currentIconToggleInfo) return;

    const icon = document.querySelector(currentIconToggleInfo.iconSelector);
    if (icon) {
        icon.setAttribute('d', currentIconToggleInfo.originalPath);
    }
    currentIconToggleInfo = null;
}

// +@"팝업 닫기 여부"를 결정하는 옵션을 하나 추가 (-> 리사이즈 시에는 기존 팝업 닫지 않고 위치만 다시 계산)
// +@"아이콘 path 토글 함수 추가
function showFlyout(triggerSelector, flyoutSelector, xOffset = 0, yOffset = 0, isToggle = true, iconToggleInfo = null) {
    const trigger = document.querySelector(triggerSelector);        // 트리거 버튼
    const flyout = document.querySelector(flyoutSelector);          // 플라이아웃 요소

    if (!trigger || !flyout) return;

    // ✅ 이미 열린 상태이고, 같은 트리거나 같은 팝업이면 닫기 (토글) +@토글 기능 유지
    if (isToggle && visibleFlyoutSelector === flyoutSelector && visibleTriggerSelector === triggerSelector) {
        hideAllFlyouts();
        return;
    }

    // ✅ 기존 팝업 닫기 여부 선택 가능
    if (isToggle) {
        hideAllFlyouts();
    }

    // 트리거 위치 계산 (스크롤 포함)
    const rect = trigger.getBoundingClientRect();                   // trigger(버튼) 요소의 위치와 크기 정보를 얻습니다. (현재 화면 뷰포트(viewport) 기준)
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;     // 현재 페이지가 렇마나 [세로]로, 스크롤 됐는지 계산(정확한 절대 위치 값 계산)
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;   // 현재 페이지가 렇마나 [가로]로, 스크롤 됐는지 계산(정확한 절대 위치 값 계산)

    // 팝업 위치 설정
    flyout.style.left = `${rect.left + scrollLeft + xOffset}px`;    // 팝업(layout) left 위치 설정
    flyout.style.top = `${rect.bottom + scrollTop + yOffset}px`;    // 팝업(layout) top 위치 설정
    flyout.classList.add("-visible");

    // ✅ 아이콘 path 토글 처리
    if (iconToggleInfo && isToggle) {
        // 이전에 토글된 아이콘이 있고, 다른 아이콘이면 원래 상태로 복구
        if (currentIconToggleInfo && currentIconToggleInfo.iconSelector !== iconToggleInfo.iconSelector) {
            resetPreviousIcon();
        }
        // 현재 토글할 아이콘 설정
        const iconElement = document.querySelector(iconToggleInfo.iconSelector);
        if (iconElement) {
            iconElement.setAttribute('d', iconToggleInfo.toggledPath);
        }
        currentIconToggleInfo = iconToggleInfo;
    }

    // 현재 열려있는 팝업 정보 저장
    visibleFlyoutSelector = flyoutSelector;                         // 현재 열려 있는 요소와 위치 오프셋 기억
    visibleTriggerSelector = triggerSelector;
    offsetX = xOffset;
    offsetY = yOffset;
}

// 화면 크기 변경(resize)이나 스크롤 이벤트가 발생했을 때 호출하는 함수
function updateFlyoutPosition() {
    if (!visibleFlyoutSelector || !visibleTriggerSelector) return;
    // 리사이즈 시 기존 팝업 닫지 않고 위치만 재조정
    showFlyout(visibleTriggerSelector, visibleFlyoutSelector, offsetX, offsetY, false, currentIconToggleInfo);    // 현재 위치, 정보를 이용해 다시 계산해 맞춤!
}

function hideAllFlyouts() {
    const allFlyouts = document.querySelectorAll('.Flyout.-visible');
    allFlyouts.forEach(f => f.classList.remove('-visible'));

    resetPreviousIcon();

    visibleFlyoutSelector = null;
    visibleTriggerSelector = null;
}

// ✨ 클릭 시 해당 아이콘만 토글, 이전 아이콘 복구 포함
function toggleIconPath(iconSelector, originalPath, toggledPath) {
    const icon = document.querySelector(iconSelector);
    if (!icon) return;

    // 이전 토글된 아이콘이 현재 아이콘과 다르면 원래 상태로 복구
    if (currentIconToggleInfo && currentIconToggleInfo.iconSelector !== iconSelector) {
        resetPreviousIcon();
    }

    const currentPath = icon.getAttribute('d');

    if (currentPath === originalPath) {
        icon.setAttribute('d', toggledPath);
        currentIconToggleInfo = {iconSelector, originalPath, toggledPath};
    } else {
        icon.setAttribute('d', originalPath);
        currentIconToggleInfo = null;
    }
}

// +++ 페이지 로드 시 현재 URL에 맞게 아이콘 초기 활성화 설정 +++
// 초기 상태로 아이콘 path 바꾸고 currentIconToggleInfo도 세팅
function setInitialIconByCurrentPath() {
    const path = window.location.pathname;

    if (path === '/' || path === '/home') {
        // home 아이콘 활성화
        const homeIcon = document.querySelector('.home-logo-button svg path');
        if (homeIcon) {
            homeIcon.setAttribute('d', 'M9.59.92a3.63 3.63 0 0 1 4.82 0l7.25 6.44A4 4 0 0 1 23 10.35v8.46a3.9 3.9 0 0 1-3.6 3.92 106 106 0 0 1-14.8 0A3.9 3.9 0 0 1 1 18.8v-8.46a4 4 0 0 1 1.34-3zM12 16a5 5 0 0 1-3.05-1.04l-1.23 1.58a7 7 0 0 0 8.56 0l-1.23-1.58A5 5 0 0 1 12 16');
            currentIconToggleInfo = {
                iconSelector: '.home-logo-button svg path',
                originalPath: 'M4.6 22.73A107 107 0 0 0 11 23h2.22c2.43-.04 4.6-.16 6.18-.27A3.9 3.9 0 0 0 23 18.8v-8.46a4 4 0 0 0-1.34-3L14.4.93a3.63 3.63 0 0 0-4.82 0L2.34 7.36A4 4 0 0 0 1 10.35v8.46a3.9 3.9 0 0 0 3.6 3.92M13.08 2.4l7.25 6.44a2 2 0 0 1 .67 1.5v8.46a1.9 1.9 0 0 1-1.74 1.92q-1.39.11-3.26.19V16a4 4 0 0 0-8 0v4.92q-1.87-.08-3.26-.19A1.9 1.9 0 0 1 3 18.81v-8.46a2 2 0 0 1 .67-1.5l7.25-6.44a1.63 1.63 0 0 1 2.16 0M13.12 21h-2.24a1 1 0 0 1-.88-1v-4a2 2 0 1 1 4 0v4a1 1 0 0 1-.88 1',
                toggledPath: 'M9.59.92a3.63 3.63 0 0 1 4.82 0l7.25 6.44A4 4 0 0 1 23 10.35v8.46a3.9 3.9 0 0 1-3.6 3.92 106 106 0 0 1-14.8 0A3.9 3.9 0 0 1 1 18.8v-8.46a4 4 0 0 1 1.34-3zM12 16a5 5 0 0 1-3.05-1.04l-1.23 1.58a7 7 0 0 0 8.56 0l-1.23-1.58A5 5 0 0 1 12 16'
            };
        }
    } else if (path.startsWith('/creation')) {
        // creation 아이콘 활성화
        const creationIcon = document.querySelector('.creation-logo-button svg path');
        if (creationIcon) {
            creationIcon.setAttribute('d', 'M1 5a4 4 0 0 1 4-4h14a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H5a4 4 0 0 1-4-4zm10 6H6v2h5v5h2v-5h5v-2h-5V6h-2z');
            currentIconToggleInfo = {
                iconSelector: '.creation-logo-button svg path',
                originalPath: 'M11 11H6v2h5v5h2v-5h5v-2h-5V6h-2zM5 1a4 4 0 0 0-4 4v14a4 4 0 0 0 4 4h14a4 4 0 0 0 4-4V5a4 4 0 0 0-4-4zm16 4v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h14a2 2 0 0 1 2 2',
                toggledPath: 'M1 5a4 4 0 0 1 4-4h14a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H5a4 4 0 0 1-4-4zm10 6H6v2h5v5h2v-5h5v-2h-5V6h-2z'
            };
        }
    } else if (path.startsWith('/option')) {
        // option 아이콘 활성화
        const optionIcon = document.querySelector('.option-logo-button svg path');
        if (optionIcon) {
            optionIcon.setAttribute('d', 'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0M14.7.3c.73.18 1.25.74 1.43 1.41l.58 2.14 2.14-.57a2 2 0 0 1 1.93.54 12 12 0 0 1 2.7 4.67c.21.72-.01 1.46-.5 1.95L21.4 12l1.57 1.57c.49.49.72 1.23.5 1.94a12 12 0 0 1-2.7 4.67c-.51.55-1.27.73-1.94.55l-2.13-.58-.58 2.14a1.9 1.9 0 0 1-1.43 1.4 12 12 0 0 1-5.4 0 2 2 0 0 1-1.43-1.4l-.58-2.14-2.14.58c-.66.18-1.42 0-1.93-.54a12 12 0 0 1-2.7-4.68c-.22-.72.01-1.46.5-1.95L2.6 12l-1.57-1.56a2 2 0 0 1-.5-1.95 12 12 0 0 1 2.7-4.67 2 2 0 0 1 1.93-.54l2.14.57.58-2.14c.17-.66.7-1.23 1.43-1.4a12 12 0 0 1 5.4 0M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10');
            currentIconToggleInfo = {
                iconSelector: '.option-logo-button svg path',
                originalPath: 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10m3 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0m1.13-10.29A2 2 0 0 0 14.7.31a12 12 0 0 0-5.4 0c-.73.17-1.26.74-1.43 1.4l-.58 2.14-2.14-.57a2 2 0 0 0-1.93.54 12 12 0 0 0-2.7 4.67c-.22.72.01 1.46.5 1.95L2.59 12l-1.57 1.56a2 2 0 0 0-.5 1.95 12 12 0 0 0 2.7 4.68c.51.54 1.27.72 1.93.54l2.14-.58.58 2.14c.17.67.7 1.24 1.43 1.4a12 12 0 0 0 5.4 0 2 2 0 0 0 1.43-1.4l.58-2.14 2.13.58c.67.18 1.43 0 1.94-.55a12 12 0 0 0 2.7-4.67 2 2 0 0 0-.5-1.94L21.4 12l1.57-1.56c.49-.5.71-1.23.5-1.95a12 12 0 0 0-2.7-4.67 2 2 0 0 0-1.93-.54l-2.14.57zm-6.34.54a10 10 0 0 1 4.42 0l.56 2.12a2 2 0 0 0 2.45 1.41l2.13-.57a10 10 0 0 1 2.2 3.83L20 10.59a2 2 0 0 0 0 2.83l1.55 1.55a10 10 0 0 1-2.2 3.82l-2.13-.57a2 2 0 0 0-2.44 1.42l-.57 2.12a10 10 0 0 1-4.42 0l-.57-2.12a2 2 0 0 0-2.45-1.42l-2.12.57a10 10 0 0 1-2.2-3.82L4 13.42a2 2 0 0 0 0-2.83L2.45 9.03a10 10 0 0 1 2.2-3.82l2.13.57a2 2 0 0 0 2.44-1.41z',
                toggledPath: 'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0M14.7.3c.73.18 1.25.74 1.43 1.41l.58 2.14 2.14-.57a2 2 0 0 1 1.93.54 12 12 0 0 1 2.7 4.67c.21.72-.01 1.46-.5 1.95L21.4 12l1.57 1.57c.49.49.72 1.23.5 1.94a12 12 0 0 1-2.7 4.67c-.51.55-1.27.73-1.94.55l-2.13-.58-.58 2.14a1.9 1.9 0 0 1-1.43 1.4 12 12 0 0 1-5.4 0 2 2 0 0 1-1.43-1.4l-.58-2.14-2.14.58c-.66.18-1.42 0-1.93-.54a12 12 0 0 1-2.7-4.68c-.22-.72.01-1.46.5-1.95L2.6 12l-1.57-1.56a2 2 0 0 1-.5-1.95 12 12 0 0 1 2.7-4.67 2 2 0 0 1 1.93-.54l2.14.57.58-2.14c.17-.66.7-1.23 1.43-1.4a12 12 0 0 1 5.4 0M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10'
            };
        }
    } else {
        // 기본 상태로 아이콘 리셋 (모든 아이콘 원래 path로)
        resetPreviousIcon();
    }
}

// document.addEventListener('DOMContentLoaded', () => {
//     setInitialIconByCurrentPath();
// });
document.addEventListener('DOMContentLoaded', () => {
    setInitialIconByCurrentPath();

// 버튼 클릭 시 각각의 팝업 표시
    document.querySelector('.home-logo-button a').addEventListener('click', (e) => {
        e.preventDefault();  // 일단 이동 막고

        const targetHref = e.currentTarget.href;

        toggleIconPath(
            '.home-logo-button svg path',
            'M4.6 22.73A107 107 0 0 0 11 23h2.22c2.43-.04 4.6-.16 6.18-.27A3.9 3.9 0 0 0 23 18.8v-8.46a4 4 0 0 0-1.34-3L14.4.93a3.63 3.63 0 0 0-4.82 0L2.34 7.36A4 4 0 0 0 1 10.35v8.46a3.9 3.9 0 0 0 3.6 3.92M13.08 2.4l7.25 6.44a2 2 0 0 1 .67 1.5v8.46a1.9 1.9 0 0 1-1.74 1.92q-1.39.11-3.26.19V16a4 4 0 0 0-8 0v4.92q-1.87-.08-3.26-.19A1.9 1.9 0 0 1 3 18.81v-8.46a2 2 0 0 1 .67-1.5l7.25-6.44a1.63 1.63 0 0 1 2.16 0M13.12 21h-2.24a1 1 0 0 1-.88-1v-4a2 2 0 1 1 4 0v4a1 1 0 0 1-.88 1',
            'M9.59.92a3.63 3.63 0 0 1 4.82 0l7.25 6.44A4 4 0 0 1 23 10.35v8.46a3.9 3.9 0 0 1-3.6 3.92 106 106 0 0 1-14.8 0A3.9 3.9 0 0 1 1 18.8v-8.46a4 4 0 0 1 1.34-3zM12 16a5 5 0 0 1-3.05-1.04l-1.23 1.58a7 7 0 0 0 8.56 0l-1.23-1.58A5 5 0 0 1 12 16'
        );

        // ⏱️ 약간 딜레이 후 원래 링크로 이동
        setTimeout(() => {
            window.location.href = targetHref;
        }, 100); // 100ms 정도면 충분 (눈에 보이게)
    });

    document.querySelector('.creation-logo-button button').addEventListener('click', () => {
        toggleIconPath(
            '.creation-logo-button svg path',
            'M11 11H6v2h5v5h2v-5h5v-2h-5V6h-2zM5 1a4 4 0 0 0-4 4v14a4 4 0 0 0 4 4h14a4 4 0 0 0 4-4V5a4 4 0 0 0-4-4zm16 4v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h14a2 2 0 0 1 2 2',
            'M1 5a4 4 0 0 1 4-4h14a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H5a4 4 0 0 1-4-4zm10 6H6v2h5v5h2v-5h5v-2h-5V6h-2z'
        );

        showFlyout(
            '.creation-logo-button',
            '#creationFlyout',
            63.2778, -142.556,
            true,
            {
                iconSelector: '.creation-logo-button svg path',
                originalPath: 'M11 11H6v2h5v5h2v-5h5v-2h-5V6h-2zM5 1a4 4 0 0 0-4 4v14a4 4 0 0 0 4 4h14a4 4 0 0 0 4-4V5a4 4 0 0 0-4-4zm16 4v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h14a2 2 0 0 1 2 2',
                toggledPath: 'M1 5a4 4 0 0 1 4-4h14a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H5a4 4 0 0 1-4-4zm10 6H6v2h5v5h2v-5h5v-2h-5V6h-2z'
            }
        );
    });


// 팝업 내 핀만들기 버튼
    document.querySelector('#boardFlyout  .flyout-pin-button:nth-child(1) a').addEventListener('click', (e) => {
        e.preventDefault(); // 기본 a 태그 이동 막음
        window.location.href = '/creation/pin';
    });

// 팝업 내 보드만들기 버튼
    document.querySelector('#boardFlyout  .flyout-pin-button:nth-child(2) a').addEventListener('click', (e) => {
        e.preventDefault();
        // 팝업 닫기 (필요시)
        document.getElementById('creationFlyout').setAttribute('aria-hidden', 'true');
        document.getElementById('creationFlyout').style.display = 'none';

        // 아이콘 원상복구 (필요시, toggleIconPath 함수 활용)
        // toggleIconPath(...) // 필요하면 호출

        // #board 요소에 -visible 클래스 추가
        document.getElementById('board').classList.add('-visible');
    });

    document.querySelector('.option-logo-button button').addEventListener('click', () => {
        toggleIconPath(
            '.option-logo-button svg path',
            'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10m3 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0m1.13-10.29A2 2 0 0 0 14.7.31a12 12 0 0 0-5.4 0c-.73.17-1.26.74-1.43 1.4l-.58 2.14-2.14-.57a2 2 0 0 0-1.93.54 12 12 0 0 0-2.7 4.67c-.22.72.01 1.46.5 1.95L2.59 12l-1.57 1.56a2 2 0 0 0-.5 1.95 12 12 0 0 0 2.7 4.68c.51.54 1.27.72 1.93.54l2.14-.58.58 2.14c.17.67.7 1.24 1.43 1.4a12 12 0 0 0 5.4 0 2 2 0 0 0 1.43-1.4l.58-2.14 2.13.58c.67.18 1.43 0 1.94-.55a12 12 0 0 0 2.7-4.67 2 2 0 0 0-.5-1.94L21.4 12l1.57-1.56c.49-.5.71-1.23.5-1.95a12 12 0 0 0-2.7-4.67 2 2 0 0 0-1.93-.54l-2.14.57zm-6.34.54a10 10 0 0 1 4.42 0l.56 2.12a2 2 0 0 0 2.45 1.41l2.13-.57a10 10 0 0 1 2.2 3.83L20 10.59a2 2 0 0 0 0 2.83l1.55 1.55a10 10 0 0 1-2.2 3.82l-2.13-.57a2 2 0 0 0-2.44 1.42l-.57 2.12a10 10 0 0 1-4.42 0l-.57-2.12a2 2 0 0 0-2.45-1.42l-2.12.57a10 10 0 0 1-2.2-3.82L4 13.42a2 2 0 0 0 0-2.83L2.45 9.03a10 10 0 0 1 2.2-3.82l2.13.57a2 2 0 0 0 2.44-1.41z',
            'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0M14.7.3c.73.18 1.25.74 1.43 1.41l.58 2.14 2.14-.57a2 2 0 0 1 1.93.54 12 12 0 0 1 2.7 4.67c.21.72-.01 1.46-.5 1.95L21.4 12l1.57 1.57c.49.49.72 1.23.5 1.94a12 12 0 0 1-2.7 4.67c-.51.55-1.27.73-1.94.55l-2.13-.58-.58 2.14a1.9 1.9 0 0 1-1.43 1.4 12 12 0 0 1-5.4 0 2 2 0 0 1-1.43-1.4l-.58-2.14-2.14.58c-.66.18-1.42 0-1.93-.54a12 12 0 0 1-2.7-4.68c-.22-.72.01-1.46.5-1.95L2.6 12l-1.57-1.56a2 2 0 0 1-.5-1.95 12 12 0 0 1 2.7-4.67 2 2 0 0 1 1.93-.54l2.14.57.58-2.14c.17-.66.7-1.23 1.43-1.4a12 12 0 0 1 5.4 0M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10'
        );

        showFlyout(
            '.option-logo-button',
            '#optionFlyout',
            63.2778, -181.556,
            true,
            {
                iconSelector: '.option-logo-button svg path',
                originalPath: 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10m3 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0m1.13-10.29A2 2 0 0 0 14.7.31a12 12 0 0 0-5.4 0c-.73.17-1.26.74-1.43 1.4l-.58 2.14-2.14-.57a2 2 0 0 0-1.93.54 12 12 0 0 0-2.7 4.67c-.22.72.01 1.46.5 1.95L2.59 12l-1.57 1.56a2 2 0 0 0-.5 1.95 12 12 0 0 0 2.7 4.68c.51.54 1.27.72 1.93.54l2.14-.58.58 2.14c.17.67.7 1.24 1.43 1.4a12 12 0 0 0 5.4 0 2 2 0 0 0 1.43-1.4l.58-2.14 2.13.58c.67.18 1.43 0 1.94-.55a12 12 0 0 0 2.7-4.67 2 2 0 0 0-.5-1.94L21.4 12l1.57-1.56c.49-.5.71-1.23.5-1.95a12 12 0 0 0-2.7-4.67 2 2 0 0 0-1.93-.54l-2.14.57zm-6.34.54a10 10 0 0 1 4.42 0l.56 2.12a2 2 0 0 0 2.45 1.41l2.13-.57a10 10 0 0 1 2.2 3.83L20 10.59a2 2 0 0 0 0 2.83l1.55 1.55a10 10 0 0 1-2.2 3.82l-2.13-.57a2 2 0 0 0-2.44 1.42l-.57 2.12a10 10 0 0 1-4.42 0l-.57-2.12a2 2 0 0 0-2.45-1.42l-2.12.57a10 10 0 0 1-2.2-3.82L4 13.42a2 2 0 0 0 0-2.83L2.45 9.03a10 10 0 0 1 2.2-3.82l2.13.57a2 2 0 0 0 2.44-1.41z',
                toggledPath: 'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0M14.7.3c.73.18 1.25.74 1.43 1.41l.58 2.14 2.14-.57a2 2 0 0 1 1.93.54 12 12 0 0 1 2.7 4.67c.21.72-.01 1.46-.5 1.95L21.4 12l1.57 1.57c.49.49.72 1.23.5 1.94a12 12 0 0 1-2.7 4.67c-.51.55-1.27.73-1.94.55l-2.13-.58-.58 2.14a1.9 1.9 0 0 1-1.43 1.4 12 12 0 0 1-5.4 0 2 2 0 0 1-1.43-1.4l-.58-2.14-2.14.58c-.66.18-1.42 0-1.93-.54a12 12 0 0 1-2.7-4.68c-.22-.72.01-1.46.5-1.95L2.6 12l-1.57-1.56a2 2 0 0 1-.5-1.95 12 12 0 0 1 2.7-4.67 2 2 0 0 1 1.93-.54l2.14.57.58-2.14c.17-.66.7-1.23 1.43-1.4a12 12 0 0 1 5.4 0M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10'
            }
        );
    });
    document.querySelector('.profile-add-button').addEventListener('click', () => {
        showFlyout(
            '.profile-add-button',
            '#profileFlyout',
            -327.33, 6.1111,
            true
        );
    });
});
// 화면 리사이즈 또는 스크롤 시 팝업 위치 재계산
window.addEventListener('resize', updateFlyoutPosition);
window.addEventListener('scroll', updateFlyoutPosition);

// 외부 클릭 시 팝업 닫기
document.addEventListener('click', (e) => {
    // 현재 열려 있는 팝업이 존재할 때만 팝업과 트리거 가져오기
    const flyout = visibleFlyoutSelector ? document.querySelector(visibleFlyoutSelector) : null;
    const trigger = visibleTriggerSelector ? document.querySelector(visibleTriggerSelector) : null;

    if (!flyout || !trigger) return;

    // 클릭한 곳이 팝업이나 트리거 버튼이면 무시
    if (flyout.contains(e.target) || trigger.contains(e.target)) return;

    // 그 외에는 팝업 닫기
    hideAllFlyouts();
});







