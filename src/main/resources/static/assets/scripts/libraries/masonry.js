let msnry = null;

export default function MasonryInit() {
    const grid = document.querySelector('.grid');
    if (!grid) return;

    imagesLoaded(grid, () => {
        msnry = new Masonry(grid, {
            itemSelector: '.grid-item',
            columnWidth: '.grid-sizer', // 각 열의 너비
            gutter: 20,                 // 열 사이 간격
            fitWidth: false,            // 부모 너비에 맞게 정렬
            percentPosition: true       // 퍼센트 기반 그리드를 사용
        });
    });

    // 🔁 리사이즈 대응 (디바운스 적용)
    let resizeTimer = null;
    window.addEventListener('resize', () => {
        if (!msnry) return;

        clearTimeout(resizeTimer);

        resizeTimer = setTimeout(() => {
            msnry.layout();
        }, 200); // 200ms 후 레이아웃 재계산
    });
}