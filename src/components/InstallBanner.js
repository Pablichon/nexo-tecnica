"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function InstallBanner() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [visible, setVisible] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const promptRef = useRef(null);

    useEffect(() => {
        // Si ya está instalada como PWA, no mostrar nada
        const isStandalone =
            window.matchMedia("(display-mode: standalone)").matches ||
            window.navigator.standalone === true;
        if (isStandalone) return;

        // Detectar iOS
        const ua = window.navigator.userAgent.toLowerCase();
        const ios = /iphone|ipad|ipod/.test(ua);
        setIsIOS(ios);

        // Mostrar el botón siempre (iOS o no)
        setVisible(true);

        // Capturar el evento nativo de Chrome/Android
        const handlePrompt = (e) => {
            e.preventDefault();
            promptRef.current = e;
            setDeferredPrompt(e);
        };
        window.addEventListener("beforeinstallprompt", handlePrompt);

        // Ocultar si se instala
        const handleInstalled = () => setVisible(false);
        window.addEventListener("appinstalled", handleInstalled);

        return () => {
            window.removeEventListener("beforeinstallprompt", handlePrompt);
            window.removeEventListener("appinstalled", handleInstalled);
        };
    }, []);

    const handleClick = async () => {
        if (deferredPrompt) {
            // Diálogo nativo de instalación
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === "accepted") setVisible(false);
            setDeferredPrompt(null);
            promptRef.current = null;
        } else {
            // iOS o Chrome sin evento: mostrar instrucciones
            setShowModal(true);
        }
    };

    if (!visible) return null;

    return (
        <>
            {/* Botón flotante */}
            <button
                onClick={handleClick}
                aria-label="Instalá Yofre al Toque"
                style={{
                    position: "fixed",
                    bottom: "24px",
                    right: "20px",
                    zIndex: 9999,
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    backgroundColor: "#FF8C00",
                    color: "white",
                    borderRadius: "50px",
                    padding: "13px 20px 13px 14px",
                    boxShadow: "0 4px 20px rgba(255,140,0,0.4), 0 2px 8px rgba(0,0,0,0.15)",
                    cursor: "pointer",
                    border: "none",
                    fontFamily: "var(--font-nunito), sans-serif",
                    fontWeight: "700",
                    fontSize: "14px",
                    letterSpacing: "0.01em",
                    whiteSpace: "nowrap",
                    animation: "floatIn 0.5s cubic-bezier(0.16,1,0.3,1) both",
                    WebkitTapHighlightColor: "transparent",
                }}
            >
                <Image
                    src="/icon-192x192.png"
                    width={26}
                    height={26}
                    alt=""
                    style={{ borderRadius: "6px", flexShrink: 0 }}
                />
                Instalá Yofre al Toque
            </button>

            {/* Modal de instrucciones */}
            {showModal && (
                <>
                    <div
                        onClick={() => setShowModal(false)}
                        style={{
                            position: "fixed", inset: 0,
                            backgroundColor: "rgba(0,0,0,0.5)",
                            zIndex: 10000,
                            animation: "fadeIn 0.2s ease both",
                        }}
                    />
                    <div style={{
                        position: "fixed",
                        bottom: 0, left: 0, right: 0,
                        zIndex: 10001,
                        backgroundColor: "#fff",
                        borderRadius: "24px 24px 0 0",
                        padding: "20px 24px 40px",
                        fontFamily: "var(--font-nunito), sans-serif",
                        animation: "slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both",
                    }}>
                        {/* Handle */}
                        <div style={{
                            width: "40px", height: "4px",
                            backgroundColor: "#e5e7eb", borderRadius: "99px",
                            margin: "0 auto 20px",
                        }} />

                        {/* Cabecera */}
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                            <Image src="/icon-192x192.png" width={52} height={52} alt="Logo" style={{ borderRadius: "12px" }} />
                            <div>
                                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#111827" }}>
                                    Instalá Yofre al Toque
                                </h2>
                                <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#6b7280" }}>
                                    Tené a mano las mejores ofertas de tu barrio
                                </p>
                            </div>
                        </div>

                        {/* Pasos */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            {isIOS ? (
                                <>
                                    <Step n="1" text={<>Tocá el ícono <strong>Compartir ⬆️</strong> en la barra del navegador</>} />
                                    <Step n="2" text={<>Desplazá y elegí <strong>"Agregar al inicio"</strong></>} />
                                    <Step n="3" text={<>Tocá <strong>"Agregar"</strong> y listo 🎉</>} />
                                </>
                            ) : (
                                <>
                                    <Step n="1" text={<>En Chrome, tocá el menú <strong>⋮</strong> (tres puntos) arriba</>} />
                                    <Step n="2" text={<>Elegí <strong>"Agregar a la pantalla de inicio"</strong></>} />
                                    <Step n="3" text={<>Confirmá tocando <strong>"Agregar"</strong> 🎉</>} />
                                </>
                            )}
                        </div>

                        <button
                            onClick={() => setShowModal(false)}
                            style={{
                                marginTop: "24px", width: "100%",
                                padding: "14px",
                                backgroundColor: "#FF8C00", color: "white",
                                border: "none", borderRadius: "14px",
                                fontSize: "16px", fontWeight: "700",
                                cursor: "pointer",
                                fontFamily: "var(--font-nunito), sans-serif",
                            }}
                        >
                            Entendido
                        </button>
                    </div>
                </>
            )}

            <style>{`
                @keyframes floatIn {
                    from { opacity: 0; transform: translateY(40px) scale(0.85); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to   { transform: translateY(0); }
                }
            `}</style>
        </>
    );
}

function Step({ n, text }) {
    return (
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <span style={{
                flexShrink: 0, width: "26px", height: "26px",
                backgroundColor: "#FFF3E0", color: "#FF8C00",
                borderRadius: "50%", display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: "13px", fontWeight: "800",
            }}>
                {n}
            </span>
            <p style={{ margin: 0, fontSize: "14px", color: "#374151", lineHeight: 1.5 }}>
                {text}
            </p>
        </div>
    );
}
