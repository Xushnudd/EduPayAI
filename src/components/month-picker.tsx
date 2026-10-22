"use client";

export function MonthPicker({ month, error, onChange }: { month: string; error?: string; onChange: (month: string) => void }) {
  return <div className="field month-picker">
    <label htmlFor="debt-month">Hisoblanadigan oy</label>
    <input id="debt-month" name="month" type="month" min="0001-01" max="9999-12" value={month} required onChange={event => onChange(event.currentTarget.value)} aria-invalid={!!error} aria-describedby={error ? "debt-month-error" : "debt-month-help"} />
    {error ? <span id="debt-month-error" className="field-error">{error}</span> : <p id="debt-month-help" className="field-help">To‘lovlar to‘lov sanasidagi oyga hisoblanadi.</p>}
  </div>;
}
