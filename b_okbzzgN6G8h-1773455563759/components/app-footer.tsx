"use client";

export function AppFooter() {
  return (
    <footer className="relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
      
      <div className="relative px-6 py-4 bg-card/40 backdrop-blur-xl border-t border-border/50">
        <div className="flex items-center justify-center">
          <p className="text-sm md:text-base">
            <span className="text-muted-foreground">طُور بواسطة </span>
            <span 
              className="font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse"
              style={{
                textShadow: "0 0 30px rgba(168, 85, 247, 0.5), 0 0 60px rgba(168, 85, 247, 0.3)",
                filter: "drop-shadow(0 0 10px rgba(168, 85, 247, 0.4))"
              }}
            >
              سعود
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
