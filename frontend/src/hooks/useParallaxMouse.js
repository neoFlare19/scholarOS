import { useMemo, useState } from "react";

export function useParallaxMouse(intensity = 24) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handlers = useMemo(
    () => ({
      onMouseMove: (event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
        const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
        setPosition({ x: x * intensity, y: y * intensity });
      },
      onMouseLeave: () => setPosition({ x: 0, y: 0 }),
    }),
    [intensity]
  );

  return { position, handlers };
}
