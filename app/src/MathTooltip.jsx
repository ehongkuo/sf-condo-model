import React, { useState } from 'react';

const MathTooltip = ({ children, ledger }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span style={{ borderBottom: '1px dotted rgba(255,255,255,0.4)', cursor: 'help' }}>
        {children}
      </span>
      {isHovered && ledger && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '8px',
          background: '#1e293b',
          color: '#f8fafc',
          padding: '12px',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)',
          whiteSpace: 'pre',
          fontFamily: 'monospace',
          fontSize: '0.85rem',
          zIndex: 50,
          border: '1px solid rgba(255,255,255,0.1)',
          pointerEvents: 'none',
          minWidth: 'max-content',
          textAlign: 'left'
        }}>
          {ledger}
        </div>
      )}
    </div>
  );
};

export default MathTooltip;
