const VMOOD_API_URL = "https://script.google.com/macros/s/AKfycbwMRO42QQiM1Sva4TKQmArV_ZuGxEwCwVOVA1xvHll97nhv-263-SRSCrcMMURkhESthw/exec";

let selectedSize = "";
let selectedPrice = null;
let product = null;

const params = new URLSearchParams(window.location.search);
const productId = (params.get("id") || "").trim().toUpperCase();


// ==========================================
// LOAD PRODUCT FROM GOOGLE SHEETS API
// ==========================================

function loadVmoodProduct(sku) {
  if (!sku || !/^(MP|WP)\d+$/i.test(sku)) {
    showProductError("Invalid Product", "This product link is not valid.");
    return;
  }

  const script = document.createElement("script");

  const callbackName = "vmoodProductCallback";

  const timeout = setTimeout(() => {
    cleanup();
    showProductError(
      "Connection Error",
      "Unable to load product details. Please try again."
    );
  }, 15000);

  function cleanup() {
    clearTimeout(timeout);
    script.remove();

    if (window[callbackName]) {
      delete window[callbackName];
    }
  }

  window[callbackName] = function (response) {
    cleanup();

    if (!response || response.success !== true || !response.product) {
      showProductError(
        "Product Unavailable",
        response && response.message
          ? response.message
          : "This product could not be found."
      );
      return;
    }

    // MAP GOOGLE SHEETS FIELDS TO WEBSITE FIELDS
    const data = response.product;

    product = {
      sku: data["SKU"],
      title: data["Product Name"],
      identity: data["Color Name"],
      identityColor: data["Color HEX"],
      description: data["Description"],
      folder: data["Image Folder"],
      imageCount: Number(data["Image Count"]),
      delivery: data["Delivery"],
      variants: data.variants
    };

    displayProduct(product);
  };

  script.onerror = function () {
    cleanup();
    showProductError(
      "Connection Error",
      "Unable to connect to the VMOOD product database."
    );
  };

  script.src =
    VMOOD_API_URL +
    "?sku=" + encodeURIComponent(sku) +
    "&callback=" + callbackName;

  document.head.appendChild(script);
}


// ==========================================
// DISPLAY PRODUCT
// ==========================================

function displayProduct(product) {
  document.title = product.title || "VMOOD";

  document.querySelector(".product-name").innerText =
    product.title || "";

  document.querySelector(".old-price").innerText = "";
  document.querySelector(".new-price").innerText = "";
  document.querySelector(".offer-badge").innerText = "";

  document.querySelector(".price-benefits").innerText =
    "Select your preferred option to see the price";

  document.querySelector(".stock-status").innerText =
    "Select an option to check availability";

  document.querySelector(".delivery-estimate").innerText =
    product.delivery || "";

  // PRODUCT IDENTITY BADGE
  const badge = document.querySelector(".identity-badge");

  if (badge) {
    badge.innerText = product.identity || "";

    const color = /^#[0-9A-Fa-f]{6}$/.test(product.identityColor)
      ? product.identityColor
      : "#F6F3EE";

    badge.style.backgroundColor = color;

    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    badge.style.color =
      brightness > 160 ? "#111111" : "#F6F3EE";
  }

  // BACK NAVIGATION
  document.querySelector(".back-top-link").addEventListener("click", (e) => {
    e.preventDefault();
    history.back();
  });

  document.querySelector(".back-bottom-link").addEventListener("click", (e) => {
    e.preventDefault();
    history.back();
  });

  // VARIANT SYSTEM
  const sizeBox = document.querySelector(".size-options");
  const buyButton = document.querySelector(".buy-btn");

  sizeBox.innerHTML = "";
  buyButton.disabled = true;

  selectedSize = "";
  selectedPrice = null;

  const variants = product.variants;

  let availableVariantFound = false;

  if (!variants || typeof variants !== "object") {
    sizeBox.innerText = "Product options are currently unavailable.";
  } else {
    Object.entries(variants).forEach(([size, data]) => {
      const stock = Number(data.stock);
      const oldPrice = Number(data.oldPrice);
      const newPrice = Number(data.newPrice);

      const validVariant =
        Number.isFinite(stock) &&
        stock > 0 &&
        Number.isFinite(oldPrice) &&
        Number.isFinite(newPrice) &&
        oldPrice >= 0 &&
        newPrice >= 0;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.innerText = size;

      if (!validVariant) {
        btn.disabled = true;
        btn.classList.add("sold-out");
      } else {
        availableVariantFound = true;
      }

      btn.addEventListener("click", () => {
        if (!validVariant) return;

        sizeBox.querySelectorAll("button").forEach((b) => {
          b.classList.remove("active");
        });

        btn.classList.add("active");

        selectedSize = size;
        selectedPrice = newPrice;

        updateProductPrice(oldPrice, newPrice);

        document.querySelector(".stock-status").innerText =
          "Available";

        buyButton.disabled = false;
      });

      sizeBox.appendChild(btn);
    });
  }

  if (!availableVariantFound) {
    document.querySelector(".stock-status").innerText =
      "Currently sold out";

    buyButton.disabled = true;
  }

  // PRODUCT DESCRIPTION
  document.querySelector(".product-info-list").innerText =
    product.description || "";

  // BUY BUTTON / CHECKOUT
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
    localStorage.setItem("vmoodProductSku", product.sku);

    window.location.href =
      "../VMOOD-CHECKOUT-DATA/checkout.html";
  });

  // PRODUCT IMAGES
  loadProductImages(product.folder, product.imageCount);
}


// ==========================================
// PRICE UPDATE
// ==========================================

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


// ==========================================
// PRODUCT ERROR DISPLAY
// ==========================================

function showProductError(title, message) {
  const detail = document.querySelector(".product-detail");

  if (detail) {
    detail.innerHTML = `
      <h1>${title}</h1>
      <p>${message}</p>
    `;
  }
}


// ==========================================
// VMOOD POPUP
// ==========================================

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


// ==========================================
// PRODUCT IMAGE LOADER
// ==========================================

function loadProductImages(folder, imageCount) {
  const productTrack = document.querySelector(".product-slide-track");
  const sliderDots = document.querySelector(".slider-dots");

  if (
    !productTrack ||
    !sliderDots ||
    !folder ||
    !Number.isFinite(imageCount) ||
    imageCount < 1
  ) return;

  productTrack.innerHTML = "";
  sliderDots.innerHTML = "";

  for (let i = 1; i <= imageCount; i++) {
    const img = document.createElement("img");

    img.src = `../${folder.replace(/^\/+/, "")}/${i}.png`;
    img.alt = `Product Image ${i}`;

    productTrack.appendChild(img);
  }

  createSliderDots();
}


// ==========================================
// PRODUCT IMAGE SLIDER DOTS
// ==========================================

function createSliderDots() {
  const productTrack = document.querySelector(".product-slide-track");
  const sliderDots = document.querySelector(".slider-dots");

  if (!productTrack || !sliderDots) return;

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


// ==========================================
// START PRODUCT LOADING
// ==========================================

loadVmoodProduct(productId);
