
// components/FloorPlanViewer.tsx
import React, { useState, useCallback } from 'react';
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const FloorPlanViewer = ({ planURLs, title }) => {
  const [activePlanIndex, setActivePlanIndex] = useState(0);
  const handle = useFullScreenHandle();

  const handleFullscreenToggle = useCallback(() => {
    handle.active ? 
      handle.exit() :
      handle.enter();
  }, [handle]);

  const handleKeyDown = useCallback((event) => {
    switch (event.key) {
      case 'Escape':
        if (handle.active) 
          handle.exit();
        break;
      case 'f':
      case 'F':
        event.preventDefault();
        handleFullscreenToggle();
        break;
    }
  }, [handle, handleFullscreenToggle]);

  return (
    <div className="floor-plan-viewer">
      <div className="plan-header">
        <h3 className="plan-title">{title}</h3>
        <button 
          onClick={handleFullscreenToggle}
          className="fullscreen-button"
          aria-label={handle.active ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {handle.active ? "Exit Fullscreen" : "Fullscreen View"}
        </button>
      </div>

      <FullScreen handle={handle}>
        <div 
          className={`floor-plan-container ${handle.active ? 'fullscreen' : ''}`}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={4}
            doubleClick={{ step: 1.5 }}
            pinch={{ step: 5 }}
            wheel={{ step: 0.2 }}
            limitToBounds={true}
            centerOnInit={true}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                {handle.active && (
                  <div className="zoom-controls" role="toolbar" aria-label="Zoom controls">
                    <button 
                      onClick={zoomIn}
                      className="zoom-button"
                      title="Zoom In (+ key)"
                      aria-label="Zoom in"
                    >
                      +
                    </button>
                    <button 
                      onClick={zoomOut}
                      className="zoom-button"
                      title="Zoom Out (- key)"
                      aria-label="Zoom out"
                    >
                      -
                    </button>
                    <button 
                      onClick={resetTransform}
                      className="zoom-button"
                      title="Reset Zoom (0 key)"
                      aria-label="Reset zoom"
                    >
                      ↻
                    </button>
                    <button 
                      onClick={handle.exit}
                      className="zoom-button close-button"
                      title="Exit Fullscreen (Escape key)"
                      aria-label="Exit fullscreen"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <TransformComponent>
                  <img
                    src={planURLs[activePlanIndex]}
                    alt={`Floor Plan ${activePlanIndex + 1}`}
                    className="floor-plan-image"
                    draggable={false}
                  />
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </div>
      </FullScreen>
    </div>
  );
};

export default FloorPlanViewer;
