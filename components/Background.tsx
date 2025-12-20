import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export const Background: React.FC = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring configuration for smooth tracking
  const springConfig = { damping: 30, stiffness: 200, mass: 0.8 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Initialize centrally to avoid jump on load
    mouseX.set(window.innerWidth / 2 - 400);
    mouseY.set(window.innerHeight / 2 - 400);

    const handleMouseMove = (e: MouseEvent) => {
      // Center the 800px blob on the cursor
      mouseX.set(e.clientX - 400);
      mouseY.set(e.clientY - 400);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Glass overlay to diffuse the blob further and keep content readable */}
      <div className="absolute inset-0 bg-white/30 dark:bg-slate-950/50 backdrop-blur-[80px] z-10 pointer-events-none transition-colors duration-300"></div>
      
      {/* Interactive Gradient Blob 
          Light Mode: Cyan/Blue/Indigo with Multiply Blend
          Dark Mode: Blue/Indigo/Violet with Screen Blend
      */}
      <motion.div
        style={{ x, y }}
        className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full blur-[100px]
                   opacity-40 dark:opacity-30
                   bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-500 
                   dark:from-blue-600 dark:via-indigo-600 dark:to-violet-600
                   mix-blend-multiply dark:mix-blend-screen
                   transition-all duration-300"
      />
    </div>
  );
};