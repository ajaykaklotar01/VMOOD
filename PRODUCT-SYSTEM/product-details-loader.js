const VMOOD_CATALOG = {
  ...(typeof MEN_CATALOG !== "undefined" ? MEN_CATALOG : {}),
  ...(typeof WOMEN_CATALOG !== "undefined" ? WOMEN_CATALOG : {})
};

let selectedSize = "";

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

const product = VMOOD_CATALOG[productId];

if (!product) {
  document.querySelector(".product-detail").innerHTML = `
    <h1>Sold Out</h1>
<p>This VMOOD piece is currently sold out. It will return soon.</p>
  `;
} else {
  document.title = product.title;

  document.querySelector(".product-name").innerText = product.title;
  document.querySelector(".old-price").innerText = "₹" + product.oldPrice;
  document.querySelector(".new-price").innerText = "₹" + product.newPrice;
  const discount = Math.round(
  ((product.oldPrice - product.newPrice) / product.oldPrice) * 100
);

const saving = product.oldPrice - product.newPrice;

document.querySelector(".offer-badge").innerText = `${discount}% OFF`;
document.querySelector(".price-benefits").innerText =
  `You Save ₹${saving} • Shipping Included`;

document.querySelector(".stock-status").innerText = product.stockStatus;
document.querySelector(".delivery-estimate").innerText = product.delivery;
  const badge = document.querySelector(".identity-badge");

badge.innerText = product.identity;
badge.style.backgroundColor = product.identityColor;

const hex = product.identityColor.replace("#", "");
const r = parseInt(hex.substring(0, 2), 16);
const g = parseInt(hex.substring(2, 4), 16);
const b = parseInt(hex.substring(4, 6), 16);
const brightness = (r * 299 + g * 587 + b * 114) / 1000;

badge.style.color = brightness > 160 ? "#111111" : "#F6F3EE";
  
  document.querySelector(".back-top-link").addEventListener("click", (e) => {
  e.preventDefault();
  history.back();
});

document.querySelector(".back-bottom-link").addEventListener("click", (e) => {
  e.preventDefault();
  history.back();
});

  const sizeBox = document.querySelector(".size-options");
  sizeBox.innerHTML = "";

  Object.entries(product.sizes).forEach(([size, stock]) => {

  const btn = document.createElement("button");
  btn.innerText = size;

  if (stock === 0) {
    btn.disabled = true;
    btn.classList.add("sold-out");
  }

  btn.addEventListener("click", () => {

    if (stock === 0) return;

    document.querySelectorAll(".size-options button").forEach((b) => {
      b.classList.remove("active");
    });

    btn.classList.add("active");
    selectedSize = size;

  });

  sizeBox.appendChild(btn);

});

  const infoList = document.querySelector(".product-info-list");
infoList.innerText = product.description;

  const buyButton = document.querySelector(".buy-btn");

buyButton.addEventListener("click", () => {

  if (selectedSize === "") {
    openVmoodPopup(
      "Choose Your Option",
      "Select your preferred option to continue"
    );
    return;
  }

  localStorage.setItem("vmoodProductName", product.title);
  localStorage.setItem("vmoodProductPrice", product.newPrice);
  localStorage.setItem("vmoodProductSize", selectedSize);
  localStorage.setItem("vmoodProductSku", productId);

  window.location.href = "../VMOOD-CHECKOUT-DATA/checkout.html";

});

  loadProductImages(product.folder);
}

function openVmoodPopup(title, message) {
  const popup = document.getElementById("vmoodPopup");

  document.getElementById("popupTitle").innerText = title;
  document.getElementById("popupMessage").innerText = message;

  popup.style.display = "flex";
}

function closeVmoodPopup() {
  const popup = document.getElementById("vmoodPopup");
  if (popup) {
    popup.style.display = "none";
  }
}

function loadProductImages(folder) {
  const productTrack = document.querySelector(".product-slide-track");
  const sliderDots = document.querySelector(".slider-dots");

  if (!productTrack || !folder || !product.imageCount) return;

  productTrack.innerHTML = "";
  sliderDots.innerHTML = "";

  for (let i = 1; i <= product.imageCount; i++) {
    const img = document.createElement("img");
    img.src = `${folder}/${i}.png`;
    img.alt = `Product Image ${i}`;
    productTrack.appendChild(img);
  }

  createSliderDots();
                             }

function createSliderDots() {
  const productTrack = document.querySelector(".product-slide-track");
  const sliderDots = document.querySelector(".slider-dots");

  if (productTrack && sliderDots) {
    sliderDots.innerHTML = "";

    const slides = productTrack.querySelectorAll("img");

    slides.forEach((slide, index) => {
      const dot = document.createElement("span");
      dot.classList.add("dot");

      if (index === 0) {
        dot.classList.add("active");
      }

      dot.addEventListener("click", () => {
        productTrack.scrollTo({
          left: index * productTrack.clientWidth,
          behavior: "smooth"
        });
      });

      sliderDots.appendChild(dot);
    });

    productTrack.addEventListener("scroll", () => {
      const currentIndex = Math.round(productTrack.scrollLeft / productTrack.clientWidth);
      const dots = sliderDots.querySelectorAll(".dot");

      dots.forEach((dot) => dot.classList.remove("active"));

      if (dots[currentIndex]) {
        dots[currentIndex].classList.add("active");
      }
    });
  }
    }
