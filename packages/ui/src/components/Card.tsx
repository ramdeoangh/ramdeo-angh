import React from 'react';

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card: React.FC<CardProps> = ({ className = '', ...props }) => {
  return <div className={["rounded-lg border border-gray-200 bg-white shadow-sm", className].join(' ')} {...props} />;
};


