import React from "react";

const formatRangeValue = (value, step) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return String(value ?? "");
  }

  const numericStep = Number(step);
  const decimals =
    Number.isFinite(numericStep) && numericStep > 0
      ? Math.max(0, (String(step).split(".")[1] || "").length)
      : 0;
  return numericValue.toFixed(decimals);
};

const renderFieldControl = (field, value, onUpdateParam) => {
  if (field.control === "textarea") {
    return (
      <textarea
        className="h-28 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-slate-500"
        value={value}
        onChange={(event) => onUpdateParam(field.key, event.target.value)}
      />
    );
  }

  if (field.control === "text") {
    return (
      <input
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-slate-500"
        type="text"
        value={value}
        onChange={(event) => onUpdateParam(field.key, event.target.value)}
      />
    );
  }

  if (field.control === "select") {
    return (
      <select
        className="w-full rounded border border-slate-300 bg-white px-2 py-1 font-mono text-xs text-slate-800"
        value={String(value)}
        onChange={(event) => onUpdateParam(field.key, event.target.value)}
      >
        {field.options.map((option) => (
          <option key={option} value={String(option)}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (field.control === "range") {
    return (
      <div className="flex items-center gap-2">
        <input
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-slate-700"
          type="range"
          min={field.min}
          max={field.max}
          step={field.step}
          value={value}
          onChange={(event) => onUpdateParam(field.key, event.target.value)}
        />
        <span className="min-w-10 text-right font-mono text-xs text-slate-600">
          {formatRangeValue(value, field.step)}
        </span>
      </div>
    );
  }

  if (field.control === "switch") {
    const isEnabled = value === true;
    return (
      <div className="flex items-center gap-3">
        <input
          className="h-4 w-4 cursor-pointer accent-slate-700"
          type="checkbox"
          checked={isEnabled}
          onChange={(event) => onUpdateParam(field.key, event.target.checked)}
        />
        <span className="font-mono text-xs text-slate-600">
          {isEnabled ? "dark" : "light"}
        </span>
      </div>
    );
  }

  return (
    <input
      className="w-full rounded border border-slate-300 bg-white px-2 py-1 font-mono text-xs text-slate-800"
      type="number"
      min={field.min}
      max={field.max}
      step={field.step}
      value={value}
      onChange={(event) => onUpdateParam(field.key, event.target.value)}
    />
  );
};

export const PluginParamsPanel = ({
  title = "Parameters",
  description = "",
  fields,
  pluginParams,
  onUpdateParam,
}) => {
  const safeFields = Array.isArray(fields) ? fields : [];
  const primaryFields = safeFields.filter((field) => field.section === "primary");
  const layoutFields = safeFields.filter((field) => field.section === "layout");
  const animationFields = safeFields.filter((field) => field.section === "animation");
  const extraFields = safeFields.filter(
    (field) => !["primary", "layout", "animation"].includes(field.section)
  );
  const hasLayoutFields = layoutFields.length > 0;
  const hasAnimationFields =
    primaryFields.length > 0 || animationFields.length > 0 || extraFields.length > 0;

  return (
    <>
      <div className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {title}
      </div>
      {description ? (
        <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-[11px] leading-relaxed text-slate-600">
          {description}
        </div>
      ) : null}

      {hasLayoutFields ? (
        <>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            Video Layout Params
          </div>
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            {layoutFields.map((field) => (
              <label key={field.key} className="block">
                <div className="mb-1 break-words text-xs leading-snug text-slate-600">
                  {field.label}
                </div>
                {renderFieldControl(field, pluginParams[field.key], onUpdateParam)}
              </label>
            ))}
          </div>
        </>
      ) : null}

      {hasLayoutFields && hasAnimationFields ? (
        <div className="mb-4 border-t border-slate-200" />
      ) : null}

      {hasAnimationFields ? (
        <>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            Default Animation Params (demoMotion)
          </div>

          {primaryFields.map((field) => (
            <label key={field.key} className="mb-4 block">
              <div className="mb-1 break-words text-xs leading-snug text-slate-600">
                {field.label}
              </div>
              {renderFieldControl(field, pluginParams[field.key], onUpdateParam)}
            </label>
          ))}

          {animationFields.length > 0 ? (
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              {animationFields.map((field) => (
                <label key={field.key} className="block">
                  <div className="mb-1 break-words text-xs leading-snug text-slate-600">
                    {field.label}
                  </div>
                  {renderFieldControl(field, pluginParams[field.key], onUpdateParam)}
                </label>
              ))}
            </div>
          ) : null}
        </>
      ) : null}

      {extraFields.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {extraFields.map((field) => (
            <label key={field.key} className="block">
              <div className="mb-1 break-words text-xs leading-snug text-slate-600">
                {field.label}
              </div>
              {renderFieldControl(field, pluginParams[field.key], onUpdateParam)}
            </label>
          ))}
        </div>
      ) : null}
    </>
  );
};
