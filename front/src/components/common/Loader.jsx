import React from 'react';

const Loader = ({ size = 'medium', text = 'Загрузка...' }) => {
  const sizes = {
    small: '30px',
    medium: '50px',
    large: '70px',
  };

  return (
    <div className="loading">
      <div className="loading__spinner" style={{ width: sizes[size], height: sizes[size] }}></div>
      {text && <p className="text-muted">{text}</p>}
    </div>
  );
};

export default Loader;
