// VMOOD PAYMENT SUCCESS PAGE
const paymentVerified =
  sessionStorage.getItem("vmoodPaymentVerifiedThisSession") === "true" &&
  localStorage.getItem("vmoodPaymentStatus") === "PAID" &&
  Boolean(localStorage.getItem("vmoodOrderId"));

const customerName = paymentVerified
  ? (localStorage.getItem("vmoodCustomerName") || "Customer")
  : "Customer";
const orderId = paymentVerified
  ? localStorage.getItem("vmoodOrderId")
  : "Not available";
const paymentStatus = paymentVerified ? "PAID" : "NOT VERIFIED";
const paymentMessage = paymentVerified
  ? (localStorage.getItem("vmoodPaymentMessage") || "Your payment has been verified.")
  : "This page does not confirm a payment. Please complete checkout and wait for payment verification.";

const heading = document.querySelector(".thankyou-page h1");
if (heading) {
  heading.textContent = paymentVerified ? "ORDER CONFIRMED" : "ORDER STATUS";
}

document.getElementById("customerName").textContent = customerName;
document.getElementById("orderId").textContent = orderId;

const statusElement = document.querySelector(".payment-confirmed");
if (statusElement) {
  statusElement.textContent = paymentStatus;
}

const messageElement = document.getElementById("thankyouMessage");
if (messageElement) {
  messageElement.textContent = paymentMessage;
}

document.querySelectorAll(".thankyou-card > p").forEach((paragraph) => {
  if (
    !paymentVerified &&
    paragraph.textContent.includes("Your order is now being prepared")
  ) {
    paragraph.hidden = true;
  }
});
