import React, { useState, useEffect, useRef } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  LockKeyhole,
  Unlock,
  Check,
  X,
  Settings2,
  Users,
  TrendingUp,
  Wallet,
  History,
  ChevronLeft,
  BadgeDollarSign,
} from "lucide-react";

// ------------------------------------------------------------------
// بيانات أولية (تجريبية) - Demo seed data
// ------------------------------------------------------------------
const seedOrders = [
  { id: "ORD-1042", user: "أحمد الشريف", type: "شراء", amountUsd: 250, rate: 1478, status: "مكتمل", time: "10:12" },
  { id: "ORD-1043", user: "منى قاسم", type: "بيع", amountUsd: 100, rate: 1470, status: "مكتمل", time: "10:31" },
  { id: "ORD-1044", user: "أنت", type: "شراء", amountUsd: 500, rate: 1479, status: "قيد المراجعة", time: "10:47" },
];

const seedUsers = [
  { id: "U-01", name: "أحمد الشريف", balanceUsd: 1240, balanceLocal: 320000, frozen: false, verified: true },
  { id: "U-02", name: "منى قاسم", balanceUsd: 80, balanceLocal: 15000, frozen: false, verified: true },
  { id: "U-03", name: "خالد يوسف", balanceUsd: 0, balanceLocal: 500000, frozen: true, verified: false },
  { id: "U-04", name: "أنت", balanceUsd: 620, balanceLocal: 210000, frozen: false, verified: true },
];

function money(n) {
  return new Intl.NumberFormat("ar-EG").format(Math.round(n));
}

export default function App() {
  const [view, setView] = useState("user"); // "user" | "admin"
  const [buyRate, setBuyRate] = useState(1479);
  const [sellRate, setSellRate] = useState(1470);
  const [tradingOpen, setTradingOpen] = useState(true);
  const [orders, setOrders] = useState(seedOrders);
  const [users, setUsers] = useState(seedUsers);
  const [tab, setTab] = useState("buy"); // buy | sell
  const [amount, setAmount] = useState("");
  const [flash, setFlash] = useState(null);
  const tickRef = useRef(null);

  const me = users.find((u) => u.name === "أنت");

  function placeOrder() {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setFlash({ type: "error", text: "أدخل مبلغًا صحيحًا أكبر من صفر" });
      return;
    }
    if (!tradingOpen) {
      setFlash({ type: "error", text: "التداول متوقف مؤقتًا من إدارة المنصة" });
      return;
    }
    if (me?.frozen) {
      setFlash({ type: "error", text: "حسابك مجمّد، تواصل مع الدعم" });
      return;
    }
    const rate = tab === "buy" ? buyRate : sellRate;
    const newOrder = {
      id: `ORD-${1045 + orders.length}`,
      user: "أنت",
      type: tab === "buy" ? "شراء" : "بيع",
      amountUsd: amt,
      rate,
      status: "قيد المراجعة",
      time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
    };
    setOrders((o) => [newOrder, ...o]);
    setAmount("");
    setFlash({ type: "success", text: `تم إرسال طلب ${tab === "buy" ? "الشراء" : "البيع"} للمراجعة` });
  }

  function decideOrder(id, decision) {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        if (decision === "approve") {
          setUsers((us) =>
            us.map((u) => {
              if (u.name !== o.user) return u;
              const usdDelta = o.type === "شراء" ? o.amountUsd : -o.amountUsd;
              const localDelta = o.type === "شراء" ? -o.amountUsd * o.rate : o.amountUsd * o.rate;
              return { ...u, balanceUsd: u.balanceUsd + usdDelta, balanceLocal: u.balanceLocal + localDelta };
            })
          );
        }
        return { ...o, status: decision === "approve" ? "مكتمل" : "مرفوض" };
      })
    );
  }

  function toggleFreeze(id) {
    setUsers((us) => us.map((u) => (u.id === id ? { ...u, frozen: !u.frozen } : u)));
  }

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 3200);
    return () => clearTimeout(t);
  }, [flash]);

  const pending = orders.filter((o) => o.status === "قيد المراجعة");

  return (
    <div dir="rtl" style={styles.page}>
      <style>{fontImport}</style>

      {/* ------------------------------------------------------------ */}
      {/* الشريط العلوي */}
      {/* ------------------------------------------------------------ */}
      <header style={styles.header}>
        <div style={styles.brandRow}>
          <div style={styles.brandMark}>
            <BadgeDollarSign size={22} color="#0B1F1C" strokeWidth={2.4} />
          </div>
          <div>
            <div style={styles.brandName}>مِسْكَال</div>
            <div style={styles.brandSub}>منصة الدولار الرقمي</div>
          </div>
        </div>

        <div style={styles.viewSwitch}>
          <button
            onClick={() => setView("user")}
            style={{ ...styles.switchBtn, ...(view === "user" ? styles.switchBtnActive : {}) }}
          >
            واجهة المستخدم
          </button>
          <button
            onClick={() => setView("admin")}
            style={{ ...styles.switchBtn, ...(view === "admin" ? styles.switchBtnActive : {}) }}
          >
            <ShieldCheck size={14} style={{ marginLeft: 5 }} />
            لوحة التحكم
          </button>
        </div>
      </header>

      {/* شريط السعر */}
      <div style={styles.ticker}>
        <div style={styles.tickerItem}>
          <span style={styles.tickerLabel}>سعر الشراء</span>
          <span style={styles.tickerValBuy}>{money(buyRate)}</span>
        </div>
        <div style={styles.tickerDivider} />
        <div style={styles.tickerItem}>
          <span style={styles.tickerLabel}>سعر البيع</span>
          <span style={styles.tickerValSell}>{money(sellRate)}</span>
        </div>
        <div style={styles.tickerDivider} />
        <div style={{ ...styles.tickerItem, opacity: 0.85 }}>
          {tradingOpen ? (
            <span style={{ color: "#7CE0B8", fontSize: 13, fontWeight: 600 }}>● التداول مفتوح</span>
          ) : (
            <span style={{ color: "#E08A8A", fontSize: 13, fontWeight: 600 }}>● التداول متوقف</span>
          )}
        </div>
      </div>

      {flash && (
        <div style={{ ...styles.flash, ...(flash.type === "error" ? styles.flashError : styles.flashOk) }}>
          {flash.text}
        </div>
      )}

      {/* ------------------------------------------------------------ */}
      {/* واجهة المستخدم */}
      {/* ------------------------------------------------------------ */}
      {view === "user" && (
        <main style={styles.main}>
          <section style={styles.balanceCard}>
            <div style={styles.balanceHead}>
              <Wallet size={18} color="#C9A227" />
              <span>محفظتي</span>
            </div>
            <div style={styles.balanceGrid}>
              <div>
                <div style={styles.balanceLabel}>دولار رقمي</div>
                <div style={styles.balanceValueUsd}>${money(me?.balanceUsd || 0)}</div>
              </div>
              <div>
                <div style={styles.balanceLabel}>رصيد محلي</div>
                <div style={styles.balanceValueLocal}>{money(me?.balanceLocal || 0)}</div>
              </div>
            </div>
          </section>

          <section style={styles.tradeCard}>
            <div style={styles.tabRow}>
              <button
                onClick={() => setTab("buy")}
                style={{ ...styles.tabBtn, ...(tab === "buy" ? styles.tabBtnBuyActive : {}) }}
              >
                <ArrowDownLeft size={15} />
                شراء دولار
              </button>
              <button
                onClick={() => setTab("sell")}
                style={{ ...styles.tabBtn, ...(tab === "sell" ? styles.tabBtnSellActive : {}) }}
              >
                <ArrowUpRight size={15} />
                بيع دولار
              </button>
            </div>

            <label style={styles.fieldLabel}>الكمية (بالدولار الرقمي)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              style={styles.input}
            />

            <div style={styles.estimateRow}>
              <span>المقابل بالعملة المحلية</span>
              <span style={styles.estimateVal}>
                {amount ? money(parseFloat(amount) * (tab === "buy" ? buyRate : sellRate)) : "—"}
              </span>
            </div>

            <button onClick={placeOrder} style={{ ...styles.submitBtn, ...(tab === "buy" ? styles.submitBuy : styles.submitSell) }}>
              {tab === "buy" ? "إرسال طلب الشراء" : "إرسال طلب البيع"}
            </button>
            <div style={styles.hint}>كل طلب يمر بمراجعة الإدارة قبل تنفيذه على رصيدك.</div>
          </section>

          <section style={styles.historyCard}>
            <div style={styles.historyHead}>
              <History size={16} color="#9AA5B1" />
              <span>سجل العمليات</span>
            </div>
            {orders
              .filter((o) => o.user === "أنت")
              .map((o) => (
                <div key={o.id} style={styles.orderRow}>
                  <div style={styles.orderLeft}>
                    <span style={{ ...styles.orderType, color: o.type === "شراء" ? "#7CE0B8" : "#E0B27C" }}>
                      {o.type}
                    </span>
                    <span style={styles.orderMeta}>${money(o.amountUsd)} @ {money(o.rate)}</span>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
              ))}
          </section>
        </main>
      )}

      {/* ------------------------------------------------------------ */}
      {/* لوحة التحكم */}
      {/* ------------------------------------------------------------ */}
      {view === "admin" && (
        <main style={styles.main}>
          <div style={styles.statsRow}>
            <StatCard icon={<TrendingUp size={16} color="#C9A227" />} label="طلبات قيد المراجعة" value={pending.length} />
            <StatCard icon={<Users size={16} color="#C9A227" />} label="المستخدمون" value={users.length} />
            <StatCard
              icon={<BadgeDollarSign size={16} color="#C9A227" />}
              label="إجمالي أرصدة الدولار"
              value={`$${money(users.reduce((s, u) => s + u.balanceUsd, 0))}`}
            />
          </div>

          <section style={styles.adminCard}>
            <div style={styles.adminHead}>
              <Settings2 size={16} color="#C9A227" />
              <span>التحكم بالسعر والتداول</span>
            </div>
            <div style={styles.rateEditRow}>
              <div style={styles.rateEditCol}>
                <label style={styles.fieldLabel}>سعر الشراء</label>
                <input type="number" value={buyRate} onChange={(e) => setBuyRate(Number(e.target.value))} style={styles.input} />
              </div>
              <div style={styles.rateEditCol}>
                <label style={styles.fieldLabel}>سعر البيع</label>
                <input type="number" value={sellRate} onChange={(e) => setSellRate(Number(e.target.value))} style={styles.input} />
              </div>
            </div>
            <button
              onClick={() => setTradingOpen((t) => !t)}
              style={{ ...styles.toggleTradeBtn, ...(tradingOpen ? styles.toggleOpen : styles.toggleClosed) }}
            >
              {tradingOpen ? <LockKeyhole size={15} /> : <Unlock size={15} />}
              {tradingOpen ? "إيقاف التداول الآن" : "إعادة فتح التداول"}
            </button>
          </section>

          <section style={styles.adminCard}>
            <div style={styles.adminHead}>
              <ChevronLeft size={16} color="#C9A227" />
              <span>طلبات بانتظار الموافقة ({pending.length})</span>
            </div>
            {pending.length === 0 && <div style={styles.emptyNote}>لا توجد طلبات معلّقة حاليًا.</div>}
            {pending.map((o) => (
              <div key={o.id} style={styles.pendingRow}>
                <div>
                  <div style={styles.pendingUser}>{o.user} — {o.type}</div>
                  <div style={styles.orderMeta}>${money(o.amountUsd)} @ {money(o.rate)} · {o.time}</div>
                </div>
                <div style={styles.pendingActions}>
                  <button onClick={() => decideOrder(o.id, "approve")} style={styles.approveBtn}>
                    <Check size={14} />
                  </button>
                  <button onClick={() => decideOrder(o.id, "reject")} style={styles.rejectBtn}>
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </section>

          <section style={styles.adminCard}>
            <div style={styles.adminHead}>
              <Users size={16} color="#C9A227" />
              <span>إدارة المستخدمين</span>
            </div>
            {users.map((u) => (
              <div key={u.id} style={styles.userRow}>
                <div>
                  <div style={styles.pendingUser}>
                    {u.name} {u.verified && <ShieldCheck size={12} color="#7CE0B8" style={{ marginRight: 4 }} />}
                  </div>
                  <div style={styles.orderMeta}>
                    ${money(u.balanceUsd)} · {money(u.balanceLocal)}
                  </div>
                </div>
                <button
                  onClick={() => toggleFreeze(u.id)}
                  style={{ ...styles.freezeBtn, ...(u.frozen ? styles.frozenActive : {}) }}
                >
                  {u.frozen ? "مجمّد" : "نشط"}
                </button>
              </div>
            ))}
          </section>
        </main>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div style={styles.statCard}>
      {icon}
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    "مكتمل": { bg: "rgba(124,224,184,0.12)", fg: "#7CE0B8" },
    "قيد المراجعة": { bg: "rgba(201,162,39,0.14)", fg: "#C9A227" },
    "مرفوض": { bg: "rgba(224,138,138,0.14)", fg: "#E08A8A" },
  };
  const c = map[status] || map["قيد المراجعة"];
  return (
    <span style={{ background: c.bg, color: c.fg, fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 999 }}>
      {status}
    </span>
  );
}

const fontImport = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@500;600;700;800&family=Tajawal:wght@400;500;700&display=swap');
`;

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg,#0B1F1C 0%,#0E2521 100%)",
    fontFamily: "'Tajawal', sans-serif",
    color: "#EAF2EF",
    paddingBottom: 40,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 20px 10px",
    flexWrap: "wrap",
    gap: 12,
  },
  brandRow: { display: "flex", alignItems: "center", gap: 10 },
  brandMark: {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: "linear-gradient(135deg,#E8C766,#C9A227)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: { fontFamily: "'Cairo',sans-serif", fontWeight: 800, fontSize: 18, lineHeight: 1.1 },
  brandSub: { fontSize: 11.5, color: "#9AB5AC" },
  viewSwitch: {
    display: "flex",
    background: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  switchBtn: {
    display: "flex",
    alignItems: "center",
    border: "none",
    background: "transparent",
    color: "#9AB5AC",
    fontFamily: "'Tajawal',sans-serif",
    fontSize: 13,
    fontWeight: 600,
    padding: "8px 14px",
    borderRadius: 9,
    cursor: "pointer",
  },
  switchBtnActive: { background: "#C9A227", color: "#0B1F1C" },
  ticker: {
    display: "flex",
    alignItems: "center",
    margin: "6px 20px 18px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 14,
    padding: "12px 18px",
    gap: 18,
    flexWrap: "wrap",
  },
  tickerItem: { display: "flex", flexDirection: "column", gap: 2 },
  tickerLabel: { fontSize: 11, color: "#9AB5AC" },
  tickerValBuy: { fontFamily: "'Cairo',sans-serif", fontWeight: 800, fontSize: 20, color: "#7CE0B8" },
  tickerValSell: { fontFamily: "'Cairo',sans-serif", fontWeight: 800, fontSize: 20, color: "#E0B27C" },
  tickerDivider: { width: 1, height: 30, background: "rgba(255,255,255,0.08)" },
  flash: {
    margin: "0 20px 16px",
    padding: "10px 16px",
    borderRadius: 10,
    fontSize: 13.5,
    fontWeight: 600,
  },
  flashOk: { background: "rgba(124,224,184,0.12)", color: "#7CE0B8" },
  flashError: { background: "rgba(224,138,138,0.14)", color: "#E08A8A" },
  main: { maxWidth: 480, margin: "0 auto", padding: "0 16px", display: "flex", flexDirection: "column", gap: 16 },
  balanceCard: {
    background: "linear-gradient(135deg,#12312B,#0E241F)",
    border: "1px solid rgba(201,162,39,0.25)",
    borderRadius: 16,
    padding: 18,
  },
  balanceHead: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#C9A227", fontWeight: 700, marginBottom: 12 },
  balanceGrid: { display: "flex", justifyContent: "space-between" },
  balanceLabel: { fontSize: 11.5, color: "#9AB5AC", marginBottom: 4 },
  balanceValueUsd: { fontFamily: "'Cairo',sans-serif", fontWeight: 800, fontSize: 22, color: "#EAF2EF" },
  balanceValueLocal: { fontFamily: "'Cairo',sans-serif", fontWeight: 800, fontSize: 22, color: "#EAF2EF" },
  tradeCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: 16,
  },
  tabRow: { display: "flex", gap: 8, marginBottom: 14 },
  tabBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "10px 0",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "transparent",
    color: "#9AB5AC",
    fontFamily: "'Tajawal',sans-serif",
    fontWeight: 700,
    fontSize: 13.5,
    cursor: "pointer",
  },
  tabBtnBuyActive: { background: "rgba(124,224,184,0.14)", color: "#7CE0B8", borderColor: "rgba(124,224,184,0.4)" },
  tabBtnSellActive: { background: "rgba(224,178,124,0.14)", color: "#E0B27C", borderColor: "rgba(224,178,124,0.4)" },
  fieldLabel: { display: "block", fontSize: 12, color: "#9AB5AC", marginBottom: 6 },
  input: {
    width: "100%",
    boxSizing: "border-box",
    background: "rgba(0,0,0,0.25)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: "11px 14px",
    color: "#EAF2EF",
    fontSize: 15,
    fontFamily: "'Cairo',sans-serif",
    fontWeight: 700,
    outline: "none",
    marginBottom: 12,
  },
  estimateRow: { display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "#9AB5AC", marginBottom: 14 },
  estimateVal: { color: "#EAF2EF", fontWeight: 700 },
  submitBtn: {
    width: "100%",
    border: "none",
    borderRadius: 10,
    padding: "13px 0",
    fontFamily: "'Cairo',sans-serif",
    fontWeight: 800,
    fontSize: 14.5,
    cursor: "pointer",
  },
  submitBuy: { background: "#7CE0B8", color: "#0B1F1C" },
  submitSell: { background: "#E0B27C", color: "#0B1F1C" },
  hint: { fontSize: 11, color: "#71897F", marginTop: 8, textAlign: "center" },
  historyCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: 16,
  },
  historyHead: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#9AA5B1", marginBottom: 10 },
  orderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  orderLeft: { display: "flex", flexDirection: "column", gap: 2 },
  orderType: { fontSize: 13.5, fontWeight: 700 },
  orderMeta: { fontSize: 11.5, color: "#8FA39B" },
  statsRow: { display: "flex", gap: 10 },
  statCard: {
    flex: 1,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14,
    padding: "14px 10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    textAlign: "center",
  },
  statValue: { fontFamily: "'Cairo',sans-serif", fontWeight: 800, fontSize: 16 },
  statLabel: { fontSize: 10.5, color: "#9AB5AC" },
  adminCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: 16,
  },
  adminHead: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#C9A227", marginBottom: 14 },
  rateEditRow: { display: "flex", gap: 10 },
  rateEditCol: { flex: 1 },
  toggleTradeBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    border: "none",
    borderRadius: 10,
    padding: "12px 0",
    fontFamily: "'Cairo',sans-serif",
    fontWeight: 700,
    fontSize: 13.5,
    cursor: "pointer",
  },
  toggleOpen: { background: "rgba(224,138,138,0.15)", color: "#E08A8A" },
  toggleClosed: { background: "rgba(124,224,184,0.15)", color: "#7CE0B8" },
  emptyNote: { fontSize: 12.5, color: "#71897F", padding: "8px 0" },
  pendingRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  pendingUser: { fontSize: 13.5, fontWeight: 700 },
  pendingActions: { display: "flex", gap: 6 },
  approveBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    border: "none",
    background: "rgba(124,224,184,0.18)",
    color: "#7CE0B8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  rejectBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    border: "none",
    background: "rgba(224,138,138,0.18)",
    color: "#E08A8A",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  userRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  freezeBtn: {
    fontSize: 11.5,
    fontWeight: 700,
    padding: "6px 12px",
    borderRadius: 999,
    border: "1px solid rgba(124,224,184,0.35)",
    background: "rgba(124,224,184,0.12)",
    color: "#7CE0B8",
    cursor: "pointer",
  },
  frozenActive: {
    border: "1px solid rgba(224,138,138,0.4)",
    background: "rgba(224,138,138,0.16)",
    color: "#E08A8A",
  },
};
}

export default function App() {
  const [view, setView] = useState("user"); // "user" | "admin"
  const [buyRate, setBuyRate] = useState(1479);
  const [sellRate, setSellRate] = useState(1470);
  const [tradingOpen, setTradingOpen] = useState(true);
  const [orders, setOrders] = useState(seedOrders);
  const [users, setUsers] = useState(seedUsers);
  const [tab, setTab] = useState("buy"); // buy | sell
  const [amount, setAmount] = useState("");
  const [flash, setFlash] = useState(null);
  const tickRef = useRef(null);

  const me = users.find((u) => u.name === "أنت");

  // محاكاة تذبذب بسيط في السعر (Demo only — simulated tick)
  useEffect(() => {
    tickRef.current = setInterval(() => {
      setBuyRate((r) => Math.max(1400, r + (Math.random() > 0.5 ? 1 : -1)));
      setSellRate((r) => Math.max(1390, r + (Math.random() > 0.5 ? 1 : -1)));
    }, 4000);
    return () => clearInterval(tickRef.current);
  }, []);

  function placeOrder() {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setFlash({ type: "error", text: "أدخل مبلغًا صحيحًا أكبر من صفر" });
      return;
    }
    if (!tradingOpen) {
      setFlash({ type: "error", text: "التداول متوقف مؤقتًا من إدارة المنصة" });
      return;
    }
    if (me?.frozen) {
      setFlash({ type: "error", text: "حسابك مجمّد، تواصل مع الدعم" });
      return;
    }
    const rate = tab === "buy" ? buyRate : sellRate;
    const newOrder = {
      id: `ORD-${1045 + orders.length}`,
      user: "أنت",
      type: tab === "buy" ? "شراء" : "بيع",
      amountUsd: amt,
      rate,
      status: "قيد المراجعة",
      time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
    };
    setOrders((o) => [newOrder, ...o]);
    setAmount("");
    setFlash({ type: "success", text: `تم إرسال طلب ${tab === "buy" ? "الشراء" : "البيع"} للمراجعة` });
  }

  function decideOrder(id, decision) {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        if (decision === "approve") {
          setUsers((us) =>
            us.map((u) => {
              if (u.name !== o.user) return u;
              const usdDelta = o.type === "شراء" ? o.amountUsd : -o.amountUsd;
              const localDelta = o.type === "شراء" ? -o.amountUsd * o.rate : o.amountUsd * o.rate;
              return { ...u, balanceUsd: u.balanceUsd + usdDelta, balanceLocal: u.balanceLocal + localDelta };
            })
          );
        }
        return { ...o, status: decision === "approve" ? "مكتمل" : "مرفوض" };
      })
    );
  }

  function toggleFreeze(id) {
    setUsers((us) => us.map((u) => (u.id === id ? { ...u, frozen: !u.frozen } : u)));
  }

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 3200);
    return () => clearTimeout(t);
  }, [flash]);

  const pending = orders.filter((o) => o.status === "قيد المراجعة");

  return (
    <div dir="rtl" style={styles.page}>
      <style>{fontImport}</style>

      {/* ------------------------------------------------------------ */}
      {/* الشريط العلوي */}
      {/* ------------------------------------------------------------ */}
      <header style={styles.header}>
        <div style={styles.brandRow}>
          <div style={styles.brandMark}>
            <BadgeDollarSign size={22} color="#0B1F1C" strokeWidth={2.4} />
          </div>
          <div>
            <div style={styles.brandName}>مِسْكَال</div>
            <div style={styles.brandSub}>منصة الدولار الرقمي</div>
          </div>
        </div>

        <div style={styles.viewSwitch}>
          <button
            onClick={() => setView("user")}
            style={{ ...styles.switchBtn, ...(view === "user" ? styles.switchBtnActive : {}) }}
          >
            واجهة المستخدم
          </button>
          <button
            onClick={() => setView("admin")}
            style={{ ...styles.switchBtn, ...(view === "admin" ? styles.switchBtnActive : {}) }}
          >
            <ShieldCheck size={14} style={{ marginLeft: 5 }} />
            لوحة التحكم
          </button>
        </div>
      </header>

      {/* شريط السعر */}
      <div style={styles.ticker}>
        <div style={styles.tickerItem}>
          <span style={styles.tickerLabel}>سعر الشراء</span>
          <span style={styles.tickerValBuy}>{money(buyRate)}</span>
        </div>
        <div style={styles.tickerDivider} />
        <div style={styles.tickerItem}>
          <span style={styles.tickerLabel}>سعر البيع</span>
          <span style={styles.tickerValSell}>{money(sellRate)}</span>
        </div>
        <div style={styles.tickerDivider} />
        <div style={{ ...styles.tickerItem, opacity: 0.85 }}>
          {tradingOpen ? (
            <span style={{ color: "#7CE0B8", fontSize: 13, fontWeight: 600 }}>● التداول مفتوح</span>
          ) : (
            <span style={{ color: "#E08A8A", fontSize: 13, fontWeight: 600 }}>● التداول متوقف</span>
          )}
        </div>
      </div>

      {flash && (
        <div style={{ ...styles.flash, ...(flash.type === "error" ? styles.flashError : styles.flashOk) }}>
          {flash.text}
        </div>
      )}

      {/* ------------------------------------------------------------ */}
      {/* واجهة المستخدم */}
      {/* ------------------------------------------------------------ */}
      {view === "user" && (
        <main style={styles.main}>
          <section style={styles.balanceCard}>
            <div style={styles.balanceHead}>
              <Wallet size={18} color="#C9A227" />
              <span>محفظتي</span>
            </div>
            <div style={styles.balanceGrid}>
              <div>
                <div style={styles.balanceLabel}>دولار رقمي</div>
                <div style={styles.balanceValueUsd}>${money(me?.balanceUsd || 0)}</div>
              </div>
              <div>
                <div style={styles.balanceLabel}>رصيد محلي</div>
                <div style={styles.balanceValueLocal}>{money(me?.balanceLocal || 0)}</div>
              </div>
            </div>
          </section>

          <section style={styles.tradeCard}>
            <div style={styles.tabRow}>
              <button
                onClick={() => setTab("buy")}
                style={{ ...styles.tabBtn, ...(tab === "buy" ? styles.tabBtnBuyActive : {}) }}
              >
                <ArrowDownLeft size={15} />
                شراء دولار
              </button>
              <button
                onClick={() => setTab("sell")}
                style={{ ...styles.tabBtn, ...(tab === "sell" ? styles.tabBtnSellActive : {}) }}
              >
                <ArrowUpRight size={15} />
                بيع دولار
              </button>
            </div>

            <label style={styles.fieldLabel}>الكمية (بالدولار الرقمي)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              style={styles.input}
            />

            <div style={styles.estimateRow}>
              <span>المقابل بالعملة المحلية</span>
              <span style={styles.estimateVal}>
                {amount ? money(parseFloat(amount) * (tab === "buy" ? buyRate : sellRate)) : "—"}
              </span>
            </div>

            <button onClick={placeOrder} style={{ ...styles.submitBtn, ...(tab === "buy" ? styles.submitBuy : styles.submitSell) }}>
              {tab === "buy" ? "إرسال طلب الشراء" : "إرسال طلب البيع"}
            </button>
            <div style={styles.hint}>كل طلب يمر بمراجعة الإدارة قبل تنفيذه على رصيدك.</div>
          </section>

          <section style={styles.historyCard}>
            <div style={styles.historyHead}>
              <History size={16} color="#9AA5B1" />
              <span>سجل العمليات</span>
            </div>
            {orders
              .filter((o) => o.user === "أنت")
              .map((o) => (
                <div key={o.id} style={styles.orderRow}>
                  <div style={styles.orderLeft}>
                    <span style={{ ...styles.orderType, color: o.type === "شراء" ? "#7CE0B8" : "#E0B27C" }}>
                      {o.type}
                    </span>
                    <span style={styles.orderMeta}>${money(o.amountUsd)} @ {money(o.rate)}</span>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
              ))}
          </section>
        </main>
      )}

      {/* ------------------------------------------------------------ */}
      {/* لوحة التحكم */}
      {/* ------------------------------------------------------------ */}
      {view === "admin" && (
        <main style={styles.main}>
          <div style={styles.statsRow}>
            <StatCard icon={<TrendingUp size={16} color="#C9A227" />} label="طلبات قيد المراجعة" value={pending.length} />
            <StatCard icon={<Users size={16} color="#C9A227" />} label="المستخدمون" value={users.length} />
            <StatCard
              icon={<BadgeDollarSign size={16} color="#C9A227" />}
              label="إجمالي أرصدة الدولار"
              value={`$${money(users.reduce((s, u) => s + u.balanceUsd, 0))}`}
            />
          </div>

          <section style={styles.adminCard}>
            <div style={styles.adminHead}>
              <Settings2 size={16} color="#C9A227" />
              <span>التحكم بالسعر والتداول</span>
            </div>
            <div style={styles.rateEditRow}>
              <div style={styles.rateEditCol}>
                <label style={styles.fieldLabel}>سعر الشراء</label>
                <input type="number" value={buyRate} onChange={(e) => setBuyRate(Number(e.target.value))} style={styles.input} />
              </div>
              <div style={styles.rateEditCol}>
                <label style={styles.fieldLabel}>سعر البيع</label>
                <input type="number" value={sellRate} onChange={(e) => setSellRate(Number(e.target.value))} style={styles.input} />
              </div>
            </div>
            <button
              onClick={() => setTradingOpen((t) => !t)}
              style={{ ...styles.toggleTradeBtn, ...(tradingOpen ? styles.toggleOpen : styles.toggleClosed) }}
            >
              {tradingOpen ? <LockKeyhole size={15} /> : <Unlock size={15} />}
              {tradingOpen ? "إيقاف التداول الآن" : "إعادة فتح التداول"}
            </button>
          </section>

          <section style={styles.adminCard}>
            <div style={styles.adminHead}>
              <ChevronLeft size={16} color="#C9A227" />
              <span>طلبات بانتظار الموافقة ({pending.length})</span>
            </div>
            {pending.length === 0 && <div style={styles.emptyNote}>لا توجد طلبات معلّقة حاليًا.</div>}
            {pending.map((o) => (
              <div key={o.id} style={styles.pendingRow}>
                <div>
                  <div style={styles.pendingUser}>{o.user} — {o.type}</div>
                  <div style={styles.orderMeta}>${money(o.amountUsd)} @ {money(o.rate)} · {o.time}</div>
                </div>
                <div style={styles.pendingActions}>
                  <button onClick={() => decideOrder(o.id, "approve")} style={styles.approveBtn}>
                    <Check size={14} />
                  </button>
                  <button onClick={() => decideOrder(o.id, "reject")} style={styles.rejectBtn}>
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </section>

          <section style={styles.adminCard}>
            <div style={styles.adminHead}>
              <Users size={16} color="#C9A227" />
              <span>إدارة المستخدمين</span>
            </div>
            {users.map((u) => (
              <div key={u.id} style={styles.userRow}>
                <div>
                  <div style={styles.pendingUser}>
                    {u.name} {u.verified && <ShieldCheck size={12} color="#7CE0B8" style={{ marginRight: 4 }} />}
                  </div>
                  <div style={styles.orderMeta}>
                    ${money(u.balanceUsd)} · {money(u.balanceLocal)}
                  </div>
                </div>
                <button
                  onClick={() => toggleFreeze(u.id)}
                  style={{ ...styles.freezeBtn, ...(u.frozen ? styles.frozenActive : {}) }}
                >
                  {u.frozen ? "مجمّد" : "نشط"}
                </button>
              </div>
            ))}
          </section>
        </main>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div style={styles.statCard}>
      {icon}
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    "مكتمل": { bg: "rgba(124,224,184,0.12)", fg: "#7CE0B8" },
    "قيد المراجعة": { bg: "rgba(201,162,39,0.14)", fg: "#C9A227" },
    "مرفوض": { bg: "rgba(224,138,138,0.14)", fg: "#E08A8A" },
  };
  const c = map[status] || map["قيد المراجعة"];
  return (
    <span style={{ background: c.bg, color: c.fg, fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 999 }}>
      {status}
    </span>
  );
}

const fontImport = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@500;600;700;800&family=Tajawal:wght@400;500;700&display=swap');
`;

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg,#0B1F1C 0%,#0E2521 100%)",
    fontFamily: "'Tajawal', sans-serif",
    color: "#EAF2EF",
    paddingBottom: 40,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 20px 10px",
    flexWrap: "wrap",
    gap: 12,
  },
  brandRow: { display: "flex", alignItems: "center", gap: 10 },
  brandMark: {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: "linear-gradient(135deg,#E8C766,#C9A227)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: { fontFamily: "'Cairo',sans-serif", fontWeight: 800, fontSize: 18, lineHeight: 1.1 },
  brandSub: { fontSize: 11.5, color: "#9AB5AC" },
  viewSwitch: {
    display: "flex",
    background: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  switchBtn: {
    display: "flex",
    alignItems: "center",
    border: "none",
    background: "transparent",
    color: "#9AB5AC",
    fontFamily: "'Tajawal',sans-serif",
    fontSize: 13,
    fontWeight: 600,
    padding: "8px 14px",
    borderRadius: 9,
    cursor: "pointer",
  },
  switchBtnActive: { background: "#C9A227", color: "#0B1F1C" },
  ticker: {
    display: "flex",
    alignItems: "center",
    margin: "6px 20px 18px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 14,
    padding: "12px 18px",
    gap: 18,
    flexWrap: "wrap",
  },
  tickerItem: { display: "flex", flexDirection: "column", gap: 2 },
  tickerLabel: { fontSize: 11, color: "#9AB5AC" },
  tickerValBuy: { fontFamily: "'Cairo',sans-serif", fontWeight: 800, fontSize: 20, color: "#7CE0B8" },
  tickerValSell: { fontFamily: "'Cairo',sans-serif", fontWeight: 800, fontSize: 20, color: "#E0B27C" },
  tickerDivider: { width: 1, height: 30, background: "rgba(255,255,255,0.08)" },
  flash: {
    margin: "0 20px 16px",
    padding: "10px 16px",
    borderRadius: 10,
    fontSize: 13.5,
    fontWeight: 600,
  },
  flashOk: { background: "rgba(124,224,184,0.12)", color: "#7CE0B8" },
  flashError: { background: "rgba(224,138,138,0.14)", color: "#E08A8A" },
  main: { maxWidth: 480, margin: "0 auto", padding: "0 16px", display: "flex", flexDirection: "column", gap: 16 },
  balanceCard: {
    background: "linear-gradient(135deg,#12312B,#0E241F)",
    border: "1px solid rgba(201,162,39,0.25)",
    borderRadius: 16,
    padding: 18,
  },
  balanceHead: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#C9A227", fontWeight: 700, marginBottom: 12 },
  balanceGrid: { display: "flex", justifyContent: "space-between" },
  balanceLabel: { fontSize: 11.5, color: "#9AB5AC", marginBottom: 4 },
  balanceValueUsd: { fontFamily: "'Cairo',sans-serif", fontWeight: 800, fontSize: 22, color: "#EAF2EF" },
  balanceValueLocal: { fontFamily: "'Cairo',sans-serif", fontWeight: 800, fontSize: 22, color: "#EAF2EF" },
  tradeCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: 16,
  },
  tabRow: { display: "flex", gap: 8, marginBottom: 14 },
  tabBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "10px 0",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "transparent",
    color: "#9AB5AC",
    fontFamily: "'Tajawal',sans-serif",
    fontWeight: 700,
    fontSize: 13.5,
    cursor: "pointer",
  },
  tabBtnBuyActive: { background: "rgba(124,224,184,0.14)", color: "#7CE0B8", borderColor: "rgba(124,224,184,0.4)" },
  tabBtnSellActive: { background: "rgba(224,178,124,0.14)", color: "#E0B27C", borderColor: "rgba(224,178,124,0.4)" },
  fieldLabel: { display: "block", fontSize: 12, color: "#9AB5AC", marginBottom: 6 },
  input: {
    width: "100%",
    boxSizing: "border-box",
    background: "rgba(0,0,0,0.25)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: "11px 14px",
    color: "#EAF2EF",
    fontSize: 15,
    fontFamily: "'Cairo',sans-serif",
    fontWeight: 700,
    outline: "none",
    marginBottom: 12,
  },
  estimateRow: { display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "#9AB5AC", marginBottom: 14 },
  estimateVal: { color: "#EAF2EF", fontWeight: 700 },
  submitBtn: {
    width: "100%",
    border: "none",
    borderRadius: 10,
    padding: "13px 0",
    fontFamily: "'Cairo',sans-serif",
    fontWeight: 800,
    fontSize: 14.5,
    cursor: "pointer",
  },
  submitBuy: { background: "#7CE0B8", color: "#0B1F1C" },
  submitSell: { background: "#E0B27C", color: "#0B1F1C" },
  hint: { fontSize: 11, color: "#71897F", marginTop: 8, textAlign: "center" },
  historyCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: 16,
  },
  historyHead: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#9AA5B1", marginBottom: 10 },
  orderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  orderLeft: { display: "flex", flexDirection: "column", gap: 2 },
  orderType: { fontSize: 13.5, fontWeight: 700 },
  orderMeta: { fontSize: 11.5, color: "#8FA39B" },
  statsRow: { display: "flex", gap: 10 },
  statCard: {
    flex: 1,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14,
    padding: "14px 10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    textAlign: "center",
  },
  statValue: { fontFamily: "'Cairo',sans-serif", fontWeight: 800, fontSize: 16 },
  statLabel: { fontSize: 10.5, color: "#9AB5AC" },
  adminCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: 16,
  },
  adminHead: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#C9A227", marginBottom: 14 },
  rateEditRow: { display: "flex", gap: 10 },
  rateEditCol: { flex: 1 },
  toggleTradeBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    border: "none",
    borderRadius: 10,
    padding: "12px 0",
    fontFamily: "'Cairo',sans-serif",
    fontWeight: 700,
    fontSize: 13.5,
    cursor: "pointer",
  },
  toggleOpen: { background: "rgba(224,138,138,0.15)", color: "#E08A8A" },
  toggleClosed: { background: "rgba(124,224,184,0.15)", color: "#7CE0B8" },
  emptyNote: { fontSize: 12.5, color: "#71897F", padding: "8px 0" },
  pendingRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  pendingUser: { fontSize: 13.5, fontWeight: 700 },
  pendingActions: { display: "flex", gap: 6 },
  approveBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    border: "none",
    background: "rgba(124,224,184,0.18)",
    color: "#7CE0B8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  rejectBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    border: "none",
    background: "rgba(224,138,138,0.18)",
    color: "#E08A8A",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  userRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  freezeBtn: {
    fontSize: 11.5,
    fontWeight: 700,
    padding: "6px 12px",
    borderRadius: 999,
    border: "1px solid rgba(124,224,184,0.35)",
    background: "rgba(124,224,184,0.12)",
    color: "#7CE0B8",
    cursor: "pointer",
  },
  frozenActive: {
    border: "1px solid rgba(224,138,138,0.4)",
    background: "rgba(224,138,138,0.16)",
    color: "#E08A8A",
  },
};
