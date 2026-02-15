import React, { useRef, useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { normalizeSplit, calculateSplitFromDivider, calculateSplitFromKeyboard } from "@/lib/split-bar-utils";

interface InteractiveSplitBarProps {
  needs: number;
  wants: number;
  savings: number;
  onChange: (values: { needs: number; wants: number; savings: number }) => void;
  labels?: {
    needs: string;
    wants: string;
    savings: string;
  };
}

type DividerType = "divider1" | "divider2" | null;

const InteractiveSplitBar: React.FC<InteractiveSplitBarProps> = ({
  needs,
  wants,
  savings,
  onChange,
  labels,
}) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingDivider, setDraggingDivider] = useState<DividerType>(null);
  const [focusedDivider, setFocusedDivider] = useState<DividerType>(null);

  // Normalize values on mount if they don't sum to 100
  useEffect(() => {
    const total = needs + wants + savings;
    if (total !== 100 && total > 0) {
      onChange(normalizeSplit(needs, wants, savings));
    }
  }, []);

  const calculateNewSplit = useCallback(
    (clientX: number, divider: "divider1" | "divider2") => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const cursorX = clientX - rect.left;
      const percent = Math.round((cursorX / rect.width) * 100);

      onChange(calculateSplitFromDivider(percent, divider, { needs, wants, savings }));
    },
    [needs, wants, savings, onChange]
  );

  const handleMouseDown = useCallback((divider: DividerType) => {
    setDraggingDivider(divider);
  }, []);

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!draggingDivider) return;
      calculateNewSplit(event.clientX, draggingDivider);
    },
    [draggingDivider, calculateNewSplit]
  );

  const handleMouseUp = useCallback(() => {
    setDraggingDivider(null);
  }, []);

  const handleTouchStart = useCallback((divider: DividerType) => {
    setDraggingDivider(divider);
  }, []);

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (!draggingDivider || event.touches.length === 0) return;
      event.preventDefault();
      calculateNewSplit(event.touches[0].clientX, draggingDivider);
    },
    [draggingDivider, calculateNewSplit]
  );

  const handleTouchEnd = useCallback(() => {
    setDraggingDivider(null);
  }, []);

  // Attach global mouse/touch event listeners
  useEffect(() => {
    if (draggingDivider) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove, { passive: false });
      document.addEventListener("touchend", handleTouchEnd);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [draggingDivider, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, divider: "divider1" | "divider2") => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        const delta = event.key === "ArrowLeft" ? -1 : 1;
        onChange(calculateSplitFromKeyboard(delta, divider, { needs, wants, savings }));
      }
    },
    [needs, wants, savings, onChange]
  );

  const defaultLabels = {
    needs: t("savings_strategies.needs"),
    wants: t("savings_strategies.wants"),
    savings: t("savings_strategies.savings"),
  };

  const actualLabels = labels || defaultLabels;

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">{t("savings_strategies.custom.drag_hint")}</p>
      <div
        ref={containerRef}
        className="relative h-12 rounded-lg overflow-hidden select-none"
        style={{ touchAction: "none" }}
      >
        {/* Needs Segment */}
        <div
          className="absolute top-0 left-0 h-full bg-primary flex items-center justify-center text-xs font-semibold text-primary-foreground transition-all"
          style={{ width: `${needs}%` }}
        >
          {needs > 20 && `${actualLabels.needs} ${needs}%`}
          {needs <= 20 && needs > 10 && `${needs}%`}
        </div>

        {/* Wants Segment */}
        <div
          className="absolute top-0 h-full bg-warning flex items-center justify-center text-xs font-semibold text-warning-foreground transition-all"
          style={{ left: `${needs}%`, width: `${wants}%` }}
        >
          {wants > 20 && `${actualLabels.wants} ${wants}%`}
          {wants <= 20 && wants > 10 && `${wants}%`}
        </div>

        {/* Savings Segment */}
        <div
          className="absolute top-0 right-0 h-full bg-success flex items-center justify-center text-xs font-semibold text-success-foreground transition-all"
          style={{ width: `${savings}%` }}
        >
          {savings > 20 && `${actualLabels.savings} ${savings}%`}
          {savings <= 20 && savings > 10 && `${savings}%`}
        </div>

        {/* Divider 1: Between Needs and Wants */}
        <div
          className={`absolute top-0 h-full w-1 bg-background cursor-col-resize z-10 hover:w-3 hover:bg-foreground/20 transition-all ${
            draggingDivider === "divider1" ? "w-3 bg-foreground/30" : ""
          } ${focusedDivider === "divider1" ? "ring-2 ring-primary" : ""}`}
          style={{ left: `calc(${needs}% - 2px)` }}
          onMouseDown={() => handleMouseDown("divider1")}
          onTouchStart={() => handleTouchStart("divider1")}
          onFocus={() => setFocusedDivider("divider1")}
          onBlur={() => setFocusedDivider(null)}
          onKeyDown={(e) => handleKeyDown(e, "divider1")}
          tabIndex={0}
          role="slider"
          aria-label={t("savings_strategies.custom.divider_needs_wants")}
          aria-valuemin={1}
          aria-valuemax={100 - savings - 1}
          aria-valuenow={needs}
        />

        {/* Divider 2: Between Wants and Savings */}
        <div
          className={`absolute top-0 h-full w-1 bg-background cursor-col-resize z-10 hover:w-3 hover:bg-foreground/20 transition-all ${
            draggingDivider === "divider2" ? "w-3 bg-foreground/30" : ""
          } ${focusedDivider === "divider2" ? "ring-2 ring-primary" : ""}`}
          style={{ left: `calc(${needs + wants}% - 2px)` }}
          onMouseDown={() => handleMouseDown("divider2")}
          onTouchStart={() => handleTouchStart("divider2")}
          onFocus={() => setFocusedDivider("divider2")}
          onBlur={() => setFocusedDivider(null)}
          onKeyDown={(e) => handleKeyDown(e, "divider2")}
          tabIndex={0}
          role="slider"
          aria-label={t("savings_strategies.custom.divider_wants_savings")}
          aria-valuemin={needs + 1}
          aria-valuemax={99}
          aria-valuenow={needs + wants}
        />
      </div>
    </div>
  );
};

export default InteractiveSplitBar;
