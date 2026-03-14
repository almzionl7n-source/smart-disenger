"use client";

import { useState, useCallback, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  Type, ImagePlus, Shapes, Square, Circle, Triangle, Star,
  Download, Trash2, RotateCw, Copy, ZoomIn, ZoomOut,
  X, Send, Sparkles, Menu, LayoutTemplate, Palette,
  ChevronDown, Bold, Italic, AlignCenter, AlignLeft, AlignRight,
  Minus, Plus, Image as ImageIcon, FileText, Smartphone, Monitor,
  Instagram, Twitter, Facebook, Youtube
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CanvasElement {
  id: string;
  type: "text" | "image" | "shape";
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  color?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: string;
  rotation?: number;
  shapeType?: "rectangle" | "circle" | "triangle" | "star" | "line" | "diamond";
  opacity?: number;
}

interface Template {
  id: string;
  name: string;
  icon: React.ReactNode;
  width: number;
  height: number;
  elements: Omit<CanvasElement, "id">[];
  category: string;
}

const colors = [
  "#a855f7", "#ec4899", "#3b82f6", "#10b981", "#f59e0b",
  "#ef4444", "#6366f1", "#14b8a6", "#f97316", "#8b5cf6",
  "#ffffff", "#000000", "#374151", "#9ca3af", "#fbbf24",
];

const gradients = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
];

const templates: Template[] = [
  {
    id: "instagram-post",
    name: "منشور انستقرام",
    icon: <Instagram className="h-5 w-5" />,
    width: 1080,
    height: 1080,
    category: "social",
    elements: [
      { type: "shape", x: 0, y: 0, width: 1080, height: 1080, content: "", color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", shapeType: "rectangle" },
      { type: "text", x: 140, y: 400, width: 800, height: 100, content: "عنوان رئيسي", color: "#ffffff", fontSize: 72, fontWeight: "bold", textAlign: "center" },
      { type: "text", x: 140, y: 520, width: 800, height: 60, content: "نص فرعي يوضح الفكرة", color: "#ffffff", fontSize: 36, textAlign: "center", opacity: 0.9 },
    ],
  },
  {
    id: "instagram-story",
    name: "ستوري انستقرام",
    icon: <Smartphone className="h-5 w-5" />,
    width: 1080,
    height: 1920,
    category: "social",
    elements: [
      { type: "shape", x: 0, y: 0, width: 1080, height: 1920, content: "", color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", shapeType: "rectangle" },
      { type: "text", x: 90, y: 800, width: 900, height: 120, content: "عنوان القصة", color: "#ffffff", fontSize: 64, fontWeight: "bold", textAlign: "center" },
    ],
  },
  {
    id: "twitter-post",
    name: "منشور تويتر",
    icon: <Twitter className="h-5 w-5" />,
    width: 1200,
    height: 675,
    category: "social",
    elements: [
      { type: "shape", x: 0, y: 0, width: 1200, height: 675, content: "", color: "#1a1625", shapeType: "rectangle" },
      { type: "text", x: 100, y: 250, width: 1000, height: 80, content: "منشور تويتر", color: "#ffffff", fontSize: 56, fontWeight: "bold", textAlign: "center" },
      { type: "text", x: 100, y: 350, width: 1000, height: 50, content: "اضف وصفك هنا", color: "#9ca3af", fontSize: 32, textAlign: "center" },
    ],
  },
  {
    id: "facebook-cover",
    name: "غلاف فيسبوك",
    icon: <Facebook className="h-5 w-5" />,
    width: 820,
    height: 312,
    category: "social",
    elements: [
      { type: "shape", x: 0, y: 0, width: 820, height: 312, content: "", color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", shapeType: "rectangle" },
      { type: "text", x: 60, y: 120, width: 700, height: 70, content: "غلاف صفحتك", color: "#ffffff", fontSize: 48, fontWeight: "bold", textAlign: "center" },
    ],
  },
  {
    id: "youtube-thumbnail",
    name: "صورة يوتيوب",
    icon: <Youtube className="h-5 w-5" />,
    width: 1280,
    height: 720,
    category: "social",
    elements: [
      { type: "shape", x: 0, y: 0, width: 1280, height: 720, content: "", color: "#ef4444", shapeType: "rectangle" },
      { type: "text", x: 90, y: 280, width: 1100, height: 100, content: "عنوان الفيديو", color: "#ffffff", fontSize: 72, fontWeight: "bold", textAlign: "center" },
      { type: "shape", x: 540, y: 450, width: 200, height: 200, content: "", color: "#ffffff", shapeType: "circle", opacity: 0.3 },
    ],
  },
  {
    id: "business-card",
    name: "بطاقة عمل",
    icon: <FileText className="h-5 w-5" />,
    width: 1050,
    height: 600,
    category: "print",
    elements: [
      { type: "shape", x: 0, y: 0, width: 1050, height: 600, content: "", color: "#1a1625", shapeType: "rectangle" },
      { type: "shape", x: 0, y: 0, width: 15, height: 600, content: "", color: "#a855f7", shapeType: "rectangle" },
      { type: "text", x: 60, y: 180, width: 500, height: 60, content: "الاسم الكامل", color: "#ffffff", fontSize: 42, fontWeight: "bold" },
      { type: "text", x: 60, y: 250, width: 500, height: 40, content: "المسمى الوظيفي", color: "#a855f7", fontSize: 24 },
      { type: "text", x: 60, y: 350, width: 500, height: 30, content: "email@example.com", color: "#9ca3af", fontSize: 18 },
      { type: "text", x: 60, y: 390, width: 500, height: 30, content: "+966 50 000 0000", color: "#9ca3af", fontSize: 18 },
    ],
  },
  {
    id: "presentation",
    name: "شريحة عرض",
    icon: <Monitor className="h-5 w-5" />,
    width: 1920,
    height: 1080,
    category: "presentation",
    elements: [
      { type: "shape", x: 0, y: 0, width: 1920, height: 1080, content: "", color: "#0f0d1a", shapeType: "rectangle" },
      { type: "text", x: 160, y: 400, width: 1600, height: 100, content: "عنوان العرض التقديمي", color: "#ffffff", fontSize: 72, fontWeight: "bold", textAlign: "center" },
      { type: "text", x: 160, y: 520, width: 1600, height: 60, content: "العنوان الفرعي", color: "#a855f7", fontSize: 36, textAlign: "center" },
      { type: "shape", x: 860, y: 650, width: 200, height: 8, content: "", color: "#a855f7", shapeType: "rectangle" },
    ],
  },
  {
    id: "poster",
    name: "بوستر اعلاني",
    icon: <ImageIcon className="h-5 w-5" />,
    width: 1080,
    height: 1350,
    category: "print",
    elements: [
      { type: "shape", x: 0, y: 0, width: 1080, height: 1350, content: "", color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", shapeType: "rectangle" },
      { type: "text", x: 90, y: 500, width: 900, height: 120, content: "عرض خاص", color: "#ffffff", fontSize: 80, fontWeight: "bold", textAlign: "center" },
      { type: "text", x: 90, y: 650, width: 900, height: 80, content: "خصم 50%", color: "#1a1625", fontSize: 96, fontWeight: "bold", textAlign: "center" },
      { type: "text", x: 90, y: 800, width: 900, height: 50, content: "لفترة محدودة", color: "#ffffff", fontSize: 32, textAlign: "center", opacity: 0.9 },
    ],
  },
];

export default function DesignerApp() {
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.6);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("نص جديد");
  const [selectedColor, setSelectedColor] = useState("#a855f7");
  const [fontSize, setFontSize] = useState(32);
  const [chatOpen, setChatOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeCorner, setResizeCorner] = useState<string | null>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  const addElement = useCallback((element: Omit<CanvasElement, "id">) => {
    const newElement: CanvasElement = {
      ...element,
      id: `${element.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setElements((prev) => [...prev, newElement]);
    setSelectedElement(newElement.id);
    setActivePanel(null);
  }, []);

  const handleAddText = () => {
    addElement({
      type: "text",
      x: canvasSize.width / 2 - 100,
      y: canvasSize.height / 2 - 30,
      width: 200,
      height: 60,
      content: textInput,
      color: selectedColor,
      fontSize: fontSize,
      fontWeight: "normal",
      textAlign: "center",
    });
    setTextInput("نص جديد");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const maxSize = Math.min(canvasSize.width, canvasSize.height) * 0.5;
          const ratio = Math.min(maxSize / img.width, maxSize / img.height);
          addElement({
            type: "image",
            x: canvasSize.width / 2 - (img.width * ratio) / 2,
            y: canvasSize.height / 2 - (img.height * ratio) / 2,
            width: img.width * ratio,
            height: img.height * ratio,
            content: event.target?.result as string,
          });
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddShape = (shapeType: CanvasElement["shapeType"]) => {
    addElement({
      type: "shape",
      x: canvasSize.width / 2 - 50,
      y: canvasSize.height / 2 - 50,
      width: 100,
      height: 100,
      content: "",
      color: selectedColor,
      shapeType,
    });
  };

  const applyTemplate = (template: Template) => {
    setCanvasSize({ width: template.width, height: template.height });
    const scaleFactor = Math.min(800 / template.width, 600 / template.height);
    setZoom(scaleFactor * 0.8);
    const newElements: CanvasElement[] = template.elements.map((el, index) => ({
      ...el,
      id: `template-${template.id}-${index}-${Date.now()}`,
    }));
    setElements(newElements);
    setSelectedElement(null);
    setActivePanel(null);
    setSidebarOpen(false);
  };

  const deleteSelected = () => {
    if (selectedElement) {
      setElements(elements.filter((el) => el.id !== selectedElement));
      setSelectedElement(null);
    }
  };

  const duplicateSelected = () => {
    if (selectedElement) {
      const element = elements.find((el) => el.id === selectedElement);
      if (element) {
        const newElement = {
          ...element,
          id: `${element.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          x: element.x + 20,
          y: element.y + 20,
        };
        setElements([...elements, newElement]);
        setSelectedElement(newElement.id);
      }
    }
  };

  const rotateSelected = () => {
    if (selectedElement) {
      setElements(
        elements.map((el) =>
          el.id === selectedElement
            ? { ...el, rotation: ((el.rotation || 0) + 15) % 360 }
            : el
        )
      );
    }
  };

  const updateSelectedElement = (updates: Partial<CanvasElement>) => {
    if (selectedElement) {
      setElements(
        elements.map((el) =>
          el.id === selectedElement ? { ...el, ...updates } : el
        )
      );
    }
  };

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    const element = elements.find((el) => el.id === elementId);
    if (!element) return;

    setSelectedElement(elementId);
    setIsDragging(true);

    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const scaleX = canvasSize.width / rect.width;
      const scaleY = canvasSize.height / rect.height;
      setDragOffset({
        x: (e.clientX - rect.left) * scaleX - element.x,
        y: (e.clientY - rect.top) * scaleY - element.y,
      });
    }
  };

  const handleResizeStart = (e: React.MouseEvent, corner: string) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeCorner(corner);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const scaleX = canvasSize.width / rect.width;
    const scaleY = canvasSize.height / rect.height;

    if (isDragging && selectedElement && !isResizing) {
      const newX = (e.clientX - rect.left) * scaleX - dragOffset.x;
      const newY = (e.clientY - rect.top) * scaleY - dragOffset.y;

      setElements(
        elements.map((el) =>
          el.id === selectedElement
            ? { ...el, x: Math.max(0, Math.min(newX, canvasSize.width - el.width)), y: Math.max(0, Math.min(newY, canvasSize.height - el.height)) }
            : el
        )
      );
    }

    if (isResizing && selectedElement && resizeCorner) {
      const element = elements.find((el) => el.id === selectedElement);
      if (!element) return;

      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top) * scaleY;

      let newWidth = element.width;
      let newHeight = element.height;
      let newX = element.x;
      let newY = element.y;

      if (resizeCorner.includes("e")) {
        newWidth = Math.max(30, mouseX - element.x);
      }
      if (resizeCorner.includes("w")) {
        const diff = element.x - mouseX;
        newWidth = Math.max(30, element.width + diff);
        newX = mouseX;
      }
      if (resizeCorner.includes("s")) {
        newHeight = Math.max(30, mouseY - element.y);
      }
      if (resizeCorner.includes("n")) {
        const diff = element.y - mouseY;
        newHeight = Math.max(30, element.height + diff);
        newY = mouseY;
      }

      setElements(
        elements.map((el) =>
          el.id === selectedElement
            ? { ...el, x: newX, y: newY, width: newWidth, height: newHeight }
            : el
        )
      );
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeCorner(null);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isLoading) return;
    sendMessage({ text: chatInput });
    setChatInput("");
  };

  const exportCanvas = () => {
    const canvas = document.createElement("canvas");
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    elements.forEach((element) => {
      ctx.save();
      ctx.translate(element.x + element.width / 2, element.y + element.height / 2);
      ctx.rotate(((element.rotation || 0) * Math.PI) / 180);
      ctx.globalAlpha = element.opacity ?? 1;

      if (element.type === "shape") {
        if (element.color?.startsWith("linear-gradient")) {
          const gradient = ctx.createLinearGradient(-element.width / 2, -element.height / 2, element.width / 2, element.height / 2);
          gradient.addColorStop(0, "#667eea");
          gradient.addColorStop(1, "#764ba2");
          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = element.color || "#a855f7";
        }

        switch (element.shapeType) {
          case "rectangle":
            ctx.fillRect(-element.width / 2, -element.height / 2, element.width, element.height);
            break;
          case "circle":
            ctx.beginPath();
            ctx.ellipse(0, 0, element.width / 2, element.height / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            break;
          case "triangle":
            ctx.beginPath();
            ctx.moveTo(0, -element.height / 2);
            ctx.lineTo(element.width / 2, element.height / 2);
            ctx.lineTo(-element.width / 2, element.height / 2);
            ctx.closePath();
            ctx.fill();
            break;
          case "star":
            const spikes = 5;
            const outerRadius = Math.min(element.width, element.height) / 2;
            const innerRadius = outerRadius / 2;
            ctx.beginPath();
            for (let i = 0; i < spikes * 2; i++) {
              const radius = i % 2 === 0 ? outerRadius : innerRadius;
              const angle = (i * Math.PI) / spikes - Math.PI / 2;
              if (i === 0) ctx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
              else ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
            }
            ctx.closePath();
            ctx.fill();
            break;
          case "diamond":
            ctx.beginPath();
            ctx.moveTo(0, -element.height / 2);
            ctx.lineTo(element.width / 2, 0);
            ctx.lineTo(0, element.height / 2);
            ctx.lineTo(-element.width / 2, 0);
            ctx.closePath();
            ctx.fill();
            break;
        }
      } else if (element.type === "text") {
        ctx.fillStyle = element.color || "#000000";
        ctx.font = `${element.fontStyle === "italic" ? "italic " : ""}${element.fontWeight === "bold" ? "bold " : ""}${element.fontSize || 24}px Tajawal, Arial`;
        ctx.textAlign = (element.textAlign as CanvasTextAlign) || "center";
        ctx.textBaseline = "middle";
        ctx.fillText(element.content, 0, 0);
      }

      ctx.restore();
    });

    elements
      .filter((el) => el.type === "image")
      .forEach((element) => {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.src = element.content;
        ctx.save();
        ctx.translate(element.x + element.width / 2, element.y + element.height / 2);
        ctx.rotate(((element.rotation || 0) * Math.PI) / 180);
        ctx.globalAlpha = element.opacity ?? 1;
        ctx.drawImage(img, -element.width / 2, -element.height / 2, element.width, element.height);
        ctx.restore();
      });

    setTimeout(() => {
      const link = document.createElement("a");
      link.download = `design-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }, 100);
  };

  const renderElement = (element: CanvasElement) => {
    const isSelected = selectedElement === element.id;
    const baseStyle: React.CSSProperties = {
      position: "absolute",
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      transform: `rotate(${element.rotation || 0}deg)`,
      cursor: isDragging && isSelected ? "grabbing" : "grab",
      opacity: element.opacity ?? 1,
    };

    const renderResizeHandles = () => {
      if (!isSelected) return null;
      const handles = ["nw", "ne", "sw", "se", "n", "s", "e", "w"];
      const positions: Record<string, React.CSSProperties> = {
        nw: { top: -4, left: -4, cursor: "nw-resize" },
        ne: { top: -4, right: -4, cursor: "ne-resize" },
        sw: { bottom: -4, left: -4, cursor: "sw-resize" },
        se: { bottom: -4, right: -4, cursor: "se-resize" },
        n: { top: -4, left: "50%", transform: "translateX(-50%)", cursor: "n-resize" },
        s: { bottom: -4, left: "50%", transform: "translateX(-50%)", cursor: "s-resize" },
        e: { top: "50%", right: -4, transform: "translateY(-50%)", cursor: "e-resize" },
        w: { top: "50%", left: -4, transform: "translateY(-50%)", cursor: "w-resize" },
      };
      return handles.map((handle) => (
        <div
          key={handle}
          className="absolute w-2 h-2 bg-primary rounded-full border border-primary-foreground"
          style={positions[handle]}
          onMouseDown={(e) => handleResizeStart(e, handle)}
        />
      ));
    };

    const selectionStyle: React.CSSProperties = isSelected
      ? { outline: "2px solid #a855f7", outlineOffset: "2px" }
      : {};

    switch (element.type) {
      case "text":
        return (
          <div
            key={element.id}
            style={{ ...baseStyle, ...selectionStyle }}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                fontSize: element.fontSize || 24,
                color: element.color || "#1a1a2e",
                fontWeight: element.fontWeight || "normal",
                fontStyle: element.fontStyle || "normal",
                textAlign: (element.textAlign as React.CSSProperties["textAlign"]) || "center",
                display: "flex",
                alignItems: "center",
                justifyContent: element.textAlign === "left" ? "flex-start" : element.textAlign === "right" ? "flex-end" : "center",
                userSelect: "none",
                fontFamily: "Tajawal, sans-serif",
              }}
            >
              {element.content}
            </div>
            {renderResizeHandles()}
          </div>
        );
      case "image":
        return (
          <div key={element.id} style={{ ...baseStyle, ...selectionStyle }} onMouseDown={(e) => handleMouseDown(e, element.id)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={element.content} alt="design" className="w-full h-full object-contain rounded" draggable={false} />
            {renderResizeHandles()}
          </div>
        );
      case "shape":
        const shapeStyle: React.CSSProperties = {
          backgroundColor: element.color?.startsWith("linear") ? undefined : element.color,
          background: element.color?.startsWith("linear") ? element.color : undefined,
        };
        return (
          <div key={element.id} style={{ ...baseStyle, ...selectionStyle }} onMouseDown={(e) => handleMouseDown(e, element.id)}>
            {element.shapeType === "rectangle" && <div className="w-full h-full rounded" style={shapeStyle} />}
            {element.shapeType === "circle" && <div className="w-full h-full rounded-full" style={shapeStyle} />}
            {element.shapeType === "diamond" && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-[70%] h-[70%] rotate-45 rounded" style={shapeStyle} />
              </div>
            )}
            {element.shapeType === "triangle" && (
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  {element.color?.startsWith("linear") && (
                    <linearGradient id={`grad-${element.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#667eea" />
                      <stop offset="100%" stopColor="#764ba2" />
                    </linearGradient>
                  )}
                </defs>
                <polygon
                  points="50,10 90,90 10,90"
                  fill={element.color?.startsWith("linear") ? `url(#grad-${element.id})` : element.color}
                />
              </svg>
            )}
            {element.shapeType === "star" && (
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  {element.color?.startsWith("linear") && (
                    <linearGradient id={`grad-${element.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#667eea" />
                      <stop offset="100%" stopColor="#764ba2" />
                    </linearGradient>
                  )}
                </defs>
                <polygon
                  points="50,5 61,40 98,40 68,62 79,97 50,75 21,97 32,62 2,40 39,40"
                  fill={element.color?.startsWith("linear") ? `url(#grad-${element.id})` : element.color}
                />
              </svg>
            )}
            {element.shapeType === "line" && (
              <div className="w-full h-1 rounded-full" style={{ ...shapeStyle, position: "absolute", top: "50%" }} />
            )}
            {renderResizeHandles()}
          </div>
        );
      default:
        return null;
    }
  };

  const selectedEl = elements.find((el) => el.id === selectedElement);

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/15 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 py-3 bg-card/70 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg bg-secondary/40 text-muted-foreground hover:bg-secondary/60 transition-colors">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-foreground">المصمم الذكي</h1>
              <p className="text-xs text-muted-foreground">صمم باحترافية</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <span>{canvasSize.width} x {canvasSize.height}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setCanvasSize({ width: 1080, height: 1080 })}>انستقرام (1080x1080)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCanvasSize({ width: 1080, height: 1920 })}>ستوري (1080x1920)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCanvasSize({ width: 1200, height: 675 })}>تويتر (1200x675)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCanvasSize({ width: 1920, height: 1080 })}>يوتيوب (1920x1080)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCanvasSize({ width: 800, height: 600 })}>مخصص (800x600)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={exportCanvas} size="sm" className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/25">
            <Download className="h-4 w-4 ml-2" />
            <span className="hidden sm:inline">تصدير</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? "w-80" : "w-0"} transition-all duration-300 overflow-hidden flex-shrink-0`}>
          <div className="h-full w-80 bg-card/70 backdrop-blur-xl border-l border-border/50 p-4 overflow-y-auto">
            <h2 className="text-lg font-bold text-foreground mb-4">ادوات التصميم</h2>

            {/* Tools Grid */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[
                { id: "text", icon: Type, label: "نص" },
                { id: "image", icon: ImagePlus, label: "صورة" },
                { id: "shapes", icon: Shapes, label: "اشكال" },
                { id: "templates", icon: LayoutTemplate, label: "قوالب" },
                { id: "colors", icon: Palette, label: "الوان" },
              ].map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => {
                    if (tool.id === "image") {
                      fileInputRef.current?.click();
                    } else {
                      setActivePanel(activePanel === tool.id ? null : tool.id);
                    }
                  }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                    activePanel === tool.id
                      ? "bg-primary/20 border-2 border-primary shadow-lg shadow-primary/20"
                      : "bg-secondary/40 border border-border/30 hover:bg-secondary/60"
                  }`}
                >
                  <tool.icon className={`h-5 w-5 ${activePanel === tool.id ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-xs ${activePanel === tool.id ? "text-primary font-medium" : "text-muted-foreground"}`}>{tool.label}</span>
                </button>
              ))}
            </div>

            {/* Text Panel */}
            {activePanel === "text" && (
              <div className="space-y-4 p-4 bg-secondary/30 rounded-xl border border-border/30">
                <h3 className="font-medium text-foreground">اضافة نص</h3>
                <Textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="ادخل النص..."
                  className="bg-secondary/50 border-border/50 min-h-[80px]"
                  dir="rtl"
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">الحجم:</span>
                  <Slider
                    value={[fontSize]}
                    onValueChange={(v) => setFontSize(v[0])}
                    min={12}
                    max={120}
                    step={2}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground w-8">{fontSize}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {colors.slice(0, 10).map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${selectedColor === color ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <Button onClick={handleAddText} className="w-full">اضافة النص</Button>
              </div>
            )}

            {/* Shapes Panel */}
            {activePanel === "shapes" && (
              <div className="space-y-4 p-4 bg-secondary/30 rounded-xl border border-border/30">
                <h3 className="font-medium text-foreground">اضافة شكل</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${selectedColor === color ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {gradients.map((gradient, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedColor(gradient)}
                      className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${selectedColor === gradient ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""}`}
                      style={{ background: gradient }}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: "rectangle" as const, icon: Square, label: "مستطيل" },
                    { type: "circle" as const, icon: Circle, label: "دائرة" },
                    { type: "triangle" as const, icon: Triangle, label: "مثلث" },
                    { type: "star" as const, icon: Star, label: "نجمة" },
                    { type: "diamond" as const, icon: Square, label: "معين", rotate: true },
                    { type: "line" as const, icon: Minus, label: "خط" },
                  ].map((shape) => (
                    <button
                      key={shape.type}
                      onClick={() => handleAddShape(shape.type)}
                      className="flex flex-col items-center gap-2 p-3 rounded-lg bg-secondary/40 hover:bg-secondary/60 transition-colors"
                    >
                      <shape.icon className={`h-6 w-6 ${shape.rotate ? "rotate-45" : ""}`} style={{ color: selectedColor.startsWith("linear") ? "#a855f7" : selectedColor }} />
                      <span className="text-xs text-muted-foreground">{shape.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Templates Panel */}
            {activePanel === "templates" && (
              <div className="space-y-4 p-4 bg-secondary/30 rounded-xl border border-border/30">
                <h3 className="font-medium text-foreground">قوالب جاهزة</h3>
                <div className="space-y-2">
                  {["social", "print", "presentation"].map((category) => (
                    <div key={category} className="space-y-2">
                      <h4 className="text-xs text-muted-foreground uppercase tracking-wider">
                        {category === "social" ? "شبكات التواصل" : category === "print" ? "مطبوعات" : "عروض تقديمية"}
                      </h4>
                      <div className="grid gap-2">
                        {templates
                          .filter((t) => t.category === category)
                          .map((template) => (
                            <button
                              key={template.id}
                              onClick={() => applyTemplate(template)}
                              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40 hover:bg-secondary/60 transition-colors text-right w-full"
                            >
                              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                                {template.icon}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">{template.name}</p>
                                <p className="text-xs text-muted-foreground">{template.width} x {template.height}</p>
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Colors Panel */}
            {activePanel === "colors" && (
              <div className="space-y-4 p-4 bg-secondary/30 rounded-xl border border-border/30">
                <h3 className="font-medium text-foreground">لوحة الالوان</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">الوان اساسية</p>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`w-8 h-8 rounded-lg transition-transform hover:scale-110 ${selectedColor === color ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">تدرجات لونية</p>
                    <div className="flex flex-wrap gap-2">
                      {gradients.map((gradient, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedColor(gradient)}
                          className={`w-8 h-8 rounded-lg transition-transform hover:scale-110 ${selectedColor === gradient ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""}`}
                          style={{ background: gradient }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Element Properties */}
            {selectedEl && (
              <div className="mt-6 space-y-4 p-4 bg-secondary/30 rounded-xl border border-border/30">
                <h3 className="font-medium text-foreground">خصائص العنصر</h3>

                {selectedEl.type === "text" && (
                  <>
                    <Textarea
                      value={selectedEl.content}
                      onChange={(e) => updateSelectedElement({ content: e.target.value })}
                      className="bg-secondary/50 border-border/50"
                      dir="rtl"
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        variant={selectedEl.fontWeight === "bold" ? "default" : "outline"}
                        size="icon"
                        onClick={() => updateSelectedElement({ fontWeight: selectedEl.fontWeight === "bold" ? "normal" : "bold" })}
                      >
                        <Bold className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={selectedEl.fontStyle === "italic" ? "default" : "outline"}
                        size="icon"
                        onClick={() => updateSelectedElement({ fontStyle: selectedEl.fontStyle === "italic" ? "normal" : "italic" })}
                      >
                        <Italic className="h-4 w-4" />
                      </Button>
                      <div className="flex-1" />
                      <Button
                        variant={selectedEl.textAlign === "right" ? "default" : "outline"}
                        size="icon"
                        onClick={() => updateSelectedElement({ textAlign: "right" })}
                      >
                        <AlignRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={selectedEl.textAlign === "center" ? "default" : "outline"}
                        size="icon"
                        onClick={() => updateSelectedElement({ textAlign: "center" })}
                      >
                        <AlignCenter className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={selectedEl.textAlign === "left" ? "default" : "outline"}
                        size="icon"
                        onClick={() => updateSelectedElement({ textAlign: "left" })}
                      >
                        <AlignLeft className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => updateSelectedElement({ fontSize: Math.max(8, (selectedEl.fontSize || 24) - 2) })}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground flex-1 text-center">{selectedEl.fontSize || 24}px</span>
                      <Button variant="outline" size="icon" onClick={() => updateSelectedElement({ fontSize: (selectedEl.fontSize || 24) + 2 })}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}

                {(selectedEl.type === "text" || selectedEl.type === "shape") && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">اللون</p>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => updateSelectedElement({ color })}
                          className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${selectedEl.color === color ? "ring-2 ring-primary ring-offset-1 ring-offset-card" : ""}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs text-muted-foreground mb-2">الشفافية</p>
                  <Slider
                    value={[(selectedEl.opacity ?? 1) * 100]}
                    onValueChange={(v) => updateSelectedElement({ opacity: v[0] / 100 })}
                    min={10}
                    max={100}
                    step={5}
                  />
                </div>
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 bg-secondary/30 backdrop-blur-md border-b border-border/50">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setZoom(Math.max(0.2, zoom - 0.1))} className="text-muted-foreground">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground min-w-[50px] text-center">{Math.round(zoom * 100)}%</span>
              <Button variant="ghost" size="icon" onClick={() => setZoom(Math.min(2, zoom + 0.1))} className="text-muted-foreground">
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            {selectedElement && (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={rotateSelected} className="text-muted-foreground">
                  <RotateCw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={duplicateSelected} className="text-muted-foreground">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={deleteSelected} className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Canvas */}
          <div className="flex-1 overflow-auto p-4 md:p-8 bg-secondary/20 flex items-center justify-center">
            <div
              ref={canvasRef}
              className="relative bg-white rounded shadow-2xl overflow-hidden"
              style={{
                width: canvasSize.width,
                height: canvasSize.height,
                transform: `scale(${zoom})`,
                transformOrigin: "center center",
              }}
              onClick={() => setSelectedElement(null)}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {elements.map(renderElement)}
              {elements.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <LayoutTemplate className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">اختر قالب او ابدا بالتصميم</p>
                    <p className="text-sm opacity-70">اضف نصوص وصور واشكال</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-3 bg-card/50 backdrop-blur-xl border-t border-border/50">
        <div className="flex items-center justify-center">
          <p className="text-sm">
            <span className="text-muted-foreground">طور بواسطة </span>
            <span className="font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">سعود</span>
          </p>
        </div>
      </footer>

      {/* AI Chat Button */}
      <button onClick={() => setChatOpen(!chatOpen)} className="fixed bottom-20 left-6 z-50 group">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/40 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center gap-2 bg-gradient-to-r from-primary to-accent px-5 py-3 rounded-full shadow-xl shadow-primary/30">
            {chatOpen ? <X className="h-5 w-5 text-primary-foreground" /> : <Sparkles className="h-5 w-5 text-primary-foreground" />}
            <span className="text-sm font-medium text-primary-foreground">مساعد سعود</span>
          </div>
        </div>
      </button>

      {/* AI Chat Panel */}
      {chatOpen && (
        <div className="fixed bottom-36 left-6 z-50 w-80 md:w-96 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl shadow-primary/10 overflow-hidden">
            <div className="bg-gradient-to-r from-primary/20 to-accent/20 p-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">مساعد سعود الذكي</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <p className="text-xs text-muted-foreground">متصل الان</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-72 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="bg-secondary/60 px-4 py-3 rounded-2xl rounded-tr-none text-sm text-foreground">
                  مرحبا! انا مساعد سعود الذكي. يمكنني مساعدتك في:
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>- اقتراح افكار تصميم ابداعية</li>
                    <li>- نصائح حول الالوان والخطوط</li>
                    <li>- شرح ادوات التصميم</li>
                  </ul>
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`px-4 py-3 rounded-2xl text-sm ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tl-none mr-8"
                      : "bg-secondary/60 text-foreground rounded-tr-none ml-8"
                  }`}
                >
                  {message.parts.map((part, index) => {
                    if (part.type === "text") {
                      return <span key={index}>{part.text}</span>;
                    }
                    return null;
                  })}
                </div>
              ))}
              {isLoading && (
                <div className="bg-secondary/60 px-4 py-3 rounded-2xl rounded-tr-none text-sm text-foreground ml-8">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-border/50">
              <div className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="اكتب رسالتك..."
                  className="flex-1 bg-secondary/40 border-border/30"
                  dir="rtl"
                  disabled={isLoading}
                />
                <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90" disabled={isLoading || !chatInput.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
