const VMOOD_CATALOG = {
  ...(typeof MEN_CATALOG !== "undefined" ? MEN_CATALOG : {}),
  ...(typeof WOMEN_CATALOG !== "undefined" ? WOMEN_CATALOG : {})
};

let selectedSize = "";
let selectedPrice = null;

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

  // PRODUCT PRICE UPDATE FUNCTION
  function updateProductPrice(oldPrice, newPrice) {
    const oldPriceElement = document.querySelector(".old-price");
    const newPriceElement = document.querySelector(".new-price");
    const offerBadge = document.querySelector(".offer-badge");
    const priceBenefits = document.querySelector(".price-benefits");

    oldPriceElement.innerText = "₹" + oldPrice;
    newPriceElement.innerText = "₹" + newPrice;

    const discount = oldPrice > 0
      ? Math.round(((oldPrice - newPrice) / oldPrice) * 100)
      : 0;

    const saving = oldPrice - newPrice;

    offerBadge.innerText =
      discount > 0 ? `${discount}% OFF` : "";

    priceBenefits.innerText =
      `You Save ₹${saving} • Shipping Included`;
  }

  // INITIAL PRICE - WAIT FOR VARIANT SELECTION
  document.querySelector(".old-price").innerText = "";
  document.querySelector(".new-price").innerText = "";
  document.querySelector(".offer-badge").innerText = "";

  document.querySelector(".price-benefits").innerText =
    "Select your preferred option to see the price";

  document.querySelector(".stock-status").innerText = product.stockStatus;
  document.querySelector(".delivery-estimate").innerText = product.delivery;

  // PRODUCT IDENTITY BADGE
  const badge = document.querySelector(".identity-badge");

  badge.innerText = product.identity;
  badge.style.backgroundColor = product.identityColor;

  const hex = product.identityColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  badge.style.color = brightness > 160 ? "#111111" : "#F6F3EE";

  // BACK NAVIGATION
  document.querySelector(".back-top-link").addEventListener("click", (e) => {
    e.preventDefault();
    history.back();
  });

  document.querySelector(".back-bottom-link").addEventListener("click", (e) => {
    e.preventDefault();
    history.back();
  });

  // NEW VARIANT-BASED SYSTEM ONLY
  const sizeBox = document.querySelector(".size-options");
  sizeBox.innerHTML = "";

  const variants = product.variants;

  if (!variants || typeof variants !== "object") {
    sizeBox.innerText = "Product options are currently unavailable.";
    document.querySelector(".buy-btn").disabled = true;
  } else {
    Object.entries(variants).forEach(([size, data]) => {

      const stock = Number(data.stock);
      const oldPrice = Number(data.oldPrice);
      const newPrice = Number(data.newPrice);

      const validVariant =
        Number.isFinite(stock) &&
        stock > 0 &&
        Number.isFinite(oldPrice) &&
        Number.isFinite(newPrice);

      const btn = document.createElement("button");
      btn.innerText = size;

      if (!validVariant) {
        btn.disabled = true;
        btn.classList.add("sold-out");
      }

      btn.addEventListener("click", () => {

        if (!validVariant) return;

        document.querySelectorAll(".size-options button").forEach((b) => {
          b.classList.remove("active");
        });

        btn.classList.add("active");

        selectedSize = size;
        selectedPrice = newPrice;

        // UPDATE SELECTED VARIANT PRICE
        updateProductPrice(oldPrice, newPrice);
      });

      sizeBox.appendChild(btn);
    });
  }

  // PRODUCT DESCRIPTION
  const infoList = document.querySelector(".product-info-list");
  infoList.innerText = product.description;

  // BUY BUTTON / CHECKOUT
  const buyButton = document.querySelector(".buy-btn");

  buyButton.addEventListener("click", () => {

    if (
      selectedSize === "" ||
      selectedPrice === null ||
      !Number.isFinite(selectedPrice)
    ) {
      openVmoodPopup(
        "Choose Your Option",
        "Select your preferred option to continue"
      );
      return;
    }

    localStorage.setItem("vmoodProductName", product.title);
    localStorage.setItem("vmoodProductPrice", selectedPrice);
    localStorage.setItem("vmoodProductSize", selectedSize);
    localStorage.setItem("vmoodProductSku", productId);

    window.location.href = "../VMOOD-CHECKOUT-DATA/checkout.html";

  });

  loadProductImages(product.folder);
}


// VMOOD POPUP
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


// PRODUCT IMAGE LOADER
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


// PRODUCT IMAGE SLIDER DOTS
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
      const currentIndex = Math.round(
        productTrack.scrollLeft / productTrack.clientWidth
      );

      const dots = sliderDots.querySelectorAll(".dot");

      dots.forEach((dot) => dot.classList.remove("active"));

      if (dots[currentIndex]) {
        dots[currentIndex].classList.add("active");
      }
    });
  }
}
