import { useRef, useState } from "preact/hooks";
import "./input.css";

const MIN_LENGTH_MSG = (num: number) => `Must be at least ${num} characters`;
const MAX_LENGTH_MSG = (num: number) => `Must be at most ${num} characters`;

export function Input(props: {
  id: string;
  type: string;
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: number | "any";
  /** Unit shown inside the field's right edge, e.g. "t" or "kr.". */
  suffix?: string;
  value?: string;
  onInput?: (e: Event) => void;
  onChange?: (e: Event) => void;
  /** Error message to show, e.g. a field error from an API response. */
  error?: string;
}) {
  const [valid, setValid] = useState(true);
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const onInput = (e: Event) => {
    if (inputRef?.current) {
      setValid(inputRef?.current?.validity.valid);
    }

    if (!valid && props.minLength && inputRef?.current?.validity.tooShort) {
      setMessage(MIN_LENGTH_MSG(props.minLength));
    } else if (
      !valid && props.maxLength && inputRef?.current?.validity.tooLong
    ) {
      setMessage(MAX_LENGTH_MSG(props.maxLength));
    } else if (
      !valid && props.required && inputRef?.current?.validity.valueMissing
    ) {
      setMessage("This field is required");
    }
    if (props.onInput) {
      props.onInput(e);
    }
  };
  // An explicit `error` prop (e.g. from an API response) wins over native validity.
  const hint = props.error || (!valid ? message : "");
  const input = (
    <input
      type={props.type}
      id={props.id}
      name={props.name}
      onInput={onInput}
      minLength={props.minLength}
      maxLength={props.maxLength}
      min={props.min}
      max={props.max}
      step={props.step}
      placeholder={props.placeholder}
      required={props.required}
      aria-invalid={hint ? true : undefined}
      ref={inputRef}
      value={props.value}
      onChange={props.onChange}
    />
  );
  return (
    <div className={`form-field ${hint ? "invalid" : ""}`}>
      <label htmlFor={props.id}>{props.label}</label>
      {props.suffix
        ? (
          <div class="input-affix">
            {input}
            <span class="input-suffix" aria-hidden="true">{props.suffix}</span>
          </div>
        )
        : input}
      {hint && <p class="form-hint">{hint}</p>}
    </div>
  );
}
