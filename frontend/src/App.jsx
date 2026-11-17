import { useEffect, useState } from "react";
import {
  LayoutDashboard, Users, ClipboardList, Video, Mic,
  Image, Bot, Wallet, Settings, Plus,
  Bell, Film, TrendingUp, Search
} from "lucide-react";
import "./App.css";
import AIStudio from "./AIStudio";
import VideoStudio from "./VideoStudio";
import VoiceStudio from "./VoiceStudio";

const API = "http://localhost:4000/api";

function App() {
  const [clients, setClients] = useState([]);
  const [orders, setOrders] = useState([]);
  const [active, setActive] = useState("Bosh sahifa");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [clientId, setClientId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [paid, setPaid] = useState("0");
  const [loading, setLoading] = useState(false);

  async function loadClients() {
    try {
      const r = await fetch(`${API}/clients`);
      const d = await r.json();
      if (d.success) setClients(d.clients);
    } catch (e) { console.error(e); }
  }

  async function loadOrders() {
    try {
      const r = await fetch(`${API}/orders`);
      const d = await r.json();
      if (d.success) setOrders(d.orders);
    } catch (e) { console.error(e); }
  }

  useEffect(() => {
    loadClients();
    loadOrders();
  }, []);

  async function addClient(e) {
    e.preventDefault();
    try {
      const r = await fetch(`${API}/clients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone })
      });
      const d = await r.json();
      if (d.success) {
        setName("");
        setPhone("");
        setShowForm(false);
        await loadClients();
      } else alert(d.message || "Xatolik");
    } catch { alert("Server bilan aloqa yo'q"); }
  }

  async function addOrder(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await fetch(`${API}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: Number(clientId),
          title,
          description,
          price: Number(price),
          paid: Number(paid)
        })
      });
      const d = await r.json();
      if (d.success) {
        setShowForm(false);
        setClientId("");
        setTitle("");
        setDescription("");
        setPrice("");
        setPaid("0");
        await loadOrders();
        alert("Buyurtma muvaffaqiyatli saqlandi!");
      } else alert(d.message || "Buyurtma saqlanmadi");
    } catch { alert("Server bilan aloqa yo'q"); }
    finally { setLoading(false); }
  }

  async function changeStatus(id, status) {
    try {
      const r = await fetch(`${API}/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const d = await r.json();
      if (d.success) loadOrders();
      else alert(d.message || "Holat o'zgarmadi");
    } catch { alert("Server bilan aloqa yo'q"); }
  }

  const money = n => Number(n || 0).toLocaleString("uz-UZ") + " so'm";

  const menu = [
    { name: "Bosh sahifa", icon: LayoutDashboard },
    { name: "Mijozlar", icon: Users },
    { name: "Buyurtmalar", icon: ClipboardList },
    { name: "AI Studio", icon: Bot },
    { name: "AI Ovoz studiyasi", icon: Mic },
    { name: "Video montaj", icon: Film },
    { name: "Media fayllar", icon: Image },
    { name: "Moliya", icon: Wallet },
    { name: "Sozlamalar", icon: Settings }
  ];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">J</div>
          <div><h2>JAGA<span>AI</span></h2><small>CREATIVE STUDIO</small></div>
        </div>
        <p className="menu-label">ASOSIY MENYU</p>
        <nav>
          {menu.map(item => (
            <button key={item.name}
              className={active === item.name ? "menu-item active" : "menu-item"}
              onClick={() => { setActive(item.name); setShowForm(false); }}>
              <item.icon size={19}/>{item.name}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="online-dot"></div><span>Mahalliy server faol</span>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div><span className="top-label">JAGA AI STUDIO /</span><h2>{active}</h2></div>
          <div className="top-actions">
            <button className="icon-btn"><Bell size={19}/></button>
            <div className="profile">
              <div className="avatar">J</div>
              <div><b>Administrator</b><small>Shaxsiy kabinet</small></div>
            </div>
          </div>
        </header>

        {active === "Bosh sahifa" && (
          <>
            <section className="welcome">
              <div>
                <span className="welcome-tag">CREATIVE WORKSPACE</span>
                <h1>Salom! JAGA AI STUDIO'ga xush kelibsiz.</h1>
                <p>Mijozlaringiz, buyurtmalaringiz va kreativ loyihalaringizni boshqaring.</p>
              </div>
              <div className="welcome-icon"><Video size={65}/></div>
            </section>
            <section className="stats">
              <div className="stat-card"><Users/><span>JAMI MIJOZLAR</span><strong>{clients.length}</strong><small>Bazada saqlangan mijozlar</small></div>
              <div className="stat-card"><ClipboardList/><span>BUYURTMALAR</span><strong>{orders.length}</strong><small>Jami buyurtmalar</small></div>
              <div className="stat-card"><Film/><span>TAYYOR VIDEOLAR</span><strong>0</strong><small>Eksport qilingan videolar</small></div>
              <div className="stat-card"><TrendingUp/><span>JAMI TUSHUM</span><strong>{money(orders.reduce((s,o) => s + Number(o.paid || 0), 0))}</strong><small>Buyurtmalardan tushgan to'lov</small></div>
            </section>
            <section className="content-card">
              <div className="section-head">
                <div><h3>So'nggi mijozlar</h3><p>Mijozlar bazasidagi ma'lumotlar</p></div>
                <button className="primary-btn" onClick={() => {setActive("Mijozlar");setShowForm(true);}}><Plus size={18}/> Mijoz qo'shish</button>
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>MIJOZ</th><th>TELEFON</th><th>TELEGRAM</th><th>SANA</th></tr></thead>
                  <tbody>
                    {clients.map(c => <tr key={c.id}><td><b>{c.name}</b></td><td>{c.phone || "—"}</td><td>{c.telegram || "—"}</td><td>{c.created_at}</td></tr>)}
                    {!clients.length && <tr><td colSpan="4" className="empty">Hozircha mijozlar mavjud emas.</td></tr>}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {active === "Mijozlar" && (
          <section className="content-card">
            <div className="section-head">
              <div><h3>Mijozlar bazasi</h3><p>Jami {clients.length} ta mijoz</p></div>
              <button className="primary-btn" onClick={() => setShowForm(!showForm)}><Plus size={18}/> Mijoz qo'shish</button>
            </div>
            {showForm && <form className="client-form" onSubmit={addClient}>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Mijoz ismi" required/>
              <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Telefon raqami"/>
              <button className="primary-btn">Saqlash</button>
              <button type="button" className="cancel-btn" onClick={()=>setShowForm(false)}>Bekor qilish</button>
            </form>}
            {clients.map(c=><div className="client-row" key={c.id}><div className="avatar">{c.name[0]}</div><div><b>{c.name}</b><small>{c.phone || "Telefon kiritilmagan"}</small></div></div>)}
          </section>
        )}

        {active === "Buyurtmalar" && (
          <section className="content-card">
            <div className="section-head">
              <div><h3>Buyurtmalar boshqaruvi</h3><p>Jami {orders.length} ta buyurtma</p></div>
              <button className="primary-btn" onClick={() => {loadClients();setShowForm(!showForm);}}><Plus size={18}/> Yangi buyurtma</button>
            </div>

            {showForm && <form className="client-form" onSubmit={addOrder}>
              <select value={clientId} onChange={e=>setClientId(e.target.value)} required>
                <option value="">Mijozni tanlang</option>
                {clients.map(c=><option key={c.id} value={c.id}>{c.name} — {c.phone}</option>)}
              </select>
              <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Buyurtma nomi" required/>
              <input value={description} onChange={e=>setDescription(e.target.value)} placeholder="Buyurtma haqida"/>
              <input type="number" min="0" value={price} onChange={e=>setPrice(e.target.value)} placeholder="Narxi (so'm)" required/>
              <input type="number" min="0" value={paid} onChange={e=>setPaid(e.target.value)} placeholder="To'langan summa"/>
              <button className="primary-btn" disabled={loading}>{loading ? "Saqlanmoqda..." : "Buyurtmani saqlash"}</button>
              <button type="button" className="cancel-btn" onClick={()=>setShowForm(false)}>Bekor qilish</button>
            </form>}

            <div className="table-wrap">
              <table>
                <thead><tr><th>BUYURTMA</th><th>MIJOZ</th><th>NARXI</th><th>TO'LANGAN</th><th>QARZ</th><th>HOLATI</th></tr></thead>
                <tbody>
                  {orders.map(o=><tr key={o.id}>
                    <td><b>{o.title}</b><small>{o.description}</small></td>
                    <td>{o.client_name}<small>{o.client_phone}</small></td>
                    <td>{money(o.price)}</td>
                    <td>{money(o.paid)}</td>
                    <td>{money(Math.max(0,Number(o.price)-Number(o.paid)))}</td>
                    <td><select value={o.status} onChange={e=>changeStatus(o.id,e.target.value)}>
                      <option value="new">Yangi</option>
                      <option value="in_progress">Jarayonda</option>
                      <option value="completed">Tayyor</option>
                      <option value="cancelled">Bekor qilingan</option>
                    </select></td>
                  </tr>)}
                  {!orders.length && <tr><td colSpan="6" className="empty">Hozircha buyurtmalar mavjud emas.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {active === "AI Studio" && <AIStudio />}
        {active === "Video montaj" && <VideoStudio />}
        {active === "AI Ovoz studiyasi" && <VoiceStudio />}
        {!["Bosh sahifa","Mijozlar","Buyurtmalar","AI Studio","Video montaj","AI Ovoz studiyasi"].includes(active) && (
          <section className="content-card coming">
            <Bot size={42}/><h2>{active}</h2>
            <p>Bu bo'limning funksiyalarini keyingi bosqichlarda ishga tushiramiz.</p>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;

