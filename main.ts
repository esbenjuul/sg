import "@std/dotenv/load";
import { App, staticFiles } from "fresh";
import { authMiddleware, type AuthState } from "./middleware/auth.ts";
import { DashboardLayout } from "./components/layouts/dashboard.tsx";
export const app = new App<AuthState>();

app.use(staticFiles());

// Layouts
app.layout("/dashboard", DashboardLayout, { skipInheritedLayouts: true });
// Auth middleware
app.use(authMiddleware);

// Enable file-system based routing
app.fsRoutes();
