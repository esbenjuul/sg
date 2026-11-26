import "../Input/input.css";

export interface TextareaProps {
  id: string;
  name?: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  maxLength?: number;
  value?: string;
  /** Error message to show, e.g. a field error from an API response. */
  error?: string;
  onInput?: (value: string, e: Event) => void;
}

export function Textarea(props: TextareaProps) {
  return (
    <div className={`form-field ${props.error ? "invalid" : ""}`}>
      <label htmlFor={props.id}>{props.label}</label>
      <textarea
        id={props.id}
        name={props.name}
        rows={props.rows ?? 3}
        maxLength={props.maxLength}
        placeholder={props.placeholder}
        required={props.required}
        aria-invalid={props.error ? true : undefined}
        value={props.value}
        onInput={(e) =>
          props.onInput?.((e.target as HTMLTextAreaElement).value, e)}
      />
      {props.error && <p class="form-hint">{props.error}</p>}
    </div>
  );
}
