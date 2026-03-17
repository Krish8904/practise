import { useEffect, useState } from "react";
import Lenis from "lenis";

export default function ChatBot() {
  const [botReady, setBotReady] = useState(false);

  useEffect(() => {
    // ── Lenis for page scroll ──
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const rafId = requestAnimationFrame(raf);

    // ── Pause Lenis when mouse is over Botpress widget ──
    const handleMouseOver = (e) => {
      if (e.target?.closest?.("#bp-web-widget-container")) {
        lenis.stop();
      }
    };
    const handleMouseOut = (e) => {
      if (e.target?.closest?.("#bp-web-widget-container")) {
        lenis.start();
      }
    };

    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);

    // ── Load Botpress scripts ──
    ["bp-script1", "bp-script2"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });

    const script1 = document.createElement("script");
    script1.id = "bp-script1";
    script1.src = "https://cdn.botpress.cloud/webchat/v3.6/inject.js";
    script1.async = true;

    script1.onload = () => {
      const script2 = document.createElement("script");
      script2.id = "bp-script2";
      script2.src = "https://files.bpcontent.cloud/2026/03/16/05/20260316054017-N9RVPEKI.js";
      script2.async = true;
      script2.onload = () => {
        setTimeout(() => {
          setBotReady(true);
        }, 600);
      };
      document.body.appendChild(script2);
    };

    document.body.appendChild(script1);

    return () => {
      // Cleanup Lenis
      cancelAnimationFrame(rafId);
      lenis.destroy();

      // Cleanup mouse listeners
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);

      // Cleanup Botpress
      window.botpress?.close();
      window.botpress?.hide?.();
      ["bp-script1", "bp-script2"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.remove();
      });
      document
        .querySelectorAll("[id^='bp-'], [class^='bp-'], #botpress-webchat, #bp-web-widget-container")
        .forEach((el) => el.remove());
    };
  }, []);

  return (<></>
  );
}