import { define } from "../utils/state.ts";
import SignupForm from "../islands/SignupForm.tsx";

export default define.page<void>(function SignupPage(ctx) {
  const { user } = ctx.state;

  // Redirect if already logged in
  if (user) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/dashboard" },
    });
  }

  return (
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h2>Create Account</h2>
          <p>Sign up to get started</p>
        </div>

        <SignupForm />

        <div class="auth-footer">
          <p>
            Already have an account? <a href="/login">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
});
