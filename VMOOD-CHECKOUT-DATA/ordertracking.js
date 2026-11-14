// VMOOD ORDER TRACKING
const VMOOD_API_URL = "PASTE_NEW_APPS_SCRIPT_EXEC_URL_HERE";

function showTrackingMessage(message, className) {
  const result = document.getElementById("result");
  result.replaceChildren();

  const paragraph = document.createElement("p");
  paragraph.className = className || "";
  paragraph.textContent = message;
  result.appendChild(paragraph);
}

async function trackOrder() {
  const orderId = document.getElementById("orderId").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const button = document.querySelector(".tracking-card button");

  if (!orderId || !/^[6-9]\d{9}$/.test(phone)) {
    showTrackingMessage("Please enter your order ID and a valid 10-digit mobile number.", "error");
    return;
  }

  if (!VMOOD_API_URL || VMOOD_API_URL.includes("PASTE_NEW")) {
    showTrackingMessage("Order tracking is not connected yet. Please try again later.", "error");
    return;
  }

  button.disabled = true;
  button.textContent = "CHECKING...";

  try {
    const response = await fetch(VMOOD_API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "TRACK_ORDER",
        orderId: orderId,
        phone: phone
      })
    });

    const text = await response.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch (error) {
      throw new Error("The VMOOD server returned an invalid response.");
    }

    if (!response.ok || !data.success || !data.order) {
      throw new Error(data.message || "No order found. Please check your order ID and mobile number.");
    }

    const order = data.order;
    const result = document.getElementById("result");
    result.replaceChildren();

    const card = document.createElement("div");
    card.className = "success";

    function addLine(label, value, className) {
      const paragraph = document.createElement("p");
      if (className) paragraph.className = className;
      const strong = document.createElement("strong");
      strong.textContent = label + ":";
      const line = document.createElement("br");
      paragraph.append(strong, line, document.createTextNode(value || "-"));
      card.appendChild(paragraph);
    }

    const heading = document.createElement("p");
    heading.className = "status";
    heading.textContent = "ORDER DETAILS";
    card.appendChild(heading);

    addLine("Order ID", order.orderId);
    addLine("Product", order.productName);
    addLine("Size", order.size);
    addLine("Payment Status", order.paymentStatus || "PAID");
    addLine("Delivery Status", order.deliveryStatus || "PROCESSING");
    if (order.paymentMessage) {
      addLine("Payment Note", order.paymentMessage);
    }

    result.appendChild(card);

  } catch (error) {
    showTrackingMessage(error.message || "Unable to find your order. Please try again.", "error");
  } finally {
    button.disabled = false;
    button.textContent = "TRACK ORDER";
  }
}
