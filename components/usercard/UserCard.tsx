import "./usercard.css";
import { UserDetails } from "../../models/user/types.ts";
import { Avatar } from "../avatar/avatar.tsx";
import { PhoneIcon } from "../icons/PhoneIcon.tsx";
import { MailIcon } from "../icons/MailIcon.tsx";
import { Button } from "../button/button.tsx";
import { Tag } from "../tag/Tag.tsx";
import { BinIcon, UsersIcon } from "../icons/index.ts";
import { ObjectId } from "mongodb";
export interface UserCardProps {
  user: UserDetails;
  onEdit: (userId: ObjectId) => void;
  onDelete: (userId: ObjectId) => void;
}

export function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  const { name, email, mobile, role } = user;
  return (
    <article class="user-card">
      <header>
        <Avatar name={name} manchet={role} />
      </header>
      <div class="user-info">
        <div class="detail">
          <PhoneIcon />
          <span>{mobile}</span>
        </div>
        <div class="detail">
          <MailIcon />
          <span>{email}</span>
        </div>
      </div>
      <hr />
      <div class="detail">
        <UsersIcon />
        <span>2 aktive hold - 3 total</span>
      </div>
      <div>
        <Tag>Micropiger</Tag>
      </div>
      <hr />
      <footer>
        <Button buttonType="secondary" onClick={() => onEdit(user._id)}>
          Rediger
        </Button>
        <Button buttonType="danger" onClick={() => onDelete(user._id)}>
          <BinIcon />
        </Button>
      </footer>
    </article>
  );
}
