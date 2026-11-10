const VMOOD_CATALOG = {
  ...(typeof MEN_CATALOG !== "undefined" ? MEN_CATALOG : {}),
  ...(typeof WOMEN_CATALOG !== "undefined" ? WOMEN_CATALOG : {})
};

function getTextColor(bgColor) {
  const hex = bgColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 160 ? "#111111" : "#F6F3EE";
}

document
  .querySelectorAll(".product-card[data-id], .home-product-card[data-id]")
  .forEach((card) => {
  const id = card.dataset.id;
  const product = VMOOD_CATALOG[id];

  if (!product) return;

  card.querySelector(".card-img").src = `${product.folder}/1.png`;
  card.querySelector(".card-img").alt = product.title;

  card.querySelector(".card-title").innerText = product.title;
  card.querySelector(".card-old-price").innerText = "₹" + product.oldPrice;
card.querySelector(".card-price").innerText = "₹" + product.newPrice;
  const discount = Math.round(
  ((product.oldPrice - product.newPrice) / product.oldPrice) * 100
);

card.querySelector(".card-offer").innerText = `${discount}% OFF`;
  
  const badge = card.querySelector(".card-badge");
  badge.innerText = product.identity;
  badge.style.backgroundColor = product.identityColor;
  badge.style.color = getTextColor(product.identityColor);

  const isHome = location.pathname.endsWith("index.html") ||
               location.pathname === "/" ||
               location.pathname.endsWith("/");

const productPage = isHome
  ? "PRODUCT-SYSTEM/product-details.html"
  : "../PRODUCT-SYSTEM/product-details.html";

card.querySelector(".card-link").href =
  `${productPage}?id=${id}`;

  card.querySelector(".card-link").innerText = "EXPLORE";
});
