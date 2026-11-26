import "../Input/input.css";
import "./select.css";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  id: string;
  name?: string;
  label: string;
  options: SelectOption[];
  /** Shown as a disabled first option while nothing is selected. */
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  required?: boolean;
  /** Error message to show, e.g. a field error from an API response. */
  error?: string;
  onChange?: (value: string, e: Event) => void;
}

export function Select(props: SelectProps) {
  return (
    <div className={`form-field ${props.error ? "invalid" : ""}`}>
      <label htmlFor={props.id}>{props.label}</label>
      <select
        id={props.id}
        name={props.name}
        value={props.value}
        defaultValue={props.defaultValue}
        required={props.required}
        aria-invalid={props.error ? true : undefined}
        onChange={(e) =>
          props.onChange?.((e.target as HTMLSelectElement).value, e)}
      >
        {props.placeholder !== undefined && (
          <option value="" disabled={props.required}>
            {props.placeholder}
          </option>
        )}
        {props.options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {props.error && <p class="form-hint">{props.error}</p>}
    </div>
  );
}
