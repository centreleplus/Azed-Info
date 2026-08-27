import React from "react";

interface CardWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const CardWrapper: React.FC<CardWrapperProps> = ({ children, className = "", ...props }) => {
  return (
    <div 
      className={`bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-emerald-100/60 dark:border-slate-800 shadow-sm shadow-emerald-900/5 transition-all hover:shadow-md ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default CardWrapper;
