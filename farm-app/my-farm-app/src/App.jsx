// src/App.jsx
import React, { useState, useEffect } from 'react';
import './App.css';
// Charts + Notifications imports
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";


// ---------- API utilities ----------
const API_URL = 'http://localhost:3001/api';

async function loadState() {
  try {
    const response = await fetch(`${API_URL}/data`);
    if (!response.ok) return null;
    return await response.json();
  } catch (e) {
    console.error('loadState error', e);
    return null;
  }
}

async function saveState(state) {
  try {
    const response = await fetch(`${API_URL}/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state)
    });
    return response.ok;
  } catch (e) {
    console.error('saveState error', e);
    return false;
  }
}

// ---------- Mock starter data ----------
const starterState = {
  users: [
    { id: 'u_admin', role: 'admin', name: 'Admin', email: 'admin@farmvalue.com', password: 'admin123' },
    { id: 'u_farmer1', role: 'farmer', name: 'Farmer Ravi', email: 'ravi@farm.com', password: 'farmer123' },
    { id: 'u_buyer1', role: 'buyer', name: 'Buyer Asha', email: 'asha@buyer.com', password: 'buyer123' }
  ],
  products: [
    {
      id: 'p1',
      farmerId: 'u_farmer1',
      title: 'Homemade Mango Pickle (250g)',
      description: 'Traditionally fermented mango pickle. No preservatives.',
      price: 150,
      inventory: 30,
      images: ['/images/mango.jpg'],
      categories: ['Processed Food']
    },
    {
      id: 'p2',
      farmerId: 'u_farmer1',
      title: 'Chicken Pickle (350g)',
      description: 'Spicy chicken pickle made in small batches.',
      price: 500,
      inventory: 20,
      images: ['https://nirmalashomekitchen.com/wp-content/uploads/2025/06/chicken-pickle-6.jpg'],
      categories: ['Processed Food']
    },
    {
      id: 'p3',
      farmerId: 'u_farmer1',
      title: 'Handwoven Jute Basket',
      description: 'Durable handwoven jute basket — perfect for storage or decor.',
      price: 850,
      inventory: 12,
      images: ['https://artycraftz.com/cdn/shop/files/Handmade_Jute_Basket_for_Accessories_-_ArtyCraftz.com-1820114.jpg?v=1730903277'],
      categories: ['Handmade', 'Home']
    },
    {
      id: 'p4',
      farmerId: 'u_farmer1',
      title: 'Terracotta Pottery Mug',
      description: 'Hand-thrown terracotta mug with a natural glaze — dishwasher safe.',
      price: 420,
      inventory: 18,
      images: ['https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=300&fit=crop'],
      categories: ['Handmade', 'Kitchen']
    }
  ],
  orders: [],
  chats: []
};
// Global Notification Function
function notify(msg) {
  toast.success(msg, {
    position: "top-right",
    autoClose: 1800,
  });
}
// ---------------- CHARTS COMPONENTS ----------------

// Line Chart – Sales Over Time
function SalesChart({ orders }) {
  const data = orders.map(o => ({
    date: new Date(o.date).toLocaleDateString(),
    amount: o.items.reduce((s, i) => s + i.price * i.qty, 0)
  }));

  return (
    <div className="card">
      <h3>Sales Over Time</h3>
      <LineChart width={350} height={220} data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="amount" stroke="#0f766e" strokeWidth={2} />
      </LineChart>
    </div>
  );
}

// Pie Chart – Products by Category
function CategoryPieChart({ products }) {
  const categoryCount = {};

  products.forEach(p => {
    (p.categories || []).forEach(cat => {
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
  });

  const chartData = Object.entries(categoryCount).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ["#0ea5e9", "#10b981", "#c026d3", "#eab308", "#ef4444"];

  return (
    <div className="card">
      <h3>Products by Category</h3>
      <PieChart width={350} height={260}>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          outerRadius={90}
          label
        >
          {chartData.map((entry, idx) => (
            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </div>
  );
}

// Charts Page Wrapper
function ChartsPage({ state }) {
  return (
    <main>
      <div className="container fullwidth">
        <h2>Analytics Dashboard</h2>
        <p className="muted">Visual insights about sales & products</p>

        <div
          className="grid mt-12"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}
        >
          <SalesChart orders={state.orders} />
          <CategoryPieChart products={state.products} />
        </div>
      </div>
    </main>
  );
}


// ---------- Login Page ----------
function LoginPage({ onLogin, onSwitchToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaQ, setCaptchaQ] = useState('');
  const [captchaAns, setCaptchaAns] = useState('');
  const [userCaptcha, setUserCaptcha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function generateCaptcha() {
    const a = Math.floor(Math.random() * 10);
    const b = Math.floor(Math.random() * 10);
    setCaptchaQ(`${a} + ${b} = ?`);
    setCaptchaAns((a + b).toString());
  }

  useEffect(() => {
    generateCaptcha();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (userCaptcha.trim() !== captchaAns) {
      setError('Incorrect CAPTCHA');
      generateCaptcha();
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (data.success) onLogin(data.user);
      else setError(data.error || 'Invalid login');
    } catch {
      setError('Server error');
    }

    setLoading(false);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: 420, width: '100%' }}>
        <h2>Login</h2>

        <form onSubmit={handleSubmit} className="form">
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />

          <label>CAPTCHA: {captchaQ}</label>
          <input type="text" value={userCaptcha} onChange={e=>setUserCaptcha(e.target.value)} required />
          <a href="#" onClick={(e)=>{e.preventDefault();generateCaptcha();}}>Refresh</a>

          {error && <div style={{ color: 'red' }}>{error}</div>}

          <button type="submit">{loading ? "Logging in..." : "Login"}</button>
        </form>

        <p style={{ textAlign: 'center' }}>
          Don't have an account?
          <a href="#" onClick={(e)=>{e.preventDefault();onSwitchToSignup();}}> Sign up</a>
        </p>
      </div>
    </div>
  );
}

// ---------- Signup Page ----------
function SignupPage({ onSignup, onSwitchToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer');
  const [error, setError] = useState('');
    async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });

      const data = await response.json();
      if (data.success) onSignup(data.user);
      else setError(data.error || 'Signup failed');
    } catch {
      setError('Server error');
    }
  }

  return (
    <div style={{ minHeight: '100vh', display:'flex', justifyContent:'center', alignItems:'center' }}>
      <div className="card" style={{ maxWidth:420, width:'100%' }}>
        <h2>Create Account</h2>

        <form onSubmit={handleSubmit} className="form">
          <input type="text" placeholder="Full Name" value={name} onChange={e=>setName(e.target.value)} required />
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
          <select value={role} onChange={e=>setRole(e.target.value)}>
            <option value="buyer">Buyer</option>
            <option value="farmer">Farmer</option>
          </select>

          {error && <div style={{ color:'red' }}>{error}</div>}
          <button type="submit">Sign Up</button>
        </form>

        <p style={{ textAlign:'center' }}>
          Already have an account?  
          <a href="#" onClick={(e)=>{e.preventDefault();onSwitchToLogin();}}> Login</a>
        </p>
      </div>
    </div>
  );
}

// ---------- Logo ----------
function FarmLogo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <path d="M50 15L20 40V75H80V40L50 15Z" fill="#d97706" stroke="#92400e" strokeWidth="2"/>
      <rect x="42" y="55" width="16" height="20" fill="#78350f" />
      <ellipse cx="50" cy="80" rx="35" ry="8" fill="#16a34a" opacity="0.6"/>
    </svg>
  );
}

// ---------- Header ----------
function Header({ darkMode, setDarkMode, currentUser, onLogout, currentPage, setCurrentPage }) {
  function toggleDark() {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem("fvf_theme", next ? "dark" : "light");
      return next;
    });
  }

  return (
    <header className="navbar">
      <div className="logo" onClick={()=>setCurrentPage('explore')} style={{ cursor:'pointer' }}>
        <FarmLogo size={40} />
        <div className="logo-text">FarmValue</div>
      </div>

      <nav className="nav-center">
        <a className={`nav-item ${currentPage==='explore'?'active':''}`} href="#" onClick={(e)=>{e.preventDefault();setCurrentPage('explore')}}>Explore</a>
        <a className={`nav-item ${currentPage==='farmers'?'active':''}`} href="#" onClick={(e)=>{e.preventDefault();setCurrentPage('farmers')}}>Farmers</a>
        <a className={`nav-item ${currentPage==='orders'?'active':''}`} href="#" onClick={(e)=>{e.preventDefault();setCurrentPage('orders')}}>Orders</a>
        <a className={`nav-item ${currentPage==='about'?'active':''}`} href="#" onClick={(e)=>{e.preventDefault();setCurrentPage('about')}}>About</a>
        <a
        
  className={`nav-item ${currentPage === 'charts' ? 'active' : ''}`}
  href="#charts"
  onClick={(e) => { e.preventDefault(); setCurrentPage('charts'); }}
>
  Charts
</a>
<a
  className={`nav-item ${currentPage === 'chat' ? 'active' : ''}`}
  href="#chat"
  onClick={(e) => { e.preventDefault(); setCurrentPage('chat'); }}
>
  Chat
</a>


        {currentUser.role==='farmer' && 
          <a className={`nav-item ${currentPage==='dashboard'?'active':''}`} href="#" onClick={(e)=>{e.preventDefault();setCurrentPage('dashboard')}}>
            Dashboard
          </a>
        }

        {currentUser.role==='admin' &&
          <a className={`nav-item ${currentPage==='admin'?'active':''}`} href="#" onClick={(e)=>{e.preventDefault();setCurrentPage('admin')}}>
            Admin
          </a>
        }
      </nav>

      <div className="navbar-right">
        <button className="icon-btn" onClick={toggleDark}>🌓</button>
        <span className="muted">Hi, {currentUser.name}</span>
        <button className="secondary" onClick={onLogout}>Logout</button>
      </div>
    </header>
  );
}

// ---------- Farmers Page ----------
function FarmersPage({ state }) {
  const farmers = state.users.filter(u => u.role === 'farmer');

  return (
    <main>
      <div className="container fullwidth">
        <h2>Our Farmers</h2>

        <div className="grid mt-12">
          {farmers.map(f => {
            const myProducts = state.products.filter(p => p.farmerId === f.id);
            return (
              <div key={f.id} className="card">
                <h4>{f.name}</h4>
                <p className="muted">{f.email}</p>
                <div className="meta">{myProducts.length} products</div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
// ---------- Orders Page ----------
function OrdersPage({ state, currentUser }) {
  const userOrders =
    currentUser.role === "admin"
      ? state.orders
      : state.orders.filter((o) => o.buyerId === currentUser.id);

  const totalSpent = userOrders.reduce((sum, order) => {
    return (
      sum +
      order.items.reduce(
        (orderSum, item) => orderSum + item.price * item.qty,
        0
      )
    );
  }, 0);

  return (
    <main>
      <div className="container fullwidth">
        <h2>Your Orders</h2>

        {userOrders.length === 0 ? (
          <div className="card mt-12">
            <p className="muted">No orders yet</p>
          </div>
        ) : (
          <div className="mt-12">
            {userOrders.map((order) => {
              const total = order.items.reduce(
                (sum, item) => sum + item.price * item.qty,
                0
              );

              return (
                <div key={order.id} className="card" style={{ marginBottom: 20 }}>
                  <h4>Order #{order.id}</h4>
                  <p className="small muted">
                    {new Date(order.date).toLocaleString()}
                  </p>

                  <div style={{ marginTop: 12 }}>
                    {order.items.map((item, idx) => {
                      const prod = state.products.find(
                        (p) => p.id === item.productId
                      );
                      return (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginTop: 4
                          }}
                        >
                          <span className="small">
                            {prod?.title || "Product"} × {item.qty}
                          </span>
                          <span className="small">
                            ₹{item.qty * item.price}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="meta" style={{ marginTop: 12 }}>
                    Total: ₹{total}
                  </div>

                  <div
                    className="small"
                    style={{
                      marginTop: 8,
                      padding: "4px 8px",
                      background: "var(--accent-100)",
                      borderRadius: 6,
                      display: "inline-block"
                    }}
                  >
                    {order.status}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

// ---------- About Page ----------
function AboutPage() {
  return (
    <main>
      <div className="container" style={{ maxWidth: 800 }}>
        <h2>About FarmValue</h2>

        <div className="card mt-12">
          <h3>Our Mission</h3>
          <p>
            FarmValue connects local farmers and buyers directly ensuring fair
            pricing and transparency.
          </p>
        </div>

        <div className="card mt-12">
          <h3>How It Works</h3>
          <ul style={{ marginTop: 12 }}>
            <li>Farmers list products</li>
            <li>Buyers explore and order</li>
            <li>Payment & delivery management</li>
          </ul>
        </div>
      </div>
    </main>
  );
}

// ---------- ProductCard ----------
function ProductCard({ p, onAddToCart, onEdit, onDelete, showFarmer }) {
  const img = p.images && p.images.length ? p.images[0] : null;

  return (
    <article className="card product-card">
      {img && (
        <div className="product-img-wrap">
          <img src={img} className="product-img" alt={p.title} />
        </div>
      )}

      <h4>{p.title}</h4>
      <p className="desc">{p.description}</p>

      <div className="meta">
        ₹{p.price} — {p.inventory} in stock
      </div>

      {showFarmer && (
        <div className="farmer">Farmer: {p.farmerName || p.farmerId}</div>
      )}

      <div className="row" style={{ marginTop: 12 }}>
        {onAddToCart && (
          <button onClick={() => onAddToCart(p)}>Add to Cart</button>
        )}
        {onEdit && (
          <button onClick={() => onEdit(p)} className="secondary">
            Edit
          </button>
        )}
        {onDelete && (
          <button onClick={() => onDelete(p)} className="secondary">
            Delete
          </button>
        )}
      </div>
    </article>
  );
}

// ---------- Buyer Catalog ----------
function BuyerCatalog({ state, addToCart, cart, removeFromCart, placeOrder }) {
  const products = state.products.map((prod) => ({
    ...prod,
    farmerName: (state.users.find((u) => u.id === prod.farmerId) || {})
      .name
  }));

  return (
    <main>
      <div className="container fullwidth">
        <h2>Explore Products</h2>

        <div className="grid mt-12">
          {products.map((p) => (
            <ProductCard key={p.id} p={p} onAddToCart={addToCart} showFarmer />
          ))}
        </div>

        <section className="mt-22">
          <h3>Your Cart</h3>

          {cart.length === 0 ? (
            <div className="muted">Cart is empty</div>
          ) : (
            <>
              {cart.map((c) => (
                <div className="cart-item" key={c.productId}>
                  <div>
                    <strong>{c.title}</strong>
                    <div className="small">
                      Qty: {c.qty} — ₹{c.price}
                    </div>
                  </div>

                  <button
                    className="secondary"
                    onClick={() => removeFromCart(c.productId)}
                  >
                    Remove
                  </button>
                </div>
              ))}

              <button className="mt-10" onClick={placeOrder}>
                Place Order
              </button>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
// ---------- Farmer Dashboard ----------
function FarmerDashboard({ state, setState, currentFarmerId }) {
  const farmer = state.users.find((u) => u.id === currentFarmerId);
  const myProducts = state.products.filter((p) => p.farmerId === currentFarmerId);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    inventory: "",
    categories: ""
  });

  const [editingId, setEditingId] = useState(null);

  function saveProduct(e) {
    e.preventDefault();

    const payload = {
      id: editingId || "p_" + Date.now(),
      farmerId: currentFarmerId,
      title: form.title,
      description: form.description,
      price: Number(form.price),
      inventory: Number(form.inventory),
      categories: form.categories.split(",").map((x) => x.trim()),
      images: []
    };

    let updated;
    if (editingId) {
      updated = state.products.map((p) => (p.id === editingId ? payload : p));
    } else {
      updated = [payload, ...state.products];
    }

    const newState = { ...state, products: updated };
    setState(newState);
    saveState(newState);

    setForm({
      title: "",
      description: "",
      price: "",
      inventory: "",
      categories: ""
    });
    setEditingId(null);
  }

  function editProduct(p) {
    setEditingId(p.id);
    setForm({
      title: p.title,
      description: p.description,
      price: p.price,
      inventory: p.inventory,
      categories: p.categories.join(", ")
    });
  }

  function deleteProduct(p) {
    if (!confirm("Delete this product?")) return;

    const updated = state.products.filter((x) => x.id !== p.id);
    const newState = { ...state, products: updated };
    setState(newState);
    saveState(newState);
  }

  return (
    <main>
      <div className="container fullwidth">
        <h2>{farmer?.name} — Dashboard</h2>

        <div className="mt-12" style={{ display: "flex", gap: 20 }}>
          <div style={{ flex: 1 }}>
            <h3>{editingId ? "Edit Product" : "Add Product"}</h3>

            <form onSubmit={saveProduct} className="form">
              <input
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                required
              />
              <div className="form-row">
                <input
                  type="number"
                  placeholder="Price"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
                <input
                  type="number"
                  placeholder="Inventory"
                  value={form.inventory}
                  onChange={(e) =>
                    setForm({ ...form, inventory: e.target.value })
                  }
                  required
                />
              </div>

              <input
                placeholder="Categories (comma separated)"
                value={form.categories}
                onChange={(e) =>
                  setForm({ ...form, categories: e.target.value })
                }
              />

              <div className="actions">
                <button type="submit">
                  {editingId ? "Save Changes" : "Add Product"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => {
                      setEditingId(null);
                      setForm({
                        title: "",
                        description: "",
                        price: "",
                        inventory: "",
                        categories: ""
                      });
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div style={{ flex: 1 }}>
            <h3>Your Products</h3>

            {myProducts.length === 0 ? (
              <p className="muted">No products yet.</p>
            ) : (
              <div className="grid mt-10">
                {myProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    p={{ ...p, farmerName: farmer.name }}
                    onEdit={editProduct}
                    onDelete={deleteProduct}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

// ---------- Admin Panel ----------
function AdminPanel({ state, setState }) {
  function deleteProduct(p) {
    if (!confirm("Admin: Delete this product?")) return;
    const updated = state.products.filter((x) => x.id !== p.id);
    const newState = { ...state, products: updated };
    setState(newState);
    saveState(newState);
  }

  return (
    <main>
      <div className="container fullwidth">
        <h2>Admin Panel</h2>

        <section className="mt-10">
          <h3>All Users</h3>
          <ul>
            {state.users.map((u) => (
              <li key={u.id}>
                {u.name} — {u.role}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16">
          <h3>All Products</h3>
          <div className="grid mt-8">
            {state.products.map((p) => {
              const farmer = state.users.find((u) => u.id === p.farmerId);
              return (
                <ProductCard
                  key={p.id}
                  p={{ ...p, farmerName: farmer?.name }}
                  onDelete={deleteProduct}
                />
              );
            })}
          </div>
        </section>

        <section className="mt-20">
          <h3>Orders</h3>
          {state.orders.length === 0 ? (
            <p className="muted">No orders yet</p>
          ) : (
            <ul>
              {state.orders.map((o) => (
                <li key={o.id}>
                  {o.id} — {o.items.length} items —{" "}
                  {new Date(o.date).toLocaleString()}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

// ---------- Payment Popup ----------
function PaymentPopup({ amount, onClose, onSuccess }) {
  const [method, setMethod] = useState("");

  function handlePay() {
    if (!method) {
      notify("Please select a payment method!");
      return;
    }

    notify("Payment Successful!");

    onSuccess();
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999
      }}
    >
      <div className="card" style={{ maxWidth: 400, width: "90%" }}>
        <h3>Choose Payment Method</h3>
        <p>
          Total Amount: <strong>₹{amount}</strong>
        </p>

        <div style={{ marginTop: 10 }}>
          <label>
            <input
              type="radio"
              value="card"
              onChange={(e) => setMethod(e.target.value)}
            />{" "}
            Card
          </label>
          <br />
          <label>
            <input
              type="radio"
              value="upi"
              onChange={(e) => setMethod(e.target.value)}
            />{" "}
            UPI
          </label>
          <br />
          <label>
            <input
              type="radio"
              value="wallet"
              onChange={(e) => setMethod(e.target.value)}
            />{" "}
            Wallet
          </label>
          <br />
          <label>
            <input
              type="radio"
              value="cod"
              onChange={(e) => setMethod(e.target.value)}
            />{" "}
            Cash on Delivery
          </label>
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
          <button onClick={handlePay}>Pay Now</button>
          <button className="secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
// ---------------- Chat Page ----------------
function ChatPage({ currentUser, state, setState }) {
  const [message, setMessage] = useState("");

  // Show only chats involving current user
  const chats = state.chats.filter(
    (c) => c.user1 === currentUser.id || c.user2 === currentUser.id
  );

  function sendMessage(toUser) {
    if (!message.trim()) return;

    const newChat = {
      id: "chat_" + Date.now(),
      user1: currentUser.id,
      user2: toUser,
      message,
      time: new Date().toLocaleString()
    };

    const updated = { ...state, chats: [...state.chats, newChat] };
    setState(updated);
    saveState(updated);

    setMessage("");
    notify("Message sent!");
  }

  return (
    <main>
      <div className="container fullwidth">
        <h2>Chats</h2>

        <div className="card mt-12">
          <h3>Your Messages</h3>

          {chats.length === 0 ? (
            <p className="muted">No chats yet</p>
          ) : (
            chats.map((c) => (
              <div
                key={c.id}
                style={{
                  margin: "10px 0",
                  padding: "10px",
                  borderBottom: "1px solid var(--surface-border)"
                }}
              >
                <strong>
                  {c.user1 === currentUser.id ? "You → " : "From "}
                  {
                    (state.users.find(
                      (u) =>
                        u.id === (c.user1 === currentUser.id ? c.user2 : c.user1)
                    ) || {}
                  ).name
                }
                </strong>
                <div className="small">{c.message}</div>
                <div className="small muted">{c.time}</div>
              </div>
            ))
          )}
        </div>

        <div className="card mt-20">
          <h3>Send a Message</h3>

          <select id="chat_user" className="mt-8">
            {state.users
              .filter((u) => u.id !== currentUser.id)
              .map((u) => (
                <option value={u.id} key={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
          </select>

          <textarea
            className="mt-8"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button
            className="mt-10"
            onClick={() =>
              sendMessage(document.getElementById("chat_user").value)
            }
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}

// ---------- Main App ----------
export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("fvf_current_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [showSignup, setShowSignup] = useState(false);
  const [currentPage, setCurrentPage] = useState("explore");

  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const [state, setState] = useState(starterState);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Load server data
  useEffect(() => {
    async function fetchData() {
      const serverData = await loadState();
      if (serverData) {
        setState(serverData);
      }
      setDataLoaded(true);
    }
    fetchData();
  }, []);

  // Theme setup
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem("fvf_theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("fvf_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Cart
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem("fvf_cart_v1");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("fvf_cart_v1", JSON.stringify(cart));
  }, [cart]);

  // cart functions
  function addToCart(product) {
    setCart((prev) => {
      const found = prev.find((i) => i.productId === product.id);
      if (found) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      } else {
        return [
          {
            productId: product.id,
            title: product.title,
            price: product.price,
            qty: 1
          },
          ...prev
        ];
      }
    });
  }

  function removeFromCart(productId) {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }

  // ------------ FIXED PAYMENT FLOW ------------
  function placeOrder() {
    if (cart.length === 0) return notify("Cart empty");

    if (!currentUser) {
      notify("Please login to place an order");
      return;
    }

    const totalAmount = cart.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );

    setPaymentAmount(totalAmount);
    setShowPayment(true);
  }

  function completeOrder() {
    const order = {
      id: "o_" + Date.now(),
      items: cart.map((c) => ({
        productId: c.productId,
        qty: c.qty,
        price: c.price
      })),
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      buyerEmail: currentUser.email,
      date: new Date().toISOString(),
      status: "Paid"
    };

    const newState = { ...state, orders: [...state.orders, order] };
    setState(newState);
    saveState(newState);

    setCart([]);
    setShowPayment(false);

    notify("Payment Successful! Order ID: " + order.id);
  }

  // Login/Signup
  function handleLogin(user) {
    setCurrentUser(user);
    localStorage.setItem("fvf_current_user", JSON.stringify(user));
  }

  function handleSignup(user) {
    setCurrentUser(user);
    localStorage.setItem("fvf_current_user", JSON.stringify(user));
  }

  function handleLogout() {
    setCurrentUser(null);
    localStorage.removeItem("fvf_current_user");
  }

  // Loading state
  if (!dataLoaded) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        Loading...
      </div>
    );
  }

  // Not logged in
  if (!currentUser) {
    return showSignup ? (
      <SignupPage
        onSignup={handleSignup}
        onSwitchToLogin={() => setShowSignup(false)}
      />
    ) : (
      <LoginPage
        onLogin={handleLogin}
        onSwitchToSignup={() => setShowSignup(true)}
      />
    );
  }

  // Page rendering
  function renderPage() {
    switch (currentPage) {
      case "explore":
        return (
          <BuyerCatalog
            state={state}
            addToCart={addToCart}
            cart={cart}
            removeFromCart={removeFromCart}
            placeOrder={placeOrder}
          />
        );
      case "farmers":
        return <FarmersPage state={state} />;
        case "charts":
  return <ChartsPage state={state} />;
  case "chat":
  return <ChatPage currentUser={currentUser} state={state} setState={setState} />;


      case "orders":
        return <OrdersPage state={state} currentUser={currentUser} />;
      case "about":
        return <AboutPage />;
      case "dashboard":
        return (
          <FarmerDashboard
            state={state}
            setState={setState}
            currentFarmerId={currentUser.id}
          />
        );
      case "admin":
        return <AdminPanel state={state} setState={setState} />;
      default:
        return <BuyerCatalog state={state} />;
    }
  }

  return (
    <div>
      <ToastContainer />

      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        currentUser={currentUser}
        onLogout={handleLogout}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      {renderPage()}

      {/* ------- Payment Popup ------- */}
      {showPayment && (
        <PaymentPopup
          amount={paymentAmount}
          onClose={() => setShowPayment(false)}
          onSuccess={completeOrder}
        />
      )}

      <footer>
        <small className="small">
          FarmValue — Connecting farmers & buyers directly.
        </small>
      </footer>
    </div>
  );
}

