"use client";

import { Download, Share2, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface AppHeaderProps {
  onExport?: () => void;
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export function AppHeader({ onExport, onMobileMenuToggle, isMobileMenuOpen }: AppHeaderProps) {
  const [showShareToast, setShowShareToast] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    } catch {
      // Fallback for browsers that don't support clipboard API
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    }
  };

  return (
    <header className="relative">
      {/* Glow effect behind header */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 blur-xl" />
      
      <div className="relative flex items-center justify-between px-4 md:px-6 py-4 bg-card/60 backdrop-blur-xl border-b border-border/50">
        {/* Mobile Menu Button */}
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 rounded-lg bg-secondary/40 text-muted-foreground hover:text-foreground transition-colors"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative">
            {/* Logo glow */}
            <div className="absolute inset-0 bg-primary/40 rounded-xl blur-lg" />
            <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-xl md:text-2xl font-bold text-primary-foreground">م</span>
            </div>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg md:text-xl font-bold text-foreground">
              المُصمم الذكي
            </h1>
            <p className="text-xs text-muted-foreground">صمّم بإبداع لا حدود له</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="hidden sm:flex items-center gap-2 bg-secondary/40 border-border/50 hover:bg-secondary/60 text-foreground"
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden md:inline">مشاركة</span>
          </Button>
          <Button
            onClick={onExport}
            size="sm"
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg shadow-primary/30"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">تصدير</span>
          </Button>
        </div>
      </div>

      {/* Share Toast */}
      {showShareToast && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 px-4 py-2 bg-card/90 backdrop-blur-md border border-border/50 rounded-lg shadow-lg animate-in slide-in-from-top-2 duration-200">
          <p className="text-sm text-foreground">تم نسخ الرابط! ✨</p>
        </div>
      )}
    </header>
  );
}
