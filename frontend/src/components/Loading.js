import React from 'react';

export default function Loading({ text = 'Chargement...' }) {
  return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <div className="spinner-border text-primary me-2" role="status" aria-hidden="true"></div>
      <span>{text}</span>
    </div>
  );
}


