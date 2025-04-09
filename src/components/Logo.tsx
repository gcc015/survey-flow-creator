
import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white border-4 border-brand-500" />
        </div>
        <div className="absolute inset-0">
          {Array.from({ length: 36 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-3 bg-brand-500 origin-bottom"
              style={{
                left: '50%',
                bottom: '50%',
                transform: `translateX(-50%) rotate(${i * 10}deg)`,
                transformOrigin: 'bottom',
              }}
            />
          ))}
        </div>
      </div>
      <div className="text-3xl font-bold text-brand-900 ml-2">dynata™</div>
    </div>
  );
};

export default Logo;
