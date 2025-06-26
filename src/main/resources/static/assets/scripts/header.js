let visibleFlyoutSelector = null;
let visibleTriggerSelector = null;
let offsetX = 0;        // 위치 미세 조정을 위한 X축 값
let offsetY = 0;        // 위치 미세 조정을 위한 Y축 값

// +@"팝업 닫기 여부"를 결정하는 옵션을 하나 추가 (-> 리사이즈 시에는 기존 팝업 닫지 않고 위치만 다시 계산)
function showFlyout(triggerSelector, flyoutSelector, xOffset = 0, yOffset = 0, isToggle = true) {
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

    // 현재 열려있는 팝업 정보 저장
    visibleFlyoutSelector = flyoutSelector;                         // 현재 열려 있는 요소와 위치 오프셋 기억
    visibleTriggerSelector = triggerSelector;
    offsetX = xOffset;
    offsetY = yOffset;

    console.log("Trigger Rect:", rect);
    console.log("Calculated Left:", rect.left + scrollLeft + xOffset);
    console.log("Calculated Top:", rect.bottom + scrollTop + yOffset);
}

// 화면 크기 변경(resize)이나 스크롤 이벤트가 발생했을 때 호출하는 함수
function updateFlyoutPosition() {
    if (!visibleFlyoutSelector || !visibleTriggerSelector) return;
    // 리사이즈 시 기존 팝업 닫지 않고 위치만 재조정
    showFlyout(visibleTriggerSelector, visibleFlyoutSelector, offsetX, offsetY, false);    // 현재 위치, 정보를 이용해 다시 계산해 맞춤!
}

function hideAllFlyouts() {
    const allFlyouts = document.querySelectorAll('.-visible');
    allFlyouts.forEach(f => f.classList.remove('-visible'));
    visibleFlyoutSelector = null;
    visibleTriggerSelector = null;
}

// 버튼 클릭 시 각각의 팝업 표시
document.querySelector('.creation-logo-button button').addEventListener('click', () => {
    showFlyout('.creation-logo-button', '#creationFlyout', 63.2778, -142.556);  // 만들기 버튼 위치 조정
});
document.querySelector('.option-logo-button button').addEventListener('click', () => {
    showFlyout('.option-logo-button', '#optionFlyout', 63.2778, -181.556);      // 옵션 버튼 위치 조정
});
document.querySelector('.profile-add-button').addEventListener('click', () => {
    showFlyout('.profile-add-button', '#profileFlyout', -327.33, 6.1111); // 필요하면 X, Y 오프셋 조절
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



