
const VMOOD_API_URL = "https://script.google.com/macros/s/AKfycbwMRO42QQiM1Sva4TKQmArV_ZuGxEwCwVOVA1xvHll97nhv-263-SRSCrcMMURkhESthw/exec";

let vmoodRequestNumber = 0;

function getTextColor(bgColor) {
  const hex = bgColor.replace("#", "");

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 160 ? "#111111" : "#F6F3EE";
}

function loadCollectionProduct(card) {
  const id = (card.dataset.id || "").trim().toUpperCase();

  if (!/^(MP|WP)\d+$/.test(id)) {
    card.style.display = "none";
    return;
  }

  // Hide until valid Google Sheets data arrives.
  card.style.display = "none";

  const callbackName = "vmoodCollectionCallback" + (++vmoodRequestNumber);
  const script = document.createElement("script");

  let finished = false;

  const timeout = setTimeout(() => {
    finish();
    card.style.display = "none";
  }, 15000);

  function finish() {
    if (finished) return;

    finished = true;
    clearTimeout(timeout);
    script.remove();
    delete window[callbackName];
  }

  window[callbackName] = function (response) {
    finish();

    if (
      !response ||
      response.success !== true ||
      !response.product
    ) {
      card.style.display = "none";
      return;
    }

    const data = response.product;
    const variants = data.variants;

    const title = data["Product Name"];
    const folder = data["Image Folder"];
    const colorName = data["Color Name"];
    const colorHex = data["Color HEX"];

    const imageCount = Number(data["Image Count"]);

    // Check essential product information.
    if (
      !title ||
      !folder ||
      !colorName ||
      !/^#[0-9A-Fa-f]{6}$/.test(colorHex || "") ||
      !Number.isFinite(imageCount) ||
      imageCount < 1 ||
      !data["Description"] ||
      !data["Delivery"] ||
      !variants ||
      typeof variants !== "object"
    ) {
      card.style.display = "none";
      return;
    }

    // Find the lowest-priced valid variant.
    const validPrices = Object.values(variants)
      .map((variant) => ({
        oldPrice: Number(variant.oldPrice),
        newPrice: Number(variant.newPrice),
        stock: Number(variant.stock)
      }))
      .filter((variant) =>
        Number.isFinite(variant.oldPrice) &&
        Number.isFinite(variant.newPrice) &&
        Number.isFinite(variant.stock) &&
        variant.oldPrice >= 0 &&
        variant.newPrice >= 0 &&
        variant.stock >= 0
      );

    if (validPrices.length === 0) {
      card.style.display = "none";
      return;
    }

    // Prefer an in-stock variant for the collection price.
    const availablePrices = validPrices.filter(
      (variant) => variant.stock > 0
    );

    const priceList = availablePrices.length > 0
      ? availablePrices
      : validPrices;

    priceList.sort((a, b) => a.newPrice - b.newPrice);

    const displayPrice = priceList[0];

    // Work out paths from the current page.
    const isCollectionPage =
      /\/(MEN-PRODUCT|WOMEN-PRODUCT)\//i.test(location.pathname);

    const prefix = isCollectionPage ? "../" : "";

    const imagePath =
      prefix + folder.replace(/^\/+/, "") + "/1.png";

    const productPage = isCollectionPage
      ? "../PRODUCT-SYSTEM/product-details.html"
      : "PRODUCT-SYSTEM/product-details.html";

    // Fill product card.
    const image = card.querySelector(".card-img");
    const name = card.querySelector(".card-title");
    const oldPrice = card.querySelector(".card-old-price");
    const newPrice = card.querySelector(".card-price");
    const offer = card.querySelector(".card-offer");
    const badge = card.querySelector(".card-badge");
    const link = card.querySelector(".card-link");

    if (
      !image ||
      !name ||
      !oldPrice ||
      !newPrice ||
      !offer ||
      !badge ||
      !link
    ) {
      card.style.display = "none";
      return;
    }

    image.src = imagePath;
    image.alt = title;

    name.innerText = title;

    oldPrice.innerText = "₹" + displayPrice.oldPrice;
    newPrice.innerText = "₹" + displayPrice.newPrice;

    const discount = displayPrice.oldPrice > 0
      ? Math.round(
          ((displayPrice.oldPrice - displayPrice.newPrice) /
          displayPrice.oldPrice) * 100
        )
      : 0;

    offer.innerText = availablePrices.length === 0
      ? "SOLD OUT"
      : discount > 0
        ? `${discount}% OFF`
        : "";

    badge.innerText = colorName;
    badge.style.backgroundColor = colorHex;
    badge.style.color = getTextColor(colorHex);

    link.href = `${productPage}?id=${encodeURIComponent(id)}`;
    link.innerText = "EXPLORE";

    // Display only after successful validation.
    card.style.display = "";
  };

  script.onerror = function () {
    finish();
    card.style.display = "none";
  };

  script.src =
    VMOOD_API_URL +
    "?sku=" + encodeURIComponent(id) +
    "&callback=" + callbackName;

  document.head.appendChild(script);
}


// LOAD ALL COLLECTION AND HOME PRODUCT CARDS
document
  .querySelectorAll(".product-card[data-id], .home-product-card[data-id]")
  .forEach(loadCollectionProduct);
    
