const SUPABASE_URL = "https://hbgwmfddpcussmgyxvvv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiZ3dtZmRkcGN1c3NtZ3l4dnZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMzgyOTEsImV4cCI6MjA5NzYxNDI5MX0.TBUtrji1sZZlelyfzGQp9z3gwX48TBMZlAav5cn_7Dc";

const RAZORPAY_KEY_ID = "rzp_test_T4K1WoN4THMhEB";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function openCheckoutPopup(title, message) {
  document.getElementById("checkoutPopupTitle").innerText = title;
  document.getElementById("checkoutPopupMessage").innerText = message;

  const popup = document.getElementById("checkoutPopup");
  if (popup) {
    popup.style.display = "flex";
  }
}

function closeCheckoutPopup() {
  const popup = document.getElementById("checkoutPopup");
  if (popup) {
    popup.style.display = "none";
  }
}

const productName = localStorage.getItem("vmoodProductName");
const price = Number(localStorage.getItem("vmoodProductPrice"));
const size = localStorage.getItem("vmoodProductSize");
const productSku = localStorage.getItem("vmoodProductSku");

document.getElementById("checkoutProduct").innerText = productName || "";
document.getElementById("checkoutPrice").innerText = price ? "₹" + price : "";
document.getElementById("checkoutSize").innerText = size || "";
document.querySelector(".back-top-link").addEventListener("click", (e) => {
  e.preventDefault();
  history.back();
});

document.getElementById("continuePayment").addEventListener("click", () => {
  const name = document.getElementById("customerName").value.trim();
  const phone = document.getElementById("customerPhone").value.trim();
  const email = document.getElementById("customerEmail").value.trim();
  const address = document.getElementById("customerAddress").value.trim();
  const city = document.getElementById("customerCity").value.trim();
  const state = document.getElementById("customerState").value.trim();
  const pincode = document.getElementById("customerPincode").value.trim();

  if (
  !productName ||
  !Number.isFinite(price) ||
  price <= 0 ||
  !size ||
  !productSku
) {
  openCheckoutPopup(
    "Product Details Missing",
    "Please go back and select your product option again."
  );
  return;
}

  if (!name || !phone || !address || !city || !state || !pincode) {
     openCheckoutPopup("Delivery Details Required", "Please fill all delivery details correctly before continuing.");
    return;
  }

  // Full Name Validation
if (name.length < 3) {
  openCheckoutPopup("Full Name Required", "Please enter your full name correctly.");
  return;
}

// Mobile Number Validation
if (!/^[6-9]\d{9}$/.test(phone)) {
  openCheckoutPopup("Invalid Mobile Number", "Please enter a valid 10-digit mobile number.");
  return;
}

// Email Validation (optional)
if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  openCheckoutPopup("Invalid Email Address", "Please enter a valid email address or leave it blank.");
  return;
}

// Address Validation
if (address.length < 10) {
  openCheckoutPopup("Complete Address Required", "Please enter your complete delivery address.");
  return;
}

// City Validation
if (city.length < 2) {
  openCheckoutPopup("Invalid City", "Please enter a valid city.");
  return;
}

// Pincode Validation
if (!/^\d{6}$/.test(pincode)) {
  openCheckoutPopup("Invalid Pincode", "Please enter a valid 6-digit pincode.");
  return;
    }
  
  const orderId = "VM" + Date.now();

localStorage.setItem("vmoodOrderId", orderId);
localStorage.setItem("vmoodCustomerName", name);

  const options = {
    key: RAZORPAY_KEY_ID,
    amount: price * 100,
    currency: "INR",
    name: "VMOOD",
    description: productName + " - Size " + size,

    handler: async function (response) {
      const { error } = await supabaseClient
        .from("orders")
        .insert([
          {
            product_name: productName,
            sku: productSku,
            price: price,
            size: size,
            customer_name: name,
            phone: phone,
            email: email,
            address: address,
            city: city,
            state: state,
            pincode: pincode,
            order_id: orderId,
            payment_status: "PAID"
          }
        ]);

      if (error) {
        alert(JSON.stringify(error));
        return;
      }

      window.location.href = "thankyou.html";
    },

    prefill: {
      name: name,
      email: email,
      contact: phone
    },

    theme: {
      color: "#111111"
    }
  };

  const rzp = new Razorpay(options);
  rzp.open();
});
