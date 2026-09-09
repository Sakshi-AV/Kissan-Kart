let products = [];
let cart = JSON.parse(localStorage.getItem("kissanCart") || "[]");
let activeCategory = "All";
const $ = s => document.querySelector(s);
const money = n => `₹${Number(n).toLocaleString("en-IN")}`;
async function loadProducts(){const params=new URLSearchParams();if(activeCategory!=="All")params.set("category",activeCategory);const q=$("#search").value.trim();if(q)params.set("search",q);const res=await fetch("/api/products?"+params.toString());products=await res.json();renderProducts()}
async function seedIfNeeded(){await fetch("/api/seed",{method:"POST"});loadProducts()}
function renderProducts(){$("#products").innerHTML=products.length?products.map(p=>`<article class="product"><div class="product-art"><span class="badge">${p.badge||"Farm fresh"}</span>${p.emoji||"🥕"}</div><div class="product-info"><h3>${p.name}</h3><p>${p.description||""}</p><div class="price-row"><div class="price">${money(p.price)} <small>/ ${p.unit}</small></div><button class="add" onclick="addToCart('${p._id}')">+</button></div></div></article>`).join(""):`<p style="color:var(--muted)">No harvest found. Try another search.</p>`}
function saveCart(){localStorage.setItem("kissanCart",JSON.stringify(cart));renderCart()}
function addToCart(id){const p=products.find(x=>x._id===id)||productsAll.find(x=>x._id===id);if(!p)return;const existing=cart.find(x=>x.productId===id);if(existing)existing.quantity++;else cart.push({productId:id,name:p.name,price:p.price,emoji:p.emoji,quantity:1});saveCart();openCart()}
let productsAll=[];async function cacheAll(){const r=await fetch("/api/products");productsAll=await r.json()}
function changeQty(id,delta){const item=cart.find(x=>x.productId===id);if(!item)return;item.quantity+=delta;if(item.quantity<=0)cart=cart.filter(x=>x.productId!==id);saveCart()}
function renderCart(){$("#cartCount").textContent=cart.reduce((s,x)=>s+x.quantity,0);$("#cartItems").innerHTML=cart.length?cart.map(x=>`<div class="cart-row"><div class="cart-emoji">${x.emoji}</div><div><h4>${x.name}</h4><p>${money(x.price)} each</p></div><div class="qty"><button onclick="changeQty('${x.productId}',-1)">−</button><b>${x.quantity}</b><button onclick="changeQty('${x.productId}',1)">+</button></div></div>`).join(""):`<p style="color:var(--muted)">Your basket is waiting for something delicious.</p>`;$("#cartTotal").textContent=money(cart.reduce((s,x)=>s+x.price*x.quantity,0))}
function openCart(){$("#cartDrawer").classList.add("open");$("#overlay").classList.add("show")}
function closeCart(){$("#cartDrawer").classList.remove("open");$("#overlay").classList.remove("show")}
$("#cartBtn").onclick=openCart;$("#closeCart").onclick=closeCart;$("#overlay").onclick=closeCart;
$("#themeToggle").onclick=()=>{document.documentElement.dataset.theme=document.documentElement.dataset.theme==="dark"?"light":"dark";localStorage.setItem("kissanTheme",document.documentElement.dataset.theme);$("#themeToggle").textContent=document.documentElement.dataset.theme==="dark"?"☾":"☼"};
if(localStorage.getItem("kissanTheme")==="dark"){document.documentElement.dataset.theme="dark";$("#themeToggle").textContent="☾"}
document.querySelectorAll(".category").forEach(btn=>btn.onclick=()=>{document.querySelector(".category.active").classList.remove("active");btn.classList.add("active");activeCategory=btn.dataset.category;loadProducts()});
let searchTimer;$("#search").oninput=()=>{clearTimeout(searchTimer);searchTimer=setTimeout(loadProducts,250)};
$("#checkoutBtn").onclick=()=>{if(!cart.length)return alert("Add at least one item to your basket.");$("#checkoutModal").classList.add("show");closeCart()};
$("#closeModal").onclick=()=>$("#checkoutModal").classList.remove("show");
$("#checkoutForm").onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.target);const customer=Object.fromEntries(fd.entries());const total=cart.reduce((s,x)=>s+x.price*x.quantity,0);const res=await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({customer,items:cart.map(({productId,name,price,quantity})=>({productId,name,price,quantity})),total})});const data=await res.json();if(res.ok){cart=[];saveCart();e.target.classList.add("hidden");$("#orderSuccess").classList.remove("hidden");$("#orderSuccess").innerHTML=`🌾 Order placed!<br><br>Your order ID is <strong>${data.orderId}</strong>.<br>We'll get your fresh basket moving.`}else alert(data.message||"Could not place order.")};
seedIfNeeded();cacheAll();renderCart();