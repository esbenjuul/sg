import { useState } from "preact/hooks";
import { Input } from "../components/Input/Input.tsx";

export default function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordTwo, setPasswordTwo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    console.log(e);
    // Validate password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }
    if (password !== passwordTwo) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    console.log(e.target);
    const body = new FormData(e.target as HTMLFormElement);
    console.log(body.keys());
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        body,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Signup failed");
        setLoading(false);
        return;
      }

      // Redirect to dashboard on success
      window.location.href = "/dashboard";
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form method="post" onSubmit={handleSubmit}>
      {error && (
        <div class="error-message">
          {error}
        </div>
      )}

      <Input
        type="text"
        id="name"
        name="name"
        label="Full Name"
        onInput={(e) => setName((e.target as HTMLInputElement).value)}
        placeholder="John Doe"
        minLength={6}
        required
      >
      </Input>

      <Input
        type="email"
        id="email"
        name="email"
        label="Email Address"
        onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
        required
        placeholder="you@example.com"
      />

      <Input
        type="password"
        id="password"
        name="password"
        label="Password"
        onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
        required
        minLength={6}
        placeholder="••••••••"
      />

      <Input
        type="password"
        id="password-two"
        name="passwordtwo"
        label="Confirm Password"
        onInput={(e) => setPasswordTwo((e.target as HTMLInputElement).value)}
        required
        minLength={6}
        placeholder="••••••••"
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
