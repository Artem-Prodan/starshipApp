// src/pages/components/StarRating.jsx

import React, { useState } from 'react';
import './StarRating.css';

const StarRating = ({ value = 0, onChange, editable = false }) => {
  const [hoverValue, setHoverValue] = useState(undefined);

  const handleClick = (val) => {
    if (editable && onChange) onChange(val);
  };

  const handleMouseOver = (val) => {
    if (editable) setHoverValue(val);
  };

  const handleMouseLeave = () => {
    if (editable) setHoverValue(undefined);
  };

  const currentRating = hoverValue !== undefined ? hoverValue : value;

  return (
    <div 
    className={`star-rating ${editable ? 'editable' : 'readonly'}`}
    onMouseLeave={handleMouseLeave}>
      {[...Array(5)].map((_, i) => {
        const leftValue = i + 0.5;
        const rightValue = i + 1;

        return (
          <span key={i} className="star-pair">

            <span
                className={`star left fa-solid fa-star ${currentRating >= leftValue ? 'filled' : ''}`}
                onClick={() => handleClick(leftValue)}
                onMouseOver={() => handleMouseOver(leftValue)}
                aria-label={`Set rating to ${leftValue}`}
                role="button"
                tabIndex={editable ? 0 : -1}
                ></span>
            <span
              className={`star right fa-solid fa-star ${currentRating >= rightValue ? 'filled' : ''}`}
              onClick={() => handleClick(rightValue)}
              onMouseOver={() => handleMouseOver(rightValue)}
              aria-label={`Set rating to ${rightValue}`}
              role="button"
              tabIndex={editable ? 0 : -1}
            > </span>

         </span>
        );
      })}
    </div>
  );
};

export default StarRating;
