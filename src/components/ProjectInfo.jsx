
// components/ProjectInfo.tsx
import React from 'react'

const ProjectInfo = ({ project, onBuyClick }) => {
  return (
    <div className="project-info">
      <h2 className="section-title">Project Details</h2>
      
      <div className="details-grid">
        <div className="detail-group">
          <div className="detail-item">
            <span className="detail-label">Price:</span>
            <span className="detail-value">
              {project.price ? `KES ${project.price.toLocaleString()}` : "Contact for pricing"}
            </span>
          </div>
          
          <div className="detail-item">
            <span className="detail-label">Rooms:</span>
            <span className="detail-value">{project.rooms || "Not specified"}</span>
          </div>
          
          <div className="detail-item">
            <span className="detail-label">Floors:</span>
            <span className="detail-value">{project.floorCount || "Not specified"}</span>
          </div>
        </div>
        
        <div className="detail-group">
          <div className="detail-item">
            <span className="detail-label">Dimensions:</span>
            <span className="detail-value">
              {project.length && project.width 
                ? `${project.length}m × ${project.width}m`
                : "Not specified"
              }
            </span>
          </div>
          
          <div className="detail-item">
            <span className="detail-label">Area:</span>
            <span className="detail-value">
              {project.area ? `${project.area.toFixed(1)} sqm` : "Not calculated"}
            </span>
          </div>
        </div>
      </div>

      {project.description && (
        <div className="description-section">
          <h3 className="description-title">Description</h3>
          <p className="description-text">{project.description}</p>
        </div>
      )}

      <button 
        onClick={onBuyClick}
        className="buy-button"
        aria-label={`Purchase ${project.title}`}
      >
        Buy / Download Plans
      </button>
    </div>
  );
};

export default ProjectInfo;
