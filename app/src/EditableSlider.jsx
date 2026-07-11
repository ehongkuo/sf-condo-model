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

  return (
    <div className="slider-group">
      {label && (
        <label className="slider-label">{label}</label>
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
      <div className="slider-value-row">
        {isCurrency && (
          <span className="slider-prefix">$</span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="compact-input"
        />
        {isPercentage && (
          <span className="slider-suffix">%</span>
        )}
        {format === "currency/mo" && (
          <span className="slider-suffix">/mo</span>
        )}
        {format === "years" && (
          <span className="slider-suffix">yrs</span>
        )}
      </div>
    </div>
  );
}
