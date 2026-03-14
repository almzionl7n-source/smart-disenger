"use client";

import { useState, useRef } from "react";
import {
  Type,
  ImagePlus,
  LayoutTemplate,
  Shapes,
  Square,
  Circle,
  Triangle,
  Star,
  Palette,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CanvasElement } from "./design-canvas";

interface ToolsSidebarProps {
  onAddElement: (element: Omit<CanvasElement, "id">) => void;
}

const templates = [
  { name: "بطاقة أعمال", preview: "💼", width: 350, height: 200 },
  { name: "منشور انستغرام", preview: "📱", width: 400, height: 400 },
  { name: "غلاف فيسبوك", preview: "🖼️", width: 600, height: 200 },
  { name: "بوستر إعلاني", preview: "📢", width: 400, height: 500 },
];

const colors = [
  "#a855f7",
  "#ec4899",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#6366f1",
  "#14b8a6",
  "#f97316",
  "#8b5cf6",
];

export function ToolsSidebar({ onAddElement }: ToolsSidebarProps) {
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("نص جديد");
  const [selectedColor, setSelectedColor] = useState("#a855f7");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tools = [
    { id: "text", icon: Type, label: "إضافة نص" },
    { id: "image", icon: ImagePlus, label: "رفع صورة" },
    { id: "templates", icon: LayoutTemplate, label: "قوالب جاهزة" },
    { id: "shapes", icon: Shapes, label: "أشكال هندسية" },
  ];

  const shapes = [
    { type: "rectangle" as const, icon: Square, label: "مستطيل" },
    { type: "circle" as const, icon: Circle, label: "دائرة" },
    { type: "triangle" as const, icon: Triangle, label: "مثلث" },
    { type: "star" as const, icon: Star, label: "نجمة" },
  ];

  const handleAddText = () => {
    onAddElement({
      type: "text",
      x: 200,
      y: 200,
      width: 200,
      height: 60,
      content: textInput,
      color: selectedColor,
      fontSize: 28,
    });
    setTextInput("نص جديد");
    setActivePanel(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onAddElement({
          type: "image",
          x: 150,
          y: 150,
          width: 200,
          height: 200,
          content: event.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
    setActivePanel(null);
  };

  const handleAddShape = (shapeType: "rectangle" | "circle" | "triangle" | "star") => {
    onAddElement({
      type: "shape",
      x: 200,
      y: 200,
      width: 100,
      height: 100,
      content: "",
      color: selectedColor,
      shapeType,
    });
    setActivePanel(null);
  };

  const handleToolClick = (toolId: string) => {
    if (toolId === "image") {
      fileInputRef.current?.click();
    } else {
      setActivePanel(activePanel === toolId ? null : toolId);
    }
  };

  return (
    <div
      className={`relative flex flex-col transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-72"
      }`}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-6 h-12 bg-secondary/80 backdrop-blur-md border border-border/50 rounded-l-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* Main Sidebar */}
      <div className="h-full bg-card/60 backdrop-blur-xl border-l border-border/50 rounded-l-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border/50">
          <h2
            className={`font-bold text-foreground transition-all ${
              isCollapsed ? "text-center text-lg" : "text-xl"
            }`}
          >
            {isCollapsed ? "🛠️" : "أدوات التصميم"}
          </h2>
        </div>

        {/* Tools */}
        <div className="p-3">
          <div className={`grid gap-2 ${isCollapsed ? "grid-cols-1" : "grid-cols-2"}`}>
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool.id)}
                className={`group relative flex ${
                  isCollapsed ? "justify-center" : "flex-col items-center justify-center"
                } gap-2 p-4 rounded-xl transition-all duration-200 ${
                  activePanel === tool.id
                    ? "bg-primary/20 border-2 border-primary shadow-lg shadow-primary/20"
                    : "bg-secondary/40 border border-border/30 hover:bg-secondary/60 hover:border-primary/50"
                }`}
              >
                <tool.icon
                  className={`h-6 w-6 transition-colors ${
                    activePanel === tool.id ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                  }`}
                />
                {!isCollapsed && (
                  <span
                    className={`text-sm font-medium ${
                      activePanel === tool.id ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {tool.label}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Active Panel Content */}
        {!isCollapsed && activePanel && (
          <div className="p-4 border-t border-border/50 animate-in slide-in-from-top-2 duration-200">
            {activePanel === "text" && (
              <div className="space-y-4">
                <Input
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="أدخل النص..."
                  className="bg-secondary/50 border-border/50 text-foreground"
                  dir="rtl"
                />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Palette className="h-4 w-4" />
                    <span>اختر اللون</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                          selectedColor === color ? "ring-2 ring-offset-2 ring-offset-card ring-primary scale-110" : ""
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <Button onClick={handleAddText} className="w-full">
                  إضافة النص
                </Button>
              </div>
            )}

            {activePanel === "templates" && (
              <div className="space-y-3">
                {templates.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onAddElement({
                        type: "shape",
                        x: 100,
                        y: 100,
                        width: template.width,
                        height: template.height,
                        content: "",
                        color: "#f3f4f6",
                        shapeType: "rectangle",
                      });
                      setActivePanel(null);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary/40 border border-border/30 hover:bg-secondary/60 hover:border-primary/50 transition-all"
                  >
                    <span className="text-2xl">{template.preview}</span>
                    <span className="text-sm font-medium text-foreground">{template.name}</span>
                  </button>
                ))}
              </div>
            )}

            {activePanel === "shapes" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Palette className="h-4 w-4" />
                    <span>اختر اللون</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                          selectedColor === color ? "ring-2 ring-offset-2 ring-offset-card ring-primary scale-110" : ""
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {shapes.map((shape) => (
                    <button
                      key={shape.type}
                      onClick={() => handleAddShape(shape.type)}
                      className="flex flex-col items-center gap-2 p-4 rounded-lg bg-secondary/40 border border-border/30 hover:bg-secondary/60 hover:border-primary/50 transition-all"
                    >
                      <shape.icon
                        className="h-8 w-8"
                        style={{ color: selectedColor }}
                      />
                      <span className="text-xs text-muted-foreground">{shape.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
    </div>
  );
}
