// HERO INFINITE SLIDESHOW
const heroTrack = document.querySelector(".hero-track");
const totalHeroSlides = document.querySelectorAll(".hero-track img").length;
let currentHeroSlide = 0;

setInterval(() => {
if (!heroTrack) return;

currentHeroSlide++;

heroTrack.style.transition = "transform 1s ease-in-out";
heroTrack.style.transform = `translateX(-${currentHeroSlide * 100}%)`;

if (currentHeroSlide === totalHeroSlides) {
setTimeout(() => {
heroTrack.style.transition = "none";
heroTrack.style.transform = "translateX(0)";
currentHeroSlide = 0;
}, 500);
}
}, 3500);

// VMOOD WORLD INFINITE SLIDESHOW
const worldTrack = document.querySelector(".world-track");
const totalWorldSlides = document.querySelectorAll(".world-track img").length;
let currentWorldSlide = 0;

setInterval(() => {
if (!worldTrack) return;

currentWorldSlide++;

worldTrack.style.transition = "transform 1s ease-in-out";
worldTrack.style.transform = `translateX(-${currentWorldSlide * 100}%)`;

if (currentWorldSlide === totalWorldSlides) {
setTimeout(() => {
worldTrack.style.transition = "none";
worldTrack.style.transform = "translateX(0)";
currentWorldSlide = 0;
}, 500);
}
}, 3500);

// PREMIUM SCROLL ANIMATION
const revealElements = document.querySelectorAll(
  "section, .product-card, .info-card, .review-card"
);

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.intersectionRatio > 0.22) {
      entry.target.classList.add("show");
    } else {
      entry.target.classList.remove("show");
    }
  });
}, {
  threshold: [0, 0.22]
});

revealElements.forEach((element) => {
  revealObserver.observe(element);
});



// VMOOD INTRO - HOMEPAGE ONLY

const vmoodIntro = document.getElementById("vmoodIntro");

if (vmoodIntro) {

  const navigationEntry =
    performance.getEntriesByType("navigation")[0];

  const isRefresh =
    navigationEntry &&
    navigationEntry.type === "reload";

  const cameFromInternalPage =
    document.referrer &&
    new URL(document.referrer).origin === window.location.origin &&
    new URL(document.referrer).pathname !== window.location.pathname;

  if (!cameFromInternalPage || isRefresh) {

    vmoodIntro.hidden = false;

    setTimeout(() => {
      vmoodIntro.classList.add("intro-exit");

      setTimeout(() => {
        vmoodIntro.hidden = true;
        vmoodIntro.classList.remove("intro-exit");
      }, 600);

    }, 1800);

  }
}

// SIDE MENU
function openMenu() {
  document.getElementById("sideMenu").classList.add("active");
  document.getElementById("menuOverlay").classList.add("active");
}

function closeMenu() {
  document.getElementById("sideMenu").classList.remove("active");
  document.getElementById("menuOverlay").classList.remove("active");
}

// AUTOMATIC STAR RATING
document.querySelectorAll(".stars[data-rating]").forEach(stars => {
  const rating = Math.max(0, Math.min(5,
    Number(stars.dataset.rating) || 0
  ));

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.25;

  stars.innerHTML =
    '<span>' + '★'.repeat(fullStars) + '</span>' +
    (hasHalfStar ? '<span class="half">★</span>' : '') +
    '<span style="color:#514a3d">' +
    '★'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0)) +
    '</span>';
});
