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
  compact = false,
}) {
  const isCurrency = format.startsWith("currency");
  const isPercentage = format.startsWith("percentage");

  let displayValue = value;
  if (isCurrency) {
    displayValue = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  } else if (isPercentage) {
    displayValue = `${value}%`;
  }
  if (format === "currency/mo") displayValue += "/mo";
  if (format === "years") displayValue += " yrs";

  return (
    <div className="slider-group">
      {label && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "4px",
            alignItems: "center",
          }}
        >
          <label className="slider-label" style={{ margin: 0 }}>
            {label}
          </label>
          <span
            style={{
              fontSize: "0.85rem",
              color: "#e2e8f0",
              fontWeight: "bold",
            }}
          >
            {displayValue}
          </span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className={className}
      />
    </div>
  );
}
