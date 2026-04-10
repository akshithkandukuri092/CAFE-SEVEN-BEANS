// Scroll reveal
const reveals = document.querySelectorAll('.reveal');

window.addEventListener('scroll', () => {
  reveals.forEach(el => {
    const top = el.getBoundingClientRect().top;
    if (top < window.innerHeight - 100) {
      el.classList.add('active');
    }
  });
});

// Parallax smooth effect
window.addEventListener("scroll", function() {
  let scroll = window.scrollY;
  document.querySelector(".hero").style.backgroundPositionY = scroll * 0.5 + "px";
});

window.addEventListener("scroll", () => {
  const nav = document.querySelector(".navbar");
  if (window.scrollY > 50) {
    nav.style.background = "rgba(0,0,0,0.9)";
  } else {
    nav.style.background = "rgba(0,0,0,0.6)";
  }
});

