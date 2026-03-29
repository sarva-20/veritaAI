import { useState, useRef, useEffect } from "react";

const API = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1') ? "http://localhost:8000" : "";

const CSS = `
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
@keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
@keyframes spin { to{transform:rotate(360deg)} }
@keyframes gradientAnim { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
.gradient-bg {
  background: linear-gradient(-45deg, #fff0f5, #f3e8ff, #e0f2fe, #fce7f3);
  background-size: 400% 400%;
  animation: gradientAnim 12s ease infinite;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; }
h1, h2, h3, h4 { font-family: 'Plus Jakarta Sans', sans-serif; }
button { font-family: 'DM Sans', sans-serif; cursor: pointer; border: none; outline: none; transition: all 0.2s ease; }
button:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
button:active:not(:disabled) { transform: translateY(1px); box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
input, textarea { font-family: 'DM Sans', sans-serif; }
`;
function formatMessage(text) {
  if (!text) return null;
  return text.split("\n").map((line, i) => {
    if (line.startsWith("## ")) return <p key={i} style={s.mdH2}>{line.slice(3)}</p>;
    if (line.startsWith("# ")) return <p key={i} style={s.mdH1}>{line.slice(2)}</p>;
    if (line.startsWith("- ") || line.startsWith("• ")) return <p key={i} style={s.mdLi}>· {line.slice(2)}</p>;
    if (line.includes("[ABNORMAL]")) return <span key={i} style={s.mdAbnormal}>{line}</span>;
    if (line.includes("[CRITICAL]")) return <span key={i} style={s.mdCritical}>{line}</span>;
    if (line.includes("[NORMAL]")) return <span key={i} style={s.mdNormal}>{line}</span>;
    if (line.trim() === "") return <br key={i} />;
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return <p key={i} style={s.mdP}>{parts.map((p, j) => p.startsWith("**") ? <strong key={j}>{p.slice(2, -2)}</strong> : p)}</p>;
  });
}

export default function App() {
  const [route, setRoute] = useState("landing"); // 'landing' | 'login' | 'chat'

  return (
    <>
      <style>{CSS}</style>
      <div style={s.root} className="gradient-bg">
        {route === "landing" && <LandingPage setRoute={setRoute} />}
        {route === "login" && <LoginPage setRoute={setRoute} />}
        {route === "chat" && <ChatPage setRoute={setRoute} />}
      </div>
    </>
  );
}

// ── LANDING PAGE ─────────────────────────────────────────────────────────────
function LandingPage({ setRoute }) {
  return (
    <div style={s.pageWrapper}>
      <header style={s.landingHeader}>
        <div style={s.logo}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          <span style={s.logoText}>Verita AI</span>
        </div>
        <div style={{display: "flex", gap: "24px", alignItems: "center"}}>
            <span style={{fontSize: 14, fontWeight: 600, color: "#4b5563", cursor: "pointer"}}>Features</span>
            <span style={{fontSize: 14, fontWeight: 600, color: "#4b5563", cursor: "pointer"}}>About</span>
            <button style={s.primaryBtn} onClick={() => setRoute("login")}>Log In</button>
        </div>
      </header>
      
      <main style={s.heroMain}>
        <div style={{animation: "fadeIn 0.6s ease-out"}}>
          <span style={s.badge}>Medical Intelligence</span>
          <h1 style={s.heroTitle}>Ask our AI<br/>anything about your health.</h1>
          <p style={s.heroSub}>Verita analyzes complex lab reports and blood tests, providing plain-English explanations or clinical differential diagnoses depending on your needs.</p>
          <div style={s.heroActions}>
            <button style={{...s.primaryBtn, padding: "16px 32px", fontSize: 16}} onClick={() => setRoute("login")}>Get Started</button>
          </div>
        </div>

        <div style={s.featureGrid}>
          <div style={s.featureCard}>
            <h3 style={s.featureTitle}>
              <svg style={{marginRight: 8, verticalAlign: "middle"}} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              Two Modes
            </h3>
            <p style={s.featureDesc}>Toggle between Patient (plain English) and Doctor (clinical ICD-10 precision) at any time.</p>
          </div>
          <div style={s.featureCard}>
            <h3 style={s.featureTitle}>
              <svg style={{marginRight: 8, verticalAlign: "middle"}} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              PDF Analysis
            </h3>
            <p style={s.featureDesc}>Upload dense medical reports and receive intelligent breakdowns and tagged standard values.</p>
          </div>
          <div style={s.featureCard}>
            <h3 style={s.featureTitle}>
              <svg style={{marginRight: 8, verticalAlign: "middle"}} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              Guardrails
            </h3>
            <p style={s.featureDesc}>Built-in safety protections against prompt injection and out-of-scope interactions.</p>
          </div>
        </div>
      </main>
      
      <footer style={{paddingTop: 40, borderTop: "1px solid rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6b7280"}}>
        <div>© 2026 Verita AI. All rights reserved.</div>
        <div style={{display: "flex", gap: 16}}>
          <span style={{cursor: "pointer"}}>Privacy Policy</span>
          <span style={{cursor: "pointer"}}>Terms of Service</span>
        </div>
      </footer>
    </div>
  );
}

// ── LOGIN PAGE ───────────────────────────────────────────────────────────────
function LoginPage({ setRoute }) {
  return (
    <div style={s.centeredPage}>
      <div style={{...s.authCard, animation: "fadeIn 0.4s ease-out"}}>
        <div style={{...s.logo, justifyContent: "center", marginBottom: 24}}>
          <span style={s.logoText}>Welcome Back</span>
        </div>
        
        <div style={s.inputWrapAuth}>
          <label style={s.authLabel}>Email</label>
          <input type="email" placeholder="patient@example.com" style={s.authInput} />
        </div>
        <div style={s.inputWrapAuth}>
          <label style={s.authLabel}>Password</label>
          <input type="password" placeholder="••••••••" style={s.authInput} />
        </div>
        
        <button style={{...s.primaryBtn, width: "100%", padding: "14px", marginTop: 12}} onClick={() => setRoute("chat")}>
          Sign In
        </button>
        <button style={s.textBtn} onClick={() => setRoute("landing")}>
          Back to Home
        </button>
      </div>
    </div>
  );
}

// ── CHAT PAGE ────────────────────────────────────────────────────────────────
function ChatPage({ setRoute }) {
  const [mode, setMode] = useState("patient");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [guardRail, setGuardRail] = useState(null);
  const fileRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const toBase64 = (file) => new Promise((res, rej) => {
    const r = new FileReader(); r.onload = () => res(r.result.split(",")[1]); r.onerror = rej; r.readAsDataURL(file);
  });

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true); setAnalysis(null); setQuestions([]);
    try {
      const pdf_base64 = await toBase64(file);
      const res = await fetch(`${API}/analyze`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdf_base64, filename: file.name, mode }),
      });
      const data = await res.json();
      setAnalysis(data.analysis);
      setQuestions(data.questions || []);
      setMessages([{ role: "assistant", text: `I've analyzed **${file.name}**. Review my findings in the panel above, or ask me questions about it.` }]);
    } catch {
      setAnalysis("Failed to analyze document. Please try again.");
    }
    setUploading(false);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput(""); setGuardRail(null);
    const newMessages = [...messages, { role: "user", text }];
    setMessages(newMessages);
    setLoading(true);
    const history = newMessages.slice(0, -1).map((m) => ({ role: m.role === "user" ? "user" : "model", parts: [m.text] }));
    try {
      const res = await fetch(`${API}/chat`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, mode, history }),
      });
      const data = await res.json();
      if (data.guardrail_triggered) { setGuardRail(data.response); setMessages([...newMessages]); } 
      else { setMessages([...newMessages, { role: "assistant", text: data.response }]); }
    } catch {
      setMessages([...newMessages, { role: "assistant", text: "Connection error. Is the backend running?" }]);
    }
    setLoading(false);
  };

  return (
    <div style={s.pageWrapperAlt}>
      <header style={s.chatHeader}>
        <div onClick={() => setRoute("landing")} style={{...s.logo, cursor: "pointer", display: "flex", gap: 8, alignItems: "center"}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1f2937" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          <span style={{fontWeight: 600, color: "#4b5563"}}>Home</span>
        </div>
        
        <div style={s.segmentedControl}>
          <div style={{...s.segmentBtn, ...(mode === "patient" ? s.segmentActive : {})}} onClick={() => setMode("patient")}>Patient Mode</div>
          <div style={{...s.segmentBtn, ...(mode === "doctor" ? s.segmentActive : {})}} onClick={() => setMode("doctor")}>Doctor Mode</div>
        </div>

        <div>
          <button style={s.secondaryBtn} onClick={() => fileRef.current.click()} disabled={uploading}>
            <input ref={fileRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={handleUpload} />
            {uploading ? "Analyzing..." : "📄 Upload PDF"}
          </button>
        </div>
      </header>

      <main style={s.chatMain}>
        <div style={s.chatCard}>
          
          {messages.length === 0 && !uploading && !analysis && (
            <div style={s.chatEmpty}>
              <div style={s.sparkle}>✧</div>
              <h2 style={{fontSize: 24, fontWeight: 600, color: "#111827", marginBottom: 32}}>Ask our AI anything</h2>
              
              <div style={s.suggestionsRow}>
                <div style={s.suggestionBubble} onClick={() => setInput("What is a normal resting heart rate?")}>What is a normal resting heart rate?</div>
                <div style={s.suggestionBubble} onClick={() => setInput("How do I interpret my CBC report?")}>How do I interpret my CBC report?</div>
              </div>
            </div>
          )}

          <div style={s.messagesArea}>
            {analysis && (
              <div style={s.analysisPanel}>
                <p style={{fontSize: 12, fontWeight: 700, color: "#6366f1", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8}}>Document Analysis</p>
                <div style={{fontSize: 14, color: "#374151", lineHeight: 1.6}}>{formatMessage(analysis)}</div>
                
                {questions.length > 0 && (
                  <div style={{marginTop: 16}}>
                    <p style={{fontSize: 12, fontWeight: 700, color: "#10b981", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8}}>Suggested Questions</p>
                    <div style={{display: "flex", flexWrap: "wrap", gap: 8}}>
                      {questions.map((q, i) => (
                        <div key={i} style={s.qBubble} onClick={() => setInput(q)}>{q}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} style={{ ...s.msgRow, ...(m.role === "user" ? s.msgUserRow : s.msgBotRow) }}>
                {m.role === "assistant" && <div style={s.botAvatar}>✧</div>}
                <div>
                  <div style={{fontSize: 11, color: "#9ca3af", marginBottom: 4, marginLeft: 4, textTransform: "uppercase", fontWeight: 600}}>
                    {m.role === "user" ? "Me" : "Our AI"}
                  </div>
                  <div style={{...s.bubble, ...(m.role === "user" ? s.bubbleUser : s.bubbleBot)}}>
                    {formatMessage(m.text)}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div style={{...s.msgRow, ...s.msgBotRow}}>
                <div style={s.botAvatar}>✧</div>
                <div style={{...s.bubble, ...s.bubbleBot, display: "flex", gap: 4, alignItems: "center", padding: "16px"}}>
                  <span style={s.dot}/><span style={{...s.dot, animationDelay: ".2s"}}/><span style={{...s.dot, animationDelay: ".4s"}}/>
                </div>
              </div>
            )}

            {guardRail && (
              <div style={s.guardrailAlert}>⚠️ {guardRail}</div>
            )}
            <div ref={chatEndRef} style={{height: 1}} />
          </div>

          <div style={s.inputContainer}>
            <div style={s.inputWrapperInner}>
              <input 
                type="text" 
                style={s.chatInput}
                placeholder="Ask me anything about your health..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") sendMessage(); }}
              />
              <button style={{...s.sendBtn, ...(input.trim() ? s.sendBtnActive : {})}} onClick={sendMessage} disabled={!input.trim() || loading}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </div>
            
            <div style={s.guardStatusBar}>
              <span style={{color: "#10b981", fontSize: 16}}>·</span> Active Safety Guardrails
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

// ── SHARED STYLES ────────────────────────────────────────────────────────────

const s = {
  root: { minHeight: "100vh", display: "flex", flexDirection: "column" },
  pageWrapper: { display: "flex", flexDirection: "column", flex: 1, padding: "20px 40px", maxWidth: 1200, margin: "0 auto", width: "100%" },
  pageWrapperAlt: { display: "flex", flexDirection: "column", flex: 1, padding: "20px", height: "100vh" },
  centeredPage: { display: "flex", flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  
  landingHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0", width: "100%" },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  logoText: { fontSize: 22, fontWeight: 800, color: "#111827", letterSpacing: -0.5 },
  
  primaryBtn: { background: "#111827", color: "#fff", padding: "10px 20px", borderRadius: 999, fontWeight: 600, fontSize: 14 },
  secondaryBtn: { background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.05)", color: "#374151", padding: "10px 16px", borderRadius: 999, fontWeight: 600, fontSize: 13, backdropFilter: "blur(10px)" },
  textBtn: { background: "transparent", color: "#6b7280", padding: "10px", width: "100%", fontSize: 14, fontWeight: 500, marginTop: 8 },
  
  heroMain: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 0" },
  badge: { display: "inline-block", background: "rgba(99, 102, 241, 0.1)", color: "#6366f1", padding: "6px 16px", borderRadius: 999, fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 24 },
  heroTitle: { fontSize: "clamp(48px, 6vw, 72px)", fontWeight: 800, color: "#111827", lineHeight: 1.1, letterSpacing: -1.5, marginBottom: 24 },
  heroSub: { fontSize: "clamp(18px, 2vw, 22px)", color: "#4b5563", maxWidth: 640, lineHeight: 1.6, marginBottom: 40 },
  heroActions: { display: "flex", gap: 16, marginBottom: 80 },
  
  featureGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, paddingBottom: 60 },
  featureCard: { background: "rgba(255, 255, 255, 0.6)", backdropFilter: "blur(20px)", padding: 32, borderRadius: 24, border: "1px solid rgba(255,255,255,0.4)", boxShadow: "0 10px 30px rgba(0,0,0,0.02)" },
  featureTitle: { fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 12 },
  featureDesc: { fontSize: 15, color: "#4b5563", lineHeight: 1.6 },
  
  authCard: { background: "#fff", padding: 48, borderRadius: 32, width: "100%", maxWidth: 440, boxShadow: "0 20px 40px rgba(0,0,0,0.08)" },
  inputWrapAuth: { marginBottom: 20 },
  authLabel: { display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 },
  authInput: { width: "100%", background: "#f3f4f6", border: "1px solid #e5e7eb", padding: "12px 16px", borderRadius: 12, fontSize: 15, outline: "none", transition: "border 0.2s", ":focus": { borderColor: "#6366f1" } },
  
  chatHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 16 },
  segmentedControl: { display: "flex", background: "rgba(255,255,255,0.5)", backdropFilter: "blur(10px)", padding: 4, borderRadius: 999, border: "1px solid rgba(0,0,0,0.05)" },
  segmentBtn: { padding: "8px 24px", borderRadius: 999, fontSize: 13, fontWeight: 600, color: "#6b7280", cursor: "pointer", transition: "all 0.2s" },
  segmentActive: { background: "#fff", color: "#111827", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" },
  
  chatMain: { flex: 1, display: "flex", justifyContent: "center", position: "relative" },
  chatCard: { width: "100%", maxWidth: 960, background: "rgba(255, 255, 255, 0.85)", backdropFilter: "blur(30px)", borderRadius: 32, border: "1px solid rgba(255,255,255,0.7)", boxShadow: "0 20px 60px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", overflow: "hidden" },
  chatEmpty: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40 },
  sparkle: { fontSize: 32, color: "#111827", marginBottom: 16 },
  suggestionsRow: { display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", maxWidth: 640 },
  suggestionBubble: { background: "rgba(243, 244, 246, 0.8)", padding: "12px 20px", borderRadius: 16, fontSize: 14, color: "#4b5563", cursor: "pointer", border: "1px solid rgba(0,0,0,0.03)", transition: "background 0.2s" },
  
  messagesArea: { flex: 1, overflowY: "auto", padding: "32px 40px", display: "flex", flexDirection: "column", gap: 24, scrollBehavior: "smooth" },
  msgRow: { display: "flex", gap: 12, animation: "fadeIn 0.3s ease-out" },
  msgUserRow: { justifyContent: "flex-end" },
  msgBotRow: { justifyContent: "flex-start" },
  botAvatar: { width: 32, height: 32, background: "#f3f4f6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#111827", fontSize: 16, flexShrink: 0, marginTop: 18 },
  bubble: { padding: "16px 20px", fontSize: 15, lineHeight: 1.6, maxWidth: "85%" },
  bubbleUser: { background: "#fdf2f8", color: "#111827", borderRadius: "20px 20px 4px 20px", border: "1px solid rgba(236,72,153,0.1)" },
  bubbleBot: { background: "#fff", color: "#374151", borderRadius: "20px 20px 20px 4px", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" },
  
  analysisPanel: { background: "#fff", borderRadius: 24, padding: 24, border: "1px solid rgba(99,102,241,0.2)", boxShadow: "0 10px 30px rgba(99,102,241,0.05)", marginBottom: 16 },
  qBubble: { background: "#ecfdf5", border: "1px solid #d1fae5", padding: "8px 16px", borderRadius: 999, fontSize: 13, color: "#065f46", cursor: "pointer" },
  
  inputContainer: { padding: "0 40px 32px" },
  inputWrapperInner: { position: "relative", display: "flex", alignItems: "center", background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 24, boxShadow: "0 8px 30px rgba(0,0,0,0.04)" },
  chatInput: { width: "100%", padding: "20px 60px 20px 24px", border: "none", background: "transparent", fontSize: 16, color: "#111827", outline: "none", rounded: 24 },
  sendBtn: { position: "absolute", right: 12, width: 40, height: 40, background: "transparent", border: "none", color: "#9ca3af", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" },
  sendBtnActive: { color: "#111827", background: "#f3f4f6" },
  guardStatusBar: { display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#9ca3af", justifyContent: "center", marginTop: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 },
  guardrailAlert: { background: "#fef2f2", color: "#ef4444", padding: "12px 16px", borderRadius: 12, fontSize: 14, alignSelf: "flex-start", border: "1px solid #fee2e2" },
  dot: { width: 6, height: 6, background: "#cbd5e1", borderRadius: "50%", animation: "pulse 1.4s infinite" },
  
  mdH1: { fontSize: 20, fontWeight: 700, margin: "16px 0 8px", color: "#111827" },
  mdH2: { fontSize: 18, fontWeight: 600, margin: "14px 0 6px", color: "#111827" },
  mdP: { margin: "8px 0" },
  mdLi: { marginLeft: 16, margin: "4px 0" },
  mdAbnormal: { background: "#fef3c7", padding: "2px 8px", borderRadius: 6, color: "#92400e", fontSize: 13, fontWeight: 700, margin: "0 4px" },
  mdCritical: { background: "#fee2e2", padding: "2px 8px", borderRadius: 6, color: "#b91c1c", fontSize: 13, fontWeight: 700, margin: "0 4px" },
  mdNormal: { background: "#d1fae5", padding: "2px 8px", borderRadius: 6, color: "#065f46", fontSize: 13, fontWeight: 700, margin: "0 4px" },
};