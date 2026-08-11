import { define } from "../../utils/state.ts";
import { Input } from "@/components/Input/Input.tsx";
import { Button, Card, Select } from "@/components/index.ts";
import DesignDialog from "@/islands/DesignDialog.tsx";
import { PlusIcon } from "@/components/icons/PlusIcon.tsx";
import { ImportIcon } from "@/components/icons/ImportIcon.tsx";
import { DotsIcon } from "@/components/icons/DotsIcon.tsx";
import { ArrowLeftIcon } from "@/components/icons/ArrowLeftIcon.tsx";
import { PencilIcon } from "@/components/icons/Pencilicon.tsx";

const icons = [
  { name: "PlusIcon", Icon: PlusIcon },
  { name: "ImportIcon", Icon: ImportIcon },
  { name: "DotsIcon", Icon: DotsIcon },
  { name: "ArrowLeftIcon", Icon: ArrowLeftIcon },
  { name: "PencilIcon", Icon: PencilIcon },
];

export default define.page<void>(function Design() {
  return (
    <>
      <div class="container design-lib">
        <h1>Components</h1>
        <section class="content-box">
          <article>
            <h2>Input</h2>
            <div>
              <Input
                type="text"
                name="name"
                label="Team name"
                required
                placeholder="Junior team"
              />
            </div>
          </article>
          <article>
            <h2>Button</h2>
            <div class="components">
              {(["primary", "secondary", "tertery"] as const).map((t) => (
                <Button buttonType={t}>{t} Button</Button>
              ))}
            </div>
          </article>
          <article>
            <h2>Card</h2>
            <div class="components">
              <Card
                title="name"
                text="coachname"
                img="/img"
                href="link"
              />
            </div>
          </article>
          <article>
            <h2>Select</h2>
            <div>
              <Select
                id="category"
                name="category"
                label="Category"
                required
              />
            </div>
          </article>
          <article>
            <h2>Dialog</h2>
            <div class="components">
              <DesignDialog />
            </div>
          </article>
          <article>
            <h2>Icons</h2>
            <div class="components">
              {icons.map(({ name, Icon }) => (
                <div key={name} class="icon-preview">
                  <Icon />
                  <span>{name}</span>
                </div>
              ))}
            </div>
          </article>
          <article>
            <h2>PageLayout</h2>
            <p>
              Authenticated app shell with header, navigation, and main content
              wrapper. Used as the layout for protected routes.
            </p>
          </article>
        </section>
      </div>
    </>
  );
});
