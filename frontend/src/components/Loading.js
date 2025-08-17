import React from 'react';

export default function Loading() {
  return (
    <div className="loading-container">
      <div className="text-center">
        <div className="loading-spinner mb-3"></div>
        <h4 className="text-muted mb-2">Chargement en cours...</h4>
        <p className="text-muted mb-0">Veuillez patienter pendant que nous récupérons vos données</p>
      </div>
    </div>
  );
}


