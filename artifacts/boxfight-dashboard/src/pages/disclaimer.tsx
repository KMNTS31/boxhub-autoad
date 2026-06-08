import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { TriangleAlert } from "lucide-react";

export default function Disclaimer() {
  const [, setLocation] = useLocation();

  const handleAgree = () => {
    localStorage.setItem("boxfight_agreed", "true");
    setLocation("/login");
  };

  const handleDisagree = () => {
    window.location.href = "https://discord.com";
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background">
      {/* Background hero image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/image_1780946776840.png')` }}
      />
      {/* Layered overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/90" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      {/* Cyan radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_30%,rgba(0,212,255,0.07)_0%,transparent_70%)]" />
      {/* Scanlines */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.04)_2px,rgba(0,0,0,0.04)_4px)] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-2xl w-full px-6 py-12 text-center flex flex-col items-center">

        {/* Logo */}
        <div className="relative mb-10 animate-float">
          <div className="relative w-24 h-24 rounded-full animate-lightning-pulse pulse-ring overflow-hidden">
            <img
              src="/ChatGPT_Image_Jun_7,_2026,_07_35_03_PM_1780946581008.png"
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Heading */}
        <h1 className="font-gothic text-7xl md:text-9xl text-white mb-2 animate-static-glow tracking-wider leading-none">
          WARNING
        </h1>
        <div className="w-48 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent mb-10 opacity-60" />

        {/* Warning card */}
        <div className="w-full rounded-xl mb-10 overflow-hidden relative"
          style={{
            background: 'linear-gradient(145deg, rgba(10,10,20,0.95) 0%, rgba(5,5,15,0.98) 100%)',
            border: '1px solid rgba(220,38,38,0.25)',
            boxShadow: '0 0 40px rgba(220,38,38,0.08), 0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)'
          }}
        >
          {/* Red top line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />

          <div className="p-8 md:p-10">
            <div className="flex items-center justify-center gap-3 mb-6">
              <TriangleAlert className="w-7 h-7 text-red-500 shrink-0" style={{filter:'drop-shadow(0 0 8px rgba(239,68,68,0.6))'}} />
              <h2 className="text-sm font-bold text-white uppercase tracking-[0.3em]">Read Before Proceeding</h2>
              <TriangleAlert className="w-7 h-7 text-red-500 shrink-0" style={{filter:'drop-shadow(0 0 8px rgba(239,68,68,0.6))'}} />
            </div>

            <p className="text-white/70 text-base leading-relaxed mb-6">
              Using self-bot automation tools violates{" "}
              <span className="text-white font-semibold">Discord's Terms of Service</span>{" "}
              and may result in permanent account termination without warning.
            </p>

            <div className="rounded-lg p-4 mb-2"
              style={{
                background: 'rgba(220,38,38,0.07)',
                border: '1px solid rgba(220,38,38,0.2)'
              }}
            >
              <p className="text-red-300 text-sm font-medium leading-relaxed italic">
                "We are not responsible for any bans, restrictions, or consequences that may occur to your account as a result of using this software. Use at your own risk."
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
          <Button
            size="lg"
            className="w-full sm:flex-1 h-13 font-bold uppercase tracking-[0.15em] text-sm transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, rgba(0,212,255,0.15) 0%, rgba(0,150,200,0.1) 100%)',
              border: '1px solid rgba(0,212,255,0.35)',
              color: '#00d4ff',
              boxShadow: '0 0 20px rgba(0,212,255,0.12), inset 0 1px 0 rgba(255,255,255,0.05)'
            }}
            onClick={handleAgree}
            data-testid="button-agree"
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(0,212,255,0.25) 0%, rgba(0,150,200,0.2) 100%)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(0,212,255,0.25)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(0,212,255,0.15) 0%, rgba(0,150,200,0.1) 100%)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(0,212,255,0.12), inset 0 1px 0 rgba(255,255,255,0.05)';
            }}
          >
            I Understand & Agree
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="w-full sm:w-auto h-13 px-8 text-white/30 hover:text-white/60 hover:bg-white/5 font-medium uppercase tracking-[0.15em] text-sm transition-all"
            onClick={handleDisagree}
            data-testid="button-disagree"
          >
            Leave
          </Button>
        </div>
      </div>
    </div>
  );
}
