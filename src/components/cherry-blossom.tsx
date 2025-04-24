import React, { useEffect, useState } from 'react';

interface CherryBlossomProps {
  count?: number;
  minSize?: number;
  maxSize?: number;
  className?: string;
}

export const CherryBlossom: React.FC<CherryBlossomProps> = ({
  count = 10,
  minSize = 15,
  maxSize = 30,
  className,
}) => {
  const [petals, setPetals] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    rotation: number;
    duration: number;
    delay: number;
    swayDuration: number;
  }>>([]);

  useEffect(() => {
    const generatePetals = () => {
      const newPetals = Array.from({ length: count }).map((_, index) => {
        const size = Math.random() * (maxSize - minSize) + minSize;
        return {
          id: index,
          x: Math.random() * window.innerWidth,
          y: -100 - Math.random() * 500, // Start above the viewport
          size,
          rotation: Math.random() * 360,
          duration: Math.random() * 30 + 20, // Fall duration in seconds
          delay: Math.random() * 15, // Delay start in seconds
          swayDuration: Math.random() * 4 + 3, // Sway duration in seconds
        };
      });
      setPetals(newPetals);
    };

    generatePetals();

    // Handle window resize
    const handleResize = () => {
      generatePetals();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [count, minSize, maxSize]);

  const PetalSVG = ({ size, rotation }: { size: number; rotation: number }) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      style={{ transform: `rotate(${rotation}deg)` }}
      className="text-sakura-300 dark:text-sakura-700"
    >
      <path 
        d="M12 2C7.58172 2 4 5.58172 4 10C4 14.4183 7.58172 18 12 18C16.4183 18 20 14.4183 20 10C20 5.58172 16.4183 2 12 2Z" 
        fill="currentColor" 
        opacity="0.7"
      />
      <path 
        d="M12 2C9.79086 2 8 3.79086 8 6C8 8.20914 9.79086 10 12 10C14.2091 10 16 8.20914 16 6C16 3.79086 14.2091 2 12 2Z" 
        fill="currentColor" 
      />
    </svg>
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="sakura-falling absolute"
          style={{
            left: `${petal.x}px`,
            top: `${petal.y}px`,
            animationDuration: `${petal.duration}s, ${petal.swayDuration}s`,
            animationDelay: `${petal.delay}s, ${petal.delay}s`,
          }}
        >
          <PetalSVG size={petal.size} rotation={petal.rotation} />
        </div>
      ))}
    </div>
  );
};

export default CherryBlossom;
