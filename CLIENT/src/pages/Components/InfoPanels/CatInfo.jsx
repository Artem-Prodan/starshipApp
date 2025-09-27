import React from 'react';
import '../catHeader.css';

// import FaStar from 'react-icons/fa';
import { FaStickyNote, FaFolder } from 'react-icons/fa';

const CatalogInfoPanel = ({ notesCount, foldersCount, ratedTitlesCount }) => {
  return (
    <>
      <div className="info-panel-overlay" />
      <div className="info-panel">
        <div className="info-section">
        
          <div className="info-row">
            <div className="info-block">
              <FaStickyNote className="info-icon" />
              <div className="info-text">
                <div className="info-number">{notesCount} notes</div>
                <div className="info-label">created</div>
              </div>
            </div>

            <div className="divider" />

            <div className="info-block">
              <FaFolder className="info-icon" />
              <div className="info-text">
                <div className="info-number">{foldersCount} folders</div>
                <div className="info-label">created</div>
              </div>
            </div>
          </div>

          {/* rated 

          <div className="info-row">
            <div className="info-block">
              <FaStar className="info-icon" />
              <div className="info-text">
                <div className="info-number">{ratedTitlesCount} titles</div>
                <div className="info-label">rated</div>
              </div>
            </div>
          </div>

          */}
          
        </div>
      </div>
    </>
  );
};

export default CatalogInfoPanel;
