import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

const NUMERIC_CONTROLS = new Set(["number", "range", "slider"]);

const isFiniteNumber = (value) => Number.isFinite(Number(value));

const getStepDecimals = (step) => {
  const normalizedStep = String(step ?? "");
  if (normalizedStep.includes("e-")) {
    return Number(normalizedStep.split("e-")[1]) || 0;
  }
  return Math.max(0, (normalizedStep.split(".")[1] || "").length);
};

const formatNumericValue = (value, step) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return String(value ?? "");
  }
  return numericValue.toFixed(getStepDecimals(step));
};

const copyText = async (text) => {
  if (!navigator.clipboard?.writeText) {
    throw new Error("Clipboard API is unavailable");
  }
  await navigator.clipboard.writeText(text);
};

const SliderControl = ({ field, value, labelledBy, onUpdateParam }) => {
  const inputRef = useRef(null);
  const [valueDraft, setValueDraft] = useState(() =>
    formatNumericValue(value, field.step)
  );
  const min = Number(field.min);
  const max = Number(field.max);
  const numericValue = Number(value);
  const hasValidRange =
    Number.isFinite(min) && Number.isFinite(max) && max > min;
  const clampedValue = hasValidRange
    ? Math.min(max, Math.max(min, numericValue))
    : numericValue;
  const fillPercent =
    hasValidRange && Number.isFinite(clampedValue)
      ? ((clampedValue - min) / (max - min)) * 100
      : 0;

  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setValueDraft(formatNumericValue(value, field.step));
    }
  }, [field.step, value]);

  const updateDraft = (rawValue) => {
    setValueDraft(rawValue);
    if (rawValue.trim() !== "" && isFiniteNumber(rawValue)) {
      onUpdateParam(field.key, rawValue);
    }
  };

  const resetInvalidDraft = () => {
    if (!isFiniteNumber(valueDraft)) {
      setValueDraft(formatNumericValue(value, field.step));
    }
  };

  if (!hasValidRange) {
    return (
      <input
        ref={inputRef}
        className="parameter-text-input parameter-number-input"
        type="text"
        inputMode="decimal"
        aria-labelledby={labelledBy}
        value={valueDraft}
        onBlur={resetInvalidDraft}
        onChange={(event) => updateDraft(event.target.value)}
      />
    );
  }

  return (
    <div className="parameter-slider-control">
      <div className="parameter-slider-row">
        <input
          className="parameter-slider"
          type="range"
          min={min}
          max={max}
          step={field.step}
          value={clampedValue}
          aria-labelledby={labelledBy}
          style={{ "--slider-fill": `${fillPercent}%` }}
          onChange={(event) => onUpdateParam(field.key, event.target.value)}
        />
        <input
          ref={inputRef}
          className="parameter-value-input"
          type="text"
          inputMode="decimal"
          aria-label={`${field.label} exact value`}
          value={valueDraft}
          onBlur={resetInvalidDraft}
          onChange={(event) => updateDraft(event.target.value)}
        />
      </div>
      <div className="parameter-slider-bounds" aria-hidden="true">
        <span>{formatNumericValue(min, field.step)}</span>
        <span>{formatNumericValue(max, field.step)}</span>
      </div>
    </div>
  );
};

const SwitchControl = ({
  field,
  value,
  inputId,
  labelledBy,
  onUpdateParam,
}) => {
  const isEnabled = value === true;
  const stateLabel = isEnabled
    ? (field.trueLabel ?? "On")
    : (field.falseLabel ?? "Off");
  const stateId = `${inputId}-state`;

  return (
    <div className="parameter-switch-row">
      <input
        id={inputId}
        className="parameter-switch-input"
        type="checkbox"
        checked={isEnabled}
        aria-labelledby={`${labelledBy} ${stateId}`}
        onChange={(event) => onUpdateParam(field.key, event.target.checked)}
      />
      <label className="parameter-switch" htmlFor={inputId}>
        <span className="parameter-switch-track" aria-hidden="true">
          <span className="parameter-switch-thumb" />
        </span>
        <span id={stateId} className="parameter-switch-state">
          {stateLabel}
        </span>
      </label>
    </div>
  );
};

const ParameterField = ({ field, value, onUpdateParam }) => {
  const reactId = useId();
  const inputId = `parameter-${reactId.replaceAll(":", "")}`;
  const labelId = `${inputId}-label`;
  const isNumeric = NUMERIC_CONTROLS.has(field.control);

  if (isNumeric) {
    return (
      <div className="parameter-field">
        <div id={labelId} className="parameter-label">
          {field.label}
        </div>
        <SliderControl
          field={field}
          value={value}
          labelledBy={labelId}
          onUpdateParam={onUpdateParam}
        />
      </div>
    );
  }

  if (field.control === "switch") {
    return (
      <div className="parameter-field">
        <div id={labelId} className="parameter-label">
          {field.label}
        </div>
        <SwitchControl
          field={field}
          value={value}
          inputId={inputId}
          labelledBy={labelId}
          onUpdateParam={onUpdateParam}
        />
      </div>
    );
  }

  if (field.control === "textarea") {
    return (
      <div className="parameter-field">
        <label id={labelId} className="parameter-label" htmlFor={inputId}>
          {field.label}
        </label>
        <textarea
          id={inputId}
          className="parameter-text-input parameter-textarea"
          value={value}
          onChange={(event) => onUpdateParam(field.key, event.target.value)}
        />
      </div>
    );
  }

  if (field.control === "select") {
    return (
      <div className="parameter-field">
        <label id={labelId} className="parameter-label" htmlFor={inputId}>
          {field.label}
        </label>
        <select
          id={inputId}
          className="parameter-select"
          value={String(value)}
          onChange={(event) => onUpdateParam(field.key, event.target.value)}
        >
          {field.options.map((option) => (
            <option key={option} value={String(option)}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="parameter-field">
      <label id={labelId} className="parameter-label" htmlFor={inputId}>
        {field.label}
      </label>
      <input
        id={inputId}
        className="parameter-text-input"
        type="text"
        value={value}
        onChange={(event) => onUpdateParam(field.key, event.target.value)}
      />
    </div>
  );
};

const SECTION_DEFINITIONS = [
  { key: "layout", title: "Video layout", className: "parameter-grid-compact" },
  { key: "primary", title: "Scene content", className: "" },
  { key: "animation", title: "Animation", className: "" },
];

export const PluginParamsPanel = ({
  title = "Parameters",
  description = "",
  fields,
  pluginParams,
  onUpdateParam,
}) => {
  const safeFields = useMemo(
    () => (Array.isArray(fields) ? fields : []),
    [fields]
  );
  const [copyState, setCopyState] = useState("idle");
  const copyResetTimerRef = useRef(null);

  const sections = useMemo(() => {
    const knownSectionKeys = new Set(
      SECTION_DEFINITIONS.map((section) => section.key)
    );
    const resolvedSections = SECTION_DEFINITIONS.map((section) => ({
      ...section,
      fields: safeFields.filter((field) => field.section === section.key),
    }));
    const additionalFields = safeFields.filter(
      (field) => !knownSectionKeys.has(field.section)
    );

    if (additionalFields.length > 0) {
      resolvedSections.push({
        key: "additional",
        title: "Additional",
        className: "",
        fields: additionalFields,
      });
    }

    return resolvedSections.filter((section) => section.fields.length > 0);
  }, [safeFields]);

  useEffect(
    () => () => {
      if (copyResetTimerRef.current) {
        window.clearTimeout(copyResetTimerRef.current);
      }
    },
    []
  );

  const handleCopyParams = useCallback(async () => {
    if (copyResetTimerRef.current) {
      window.clearTimeout(copyResetTimerRef.current);
    }

    try {
      await copyText(JSON.stringify(pluginParams, null, 2));
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }

    copyResetTimerRef.current = window.setTimeout(() => {
      setCopyState("idle");
    }, 1800);
  }, [pluginParams]);

  const copyButtonLabel =
    copyState === "copied"
      ? "Copied"
      : copyState === "error"
        ? "Copy failed"
        : "Copy params";

  return (
    <div className="parameter-panel">
      <header className="parameter-panel-header">
        <div className="parameter-panel-heading">
          <div className="parameter-panel-eyebrow">Live controls</div>
          <h1 className="parameter-panel-title">{title}</h1>
        </div>
        <button
          className="parameter-copy-button"
          type="button"
          data-state={copyState}
          onClick={handleCopyParams}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            width="14"
            height="14"
          >
            {copyState === "copied" ? (
              <path
                d="m4.5 10 3.25 3.25L15.5 5.5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            ) : (
              <>
                <rect
                  x="6.5"
                  y="6.5"
                  width="9"
                  height="9"
                  rx="1.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M13.5 6.5V5A1.5 1.5 0 0 0 12 3.5H5A1.5 1.5 0 0 0 3.5 5v7A1.5 1.5 0 0 0 5 13.5h1.5"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.5"
                />
              </>
            )}
          </svg>
          <span>{copyButtonLabel}</span>
        </button>
        <span className="visually-hidden" aria-live="polite">
          {copyState === "copied"
            ? "Current parameters copied to clipboard."
            : copyState === "error"
              ? "Could not copy current parameters."
              : ""}
        </span>
      </header>

      {description ? (
        <p className="parameter-panel-description">{description}</p>
      ) : null}

      <div className="parameter-sections">
        {sections.map((section) => (
          <section className="parameter-section" key={section.key}>
            <h2 className="parameter-section-title">{section.title}</h2>
            <div
              className={`parameter-fields ${section.className}`.trim()}
            >
              {section.fields.map((field) => (
                <ParameterField
                  key={field.key}
                  field={field}
                  value={pluginParams[field.key]}
                  onUpdateParam={onUpdateParam}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};
