import {HTMLAttributes} from 'preact'
import { useRef, useState } from "preact/hooks";
import "./button.css";

export interface ButtonProps extends HTMLAttributes {
    buttonType: 'primary' | 'secondary' | 'tertery';
    loading: boolean; 
    
} 

export function Button(props: ButtonProps) {
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLButtonElement>(null);

  
  return (
    <button class={`button button-${props.buttonType}`} type={props.type} disabled={props.disabled}>
        <div>{props.children}</div>
    </button>
  );
}
