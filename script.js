// HOMEPAGE SLIDESHOWS — SEAMLESS INFINITE LOOP
function startHomepageSlideshow(trackSelector) {
  document.querySelectorAll(trackSelector).forEach((track) => {
    const firstSlide = track.querySelector("img");
    if (!firstSlide) return;

    // Add one matching first-slide clone only when the HTML does not already have one.
    const slides = Array.from(track.querySelectorAll("img"));
    const firstSrc = firstSlide.getAttribute("src");
    const lastSrc = slides[slides.length - 1].getAttribute("src");

    if (lastSrc !== firstSrc) {
      track.appendChild(firstSlide.cloneNode(true));
    }

    const originalSlideCount = track.querySelectorAll("img").length - 1;
    let currentSlide = 0;
    let isResetting = false;

    track.addEventListener("transitionend", (event) => {
      if (event.propertyName !== "transform" || !isResetting) return;

      // The final clone is identical to slide 1, so this reset is visually invisible.
      track.style.transition = "none";
      track.style.transform = "translateX(0)";
      currentSlide = 0;
      isResetting = false;
    });

    setInterval(() => {
      if (isResetting) return;

      currentSlide++;
      track.style.transition = "transform 1s ease-in-out";
      track.style.transform = `translateX(-${currentSlide * 100}%)`;

      if (currentSlide === originalSlideCount) {
        isResetting = true;
      }
    }, 3000);
  });
}

startHomepageSlideshow(".hero-track");
startHomepageSlideshow(".world-track");
startHomepageSlideshow(".why-track");

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

  const shouldPlayIntro = !cameFromInternalPage || isRefresh;
  const headerLogo = document.querySelector(".site-header .logo");

  if (shouldPlayIntro) {

    vmoodIntro.hidden = false;

    setTimeout(() => {
      vmoodIntro.classList.add("intro-exit");

      setTimeout(() => {
        vmoodIntro.hidden = true;
        vmoodIntro.classList.remove("intro-exit");
        document.documentElement.classList.remove("vmood-intro-pending");

        // Keep the header logo invisible for 1.5s after V1, then start its single reveal.
        if (headerLogo) {
          setTimeout(() => {
            headerLogo.classList.add("vmood-logo-reveal");
          }, 1500);
        }
      }, 600);

    }, 1800);

  } else if (headerLogo) {
    // Internal return: V1 is skipped, so reveal the header logo on its own.
    headerLogo.classList.add("vmood-logo-reveal");
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
