import { useState } from "preact/hooks";
import { fetchApi, formToObject } from "@/api/client.ts";
import { signup } from "@/api/contracts/auth.ts";
import type { ApiErrorBody, InputOf } from "@/api/contract.ts";
import { Input } from "../components/Input/Input.tsx";

export default function SignupForm() {
  const [error, setError] = useState<ApiErrorBody["error"] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Password length + match rules come from the contract, so they run here
    // first and again on the server.
    const res = await fetchApi(
      signup,
      formToObject(e.currentTarget as HTMLFormElement) as InputOf<
        typeof signup
      >,
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
    <form method="post" onSubmit={handleSubmit} noValidate>
      {error && !error.fields && (
        <div class="error-message">{error.message}</div>
      )}

      <Input
        type="text"
        id="name"
        name="name"
        label="Full Name"
        placeholder="John Doe"
        required
        error={field("name")}
      />

      <Input
        type="email"
        id="email"
        name="email"
        label="Email Address"
        required
        placeholder="you@example.com"
        error={field("email")}
      />

      <Input
        type="password"
        id="password"
        name="password"
        label="Password"
        required
        placeholder="••••••••"
        error={field("password")}
      />

      <Input
        type="password"
        id="password-confirm"
        name="passwordConfirm"
        label="Confirm Password"
        required
        placeholder="••••••••"
        error={field("passwordConfirm")}
      />

      <button
        type="submit"
        disabled={loading}
        class="btn btn-primary"
        style="width: 100%"
      >
        {loading ? "Creating account..." : "Create Account"}
      </button>
    </form>
  );
}
