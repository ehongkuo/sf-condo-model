import React, { useState, useRef, useEffect } from "react";

export function EditableSlider({
  label,
  value,
  setValue,
  min,
  max,
  step,
  format = "currency",
  className = "slider",
}) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);

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

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleClick = () => {
    setInputValue(String(value));
    setEditing(true);
  };

  const commit = () => {
    const parsed = parseFloat(inputValue);
    if (!isNaN(parsed)) {
      const clamped = Math.min(max, Math.max(min, parsed));
      setValue(clamped);
    }
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") setEditing(false);
  };

  return (
    <div className="slider-group">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "4px",
          alignItems: "center",
        }}
      >
        {label ? (
          <label className="slider-label" style={{ margin: 0 }}>
            {label}
          </label>
        ) : (
          <div></div>
        )}
        {editing ? (
          <input
            ref={inputRef}
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={commit}
            onKeyDown={handleKeyDown}
            min={min}
            max={max}
            step={step}
            className="compact-input"
            style={{ width: "72px", fontSize: "0.85rem" }}
          />
        ) : (
          <span
            onClick={handleClick}
            style={{
              fontSize: "0.85rem",
              color: "#e2e8f0",
              fontWeight: "bold",
              cursor: "pointer",
              borderBottom: "1px dashed rgba(255,255,255,0.2)",
              paddingBottom: "1px",
            }}
            title="Click to type a value"
          >
            {displayValue}
          </span>
        )}
      </div>
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
