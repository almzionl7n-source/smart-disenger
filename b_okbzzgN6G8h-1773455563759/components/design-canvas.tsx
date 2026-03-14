"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Trash2, RotateCw, Copy, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CanvasElement {
  id: string;
  type: "text" | "image" | "shape";
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  color?: string;
  fontSize?: number;
  rotation?: number;
  shapeType?: "rectangle" | "circle" | "triangle" | "star";
}

interface DesignCanvasProps {
  elements: CanvasElement[];
  onElementsChange: (elements: CanvasElement[]) => void;
  selectedElement: string | null;
  onSelectElement: (id: string | null) => void;
}

export function DesignCanvas({
  elements,
  onElementsChange,
  selectedElement,
  onSelectElement,
}: DesignCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, elementId: string) => {
      e.stopPropagation();
      const element = elements.find((el) => el.id === elementId);
      if (!element) return;

      onSelectElement(elementId);
      setIsDragging(true);

      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const scaleX = 800 / rect.width;
        const scaleY = 600 / rect.height;
        setDragOffset({
          x: (e.clientX - rect.left) * scaleX - element.x,
          y: (e.clientY - rect.top) * scaleY - element.y,
        });
      }
    },
    [elements, onSelectElement]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !selectedElement) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const scaleX = 800 / rect.width;
      const scaleY = 600 / rect.height;
      const newX = (e.clientX - rect.left) * scaleX - dragOffset.x;
      const newY = (e.clientY - rect.top) * scaleY - dragOffset.y;

      onElementsChange(
        elements.map((el) =>
          el.id === selectedElement
            ? { ...el, x: Math.max(0, newX), y: Math.max(0, newY) }
            : el
        )
      );
    },
    [isDragging, selectedElement, dragOffset, elements, onElementsChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleCanvasClick = useCallback(() => {
    onSelectElement(null);
  }, [onSelectElement]);

  const deleteSelected = useCallback(() => {
    if (selectedElement) {
      onElementsChange(elements.filter((el) => el.id !== selectedElement));
      onSelectElement(null);
    }
  }, [selectedElement, elements, onElementsChange, onSelectElement]);

  const duplicateSelected = useCallback(() => {
    if (selectedElement) {
      const element = elements.find((el) => el.id === selectedElement);
      if (element) {
        const newElement = {
          ...element,
          id: `${element.type}-${Date.now()}`,
          x: element.x + 20,
          y: element.y + 20,
        };
        onElementsChange([...elements, newElement]);
        onSelectElement(newElement.id);
      }
    }
  }, [selectedElement, elements, onElementsChange, onSelectElement]);

  const rotateSelected = useCallback(() => {
    if (selectedElement) {
      onElementsChange(
        elements.map((el) =>
          el.id === selectedElement
            ? { ...el, rotation: ((el.rotation || 0) + 45) % 360 }
            : el
        )
      );
    }
  }, [selectedElement, elements, onElementsChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedElement) {
          deleteSelected();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedElement, deleteSelected]);

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
      outline: isSelected ? "2px solid #a855f7" : "none",
      outlineOffset: "2px",
      boxShadow: isSelected ? "0 0 20px rgba(168, 85, 247, 0.4)" : "none",
    };

    switch (element.type) {
      case "text":
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              fontSize: element.fontSize || 24,
              color: element.color || "#1a1a2e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              textAlign: "center",
              userSelect: "none",
            }}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          >
            {element.content}
          </div>
        );

      case "image":
        return (
          <div
            key={element.id}
            style={baseStyle}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={element.content}
              alt="تصميم"
              className="w-full h-full object-contain rounded-lg"
              draggable={false}
            />
          </div>
        );

      case "shape":
        return (
          <div
            key={element.id}
            style={baseStyle}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          >
            {renderShape(element)}
          </div>
        );

      default:
        return null;
    }
  };

  const renderShape = (element: CanvasElement) => {
    const color = element.color || "#a855f7";

    switch (element.shapeType) {
      case "rectangle":
        return (
          <div
            className="w-full h-full rounded-lg"
            style={{ backgroundColor: color }}
          />
        );
      case "circle":
        return (
          <div
            className="w-full h-full rounded-full"
            style={{ backgroundColor: color }}
          />
        );
      case "triangle":
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon points="50,10 90,90 10,90" fill={color} />
          </svg>
        );
      case "star":
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon
              points="50,5 61,40 98,40 68,62 79,97 50,75 21,97 32,62 2,40 39,40"
              fill={color}
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-secondary/30 backdrop-blur-md border-b border-border/50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            className="text-muted-foreground hover:text-foreground"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
            className="text-muted-foreground hover:text-foreground"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        {selectedElement && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={rotateSelected}
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={duplicateSelected}
              className="text-muted-foreground hover:text-foreground"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={deleteSelected}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto p-4 md:p-8 bg-secondary/20 flex items-center justify-center">
        <div
          ref={canvasRef}
          className="relative bg-white rounded-xl shadow-2xl overflow-hidden"
          style={{
            width: 800,
            height: 600,
            transform: `scale(${zoom})`,
            transformOrigin: "center center",
          }}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {elements.map(renderElement)}
          
          {elements.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="text-6xl mb-4">🎨</div>
                <p className="text-lg font-sans">اسحب العناصر هنا للبدء</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
