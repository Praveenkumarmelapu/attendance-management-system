/**
 * components/Loading.jsx — Loading Spinner Component
 */
import React from 'react';

const Loading = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-screen">
      <div className="spinner" />
      <p>{message}</p>
    </div>
  );
};

export default Loading;
