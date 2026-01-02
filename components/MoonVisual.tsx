
import React, { useId } from 'react';

interface MoonVisualProps {
  phase: number; // 0 to 1
  size?: number;
}

const MoonVisual: React.FC<MoonVisualProps> = ({ phase, size = 100 }) => {
  // Normalize phase to 0-1
  const normalizedPhase = ((phase % 1) + 1) % 1; 
  const isWaxing = normalizedPhase <= 0.5;
  const uniqueId = useId().replace(/:/g, ""); 
  
  // rx: Horizontal radius of the terminator ellipse.
  // Phase 0 (New): cos(0)=1 -> rx=50
  // Phase 0.5 (Full): cos(PI)=-1 -> rx=-50
  const rx = 50 * Math.cos(normalizedPhase * 2 * Math.PI);
  
  let d = "";
  
  // Logic Restoration:
  // In the previous attempt (v2) which was visually correct but jumped, 
  // we used: rx > 0 ? 0 : 1 for Waxing.
  // In v3 (which fixed jumping but inverted colors), we accidentally used: rx > 0 ? 1 : 0.
  // We are reverting to v2 logic here.
  
  if (isWaxing) {
    // Waxing (0 -> 0.5). Shadow is on Left.
    // Outer Arc: Top -> Left -> Bottom (Sweep 0).
    
    // Logic: rx > 0 ? 0 : 1
    const sweep = rx > 0 ? 0 : 1;
    d = `M 50 0 A 50 50 0 0 0 50 100 A ${Math.abs(rx)} 50 0 0 ${sweep} 50 0`;
  } else {
    // Waning (0.5 -> 1). Shadow is on Right.
    // Outer Arc: Top -> Right -> Bottom (Sweep 1).
    
    // Logic: rx > 0 ? 1 : 0
    const sweep = rx > 0 ? 1 : 0;
    d = `M 50 0 A 50 50 0 0 1 50 100 A ${Math.abs(rx)} 50 0 0 ${sweep} 50 0`;
  }

  // Calculate Illumination for Glow Effect (0 to 1)
  // 0 -> 0 (Dark), 0.5 -> 1 (Bright), 1 -> 0 (Dark)
  const illumination = 1 - Math.abs((normalizedPhase - 0.5) * 2);
  const glowOpacity = 0.05 + (illumination * 0.3); 

  return (
    <div 
      className="relative rounded-full" 
      style={{ 
        width: size, 
        height: size,
        boxShadow: `0 0 ${size/3}px rgba(255, 255, 255, ${glowOpacity})`
      }}
    >
      {/* 1. Realistic Texture */}
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/FullMoon2010.jpg/480px-FullMoon2010.jpg"
        alt="Moon"
        className="absolute inset-0 w-full h-full object-cover rounded-full"
        style={{ filter: 'grayscale(100%) contrast(1.1) brightness(0.9)' }}
      />
      
      {/* 2. Shadow Layer */}
      {/* CSS Transition for 'd' is REMOVED to prevent jumping artifacts */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none rounded-full">
        <defs>
          <filter id={`blur-${uniqueId}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
          <clipPath id={`circle-clip-${uniqueId}`}>
             <circle cx="50" cy="50" r="50" />
          </clipPath>
        </defs>

        <path 
          d={d} 
          fill="rgba(10,10,12,0.92)" 
          style={{ 
            mixBlendMode: 'multiply',
            filter: `url(#blur-${uniqueId})`,
            clipPath: `url(#circle-clip-${uniqueId})`
          }} 
        />
      </svg>
      
      {/* 3. Inner Sphere Gloss/Depth */}
      <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/10" 
           style={{ 
             boxShadow: 'inset -4px -4px 15px rgba(0,0,0,0.6), inset 2px 2px 8px rgba(255,255,255,0.1)' 
           }} 
      />
    </div>
  );
};

export default MoonVisual;
