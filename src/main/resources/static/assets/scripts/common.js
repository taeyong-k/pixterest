const $header = document.getElementById('header');
const $dialog = document.getElementById('dialog');
const emailRegex = /^[\w.\-]{4,}@[\w\-]+\.[\w.]{2,}$/;
const passwordRegex =/^[\w`~!@#$%^&*()\-=+[\]{}|;:'",.<>/?]{8,50}$/;
const $loginButton = $header.querySelector('button[name="login"]');
const $registerButton = $header.querySelector('button[name="register"]');
const $cancelButtons = $dialog.querySelectorAll('.cancel');
const $registerModalForm = document.getElementById('registerModalForm');
const $loginModalForm = document.getElementById('loginModalForm');

$loginButton.addEventListener('click', () =>
{
    $dialog.classList.add('-visible');
    $loginModalForm.classList.add('-visible');
});

$registerButton.addEventListener('click', () =>
{
    $dialog.classList.add('-visible');
    $registerModalForm.classList.add('-visible');
});




$cancelButtons.forEach(($btn) =>
    $btn.addEventListener('click', () => {
        $dialog.classList.remove('-visible');
        $registerModalForm.classList.remove('-visible');
        $loginModalForm.classList.remove('-visible');
    })
);