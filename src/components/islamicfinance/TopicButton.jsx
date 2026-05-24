import React from 'react';

export default function TopicButton({ label, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="text-xs px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
    >
      {label}
    </button>
  );
}