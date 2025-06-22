

// components/ErrorMessage.tsx
import React from 'react';


const ErrorMessage= ({ 
  message, 
  onRetry, 
  retryLabel = "Retry" 
}) => (
  <div className="error-container">
    <div className="error-icon">⚠️</div>
    <p className="error-message">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="error-retry-button">{retryLabel}
      </button>
    )}
  </div>
);

export default ErrorMessage;
