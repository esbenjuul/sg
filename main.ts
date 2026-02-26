import "@std/dotenv/load";
import { App, staticFiles } from "fresh";
import { authMiddleware, type AuthState } from "./middleware/auth.ts";
import { PageLayout } from "./components/layouts/page.tsx";
export const app = new App<AuthState>();

app.use(staticFiles());

// Layouts
app.layout("/dashboard", PageLayout, { skipInheritedLayouts: true });
app.layout("/users", PageLayout, { skipInheritedLayouts: true });
// Auth middleware
app.use(authMiddleware);

// Enable file-system based routing
app.fsRoutes();
