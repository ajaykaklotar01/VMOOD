// VMOOD PAYMENT SUCCESS PAGE
const customerName = localStorage.getItem("vmoodCustomerName") || "Customer";
const orderId = localStorage.getItem("vmoodOrderId") || "VMOOD";
const paymentStatus = localStorage.getItem("vmoodPaymentStatus") || "PAID";
const paymentMessage = localStorage.getItem("vmoodPaymentMessage") || "Your payment has been verified.";

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
