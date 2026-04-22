import {ButtonHTMLAttributes} from 'preact'
import { useRef, useState } from "preact/hooks";
import "./button.css";

export interface ButtonProps extends ButtonHTMLAttributes {
    buttonType: 'primary' | 'secondary' | 'tertery';
    loading?: boolean;
    onClick?: (e:Event) => void;
    
    
} 

export function Button(props: ButtonProps) {
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLButtonElement>(null);
  const buttonClick = (e:Event) => {
    console.log(e);
    props.onClick ? props.onClick(e) : null;
  }
  
  return (
    <button onClick={buttonClick} class={`button button-${props.buttonType}`} type={props.type} disabled={props.disabled}>
        <div>{props.children}</div>
    </button>
  );
}
