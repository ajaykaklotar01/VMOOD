document.getElementById("customerName").innerText =
  localStorage.getItem("vmoodCustomerName") || "Customer";

document.getElementById("orderId").innerText =
  localStorage.getItem("vmoodOrderId") || "VMOOD";
