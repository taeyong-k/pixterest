let msnry = null;

export default function MasonryInit() {
    const grid = document.querySelector('.grid');
    if (!grid) return;

    imagesLoaded(grid, () => {
        msnry = new Masonry(grid, {
            itemSelector: '.grid-item',
            columnWidth: '.grid-sizer', // 각 열의 너비
            gutter: 20,                 // 열 사이 간격
            fitWidth: true,             // 부모 너비에 맞게 정렬
            percentPosition: true       // 퍼센트 기반 그리드를 사용
        });
    });
}

window.addEventListener('load', MasonryInit);
window.addEventListener('resize', () => {
    if (msnry) {
        msnry.layout();
    }
});