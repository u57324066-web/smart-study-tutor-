import React, { useState, useRef, useEffect } from "react";
import { Camera, Send, X, Loader2, BookOpen, NotebookPen, MessageCircle } from "lucide-react";

const LANGUAGES = [
  { value: "auto", label: "Auto (jis mein poocho)" },
  { value: "hinglish", label: "Hinglish" },
  { value: "hindi", label: "हिंदी" },
  { value: "english", label: "English" },
  { value: "marathi", label: "मराठी" },
  { value: "tamil", label: "தமிழ்" },
  { value: "telugu", label: "తెలుగు" },
  { value: "bengali", label: "বাংলা" },
  { value: "gujarati", label: "ગુજરાતી" },
];

const FONTS_LINK = "https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap";

export default function AiTutor() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Namaste! Main tumhara AI Tutor hoon 📘\n\n• \"Ask\" mode mein koi bhi sawaal poocho (text ya photo)\n• \"Notes\" mode mein kisi bhi topic ke notes banwao\n\nKisi bhi language mein poochho — Hindi, English, Hinglish ya koi aur, jawaab bhi usi mein milega (upar dropdown se language fix bhi kar sakte ho).",
      image: null,
    },
  ]);
  const [input, setInput] = useState("");
  const [pendingImage, setPendingImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("ask"); // "ask" | "notes"
  const [language, setLanguage] = useState("auto");
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = FONTS_LINK;
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPendingImage({ dataUrl: reader.result, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };

  const sendMessage = async () => {
    if (!input.trim() && !pendingImage) return;
    const userMsg = { role: "user", text: input.trim(), image: pendingImage?.dataUrl || null };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setPendingImage(null);
    setLoading(true);

    try {
      const apiContent = [];
      if (userMsg.image) {
        const base64 = userMsg.image.split(",")[1];
        apiContent.push({
          type: "image",
          source: { type: "base64", media_type: pendingImage.mimeType, data: base64 },
        });
      }
      apiContent.push({
        type: "text",
        text:
          userMsg.text ||
          (mode === "notes"
            ? "Is photo ke topic/chapter par acche structured notes bana do."
            : "Is photo mein jo question hai, usko step-by-step solve/explain karo."),
      });

      const history = newMessages.slice(0, -1).map((m) => ({
        role: m.role,
        content: m.text || "(image question)",
      }));

      const langInstruction =
        language === "auto"
          ? "Reply in Hinglish (Hindi-English mix, Roman script) by default, unless the student clearly writes in a specific language (pure English, pure Hindi, Marathi, Tamil, etc.) — then match that language exactly."
          : language === "hinglish"
          ? "Always reply in Hinglish (Hindi-English mix, Roman script), regardless of what language the student writes in."
          : `Always reply in ${LANGUAGES.find((l) => l.value === language)?.label || language}, regardless of what language the student writes in. Translate/explain content into this language.`;

      const modeInstruction =
        mode === "notes"
          ? "The student wants NOTES, not a conversational answer. Produce well-structured study notes: a clear title, organized headings/subheadings, short bullet points, key definitions in bold, and a short summary at the end. Keep it exam-friendly and easy to revise from."
          : "Answer the student's question directly and clearly, step-by-step where relevant, like a patient tutor.";

      const response = await fetch("/.netlify/functions/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: `You are a warm, patient AI tutor for Indian students in Classes 6-12, for a service called Smart Study. ${modeInstruction} ${langInstruction} For photos, first briefly restate the question/topic, then respond accordingly.`,
          messages: [...history, { role: "user", content: apiContent }],
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      const textBlocks = (data.content || []).filter((b) => b.type === "text").map((b) => b.text);
      const answer = textBlocks.join("\n") || "Maaf karna, jawaab nahi mil paya. Dobara try karo.";
      setMessages((prev) => [...prev, { role: "assistant", text: answer, image: null }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Kuch gadbad ho gayi. Please dobara try karo.", image: null },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        background: "#182420",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        color: "#F3F1E4",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 20px 14px",
          borderBottom: "1px solid rgba(243,241,228,0.12)",
          background: "linear-gradient(180deg, #1C2B24 0%, #182420 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <BookOpen size={22} color="#E8B923" />
          <h1
            style={{
              fontFamily: "'Kalam', cursive",
              fontSize: 26,
              fontWeight: 700,
              margin: 0,
              color: "#F3F1E4",
            }}
          >
            Smart Study Tutor
          </h1>
        </div>
        <svg width="180" height="10" style={{ marginTop: 2, marginLeft: 32 }}>
          <path
            d="M2,5 Q45,0 90,5 T178,5"
            fill="none"
            stroke="#E8B923"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
        <p style={{ margin: "4px 0 0 32px", fontSize: 12.5, color: "#8FA89B" }}>
          Type a question, ya photo bhejo — main samjha dunga.
        </p>

        <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", background: "#223129", borderRadius: 10, padding: 3, border: "1px solid rgba(243,241,228,0.1)" }}>
            <button
              onClick={() => setMode("ask")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontSize: 12.5,
                fontWeight: 600,
                background: mode === "ask" ? "#E8B923" : "transparent",
                color: mode === "ask" ? "#182420" : "#8FA89B",
              }}
            >
              <MessageCircle size={14} /> Ask
            </button>
            <button
              onClick={() => setMode("notes")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontSize: 12.5,
                fontWeight: 600,
                background: mode === "notes" ? "#E8B923" : "transparent",
                color: mode === "notes" ? "#182420" : "#8FA89B",
              }}
            >
              <NotebookPen size={14} /> Notes
            </button>
          </div>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              background: "#223129",
              color: "#F3F1E4",
              border: "1px solid rgba(243,241,228,0.15)",
              borderRadius: 10,
              padding: "7px 10px",
              fontSize: 12.5,
              outline: "none",
            }}
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value} style={{ background: "#223129" }}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "18px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "82%",
              animation: "fadeIn 0.35s ease",
            }}
          >
            {m.image && (
              <img
                src={m.image}
                alt="uploaded question"
                style={{
                  maxWidth: "100%",
                  borderRadius: 10,
                  marginBottom: 6,
                  border: "2px solid #E8B923",
                }}
              />
            )}
            {m.text && (
              <div
                style={{
                  background: m.role === "user" ? "#E8B923" : "#223129",
                  color: m.role === "user" ? "#182420" : "#F3F1E4",
                  padding: "10px 14px",
                  borderRadius: m.role === "user" ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
                  fontSize: 14.5,
                  lineHeight: 1.55,
                  whiteSpace: "pre-wrap",
                  fontFamily: m.role === "assistant" ? "'Inter', sans-serif" : "inherit",
                  border: m.role === "assistant" ? "1px solid rgba(243,241,228,0.08)" : "none",
                }}
              >
                {m.text}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 8, color: "#8FA89B", fontSize: 13.5 }}>
            <Loader2 size={16} className="spin" style={{ animation: "spin 1s linear infinite" }} />
            Soch raha hoon...
          </div>
        )}
      </div>

      {/* Pending image preview */}
      {pendingImage && (
        <div style={{ padding: "0 16px 8px", display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src={pendingImage.dataUrl}
            alt="preview"
            style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 8, border: "2px solid #E8B923" }}
          />
          <button
            onClick={() => setPendingImage(null)}
            style={{ background: "none", border: "none", color: "#D9705A", cursor: "pointer", padding: 6 }}
          >
            <X size={18} />
          </button>
          <span style={{ fontSize: 12.5, color: "#8FA89B" }}>Photo ready — question likh sakte ho ya seedha bhejo</span>
        </div>
      )}

      {/* Input bar */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 8,
          padding: "10px 14px 16px",
          borderTop: "1px solid rgba(243,241,228,0.12)",
          background: "#182420",
        }}
      >
        <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleFile} style={{ display: "none" }} />
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: "#223129",
            border: "1px solid rgba(243,241,228,0.15)",
            borderRadius: "50%",
            width: 42,
            height: 42,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#E8B923",
            cursor: "pointer",
            flexShrink: 0,
          }}
          aria-label="Photo se question bhejo"
        >
          <Camera size={19} />
        </button>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={mode === "notes" ? "Kis topic/chapter ke notes chahiye?" : "Apna sawaal likho..."}
          rows={1}
          style={{
            flex: 1,
            resize: "none",
            background: "#223129",
            border: "1px solid rgba(243,241,228,0.15)",
            borderRadius: 20,
            padding: "10px 16px",
            color: "#F3F1E4",
            fontSize: 14.5,
            fontFamily: "'Inter', sans-serif",
            outline: "none",
            maxHeight: 90,
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || (!input.trim() && !pendingImage)}
          style={{
            background: "#E8B923",
            border: "none",
            borderRadius: "50%",
            width: 42,
            height: 42,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#182420",
            cursor: loading ? "default" : "pointer",
            opacity: loading || (!input.trim() && !pendingImage) ? 0.5 : 1,
            flexShrink: 0,
          }}
          aria-label="Bhejo"
        >
          <Send size={18} />
        </button>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        textarea::placeholder { color: #6B8F82; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: rgba(243,241,228,0.15); border-radius: 3px; }
      `}</style>
    </div>
  );
}
