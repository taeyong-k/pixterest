window.addEventListener('load', () => {
    const $intro = document.getElementById('intro');

    // debugging 모드면 제거
    if (new URL(location.href).searchParams.get('debugging') === 'true') {
        $intro.remove();
        return;
    }

    // 이미 인트로 본 적 있으면 제거
    if (sessionStorage.getItem('introShown') === 'true') {
        $intro.remove();
        return;
    }

    // 인트로 본 적 없으므로 1회 표시
    sessionStorage.setItem('introShown', 'true');

    // 인트로 애니메이션 시작
    setTimeout(() => {
        $intro.classList.add('-phase');
    }, 250);

    // 인트로 종료 처리
    setTimeout(() => {
        $intro.classList.remove('-visible');
        $intro.classList.remove('-phase');
    }, 2000);
});
