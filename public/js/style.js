document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById('container');
  const registerBtn = document.getElementById('register');
  const loginBtn = document.getElementById('login');

  registerBtn?.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      container.classList.remove("show-signin");
      container.classList.add("show-signup");
    } else {
      container.classList.add("active");
    }
  });

  loginBtn?.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      container.classList.remove("show-signup");
      container.classList.add("show-signin");
    } else {
      container.classList.remove("active");
    }
  });
});
