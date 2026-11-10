const supabaseUrl = "https://hbgwmfddpcussmgyxvvv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiZ3dtZmRkcGN1c3NtZ3l4dnZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMzgyOTEsImV4cCI6MjA5NzYxNDI5MX0.TBUtrji1sZZlelyfzGQp9z3gwX48TBMZlAav5cn_7Dc";
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

function trackOrder() {
  const orderId = document.getElementById("orderId").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const result = document.getElementById("result");

  if (!orderId || !phone) {
    result.innerHTML = `<p class="error">Please enter your order ID and mobile number.</p>`;
    return;
  }

  result.innerHTML = "Checking your VMOOD order...";

  supabaseClient
    .from("orders")
    .select("*")
    .eq("order_id", orderId)
    .eq("phone", phone)
    .single()
    .then(({ data, error }) => {
      if (error || !data) {
        result.innerHTML = `<p class="error">No order found. Please check your order ID and mobile number.</p>`;
        return;
      }

      result.innerHTML = `
        <div class="success">
          <p class="status">ORDER CONFIRMED</p>
          <p><strong>Order ID:</strong><br>${data.order_id}</p>
          <p><strong>Product:</strong><br>${data.product_name}</p>
          <p><strong>Size:</strong><br>${data.size}</p>
          <p><strong>Payment Status:</strong><br>${data.payment_status}</p>
          <p><strong>Delivery Status:</strong><br>${data.delivery_status || "Preparing Your VMOOD Order"}</p>
        </div>
      `;
    });
}
