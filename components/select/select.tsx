
import { useRef, useState } from "preact/hooks";
import { SelectHTMLAttributes } from "preact";

import "../Input/input.css";
import "./select.css";


export function Select(props) {
  const [valid, setValid] = useState(true);
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLSelectElement>(null);

  const onChange = (e: Event) => {
    
    if (props.onChange) {
      props.onChange(e);
    }
  };
  return (
    <div className={`form-field ${valid ? "" : "invalid"}`}>
      <label htmlFor={props.id}>{props.label}</label>
      <select
        id={props.id}
        name={props.name}
        defaultValue={props.defaultValue}
        value=""
        onChange={onChange}
        required={props.required}
        ref={inputRef}
      >

      </select>
      {!valid && <p class="form-hint">{message}</p>}
    </div>
  );
}
