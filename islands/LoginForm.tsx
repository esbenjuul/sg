import { useState } from "preact/hooks";
import { fetchApi, formToObject } from "@/api/client.ts";
import { login } from "@/api/contracts/auth.ts";
import type { ApiErrorBody, InputOf } from "@/api/contract.ts";
import { Input } from "../components/Input/Input.tsx";
import { Button } from "../components/button/button.tsx";

export default function LoginForm() {
  const [error, setError] = useState<ApiErrorBody["error"] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetchApi(
      login,
      formToObject(e.currentTarget as HTMLFormElement) as InputOf<typeof login>,
    );

    if (!res.ok) {
      setError(res.error);
      setLoading(false);
      return;
    }
    globalThis.location.href = "/dashboard";
  };

  const field = (name: string) => error?.fields?.[name]?.[0];

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && !error.fields && (
        <div class="error-message">{error.message}</div>
      )}

      <Input
        type="email"
        id="email"
        label="Email Address"
        name="email"
        required
        placeholder="you@example.com"
        error={field("email")}
      />

      <Input
        type="password"
        label="Password"
        id="password"
        name="password"
        required
        placeholder="••••••••"
        error={field("password")}
      />

      <Button type="submit" buttonType="primary" disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}
