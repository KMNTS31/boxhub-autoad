import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

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
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity"
        style={{ backgroundImage: `url('/image_1780946776840.png')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 max-w-2xl w-full p-8 text-center flex flex-col items-center">
        <div className="w-24 h-24 rounded-full lightning-border animate-lightning-pulse mb-8 overflow-hidden">
          <img src="/ChatGPT_Image_Jun_7,_2026,_07_35_03_PM_1780946581008.png" alt="Logo" className="w-full h-full object-cover" />
        </div>
        
        <h1 className="font-gothic text-6xl md:text-8xl text-white mb-6 animate-static-glow tracking-wider">
          WARNING
        </h1>
        
        <div className="bg-card/80 backdrop-blur-md p-8 rounded-lg lightning-border mb-10 border-destructive/50">
          <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-widest">Read Carefully Before Proceeding</h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-4">
            Using Discord automation tools can result in account bans and violates Discord's Terms of Service.
          </p>
          <p className="text-white font-bold text-lg border-l-4 border-destructive pl-4 text-left">
            "We are not responsible for any bans, restrictions, or consequences that may occur to your account as a result of using this software."
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 w-full justify-center">
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full sm:w-auto h-14 px-8 border-white/20 text-white hover:bg-white hover:text-black font-bold uppercase tracking-wider transition-all duration-300"
            onClick={handleAgree}
            data-testid="button-agree"
          >
            I Understand & Agree
          </Button>
          <Button 
            variant="ghost" 
            size="lg" 
            className="w-full sm:w-auto h-14 px-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 font-bold uppercase tracking-wider"
            onClick={handleDisagree}
            data-testid="button-disagree"
          >
            I Do Not Agree
          </Button>
        </div>
      </div>
    </div>
  );
}
