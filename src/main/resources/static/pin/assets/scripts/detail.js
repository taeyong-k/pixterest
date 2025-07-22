document.addEventListener('DOMContentLoaded', () => {
    // 뒤로가기 버튼
    const backButton = document.querySelector('.backButton');
    if (backButton) {
        backButton.addEventListener('click', () => {
            history.back();
        });
    }

    // 댓글 폼 textarea 자동 높이 조절
    const commentTextarea = document.querySelector('#commentForm textarea');
    if (commentTextarea) {
        const label = commentTextarea.closest('.obj-label');
        const submitButton = label.querySelector('.submit-button');

        commentTextarea.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';

            const extraSpace = 15;
            const maxHeight = 140; // textarea max-height와 동일하게 설정
            const isMaxHeight = this.scrollHeight >= maxHeight;

            label.style.paddingBottom = isMaxHeight ? '40px' : `${extraSpace}px`;
            submitButton.style.right = isMaxHeight ? '31px' : '11px';
        });

        // commentTextarea.addEventListener('keydown', function (event) {
        //     if (event.key === 'Enter' && !event.shiftKey) {
        //         event.preventDefault();
        //         document.getElementById('commentForm').requestSubmit();
        //     }
        // });
    }

    // 대댓글 폼 textarea 자동 높이 조절
    function attachReplyTextareaAutoHeight() {
        const replyTextareas = document.querySelectorAll('.reply-form textarea');
        replyTextareas.forEach(replyTextarea => {
            const label = replyTextarea.closest('.obj-label');
            const writeButton = label.parentElement.querySelector('.button-container .write');

            replyTextarea.style.height = 'auto';
            replyTextarea.style.height = replyTextarea.scrollHeight + 'px';

            replyTextarea.oninput = null;

            replyTextarea.addEventListener('input', function () {
                this.style.height = 'auto';
                this.style.height = this.scrollHeight + 'px';
            });

            // replyTextarea.addEventListener('keydown', function (event) {
            //     if (event.key === 'Enter' && !event.shiftKey) {
            //         event.preventDefault();
            //         console.log('reply textarea value:', this.value);
            //         writeButton.click();
            //     }
            // });
        });
    }

    // 수정 폼 textarea 자동 높이 조절
    function attachModifyTextareaAutoHeight() {
        const modifyTextareas = document.querySelectorAll('.modify-form textarea');
        modifyTextareas.forEach(modifyTextarea => {
            const label = modifyTextarea.closest('.obj-label');
            const writeButton = label.parentElement.querySelector('.button-container .write');

            // 높이 초기화
            modifyTextarea.style.height = 'auto';
            modifyTextarea.style.height = modifyTextarea.scrollHeight + 'px';

            // 중복 등록 방지를 위해 기존 이벤트 리스너 제거 후 다시 등록하는게 안전
            modifyTextarea.oninput = null;

            modifyTextarea.addEventListener('input', function () {
                this.style.height = 'auto';
                this.style.height = this.scrollHeight + 'px';
            });

            // modifyTextarea.addEventListener('keydown', function (event) {
            //     if (event.key === 'Enter' && !event.shiftKey) {
            //         // shift + enter 는 줄바꿈 유지, 그냥 enter면 저장
            //         event.preventDefault();  // 줄바꿈 방지
            //         writeButton.click();     // 작성(저장) 버튼 클릭 이벤트 강제 실행
            //     }
            // });
        });
    }

    // 핀 저장 버튼 클릭 이벤트
    document.querySelectorAll('.pinDetail-content .save-button').forEach(($btn) => {
        $btn.addEventListener('click', () => {
            const pinId = $btn.dataset.pinId;

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

            // 최상위 댓글 필터링
            const rootComments = comments.filter(c => !c.commentId);

            // 분리된 함수 호출
            appendComments($commentContainer, rootComments, comments);

            attachReplyTextareaAutoHeight();
            attachModifyTextareaAutoHeight();
        };
        xhr.open('GET', `/pin/comment?id=${pinId}`);
        xhr.send();
    };

    // 답글&수정 버튼 처리 로직
    $commentContainer.addEventListener('click', (e) => {

        // 답글 버튼 클릭 -> 답글 폼 열기
        if (e.target.classList.contains('reply')) {
            e.preventDefault();

            // 1. 모든 답글 폼 닫기
            document.querySelectorAll('.reply-form').forEach(form => {
                form.style.display = 'none';
                const textarea = form.querySelector('textarea');
                if (textarea) textarea.value = '';
            });

            // 2. 해당 댓글의 reply-form만 열기
            const commentDiv = e.target.closest('.comment');
            const replyForm = commentDiv.nextElementSibling;

            if (replyForm && replyForm.classList.contains('reply-form')) {
                replyForm.style.display = 'block';
                const textarea = replyForm.querySelector('textarea');
                if (textarea) {
                    textarea.focus();
                    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
                }
                attachReplyTextareaAutoHeight();
            }
            return;
        }

        if (e.target.closest('.reply-form')) {
            // 답글 취소
            if (e.target.classList.contains('cancel')) {
                e.preventDefault();
                const replyForm = e.target.closest('.reply-form');
                const textarea = replyForm.querySelector('textarea');
                textarea.value = '';
                replyForm.style.display = 'none';
                return;
            }

            // 답글 작성
            if (e.target.classList.contains('write')) {
                e.preventDefault();
                const replyForm = e.target.closest('.reply-form');
                const textarea = replyForm.querySelector('textarea');
                const replyContentRaw = textarea.value;
                const replyContent = replyContentRaw.trim();

                if (!replyContent) {
                    toast('답글이 비어있습니다', '답글을 입력해주세요.');
                    return;
                }

                // 부모 댓글 ID 얻기
                const parentCommentId = replyForm.dataset.parentId;
                if (!parentCommentId) {
                    toastAlter('오류', '부모 댓글 ID를 찾을 수 없습니다.');
                    return;
                }

                writeComment({pinId, content: replyContent, commentId: parentCommentId});
                replyForm.style.display = 'none';
                textarea.value = '';
                return;
            }
        }


        // 수정 버튼 클릭 -> 수정 폼 보이기
        if (e.target.classList.contains('modify')) {
            e.preventDefault();

            // 1. 열린 모든 수정 폼 닫기
            document.querySelectorAll('.modify-form').forEach(form => {
                form.style.display = 'none';
                const textarea = form.querySelector('textarea');
                if (textarea) textarea.value = '';
            });

            // 2. 클릭한 댓글의 수정 폼만 열기
            const commentDiv = e.target.closest('.comment');
            const modifyForm = commentDiv.nextElementSibling?.nextElementSibling;

            if (modifyForm && modifyForm.classList.contains('modify-form')) {
                modifyForm.style.display = 'block';  // 수정폼 열기

                const textarea = modifyForm.querySelector('textarea');
                if (textarea) {
                    const originalText = commentDiv.querySelector('.comment-text')?.textContent || '';
                    textarea.value = originalText;
                    textarea.focus();
                    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
                }
                attachModifyTextareaAutoHeight();
            }
            return;
        }

        if (e.target.closest('.modify-form')) {
            // 수정 폼 - 취소 버튼
            if (e.target.classList.contains('cancel')) {
                e.preventDefault();
                const modifyForm = e.target.closest('.modify-form');
                if (modifyForm) {
                    const textarea = modifyForm.querySelector('textarea');
                    textarea.value = ''; // ✨ 내용 초기화
                    modifyForm.style.display = 'none'; // 수정 폼 닫기
                }
                return;
            }

            // 수정 폼 - 작성(저장) 버튼
            if (e.target.classList.contains('write')) {
                e.preventDefault();
                const modifyForm = e.target.closest('.modify-form');
                if (!modifyForm) return;

                const textarea = modifyForm.querySelector('textarea');
                const newContent = textarea.value.trim();
                if (!newContent) {
                    toast('댓글 내용이 비어있습니다', '댓글을 입력해주세요.');
                    return;
                }

                // 수정할 댓글 ID 가져오기 (수정 버튼에서 data-id를 저장하거나 댓글 div 등에서 ID를 참조)
                const commentDiv = modifyForm.previousElementSibling.previousElementSibling;
                const commentId = commentDiv.dataset.id;
                // const commentId = commentDiv.querySelector('.modify.action')?.dataset.id;
                if (!commentId) {
                    toastAlter('오류', '댓글 ID를 찾을 수 없습니다.');
                    return;
                }

                modifyComment({id: commentId, content: newContent});
                modifyForm.style.display = 'none'; // 수정 폼 닫기
                return;
            }
        }
    });
    attachModifyTextareaAutoHeight();

    // 댓글 + 대댓글 재귀 렌더링 함수 (전역 또는 모듈 최상단에)
    function appendComments(container, targetComments, allComments, depth = 0) {
        for (const comment of targetComments) {
            const paddingLeft = 48 * depth;
            container.insertAdjacentHTML('beforeend', `
            <div class="comment ${comment.commentId ? 'reply' : ''} ${comment.deleted ? 'deleted' : ''}" data-id="${comment.id}" style="padding-left: ${paddingLeft}px;">
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
                        ${!comment.deleted ? `<a class="reply action" data-id="${comment.id}">답글</a>` : ''}
                        ${!comment.deleted && comment.mine ? `<a class="modify action" data-id="${comment.id}">수정</a>` : ''}
                        ${!comment.deleted && comment.mine ? `<a class="delete action" data-id="${comment.id}">삭제</a>` : ''}
                    </div>
                </div>
            </div>
            <form class="reply-form"  data-parent-id="${comment.id}" style="display:none;">
                <label class="obj-label">
                    <textarea aria-invalid="false" class="obj-field textarea"
                              name="input" placeholder="답변을 남기세요" spellcheck="false"
                              rows="1"></textarea>
                </label>
                <div class="button-container">
                    <button class="cancel" tabindex="0" type="button">취소</button>
                    <button class="write" tabindex="0" type="button">작성</button>
                </div>
            </form>
            <form class="modify-form" novalidate style="display:none;">
                <label class="obj-label">
                    <textarea aria-invalid="false" class="obj-field textarea"
                              name="input" placeholder="댓글을 입력하세요" spellcheck="false"
                              rows="1"></textarea>
                </label>
                <div class="button-container">
                    <button class="cancel" tabindex="0" type="button">취소</button>
                    <button class="write" tabindex="0" type="button">작성</button>
                </div>
            </form>
            <div class="child-comments" data-parent-id="${comment.id}" style="width: 100%"></div>
        `);

            // 자식 댓글 렌더링 위치 찾아서 재귀 호출
            const commentDiv = container.querySelector(`.comment[data-id="${comment.id}"]`);
            const childContainer = commentDiv.parentElement.querySelector(`.child-comments[data-parent-id="${comment.id}"]`);   // child-comments
            const childComments = allComments.filter(c => String(c.commentId) === String(comment.id));
            if (childComments.length > 0 && childContainer) {
                appendComments(childContainer, childComments, allComments, depth + 1);
            }
        }
    }


    const modifyComment = (args) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('id', args['id']);
        formData.append('content', args['content']);
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
                case 'failure_session_expired':
                    window.location.href = '/user/login?loginCheck=expired';
                    break;
                case 'failure_forbidden':
                    window.location.href = '/user/login?loginCheck=forbidden';
                    break;
                case 'failure_absent':
                    toast('댓글을 찾을 수 없습니다', '선택하신 댓글이 존재하지 않거나 삭제된 상태입니다.');
                    break;
                case 'success':
                    loadComments();
                    break;
                default:
                    toastAlter('댓글을 수정하지 못했습니다', '일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
            }
        };
        xhr.open('PATCH', '/pin/comment');
        xhr.send(formData);
    }

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
                case 'failure_session_expired':
                    window.location.href = '/user/login?loginCheck=expired';
                    break;
                case 'failure_forbidden':
                    window.location.href = '/user/login?loginCheck=forbidden';
                    break;
                case 'failure_absent':
                    toast('댓글을 찾을 수 없습니다', '선택하신 댓글이 존재하지 않거나 삭제된 상태입니다.');
                    break;
                case 'success':
                    toast('삭제 완료!', '댓글이 성공적으로 삭제되었습니다.');
                    loadComments();
                    break;
                default:
                    toastAlter('댓글을 삭제하지 못했습니다', '일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
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

    function writeComment({pinId, content, commentId = null}) {
        if (!content.trim()) {
            toast('댓글 내용이 비어있습니다', '댓글을 입력해주세요.');
            return;
        }

        const formData = new FormData();
        formData.append('pinId', pinId);
        formData.append('content', content);
        if (commentId) {
            formData.append('commentId', commentId);
        }

        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) return;
            if (xhr.status < 200 || xhr.status >= 300) {
                toastAlter('서버 오류', '서버 요청 중 문제가 발생했습니다.');
                return;
            }
            const response = JSON.parse(xhr.responseText);

            switch (response.result) {
                case 'failure_session_expired':
                    window.location.href = '/user/login?loginCheck=expired';
                    break;
                case 'failure_forbidden':
                    window.location.href = '/user/login?loginCheck=forbidden';
                    break;
                case 'failure_invalid':
                    toast('입력값이 올바르지 않습니다', '내용을 다시 한 번 확인해 주세요.');
                    break;
                case 'success':
                    loadComments();
                    break;
                default:
                    toastAlter('댓글을 저장하지 못했습니다', '일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
            }
        };
        xhr.open('POST', '/pin/comment');
        xhr.send(formData);
    }

    $commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const textarea = $commentForm.querySelector('textarea');
        writeComment({pinId, content: textarea.value});
        textarea.value = '';
    });

    loadComments();
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
                window.location.href = '/user/myPage';
            }
        });
        sessionStorage.removeItem('showToast');
    }
};