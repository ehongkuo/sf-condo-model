import React from "react";

export function EditableSlider({
  label,
  value,
  setValue,
  min,
  max,
  step,
  format = "currency",
  className = "slider",
  width = "100%",
}) {
  const isCurrency = format.startsWith("currency");
  const isPercentage = format.startsWith("percentage");

  return (
    <div className="slider-group" style={{ flex: 1, minWidth: "150px" }}>
      <label
        style={{ fontSize: "0.8rem", marginBottom: "4px", display: "block" }}
      >
        {label}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className={className}
        style={{ width: "100%" }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          marginTop: "4px",
        }}
      >
        {isCurrency && (
          <span style={{ fontSize: "0.9rem", color: "#94a3b8" }}>$</span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          style={{
            background: "rgba(0,0,0,0.2)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#f8fafc",
            padding: "4px 8px",
            borderRadius: "4px",
            width: width,
            fontSize: "0.9rem",
            fontFamily: "inherit",
            outline: "none",
          }}
        />
        {isPercentage && (
          <span style={{ fontSize: "0.9rem", color: "#94a3b8" }}>%</span>
        )}
        {format === "currency/mo" && (
          <span style={{ fontSize: "0.9rem", color: "#94a3b8" }}>/mo</span>
        )}
        {format === "years" && (
          <span style={{ fontSize: "0.9rem", color: "#94a3b8" }}>yrs</span>
        )}
      </div>
    </div>
  );
}
