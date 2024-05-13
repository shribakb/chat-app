import React from "react";

const Badge = ({ count }) => {
  return (
    <div
      style={{
        display: "flex",
        backgroundColor: "red",
        color: "white",
        borderRadius: "50%",
        padding: "4px 8px",
        fontSize: "9px",
        fontWeight: "bold",
        textAlign: "center",
      }}
    >
      {count}
    </div>
  );
};

export default Badge;
