window.addEventListener('load', () => {
    const $intro = document.getElementById('intro');

    // 디버깅 모드일 경우 intro 제거
    if (new URL(location.href).searchParams.get('debugging') === 'true') {
        $intro.remove();
    } else {
        // 250ms 후 애니메이션 트리거용 클래스 조작
        setTimeout(() => {
            $intro.classList.add('-phase');
        }, 250);

        // 2000ms 후 intro 제거 애니메이션 및 클래스 정리
        setTimeout(() => {
            $intro.classList.remove('-visible');
            $intro.classList.remove('-phase');
        }, 2000);
    }
});
