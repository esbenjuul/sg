import { useState } from "preact/hooks";
import { Input } from "../components/Input/Input.tsx";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const body = new FormData(e.target as HTMLFormElement);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        body,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
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
    <form onSubmit={handleSubmit}>
      {error && (
        <div class="error-message">
          {error}
        </div>
      )}

   
      <Input
        type="email"
        id="email"
        label="Email Address"
        name="email"
        value={email}
        onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
        required
        placeholder="you@example.com"
      />
    
  
      <Input
        type="password"
        label="Password"
        id="password"
        name="password"
        value={password}
        onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
        required
        placeholder="••••••••"
      />
  

      <button
        type="submit"
        disabled={loading}
        class="btn btn-primary"
        style="width: 100%"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
