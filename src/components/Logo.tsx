import React from 'react';

export const Logo = () => {
  return (
    <div className="inline-flex items-center justify-center p-2 bg-brand-black border-4 border-brand-black neo-container">
      <div className="w-10 h-10 bg-gradient-to-br from-brand-yellow to-brand-pink flex items-center justify-center">
        <span className="text-brand-black font-black text-2xl italic tracking-tighter">FM</span>
      </div>
    </div>
  );
};
