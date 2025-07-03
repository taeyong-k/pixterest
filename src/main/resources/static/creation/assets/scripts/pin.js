document.addEventListener('DOMContentLoaded', () => {
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













});

























