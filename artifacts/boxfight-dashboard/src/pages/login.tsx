import { Button } from "@/components/ui/button";
import { SiDiscord } from "react-icons/si";
import { Zap } from "lucide-react";

export default function Login() {
  return (
    <div className="min-h-screen w-full flex relative overflow-hidden bg-background">
      {/* Left half: hero image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('/image_1780946776840.png')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/20 to-background" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_50%_50%,rgba(0,212,255,0.06)_0%,transparent_70%)]" />
        {/* Corner accent */}
        <div className="absolute top-8 left-8">
          <p className="text-white/20 font-mono text-xs tracking-[0.3em] uppercase">! boxfight</p>
        </div>
        <div className="absolute bottom-8 left-8 right-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-white/40 text-xs font-mono tracking-widest uppercase">Secure Access Portal</span>
          </div>
        </div>
      </div>

      {/* Right half: login form */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-8 relative">
        {/* Background for right panel */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_30%,rgba(0,212,255,0.04)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.02)_2px,rgba(0,0,0,0.02)_4px)] pointer-events-none" />

        {/* Mobile background */}
        <div className="lg:hidden absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url('/image_1780946776840.png')` }} />

        <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
          {/* Logo */}
          <div className="relative mb-8 animate-float">
            <div className="w-28 h-28 rounded-full animate-lightning-pulse overflow-hidden"
              style={{
                boxShadow: '0 0 0 1px rgba(0,212,255,0.2), 0 0 30px rgba(0,212,255,0.15)'
              }}
            >
              <img
                src="/ChatGPT_Image_Jun_7,_2026,_07_35_03_PM_1780946581008.png"
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Title */}
          <h1 className="font-gothic text-5xl text-white mb-1 animate-static-glow tracking-widest text-center">
            ! boxfight
          </h1>
          <div className="flex items-center gap-3 mb-10">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
            <p className="text-white/30 tracking-[0.25em] uppercase text-xs font-mono">Auto Ad Dashboard</p>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
          </div>

          {/* Card */}
          <div className="w-full rounded-xl p-8 relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(12,14,24,0.97) 0%, rgba(8,10,18,0.99) 100%)',
              border: '1px solid rgba(0,212,255,0.12)',
              boxShadow: '0 0 40px rgba(0,0,0,0.6), 0 0 60px rgba(0,212,255,0.04), inset 0 1px 0 rgba(255,255,255,0.04)'
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

            <div className="flex items-center gap-2 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" style={{boxShadow:'0 0 6px rgba(0,212,255,0.8)'}} />
              <h2 className="text-xs font-bold text-white/50 uppercase tracking-[0.25em]">Authentication Required</h2>
            </div>

            <Button
              className="w-full h-12 font-bold uppercase tracking-[0.1em] text-sm transition-all duration-300 group"
              style={{
                background: 'linear-gradient(135deg, #5865F2 0%, #4752C4 100%)',
                border: '1px solid rgba(88,101,242,0.4)',
                boxShadow: '0 0 24px rgba(88,101,242,0.25), 0 4px 12px rgba(0,0,0,0.4)'
              }}
              onClick={() => window.location.href = '/api/auth/discord'}
              data-testid="button-login-discord"
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 40px rgba(88,101,242,0.5), 0 4px 20px rgba(0,0,0,0.4)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 24px rgba(88,101,242,0.25), 0 4px 12px rgba(0,0,0,0.4)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              <SiDiscord className="mr-2.5 w-5 h-5" />
              Login With Discord
            </Button>

            <div className="mt-6 flex items-start gap-2.5 p-3 rounded-lg"
              style={{background:'rgba(255,200,0,0.04)',border:'1px solid rgba(255,200,0,0.1)'}}>
              <Zap className="w-3.5 h-3.5 text-yellow-500/60 shrink-0 mt-0.5" />
              <p className="text-white/30 text-xs leading-relaxed">
                Access is restricted to authorized users only. Contact an admin if you require access.
              </p>
            </div>
          </div>

          <p className="mt-6 text-white/15 text-xs font-mono tracking-wider text-center">
            v2.0 · RESTRICTED ACCESS
          </p>
        </div>
      </div>
    </div>
  );
}
