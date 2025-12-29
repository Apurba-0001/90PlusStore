import React from "react";
import "./Alert.css";

const Alert = ({ type = "info", message, onClose }) => {
  return (
    <div className={`alert alert-${type}`}>
      <div className="alert-content">{message}</div>
      {onClose && (
        <button className="alert-close" onClick={onClose}>
          ✕
        </button>
      )}
    </div>
  );
};

export default Alert;
