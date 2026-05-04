import { useState, useRef, useCallback } from "react";

const EXAMPLE_PROMPTS = [
    { label: "General", value: "" },
    { label: "Photo of", value: "a photo of" },
    { label: "There is", value: "there is" },
    { label: "A scene of", value: "a scene of" },
];

const HISTORY_MAX = 6;

function TypewriterText({ text }) {
    const [displayed, setDisplayed] = useState("");
    const [done, setDone] = useState(false);

    useState(() => {
        setDisplayed("");
        setDone(false);
        let i = 0;
        const interval = setInterval(() => {
            i++;
            setDisplayed(text.slice(0, i));
            if (i >= text.length) { clearInterval(interval); setDone(true); }
        }, 22);
        return () => clearInterval(interval);
    });

    return (
        <span>
            {displayed}
            {!done && (
                <span style={{
                    display: "inline-block", width: 2, height: "1em",
                    background: "#6366f1", marginLeft: 2, verticalAlign: "text-bottom",
                    animation: "blink 0.8s step-end infinite"
                }} />
            )}
        </span>
    );
}

function HistoryCard({ item }) {
    return (
        <div style={{
            display: "flex", gap: 12, alignItems: "flex-start",
            padding: "12px 0",
            borderBottom: "0.5px solid var(--color-border-tertiary)",
            animation: "fadeUp 0.3s ease"
        }}>
            <img
                src={item.imageUrl}
                alt="thumb"
                style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                    margin: 0, fontSize: 13, color: "var(--color-text-primary)",
                    lineHeight: 1.5, fontStyle: "italic"
                }}>
                    "{item.caption}"
                </p>
                <div style={{ marginTop: 4, display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{
                        fontSize: 10, padding: "2px 7px", borderRadius: 99,
                        background: item.mode === "conditional" ? "#ede9fe" : "#f0fdf4",
                        color: item.mode === "conditional" ? "#7c3aed" : "#16a34a",
                        fontFamily: "'DM Mono', monospace", fontWeight: 500
                    }}>
                        {item.mode}
                    </span>
                    {item.prompt && (
                        <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", fontFamily: "'DM Mono', monospace" }}>
                            "{item.prompt}"
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function BLIPAnalyzer() {
    const [image, setImage] = useState(null);
    const [prompt, setPrompt] = useState("");
    const [activePrompt, setAP] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);
    const fileRef = useRef();

    const loadImage = (file) => {
        if (!file || !file.type.startsWith("image/")) return;
        setImage({ file, url: URL.createObjectURL(file) });
        setResult(null); setError(null);
    };

    const onDrop = useCallback((e) => {
        e.preventDefault(); setDragging(false);
        loadImage(e.dataTransfer.files[0]);
    }, []);

    const pickPrompt = (i) => {
        setAP(i); setPrompt(EXAMPLE_PROMPTS[i].value);
        setResult(null);
    };

    const generate = async () => {
        if (!image) return;
        setLoading(true); setError(null); setResult(null);

        const fd = new FormData();
        fd.append("image", image.file);
        fd.append("prompt", prompt);

        try {
            const res = await fetch("http://localhost:8000/caption", { method: "POST", body: fd });
            if (!res.ok) throw new Error(`Server error ${res.status}`);
            const data = await res.json();
            setResult(data);
            setHistory(prev => [
                { ...data, imageUrl: image.url },
                ...prev.slice(0, HISTORY_MAX - 1)
            ]);
        } catch (err) {
            setError(err.message.includes("fetch")
                ? "Cannot connect to backend. Run: python app.py"
                : err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Outfit:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        @keyframes fadeUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes blink   { 50%{opacity:0} }
        @keyframes captionReveal { from{opacity:0;transform:translateY(6px) scale(0.99)} to{opacity:1;transform:none} }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .drop-target { transition: border-color 0.2s, background 0.2s; }
        .drop-target:hover { border-color: #818cf8 !important; background: #fafaf9 !important; }
        .gen-btn { transition: all 0.18s ease; }
        .gen-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(99,102,241,0.25); }
        .gen-btn:active:not(:disabled){ transform: scale(0.98); }
        .prompt-chip { transition: all 0.14s; cursor: pointer; }
        .prompt-chip:hover { transform: translateY(-1px); }
      `}</style>

            <div style={{
                fontFamily: "'Outfit', sans-serif",
                maxWidth: 820, margin: "0 auto",
                padding: "3rem 1.5rem 5rem",
                animation: "fadeUp 0.45s ease"
            }}>

                {/* ── Header ── */}
                <div style={{ marginBottom: "3.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                        <span style={{
                            fontSize: 11, letterSpacing: "0.12em",
                            color: "#818cf8", fontFamily: "'DM Mono', monospace", fontWeight: 500
                        }}>
                            SALESFORCE BLIP · VIT-B/16 + TEXT DECODER
                        </span>
                    </div>

                    <h1 style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "clamp(34px, 6vw, 58px)",
                        fontWeight: 600, lineHeight: 1.08,
                        color: "var(--color-text-primary)", margin: "0 0 14px",
                        letterSpacing: "-0.01em"
                    }}>
                        Image Captioning<br />
                        <em style={{ color: "#818cf8", fontStyle: "italic" }}>with BLIP</em>
                    </h1>

                    <p style={{
                        fontSize: 15, color: "var(--color-text-secondary)",
                        maxWidth: 520, lineHeight: 1.65, margin: 0, fontWeight: 300
                    }}>
                        Upload any image. BLIP's <strong style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>ViT encoder</strong> processes
                        the visual patches, then the <strong style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>BERT-based text decoder</strong> generates
                        a natural language description — zero training required.
                    </p>
                </div>

                {/* ── Main grid ── */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1.1fr 0.9fr",
                    gap: 20, marginBottom: 20,
                    alignItems: "start"
                }}>

                    {/* ── Left: drop zone ── */}
                    <div style={{
                        border: "0.5px solid var(--color-border-tertiary)",
                        borderRadius: "var(--border-radius-lg)",
                        background: "var(--color-background-primary)",
                        overflow: "hidden"
                    }}>
                        <div style={{
                            padding: "13px 18px",
                            borderBottom: "0.5px solid var(--color-border-tertiary)",
                            display: "flex", justifyContent: "space-between", alignItems: "center"
                        }}>
                            <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "var(--color-text-tertiary)", letterSpacing: "0.08em" }}>
                                IMAGE INPUT
                            </span>
                            <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#818cf8" }}>
                                ViT-B/16 encoder
                            </span>
                        </div>

                        <div
                            className="drop-target"
                            onClick={() => fileRef.current?.click()}
                            onDrop={onDrop}
                            onDragOver={e => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            style={{
                                minHeight: 280, display: "flex", alignItems: "center",
                                justifyContent: "center", cursor: "pointer",
                                background: dragging ? "#f5f3ff" : "var(--color-background-secondary)",
                                borderBottom: "0.5px solid var(--color-border-tertiary)",
                                position: "relative", overflow: "hidden",
                                borderColor: dragging ? "#818cf8" : undefined,
                            }}
                        >
                            {image ? (
                                <>
                                    <img
                                        src={image.url} alt="uploaded"
                                        style={{ width: "100%", height: 280, objectFit: "cover", display: "block" }}
                                    />
                                    <div style={{
                                        position: "absolute", inset: 0,
                                        background: "rgba(0,0,0,0.4)",
                                        display: "flex", flexDirection: "column",
                                        alignItems: "center", justifyContent: "center", gap: 6,
                                        opacity: 0, transition: "opacity 0.2s",
                                        fontSize: 13, color: "#fff", fontWeight: 500,
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                        onMouseLeave={e => e.currentTarget.style.opacity = 0}
                                    >
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                                        </svg>
                                        Change image
                                    </div>
                                </>
                            ) : (
                                <div style={{ textAlign: "center", padding: 32 }}>
                                    <div style={{ marginBottom: 16, opacity: 0.3 }}>
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                            <rect x="3" y="3" width="18" height="18" rx="3" />
                                            <circle cx="8.5" cy="8.5" r="1.5" />
                                            <polyline points="21 15 16 10 5 21" />
                                        </svg>
                                    </div>
                                    <p style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-secondary)", margin: "0 0 6px" }}>
                                        Drop an image here
                                    </p>
                                    <span style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>
                                        or click to browse · JPG, PNG, WEBP
                                    </span>
                                </div>
                            )}
                        </div>

                        <input ref={fileRef} type="file" accept="image/*"
                            style={{ display: "none" }}
                            onChange={e => loadImage(e.target.files[0])} />

                        <div style={{ padding: "11px 18px" }}>
                            <span style={{ fontSize: 12, color: image ? "#16a34a" : "var(--color-text-tertiary)" }}>
                                {image ? `✓  ${image.file.name}` : "No image selected"}
                            </span>
                        </div>
                    </div>

                    {/* ── Right: prompt + info ── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                        {/* Prompt card */}
                        <div style={{
                            border: "0.5px solid var(--color-border-tertiary)",
                            borderRadius: "var(--border-radius-lg)",
                            background: "var(--color-background-primary)",
                            overflow: "hidden"
                        }}>
                            <div style={{
                                padding: "13px 18px",
                                borderBottom: "0.5px solid var(--color-border-tertiary)",
                                display: "flex", justifyContent: "space-between", alignItems: "center"
                            }}>
                                <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "var(--color-text-tertiary)", letterSpacing: "0.08em" }}>
                                    PROMPT (OPTIONAL)
                                </span>
                                <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#818cf8" }}>
                                    text decoder
                                </span>
                            </div>

                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", padding: "12px 16px", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                                {EXAMPLE_PROMPTS.map((p, i) => (
                                    <button key={i} className="prompt-chip" onClick={() => pickPrompt(i)} style={{
                                        padding: "5px 12px", fontSize: 12, fontFamily: "'Outfit', sans-serif",
                                        border: `1px solid ${activePrompt === i ? "#818cf8" : "var(--color-border-tertiary)"}`,
                                        borderRadius: 99, background: activePrompt === i ? "#f5f3ff" : "transparent",
                                        color: activePrompt === i ? "#6366f1" : "var(--color-text-secondary)",
                                        cursor: "pointer", fontWeight: activePrompt === i ? 500 : 400,
                                    }}>
                                        {p.label}
                                    </button>
                                ))}
                            </div>

                            <input
                                value={prompt}
                                onChange={e => { setPrompt(e.target.value); setAP(-1); setResult(null); }}
                                placeholder="e.g. a photo of, there is a..."
                                style={{
                                    width: "100%", boxSizing: "border-box",
                                    border: "none", outline: "none",
                                    padding: "12px 18px",
                                    background: "var(--color-background-secondary)",
                                    color: "var(--color-text-primary)",
                                    fontSize: 13, fontFamily: "'DM Mono', monospace",
                                }}
                            />
                        </div>

                        {/* Architecture info card */}
                        <div style={{
                            border: "0.5px solid var(--color-border-tertiary)",
                            borderRadius: "var(--border-radius-lg)",
                            background: "var(--color-background-primary)",
                            padding: "16px 18px",
                            display: "flex", flexDirection: "column", gap: 12
                        }}>
                            <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "var(--color-text-tertiary)", letterSpacing: "0.08em" }}>
                                MODEL ARCHITECTURE
                            </span>

                            {[
                                { step: "01", label: "ViT-B/16 Image Encoder", desc: "Splits image into 16×16 patches, encodes to embeddings" },
                                { step: "02", label: "Cross-Attention Fusion", desc: "Text decoder attends to image patch embeddings" },
                                { step: "03", label: "BERT Text Decoder", desc: "Auto-regressively generates caption token by token" },
                            ].map(item => (
                                <div key={item.step} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                                    <span style={{
                                        fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#818cf8",
                                        fontWeight: 500, flexShrink: 0, marginTop: 1
                                    }}>
                                        {item.step}
                                    </span>
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 2 }}>
                                            {item.label}
                                        </div>
                                        <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", lineHeight: 1.5 }}>
                                            {item.desc}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Generate button ── */}
                <button
                    className="gen-btn"
                    onClick={generate}
                    disabled={!image || loading}
                    style={{
                        width: "100%", padding: "15px",
                        background: image && !loading
                            ? "linear-gradient(135deg, #6366f1, #818cf8)"
                            : "var(--color-background-secondary)",
                        color: image && !loading ? "#fff" : "var(--color-text-tertiary)",
                        border: "none", borderRadius: "var(--border-radius-md)",
                        fontSize: 15, fontWeight: 500, fontFamily: "'Outfit', sans-serif",
                        cursor: image && !loading ? "pointer" : "not-allowed",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                        marginBottom: 20, letterSpacing: "0.01em",
                    }}
                >
                    {loading ? (
                        <>
                            <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                            BLIP is generating caption...
                        </>
                    ) : (
                        <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            Generate Caption
                        </>
                    )}
                </button>

                {/* ── Error ── */}
                {error && (
                    <div style={{
                        padding: "12px 18px", marginBottom: 20,
                        borderRadius: "var(--border-radius-md)",
                        background: "#fef2f2", border: "0.5px solid #fecaca",
                        fontSize: 13, color: "#dc2626", animation: "fadeUp 0.25s ease"
                    }}>
                        ⚠ {error}
                    </div>
                )}

                {/* ── Result ── */}
                {result && (
                    <div style={{
                        border: "0.5px solid #c7d2fe",
                        borderRadius: "var(--border-radius-lg)",
                        background: "var(--color-background-primary)",
                        overflow: "hidden", marginBottom: 28,
                        animation: "captionReveal 0.35s cubic-bezier(0.4,0,0.2,1)"
                    }}>
                        <div style={{
                            padding: "18px 24px",
                            background: "#f5f3ff",
                            borderBottom: "0.5px solid #c7d2fe",
                            display: "flex", alignItems: "center", gap: 12
                        }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: 10,
                                background: "#ede9fe", border: "1px solid #c4b5fd",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                flexShrink: 0
                            }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                            </div>
                            <div>
                                <div style={{ fontSize: 11, color: "#6366f1", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em", marginBottom: 2 }}>
                                    GENERATED CAPTION · {result.mode.toUpperCase()}
                                </div>
                                <div style={{ fontSize: 12, color: "#7c3aed", fontFamily: "'DM Mono', monospace" }}>
                                    {result.encoder} → {result.decoder}
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: "28px 28px 24px" }}>
                            <p style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontSize: "clamp(20px, 3vw, 26px)",
                                fontWeight: 400, lineHeight: 1.45,
                                color: "var(--color-text-primary)", margin: 0,
                                fontStyle: "italic",
                            }}>
                                "<TypewriterText text={result.caption} />"
                            </p>

                            {result.prompt && (
                                <div style={{ marginTop: 16, display: "flex", gap: 8, alignItems: "center" }}>
                                    <span style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>Conditioned on:</span>
                                    <span style={{
                                        fontSize: 11, padding: "3px 10px", borderRadius: 99,
                                        background: "#ede9fe", color: "#6d28d9",
                                        fontFamily: "'DM Mono', monospace"
                                    }}>
                                        "{result.prompt}"
                                    </span>
                                </div>
                            )}
                        </div>

                        <div style={{ padding: "12px 24px", borderTop: "0.5px solid var(--color-border-tertiary)", background: "var(--color-background-secondary)" }}>
                            <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", fontFamily: "'DM Mono', monospace" }}>
                                {result.model} · beam search (n=5) · max 50 tokens
                            </span>
                        </div>
                    </div>
                )}

                {/* ── History ── */}
                {history.length > 0 && (
                    <div style={{
                        border: "0.5px solid var(--color-border-tertiary)",
                        borderRadius: "var(--border-radius-lg)",
                        background: "var(--color-background-primary)",
                        overflow: "hidden", marginBottom: 28
                    }}>
                        <div style={{
                            padding: "13px 18px",
                            borderBottom: "0.5px solid var(--color-border-tertiary)",
                            display: "flex", justifyContent: "space-between", alignItems: "center"
                        }}>
                            <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "var(--color-text-tertiary)", letterSpacing: "0.08em" }}>
                                RECENT CAPTIONS
                            </span>
                            <button onClick={() => setHistory([])} style={{
                                background: "none", border: "none", fontSize: 11,
                                color: "var(--color-text-tertiary)", cursor: "pointer",
                                fontFamily: "'DM Mono', monospace"
                            }}>
                                clear
                            </button>
                        </div>
                        <div style={{ padding: "4px 18px" }}>
                            {history.map((item, i) => <HistoryCard key={i} item={item} />)}
                        </div>
                    </div>
                )}

                {/* ── Footer ── */}
                <div style={{
                    paddingTop: 20,
                    borderTop: "0.5px solid var(--color-border-tertiary)",
                    display: "flex", justifyContent: "space-between",
                    flexWrap: "wrap", gap: 8
                }}>
                    <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", fontFamily: "'DM Mono', monospace" }}>
                        Salesforce/blip-image-captioning-base
                    </span>
                    <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", fontFamily: "'DM Mono', monospace" }}>
                        ViT-B/16 · BERT decoder · FastAPI · React
                    </span>
                </div>

            </div>
        </>
    );
}
