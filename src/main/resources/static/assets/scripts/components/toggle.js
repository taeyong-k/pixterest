const toggleBtn = document.querySelector('#dark .toggle');

// const xhr = new XMLHttpRequest();
// xhr.onreadystatechange = () => {
//     if (xhr.readyState !== XMLHttpRequest.DONE)
//     {
//         return;
//     }
//     if (xhr.status < 200 || xhr.status >= 300)
//     {
//         alert('요청이 잘못되었습니다. 잠시 후 다시 시도해 주세요.')
//         return;
//     }
//     const response = JSON.parse(xhr.responseText)
//     switch (response.theme)
//     {
//         case 'dark':
//             document.body.classList.add('dark');
//             toggleBtn.textContent = '☀️';
//             break;
//         case 'light':
//             document.body.classList.remove('dark');
//             toggleBtn.textContent = '🌙';
//     }
// };
// xhr.open('GET','/user/theme');
// xhr.send();
    
toggleBtn.addEventListener('click', () =>
{
    const isDark = document.body.classList.toggle('dark');
    toggleBtn.textContent = isDark ? '☀️' : '🌙';

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('theme', isDark ? 'dark' : 'light');
    
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE)
        {
            return;
        }
        if (xhr.status < 200 || xhr.status >= 300)
        {
            alert('테마 저장 실패');
            return;
        }
    };
    xhr.open('POST','/user/theme');
    xhr.send(formData);
})
