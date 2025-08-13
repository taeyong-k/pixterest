let msnry = null;

export default function MasonryInit() {
    const grid = document.querySelector('.grid');
    if (!grid) return null;

    // 이전 인스턴스가 있으면 제거
    if (msnry) msnry.destroy();

    msnry = new window.Masonry(grid, {
        itemSelector: '.grid-item',
        columnWidth: '.grid-sizer', // 각 열의 너비
        gutter: 20,                 // 열 사이 간격
        fitWidth: false,            // 부모 너비에 맞게 정렬
        percentPosition: true       // 퍼센트 기반 그리드를 사용
    });

    // 이미지 로드될 때마다 레이아웃 갱신
    window.imagesLoaded(grid).on('progress', () => msnry.layout());

    // 🔁 리사이즈 대응 (디바운스 적용)
    let resizeTimer = null;
    window.addEventListener('resize', () => {
        if (!msnry) return;

        clearTimeout(resizeTimer);

        resizeTimer = setTimeout(() => {
            msnry.layout();
        }, 200); // 200ms 후 레이아웃 재계산
    });

    return msnry;
}