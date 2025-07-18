document.addEventListener('DOMContentLoaded', () => {
    // 뒤로가기 버튼
    const backButton = document.querySelector('.backButton');
    if (backButton) {
        backButton.addEventListener('click', () => {
            history.back();
        });
    }

    // 댓글 textarea 자동 높이 조절
    const textarea = document.querySelector('#commentForm textarea');
    if (textarea) {
        const label = textarea.closest('.obj-label');
        const submitButton = label.querySelector('.submit-button');

        textarea.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';

            const extraSpace = 15;
            const maxHeight = 140; // textarea max-height와 동일하게 설정
            const isMaxHeight = this.scrollHeight >= maxHeight;

            // padding-bottom 조절
            label.style.paddingBottom = isMaxHeight ? '40px' : `${extraSpace}px`;

            // 버튼 right 위치 조절
            submitButton.style.right = isMaxHeight ? '31px' : '11px';
        });
    }

    // 핀 저장 버튼 클릭 이벤트
    document.querySelectorAll('.pinDetail-content .save-button').forEach(($btn) => {
        $btn.addEventListener('click', () => {
            const pinId = $btn.dataset.pinId;
            console.log('💡 저장버튼 pinId:', pinId);
            const xhr = new XMLHttpRequest();
            const formData = new FormData();
            formData.append('id', pinId);
            xhr.onreadystatechange = () => {
                if (xhr.readyState !== XMLHttpRequest.DONE) {
                    return;
                }
                if (xhr.status < 200 || xhr.status >= 300) {
                    toastAlter('서버 오류', '서버 요청 중 문제가 발생했습니다.\n잠시 후 다시 시도해주세요.');
                    return;
                }
                const response = JSON.parse(xhr.responseText);
                console.log(response.result);
                switch (response.result) {
                    case 'failure_session_expired':
                        window.location.href = '/user/login?loginCheck=expired';
                        break;
                    case 'failure_forbidden':
                        window.location.href = '/user/login?loginCheck=forbidden';
                        break;
                    case 'failure_absent':
                        toast('핀을 찾을 수 없습니다', '선택하신 핀이 존재하지 않거나 삭제된 상태입니다.');
                        break;
                    case 'failure_duplicate':
                        toast('이미 저장된 핀입니다', '선택하신 핀이 이미 내 보드에 저장되어 있습니다.');
                        break;
                    case 'success':
                        $btn.classList.add('active');
                        $btn.textContent = "저장됨";
                        sessionStorage.setItem('showToast', 'true');
                        window.location.reload();
                        break;
                    default:
                        toastAlter('핀을 저장하지 못했습니다', '일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
                }
            };
            xhr.open('POST', '/pin/');
            xhr.send(formData);
        });
    });

    // 페이지 로드 시 저장 완료 토스트 표시
    window.onload = () => {
        if (sessionStorage.getItem('showToast') === 'true') {
            showToast({
                title: '핀 저장이 완료되었습니다',
                caption: '내 보드에서 확인해 보세요.',
                duration: 8100,
                buttonText: '이동하기',
                onButtonClick: () => {
                    window.location.href = '/user/login'; // ★핀 모여있는 페이지로 변경 필요★
                }
            });
            sessionStorage.removeItem('showToast');
        }
    };

    // add comment
    const $commentForm = document.getElementById('commentForm');
    const $commentContainer = document.getElementById('commentContainer');
    const pinId = new URL(location.href).searchParams.get('id');

    const loadComments = () => {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            if (xhr.status < 200 || xhr.status >= 300) {
                toastAlter('서버 오류', '서버 요청 중 문제가 발생했습니다.\n잠시 후 다시 시도해주세요.');
                return;
            }
            const comments = JSON.parse(xhr.responseText);

            // 댓글 개수 표시
            const commentCountElem = document.getElementById('commentCount');
            commentCountElem.textContent = comments.length;

            if (comments.length === 0) {
                $commentContainer.innerHTML = '<div class="no-comments">등록된 댓글이 없습니다.</div>';
                return;
            }
            $commentContainer.innerHTML = '';
            for (const comment of comments) {
                $commentContainer.insertAdjacentHTML('beforeend', `
                    <div class="comment ${comment.deleted === true ? 'deleted' : ''}">
                        <div class="head">
                            <a aria-label="내 프로필" class="profile" href="#" tabindex="0">
                                <div class="profile-img-wrapper">
                                    <img class="img" alt="내 프로필" fetchpriority="auto" loading="auto"
                                         src="${comment.profileImage || 'https://i.pinimg.com/75x75_RS/ab/af/43/abaf431ac6c2a4e7ec23f4bd37037e2d.jpg'}">
                                </div>
                            </a>
                        </div>
                        <div class="body">
                            <div class="body-box-head">
                                <span class="username">${comment.nickname}</span>
                                <span class="comment-text">${comment.deleted ? '(삭제된 댓글입니다.)' : comment.content}</span>
                            </div>
                            <div class="body-box-body">
                                <span class="timestamp">${comment.createdAt.split('T').join(' ')}</span>
                                ${!comment.deleted
                                    ? `<a class="delete action" data-id="${comment.id}">삭제</a>`
                                    : ''}
                            </div>
                        </div>
                    </div>
                `);
            }

        };
        xhr.open('GET', `/pin/comment?id=${pinId}`);
        xhr.send();
    };

    const deleteComment = (commentId) => {
        if (!confirm('정말로 댓글을 삭제할까요? 삭제된 댓글은 복구가 어렵습니다.')) {
            return;
        }
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('id', commentId);
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            if (xhr.status < 200 || xhr.status >= 300) {
                toastAlter('서버 오류', '서버 요청 중 문제가 발생했습니다.\n잠시 후 다시 시도해주세요.');
                return;
            }
            const response = JSON.parse(xhr.responseText);
            switch (response.result) {
                case 'failure':
                    alert('알 수 없는 이유로 댓글 삭제에 실패하였습니다.');
                    break;
                case 'success':
                    alert('댓글을 성공적으로 삭제하였습니다.');
                    loadComments();
                    break;
                default:
                    alert('알 수 없는 이유로 댓글을 삭제하지 못하였습니다. 잠시 후 다시 시도해 주세요.');
            }
        };
        xhr.open('DELETE', '/pin/comment');
        xhr.send(formData);
    }

    $commentContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete')) {
            e.preventDefault();
            const commentId = e.target.dataset.id;
            if (commentId) deleteComment(commentId);
        }
    });

    $commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const textarea = $commentForm.querySelector('textarea');
        const content = textarea.value.trim();
        if (!content) {
            alert('댓글을 입력해 주세요.');
            return;
        }

        const formData = new FormData();
        formData.append('pinId', pinId);
        formData.append('content', content);

        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) return;
            if (xhr.status < 200 || xhr.status >= 300) {
                toastAlter('서버 오류', '서버 요청 중 문제가 발생했습니다.');
                return;
            }
            const response = JSON.parse(xhr.responseText);
            if (response.result === 'success') {
                textarea.value = '';
                loadComments();
            } else {
                alert('댓글 작성에 실패하였습니다.');
            }
        };
        xhr.open('POST', '/pin/comment');
        xhr.send(formData);
    });

    loadComments();
});
