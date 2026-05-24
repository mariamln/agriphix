import React from 'react';

export default function TopicButton({ label, icon: Icon, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
    >
      {Icon ? <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" /> : null}
      {label}
    </button>
  );
}
