// src/components/ui/button.tsx
import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ children, ...props }: ButtonProps) {
  return (
    <button 
      className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
      {...props}
    >
      {children}
    </button>
  );
}
