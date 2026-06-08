import { Button } from "@/components/ui/button";
import { SiDiscord } from "react-icons/si";

export default function Login() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity"
        style={{ backgroundImage: `url('/image_1780946776840.png')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md p-8 flex flex-col items-center">
        <div className="w-32 h-32 rounded-full lightning-border animate-lightning-pulse mb-8 overflow-hidden">
          <img src="/ChatGPT_Image_Jun_7,_2026,_07_35_03_PM_1780946581008.png" alt="Logo" className="w-full h-full object-cover" />
        </div>
        
        <h1 className="font-gothic text-5xl text-white mb-2 animate-static-glow tracking-widest text-center">
          ! boxfight
        </h1>
        <p className="text-muted-foreground tracking-widest uppercase text-sm mb-12">
          Auto Ad Dashboard
        </p>
        
        <div className="bg-card/80 backdrop-blur-md p-8 rounded-lg lightning-border w-full flex flex-col items-center border-white/10">
          <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">Access Required</h2>
          
          <Button 
            className="w-full h-14 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold uppercase tracking-wider transition-all duration-300 shadow-[0_0_15px_rgba(88,101,242,0.3)] hover:shadow-[0_0_25px_rgba(88,101,242,0.5)] border-none"
            onClick={() => window.location.href = '/api/auth/discord'}
            data-testid="button-login-discord"
          >
            <SiDiscord className="mr-3 w-6 h-6" />
            Login With Discord
          </Button>
        </div>
      </div>
    </div>
  );
}
