import { HTMLAttributes } from "preact";
import './card.css';
export interface CardProps extends HTMLAttributes {
    title: string;
    text: string;
    img: string;
    onClick?: (e:Event) => void;
    href: string;
    
    
} 
export default function Card(props: CardProps) {
    return (
        
            <a class="card" onClick={props.onClick} href={props.href}>
                <div class="card-header">
                        <h3>{props.title}</h3>
                        <figure class="icon">
                            <img src={props.img} alt=""></img>
                        </figure>
                </div>
                <p>
                    {props.text}
                </p>
            </a>
        
    );
}