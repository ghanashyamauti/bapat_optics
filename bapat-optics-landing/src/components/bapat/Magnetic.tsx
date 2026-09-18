import {
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  type HTMLMotionProps,
  type MotionStyle,
} from "motion/react";
import { useIsFinePointer, usePrefersReducedMotion } from "./hooks";

export interface MagneticOptions {
  /**
   * Maximum translation displacement in pixels when pulled by the cursor.
   * Defaults to 10px (luxurious subtle displacement).
   */
  maxDisplacement?: number;
  /**
   * Radius in pixels beyond the button's bounds where magnetic attraction starts.
   * Defaults to 65px.
   */
  proximity?: number;
  /**
   * Optional toggle to manually disable magnetic attraction.
   */
  disabled?: boolean;
}

/**
 * Hook for adding spring-driven magnetic cursor attraction to any DOM element.
 * Pulls the element towards the cursor when within proximity and springs smoothly back to resting state.
 * Automatically disabled on touch devices and for users preferring reduced motion.
 */
export function useMagnetic<T extends HTMLElement = HTMLElement>({
  maxDisplacement = 10,
  proximity = 65,
  disabled = false,
}: MagneticOptions = {}) {
  const ref = useRef<T>(null);
  const fine = useIsFinePointer();
  const reduced = usePrefersReducedMotion();

  // Raw coordinate targets
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Buttery-smooth spring values (tuned for high responsiveness and zero oscillation)
  const springConfig = { damping: 18, stiffness: 200, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  useEffect(() => {
    // Only active on desktop/pointer-fine devices with motion enabled
    if (!fine || reduced || disabled) {
      x.set(0);
      y.set(0);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = node.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      // Invariant resting center: subtract current displacement to eliminate jitter/feedback loops
      const currentX = x.get();
      const currentY = y.get();
      const restingCenterX = rect.left + rect.width / 2 - currentX;
      const restingCenterY = rect.top + rect.height / 2 - currentY;

      const distX = e.clientX - restingCenterX;
      const distY = e.clientY - restingCenterY;

      const halfW = rect.width / 2;
      const halfH = rect.height / 2;

      // Distance from the perimeter edge of the element
      const dx = Math.max(0, Math.abs(distX) - halfW);
      const dy = Math.max(0, Math.abs(distY) - halfH);
      const edgeDistance = Math.hypot(dx, dy);

      if (edgeDistance === 0) {
        // Cursor is directly hovering over the element
        const ratioX = Math.min(1, Math.max(-1, distX / halfW));
        const ratioY = Math.min(1, Math.max(-1, distY / halfH));
        x.set(ratioX * maxDisplacement);
        y.set(ratioY * maxDisplacement);
      } else if (edgeDistance < proximity) {
        // Cursor is within the outer magnetic pull radius
        // Cosine falloff ensures a smooth transition from edge to zero pull at proximity limit
        const falloff = 0.5 * (1 + Math.cos((Math.PI * edgeDistance) / proximity));
        const totalDist = Math.hypot(distX, distY) || 1;
        const dirX = distX / totalDist;
        const dirY = distY / totalDist;
        x.set(dirX * maxDisplacement * falloff);
        y.set(dirY * maxDisplacement * falloff);
      } else {
        // Outside magnetic field: spring back to resting state
        x.set(0);
        y.set(0);
      }
    };

    const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      x.set(0);
      y.set(0);
    };
  }, [fine, reduced, disabled, maxDisplacement, proximity, x, y]);

  return {
    ref,
    style: {
      x: springX,
      y: springY,
    },
  };
}

export interface MagneticProps extends Omit<HTMLMotionProps<"div">, "style"> {
  children: ReactNode;
  maxDisplacement?: number;
  proximity?: number;
  disabled?: boolean;
  className?: string;
  style?: MotionStyle;
}

/**
 * Reusable wrapper component that adds smooth spring-based magnetic cursor attraction
 * to any button, link, or trigger.
 */
export function Magnetic({
  children,
  maxDisplacement = 10,
  proximity = 65,
  disabled = false,
  className = "",
  style,
  ...props
}: MagneticProps) {
  const { ref, style: springStyle } = useMagnetic<HTMLDivElement>({
    maxDisplacement,
    proximity,
    disabled,
  });

  return (
    <motion.div
      ref={ref}
      style={{
        ...style,
        x: springStyle.x,
        y: springStyle.y,
      }}
      className={`inline-block ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export const MagneticButton = Magnetic;
