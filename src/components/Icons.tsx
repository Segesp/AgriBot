'use client';

import React from 'react';

interface IconContainerProps {
  children: React.ReactNode;
  primaryColor: string;
  secondaryColor: string;
  size?: string;
  className?: string;
  withPulse?: boolean;
  withSpin?: boolean;
  rotateAngle?: number;
}

// Componente para facilitar la creación de iconos con gradientes y efectos
const IconContainer = ({ 
  children, 
  primaryColor, 
  secondaryColor,
  size = "h-6 w-6",
  className = "",
  withPulse = false,
  withSpin = false,
  rotateAngle = 0
}: IconContainerProps) => {
  return (
    <div 
      className={`relative ${size} ${className} 
                  ${withPulse ? 'animate-pulse' : ''} 
                  ${withSpin ? 'animate-spin' : ''}`}
      style={{ 
        transform: rotateAngle ? `rotate(${rotateAngle}deg)` : 'none',
        transition: 'transform 0.3s ease-in-out'
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="drop-shadow-md"
        style={{
          filter: `drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.25))`,
        }}
      >
        <defs>
          <linearGradient id={`grad-${primaryColor}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={secondaryColor} />
            <stop offset="100%" stopColor={primaryColor} />
          </linearGradient>
          <radialGradient id={`radial-${primaryColor}`} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor={secondaryColor} />
            <stop offset="100%" stopColor={primaryColor} />
          </radialGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="shadow">
            <feDropShadow dx="0" dy="1" stdDeviation="0.5" floodColor="rgba(0,0,0,0.3)" />
          </filter>
        </defs>
        {children}
      </svg>
    </div>
  );
};

export const TemperatureIcon = ({ size = "h-6 w-6", withPulse = false }) => (
  <IconContainer 
    primaryColor="#ef4444" 
    secondaryColor="#fb7185" 
    size={size}
    withPulse={withPulse}
  >
    <path 
      d="M12,15.5V5.5a3.5,3.5 0 1,0 -7,0v10a5,5 0 1,0 7,0z" 
      stroke="url(#grad-#ef4444)" 
      fill="rgba(239, 68, 68, 0.1)"
    />
    <path 
      d="M9.5,15.5c0,1.1-0.9,2-2,2s-2-0.9-2-2c0-0.7,0.4-1.4,1-1.7V5.5c0-0.6,0.4-1,1-1s1,0.4,1,1v8.3C9.1,14.1,9.5,14.8,9.5,15.5z" 
      stroke="url(#grad-#ef4444)" 
      fill="url(#radial-#ef4444)"
      filter="url(#glow)"
    />
    <line x1="7.5" y1="7" x2="7.5" y2="13.5" stroke="white" strokeWidth="0.5" />
    <line x1="10.5" y1="6" x2="13" y2="6" stroke="url(#grad-#ef4444)" strokeWidth="1.5" />
    <line x1="10.5" y1="9" x2="14" y2="9" stroke="url(#grad-#ef4444)" strokeWidth="1.5" />
    <line x1="10.5" y1="12" x2="15" y2="12" stroke="url(#grad-#ef4444)" strokeWidth="1.5" />
  </IconContainer>
);

export const TemperatureAlertIcon = ({ size = "h-6 w-6" }) => (
  <IconContainer 
    primaryColor="#dc2626" 
    secondaryColor="#f87171" 
    size={size}
    withPulse={true}
  >
    <path 
      d="M12,15.5V5.5a3.5,3.5 0 1,0 -7,0v10a5,5 0 1,0 7,0z" 
      stroke="url(#grad-#dc2626)" 
      fill="rgba(220, 38, 38, 0.2)"
      filter="url(#shadow)"
    />
    <path 
      d="M9.5,15.5c0,1.1-0.9,2-2,2s-2-0.9-2-2c0-0.7,0.4-1.4,1-1.7V5.5c0-0.6,0.4-1,1-1s1,0.4,1,1v8.3C9.1,14.1,9.5,14.8,9.5,15.5z" 
      stroke="url(#grad-#dc2626)" 
      fill="url(#radial-#dc2626)"
      filter="url(#glow)"
    />
    <line x1="7.5" y1="7" x2="7.5" y2="13.5" stroke="white" strokeWidth="0.5" />
    <circle cx="17" cy="8" r="5" stroke="url(#grad-#dc2626)" fill="rgba(220, 38, 38, 0.1)" />
    <line x1="17" y1="6" x2="17" y2="8" stroke="white" strokeWidth="1.5" />
    <circle cx="17" cy="10" r="0.5" fill="white" />
  </IconContainer>
);

export const HumidityIcon = ({ size = "h-6 w-6", withPulse = false }) => (
  <IconContainer 
    primaryColor="#3b82f6" 
    secondaryColor="#60a5fa" 
    size={size}
    withPulse={withPulse}
  >
    <path 
      d="M12,4 C14,7 18,10 18,13 C18,16.9 15.3,20 12,20 C8.7,20 6,16.9 6,13 C6,10 10,7 12,4 Z" 
      stroke="url(#grad-#3b82f6)" 
      fill="rgba(59, 130, 246, 0.1)"
    />
    <path 
      d="M12,17 C13.7,17 15,15.7 15,14 C15,12.3 13.7,11 12,11 C10.3,11 9,12.3 9,14 C9,15.7 10.3,17 12,17 Z" 
      stroke="url(#grad-#3b82f6)" 
      fill="url(#radial-#3b82f6)"
      filter="url(#glow)"
    />
    <path 
      d="M12,4 C13,6 15,8 16,10" 
      stroke="url(#grad-#3b82f6)" 
      strokeWidth="1"
      fill="none"
    />
    <path 
      d="M11,14 L13,14 M12,13 L12,15" 
      stroke="white" 
      strokeWidth="0.75"
    />
  </IconContainer>
);

export const HumidityLowIcon = ({ size = "h-6 w-6" }) => (
  <IconContainer 
    primaryColor="#1e40af" 
    secondaryColor="#3b82f6" 
    size={size}
    withPulse={true}
  >
    <path 
      d="M12,4 C14,7 18,10 18,13 C18,16.9 15.3,20 12,20 C8.7,20 6,16.9 6,13 C6,10 10,7 12,4 Z" 
      stroke="url(#grad-#1e40af)" 
      fill="rgba(30, 64, 175, 0.1)"
      strokeDasharray="1 1"
    />
    <path 
      d="M10,14 C10,15.1 10.9,16 12,16 C13.1,16 14,15.1 14,14" 
      stroke="url(#grad-#1e40af)" 
      fill="none"
      strokeWidth="1"
    />
    <line x1="8" y1="10" x2="16" y2="18" stroke="url(#grad-#1e40af)" strokeWidth="1.5" />
    <line x1="16" y1="10" x2="8" y2="18" stroke="url(#grad-#1e40af)" strokeWidth="1.5" />
  </IconContainer>
);

export const LightIcon = ({ size = "h-6 w-6", withPulse = false }) => (
  <IconContainer 
    primaryColor="#f59e0b" 
    secondaryColor="#fbbf24" 
    size={size}
    withPulse={withPulse}
  >
    <circle 
      cx="12" 
      cy="12" 
      r="4" 
      stroke="url(#grad-#f59e0b)" 
      fill="url(#radial-#f59e0b)"
      filter="url(#glow)"
    />
    <path 
      d="M12,3 L12,5 M12,19 L12,21 M3,12 L5,12 M19,12 L21,12 M5.6,5.6 L7,7 M17,17 L18.4,18.4 M18.4,5.6 L17,7 M7,17 L5.6,18.4" 
      stroke="url(#grad-#f59e0b)" 
      strokeWidth="1.5"
    />
    <circle 
      cx="12" 
      cy="12" 
      r="7" 
      stroke="url(#grad-#f59e0b)" 
      fill="none"
      strokeDasharray="1 2"
    />
  </IconContainer>
);

export const SoilIcon = ({ size = "h-6 w-6", withPulse = false }) => (
  <IconContainer 
    primaryColor="#10b981" 
    secondaryColor="#34d399" 
    size={size}
    withPulse={withPulse}
  >
    <path 
      d="M4,14 C6,12 8,12 10,14 C12,16 14,16 16,14 C18,12 20,12 20,14 L20,20 L4,20 Z" 
      stroke="url(#grad-#10b981)" 
      fill="rgba(16, 185, 129, 0.1)"
    />
    <path 
      d="M6,17 C7,16 8,16 9,17 C10,18 11,18 12,17 C13,16 14,16 15,17" 
      stroke="url(#grad-#10b981)" 
      fill="none"
    />
    <path 
      d="M7,7 C7,4.5 9.5,4 12,4 C14.5,4 17,4.5 17,7 C17,9.5 14.5,10 12,10 C9.5,10 7,9.5 7,7 Z" 
      stroke="url(#grad-#10b981)" 
      fill="rgba(16, 185, 129, 0.1)"
    />
    <path 
      d="M12,10 L12,14" 
      stroke="url(#grad-#10b981)"
      strokeWidth="1.5"
    />
    <circle cx="8" cy="18.5" r="0.5" fill="#10b981" />
    <circle cx="13" cy="18.5" r="0.5" fill="#10b981" />
    <circle cx="16" cy="17.5" r="0.5" fill="#10b981" />
  </IconContainer>
);

export const BatteryIcon = ({ size = "h-6 w-6", withPulse = false, level = 100 }) => {
  const width = Math.max(0, Math.min(12, (level / 100) * 12));
  const color = level > 20 ? "#10b981" : "#ef4444";
  const secondaryColor = level > 20 ? "#34d399" : "#f87171";
  
  return (
    <IconContainer 
      primaryColor={color} 
      secondaryColor={secondaryColor} 
      size={size}
      withPulse={level <= 20 || withPulse}
    >
      <rect 
        x="5" 
        y="7" 
        width="14" 
        height="10" 
        rx="1" 
        ry="1" 
        stroke="url(#grad-#6b7280)" 
        fill="rgba(107, 114, 128, 0.1)"
      />
      <rect 
        x="19" 
        y="10" 
        width="2" 
        height="4" 
        rx="1" 
        ry="1" 
        stroke="url(#grad-#6b7280)" 
        fill="rgba(107, 114, 128, 0.2)"
      />
      <rect 
        x="6" 
        y="8" 
        width={width} 
        height="8" 
        rx="0.5" 
        ry="0.5" 
        stroke="none" 
        fill={`url(#grad-${color})`}
        filter="url(#glow)"
      />
      {level <= 20 && (
        <path 
          d="M9,12 L13,16 M13,12 L9,16" 
          stroke="white" 
          strokeWidth="0.75"
        />
      )}
    </IconContainer>
  );
};

export const LocationIcon = ({ size = "h-6 w-6", withPulse = false }) => (
  <IconContainer 
    primaryColor="#8b5cf6" 
    secondaryColor="#a78bfa" 
    size={size}
    withPulse={withPulse}
  >
    <path 
      d="M12,21 C16,16.5 20,12.5 20,9 C20,5.1 16.4,2 12,2 C7.6,2 4,5.1 4,9 C4,12.5 8,16.5 12,21 Z" 
      stroke="url(#grad-#8b5cf6)" 
      fill="rgba(139, 92, 246, 0.1)"
    />
    <circle 
      cx="12" 
      cy="9" 
      r="3" 
      stroke="url(#grad-#8b5cf6)" 
      fill="url(#radial-#8b5cf6)"
      filter="url(#glow)"
    />
    <path 
      d="M12,7 L12,11 M10,9 L14,9" 
      stroke="white" 
      strokeWidth="0.75"
    />
  </IconContainer>
);

export const SalinityIcon = ({ size = "h-6 w-6", withPulse = false }) => (
  <IconContainer 
    primaryColor="#0d9488" 
    secondaryColor="#14b8a6" 
    size={size}
    withPulse={withPulse}
  >
    <path 
      d="M12,4 C14,7 18,10 18,13 C18,16.9 15.3,20 12,20 C8.7,20 6,16.9 6,13 C6,10 10,7 12,4 Z" 
      stroke="url(#grad-#0d9488)" 
      fill="rgba(13, 148, 136, 0.1)"
    />
    <path 
      d="M12,4 C13,6 15,8 16,10" 
      stroke="url(#grad-#0d9488)" 
      strokeWidth="1"
      fill="none"
    />
    <path 
      d="M12,16 C13.1,16 14,15.1 14,14 C14,12.9 13.1,12 12,12 C10.9,12 10,12.9 10,14 C10,15.1 10.9,16 12,16 Z" 
      stroke="url(#grad-#0d9488)" 
      fill="url(#radial-#0d9488)"
      filter="url(#glow)"
    />
    <path 
      d="M11,9 L13,9 M9,11 L15,11" 
      stroke="white" 
      strokeWidth="0.5"
    />
  </IconContainer>
);

export const SalinityHighIcon = ({ size = "h-6 w-6" }) => (
  <IconContainer 
    primaryColor="#991b1b" 
    secondaryColor="#ef4444" 
    size={size}
    withPulse={true}
  >
    <path 
      d="M12,4 C14,7 18,10 18,13 C18,16.9 15.3,20 12,20 C8.7,20 6,16.9 6,13 C6,10 10,7 12,4 Z" 
      stroke="url(#grad-#991b1b)" 
      fill="rgba(153, 27, 27, 0.1)"
      strokeDasharray="1"
    />
    <path 
      d="M12,16 C13.1,16 14,15.1 14,14 C14,12.9 13.1,12 12,12 C10.9,12 10,12.9 10,14 C10,15.1 10.9,16 12,16 Z" 
      stroke="url(#grad-#991b1b)" 
      fill="url(#radial-#991b1b)"
      filter="url(#glow)"
    />
    <path 
      d="M10,7 L14,11 M14,7 L10,11" 
      stroke="url(#grad-#991b1b)" 
      strokeWidth="1.5"
    />
  </IconContainer>
);

export const WaterDropIcon = ({ size = "h-6 w-6", withPulse = false }) => (
  <IconContainer 
    primaryColor="#0ea5e9" 
    secondaryColor="#38bdf8" 
    size={size}
    withPulse={withPulse}
  >
    <path 
      d="M12,3 C14,6 18,10 18,14 C18,18.4 15.3,22 12,22 C8.7,22 6,18.4 6,14 C6,10 10,6 12,3 Z" 
      stroke="url(#grad-#0ea5e9)" 
      fill="rgba(14, 165, 233, 0.1)"
    />
    <path 
      d="M12,3 C13,5 15,8 16,10" 
      stroke="url(#grad-#0ea5e9)" 
      strokeWidth="1"
      fill="none"
      strokeDasharray="1 1"
    />
    <path 
      d="M12,18 C14.2,18 16,16.2 16,14 C16,11.8 14.2,10 12,10 C9.8,10 8,11.8 8,14 C8,16.2 9.8,18 12,18 Z" 
      stroke="url(#grad-#0ea5e9)" 
      fill="url(#radial-#0ea5e9)"
      filter="url(#glow)"
    />
    <path 
      d="M10,14 L14,14 M12,12 L12,16" 
      stroke="white" 
      strokeWidth="0.75"
    />
  </IconContainer>
);

export const NutrientIcon = ({ size = "h-6 w-6", withPulse = false }) => (
  <IconContainer 
    primaryColor="#7c3aed" 
    secondaryColor="#a78bfa" 
    size={size}
    withPulse={withPulse}
  >
    <circle 
      cx="12" 
      cy="12" 
      r="8" 
      stroke="url(#grad-#7c3aed)" 
      fill="rgba(124, 58, 237, 0.1)"
    />
    <circle 
      cx="12" 
      cy="12" 
      r="4" 
      stroke="url(#grad-#7c3aed)" 
      fill="url(#radial-#7c3aed)"
      filter="url(#glow)"
    />
    <path 
      d="M12,4 L12,8 M12,16 L12,20 M4,12 L8,12 M16,12 L20,12" 
      stroke="url(#grad-#7c3aed)" 
      strokeWidth="1"
    />
    <circle cx="12" cy="12" r="1.5" fill="white" />
  </IconContainer>
);

export const PHIcon = ({ size = "h-6 w-6", withPulse = false }) => (
  <IconContainer 
    primaryColor="#059669" 
    secondaryColor="#10b981" 
    size={size}
    withPulse={withPulse}
  >
    <circle 
      cx="12" 
      cy="12" 
      r="8" 
      stroke="url(#grad-#059669)" 
      fill="rgba(5, 150, 105, 0.1)"
    />
    <path 
      d="M8,8 L8,16 M8,9 L11,9 C12.1,9 13,9.9 13,11 C13,12.1 12.1,13 11,13 L8,13" 
      stroke="url(#grad-#059669)" 
      strokeWidth="1.5"
      fill="none"
    />
    <path 
      d="M16,8 L14,16" 
      stroke="url(#grad-#059669)" 
      strokeWidth="1.5"
      fill="none"
    />
    <path 
      d="M7,6 C15,6 17,18 7,18" 
      stroke="url(#grad-#059669)" 
      fill="none"
      strokeWidth="0.5"
      strokeDasharray="1 1"
    />
  </IconContainer>
); 