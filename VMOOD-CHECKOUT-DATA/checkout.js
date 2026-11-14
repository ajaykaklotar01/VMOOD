// VMOOD SECURE CHECKOUT
// The Apps Script URL will be added after the final deployment.
const VMOOD_API_URL = "PASTE_NEW_APPS_SCRIPT_EXEC_URL_HERE";

let checkoutProcessing = false;
let paymentHandlerStarted = false;
let activeRazorpayOrderId = "";

function openCheckoutPopup(title, message) {
  document.getElementById("checkoutPopupTitle").innerText = title;
  document.getElementById("checkoutPopupMessage").innerText = message;
  document.getElementById("checkoutPopup").style.display = "flex";
}

function closeCheckoutPopup() {
  document.getElementById("checkoutPopup").style.display = "none";
}

async function vmoodApiRequest(payload) {
  if (!VMOOD_API_URL || VMOOD_API_URL.includes("PASTE_NEW")) {
    throw new Error("VMOOD checkout is not connected yet. Please try again later.");
  }

  const response = await fetch(VMOOD_API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  let data;

  try {
    data = JSON.parse(text);
  } catch (error) {
    throw new Error("The VMOOD server returned an invalid response. Please try again later.");
  }

  if (!response.ok || !data) {
    throw new Error(data && data.message ? data.message : "VMOOD server request failed.");
  }

  return data;
}

const productName = localStorage.getItem("vmoodProductName") || "";
const unitPrice = Number(localStorage.getItem("vmoodProductPrice"));
const size = localStorage.getItem("vmoodProductSize") || "";
const productSku = localStorage.getItem("vmoodProductSku") || "";
const quantity = Number(localStorage.getItem("vmoodProductQuantity") || 1);
const totalPrice = unitPrice * quantity;

document.getElementById("checkoutProduct").innerText = productName;
document.getElementById("checkoutPrice").innerText =
  Number.isFinite(unitPrice) && unitPrice > 0 ? "₹" + unitPrice : "";
document.getElementById("checkoutSize").innerText = size;
document.getElementById("checkoutQuantity").innerText =
  Number.isSafeInteger(quantity) && quantity > 0 ? quantity : "";
const totalElement = document.getElementById("checkoutTotal");
if (totalElement) {
  totalElement.innerText =
    Number.isFinite(totalPrice) && totalPrice > 0 ? "₹" + totalPrice : "";
}

document.querySelector(".back-top-link").addEventListener("click", function(event) {
  event.preventDefault();
  history.back();
});

document.getElementById("continuePayment").addEventListener("click", async function() {
  if (checkoutProcessing) return;

  const button = this;
  const name = document.getElementById("customerName").value.trim();
  const phone = document.getElementById("customerPhone").value.trim();
  const email = document.getElementById("customerEmail").value.trim();
  const address = document.getElementById("customerAddress").value.trim();
  const city = document.getElementById("customerCity").value.trim();
  const state = document.getElementById("customerState").value.trim();
  const pincode = document.getElementById("customerPincode").value.trim();

  if (
    !productName ||
    !Number.isFinite(unitPrice) ||
    unitPrice <= 0 ||
    !size ||
    !/^(MP|WP)[A-Z0-9_-]+$/i.test(productSku) ||
    !Number.isSafeInteger(quantity) ||
    quantity < 1 ||
    quantity > 20
  ) {
    openCheckoutPopup("Product Details Missing", "Please go back and select your product option again.");
    return;
  }

  if (name.length < 3 || name.length > 100) {
    openCheckoutPopup("Full Name Required", "Please enter your full name correctly.");
    return;
  }

  if (!/^[6-9]\d{9}$/.test(phone)) {
    openCheckoutPopup("Invalid Mobile Number", "Please enter a valid 10-digit mobile number.");
    return;
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    openCheckoutPopup("Invalid Email Address", "Please enter a valid email address or leave it blank.");
    return;
  }

  if (address.length < 10 || address.length > 300) {
    openCheckoutPopup("Complete Address Required", "Please enter your complete delivery address.");
    return;
  }

  if (city.length < 2 || city.length > 80 || state.length < 2 || state.length > 80) {
    openCheckoutPopup("Delivery Details Required", "Please enter a valid city and state.");
    return;
  }

  if (!/^\d{6}$/.test(pincode)) {
    openCheckoutPopup("Invalid Pincode", "Please enter a valid 6-digit pincode.");
    return;
  }

  checkoutProcessing = true;
  button.disabled = true;
  button.innerText = "PLEASE WAIT...";

  try {
    const created = await vmoodApiRequest({
      action: "CREATE_ORDER",
      sku: productSku,
      size: size,
      quantity: quantity,
      customerName: name,
      phone: phone,
      email: email,
      street: address,
      city: city,
      state: state,
      pincode: pincode
    });

    if (!created.success || !created.razorpayOrderId || !created.keyId || !created.amount) {
      throw new Error(created.message || "Unable to create your payment order.");
    }

    activeRazorpayOrderId = created.razorpayOrderId;
    paymentHandlerStarted = false;

    const options = {
      key: created.keyId,
      amount: created.amount,
      currency: created.currency || "INR",
      name: "VMOOD",
      description: (created.productName || productName) + " - " + created.size,
      order_id: created.razorpayOrderId,
      prefill: {
        name: name,
        email: email,
        contact: phone
      },
      theme: { color: "#111111" },

      handler: async function(paymentResponse) {
        paymentHandlerStarted = true;
        button.innerText = "VERIFYING PAYMENT...";

        try {
          const verified = await vmoodApiRequest({
            action: "VERIFY_PAYMENT",
            razorpay_order_id: paymentResponse.razorpay_order_id,
            razorpay_payment_id: paymentResponse.razorpay_payment_id,
            razorpay_signature: paymentResponse.razorpay_signature
          });

          if (!verified.success || !verified.paymentVerified) {
            throw new Error(verified.message || "Payment verification is pending. Please do not pay again.");
          }

          localStorage.setItem("vmoodCustomerName", name);
          localStorage.setItem("vmoodOrderId", verified.orderId || "VMOOD");
          localStorage.setItem("vmoodRazorpayOrderId", paymentResponse.razorpay_order_id);
          localStorage.setItem("vmoodOrderStatus", verified.orderStatus || "PAID");
          localStorage.setItem("vmoodPaymentStatus", "PAID");
          localStorage.setItem("vmoodPaymentMessage", verified.message || "Payment successful.");

          window.location.href = "thankyou.html";
        } catch (error) {
          openCheckoutPopup(
            "Payment Verification Pending",
            (error.message || "We could not confirm the payment yet.") +
            " Please do not pay again. Keep your Razorpay payment details and contact VMOOD support."
          );
          button.disabled = true;
          button.innerText = "PAYMENT CHECK PENDING";
        }
      },

      modal: {
        ondismiss: async function() {
          if (!paymentHandlerStarted && activeRazorpayOrderId) {
            try {
              await vmoodApiRequest({
                action: "CANCEL_ORDER",
                razorpay_order_id: activeRazorpayOrderId
              });
            } catch (error) {
              // The reservation will expire automatically after its 15-minute window.
            }
          }

          if (!paymentHandlerStarted) {
            checkoutProcessing = false;
            button.disabled = false;
            button.innerText = "CONTINUE TO PAYMENT";
          }
        }
      }
    };

    const razorpay = new Razorpay(options);

    razorpay.on("payment.failed", function() {
      openCheckoutPopup(
        "Payment Not Completed",
        "The payment was not completed. You can try again. If money was deducted, please do not pay again until the payment is checked."
      );
    });

    razorpay.open();

  } catch (error) {
    checkoutProcessing = false;
    button.disabled = false;
    button.innerText = "CONTINUE TO PAYMENT";
    openCheckoutPopup("VMOOD Checkout", error.message || "Unable to continue. Please try again.");
  }
});
