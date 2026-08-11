import { useRef, useState } from "preact/hooks";
import "./input.css";

const MIN_LENGTH_MSG = (num: number) => `Must be at least ${num} characters`;
const MAX_LENGTH_MSG = (num: number) => `Must be at most ${num} characters`;

export function Input(props) {
  const [valid, setValid] = useState(true);
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const onInput = (e: Event) => {
    if (inputRef?.current) {
      setValid(inputRef?.current?.validity.valid);
    }
    console.log(inputRef?.current?.validity);
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
  return (
    <div className={`form-field ${valid ? "" : "invalid"}`}>
      <label htmlFor={props.id}>{props.label}</label>
      <input
        type={props.type}
        id={props.id}
        name={props.name}
        onInput={onInput}
        minLength={props.minLength}
        maxLength={props.maxLength}
        placeholder={props.placeholder}
        required={props.required}
        ref={inputRef}
      />
      {!valid && <p class="form-hint">{message}</p>}
    </div>
  );
}
