import "./App.css"
import { Editor } from "@monaco-editor/react"
import { MonacoBinding } from "y-monaco"
import { useRef, useMemo, useState, useEffect } from "react"
import * as Y from "yjs"
import { SocketIOProvider } from "y-socket.io"

const COLORS = [
  "#60a5fa", "#34d399", "#f472b6", "#fb923c",
  "#a78bfa", "#facc15", "#38bdf8", "#4ade80",
]

const LANG_EXT = {
  javascript: "js", typescript: "ts", python: "py", go: "go", rust: "rs"
}

function Avatar({ username, color }) {
  const initials = username.slice(0, 2).toUpperCase()
  return (
    <div
      className="w-7 h-7 text-xs rounded-full flex items-center justify-center font-bold shrink-0 ring-2 ring-gray-900"
      style={{ backgroundColor: color + "22", color, border: `1.5px solid ${color}44` }}
      title={username}
    >
      {initials}
    </div>
  )
}

export default function App() {
  const editorRef = useRef(null)
  const [username, setUsername] = useState(() =>
    new URLSearchParams(window.location.search).get("username") || ""
  )
  const [users, setUsers] = useState([])
  const [inputVal, setInputVal] = useState("")
  const [language, setLanguage] = useState("javascript")

  const ydoc = useMemo(() => new Y.Doc(), [])
  const yText = useMemo(() => ydoc.getText("monaco"), [ydoc])

  const handleMount = (editor) => {
    editorRef.current = editor
    new MonacoBinding(
      yText,
      editorRef.current.getModel(),
      new Set([editorRef.current])
    )
  }

  const handleJoin = (e) => {
    e.preventDefault()
    if (!inputVal.trim()) return
    setUsername(inputVal.trim())
    window.history.pushState({}, "", "?username=" + inputVal.trim())
  }

  useEffect(() => {
    if (username) {
      const provider = new SocketIOProvider("/", "monaco", ydoc, { autoConnect: true })
      const myColor = COLORS[Math.floor(Math.random() * COLORS.length)]
      provider.awareness.setLocalStateField("user", { username, color: myColor })

      const update = () => {
        const states = Array.from(provider.awareness.getStates().values())
        setUsers(states.filter(s => s.user?.username).map(s => s.user))
      }
      update()
      provider.awareness.on("change", update)

      const handleBeforeUnload = () => provider.awareness.setLocalStateField("user", null)
      window.addEventListener("beforeunload", handleBeforeUnload)
      return () => {
        provider.disconnect()
        window.removeEventListener("beforeunload", handleBeforeUnload)
      }
    }
  }, [username])

  if (!username) {
    return (
      <main className="h-screen w-full flex items-center justify-center" style={{ background: "#0a0a0f" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Syne:wght@700;800&display=swap');
          * { box-sizing: border-box; }
          body { margin: 0; }
          .join-glow { box-shadow: 0 0 40px #3b82f620; }
          .join-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px #3b82f612; }
          .join-btn:hover { background: #2563eb; transform: translateY(-1px); }
          .join-btn:active { transform: translateY(0); }
          .dot { animation: pulse 2s ease-in-out infinite; }
          .dot:nth-child(2) { animation-delay: 0.3s; }
          .dot:nth-child(3) { animation-delay: 0.6s; }
          @keyframes pulse { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }
        `}</style>

        <div className="join-glow" style={{
          background: "#111118", border: "1px solid #1e1e2e", borderRadius: "16px",
          padding: "48px", width: "360px", display: "flex", flexDirection: "column", gap: "32px"
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ display: "flex", gap: "4px" }}>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="dot" style={{
                    width: "7px", height: "7px", borderRadius: "50%",
                    background: i === 0 ? "#ef4444" : i === 1 ? "#eab308" : "#22c55e"
                  }} />
                ))}
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#4b5563", letterSpacing: "0.08em" }}>collab.io</span>
            </div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "28px", fontWeight: 800, color: "#f9fafb", margin: 0, lineHeight: 1.1 }}>
              Code together,<br /><span style={{ color: "#3b82f6" }}>in real time.</span>
            </h1>
            <p style={{ margin: 0, fontSize: "13px", color: "#6b7280", fontFamily: "'JetBrains Mono', monospace" }}>
              Enter a name to join the session
            </p>
          </div>
          <form onSubmit={handleJoin} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <input
              className="join-input"
              type="text"
              placeholder="your_username"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              autoFocus
              style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: "14px", padding: "12px 16px",
                background: "#0d0d14", border: "1px solid #1e1e2e", borderRadius: "8px",
                color: "#f9fafb", transition: "border-color 0.2s, box-shadow 0.2s", letterSpacing: "0.02em"
              }}
            />
            <button
              className="join-btn"
              type="submit"
              style={{
                fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "14px", padding: "12px",
                background: "#3b82f6", border: "none", borderRadius: "8px", color: "#fff",
                cursor: "pointer", transition: "background 0.2s, transform 0.15s", letterSpacing: "0.04em"
              }}
            >
              Join Session →
            </button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main style={{ height: "100vh", width: "100%", display: "flex", flexDirection: "column", background: "#0a0a0f" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        .user-pill:hover { background: #1a1a26 !important; }
        .lang-btn { cursor: pointer; transition: all 0.15s; }
        .lang-btn:hover { background: #1e1e2e !important; }
        .lang-btn.active { background: #1d3c6e !important; color: #60a5fa !important; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e1e2e; border-radius: 4px; }
      `}</style>

      {/* Top bar */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px", height: "52px", borderBottom: "1px solid #1a1a26",
        background: "#0d0d14", flexShrink: 0, gap: "16px"
      }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: "5px" }}>
            {["#ef4444","#eab308","#22c55e"].map((c, i) => (
              <div key={i} style={{ width: "10px", height: "10px", borderRadius: "50%", background: c }} />
            ))}
          </div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "16px", color: "#f9fafb", letterSpacing: "-0.01em" }}>
            collab<span style={{ color: "#3b82f6" }}>.io</span>
          </span>
          <div style={{ width: "1px", height: "20px", background: "#1e1e2e", margin: "0 4px" }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#4b5563", letterSpacing: "0.06em" }}>
            session / monaco
          </span>
        </div>

        {/* Language switcher */}
        <div style={{ display: "flex", gap: "4px" }}>
          {Object.keys(LANG_EXT).map(lang => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`lang-btn${language === lang ? " active" : ""}`}
              style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: "11px",
                padding: "4px 10px", borderRadius: "6px", border: "none",
                background: "transparent", color: language === lang ? "#60a5fa" : "#6b7280",
                letterSpacing: "0.04em"
              }}
            >{lang}</button>
          ))}
        </div>

        {/* Avatars */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#4b5563" }}>
            {users.length} online
          </span>
          <div style={{ display: "flex", flexDirection: "row-reverse" }}>
            {users.slice(0, 6).map((user, i) => (
              <div key={i} style={{ marginLeft: i === 0 ? 0 : "-8px" }}>
                <Avatar username={user.username} color={user.color || COLORS[i % COLORS.length]} />
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <aside style={{
          width: "220px", flexShrink: 0, background: "#0d0d14",
          borderRight: "1px solid #1a1a26", display: "flex", flexDirection: "column", overflow: "hidden"
        }}>
          <div style={{ padding: "16px 16px 10px", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.12em", color: "#374151", textTransform: "uppercase" }}>
            Participants
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 16px" }}>
            {users.map((user, i) => (
              <div key={i} className="user-pill" style={{
                display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px",
                borderRadius: "8px", marginBottom: "2px",
                background: user.username === username ? "#13131f" : "transparent"
              }}>
                <Avatar username={user.username} color={user.color || COLORS[i % COLORS.length]} />
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "#e5e7eb", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user.username}
                  </div>
                  {user.username === username && (
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#3b82f6" }}>you</div>
                  )}
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <div style={{ padding: "12px 10px", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#374151" }}>Connecting…</div>
            )}
          </div>
          <div style={{ padding: "12px 16px", borderTop: "1px solid #1a1a26" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e" }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#4b5563" }}>Live sync active</span>
            </div>
          </div>
        </aside>

        {/* Editor */}
        <section style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Tab bar */}
          <div style={{
            display: "flex", alignItems: "center", height: "38px",
            background: "#0d0d14", borderBottom: "1px solid #1a1a26", padding: "0 16px"
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "8px", padding: "0 16px 0 0",
              height: "100%", borderBottom: "2px solid #3b82f6", marginBottom: "-1px"
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#3b82f6" strokeWidth="2"/>
                <path d="M14 2v6h6" stroke="#3b82f6" strokeWidth="2"/>
              </svg>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "#d1d5db" }}>
                main.{LANG_EXT[language]}
              </span>
            </div>
          </div>

          {/* Monaco */}
          <div style={{ flex: 1, overflow: "hidden" }}>
            <Editor
              height="100%"
              language={language}
              defaultValue="// Start coding — changes sync in real time"
              theme="vs-dark"
              onMount={handleMount}
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', monospace",
                fontLigatures: true,
                lineHeight: 22,
                padding: { top: 20, bottom: 20 },
                minimap: { enabled: false },
                scrollbar: { verticalScrollbarSize: 4, horizontalScrollbarSize: 4 },
                renderLineHighlight: "gutter",
                cursorBlinking: "smooth",
                smoothScrolling: true,
                cursorSmoothCaretAnimation: "on",
                bracketPairColorization: { enabled: true },
                guides: { bracketPairs: true },
              }}
            />
          </div>
        </section>
      </div>
    </main>
  )
}