# React Router — Best Practices & Folder Structure

> A reference guide for agents and developers building React applications with React Router v6+.

---

## Recommended Folder Structure

```
src/
├── app/                        # App-level setup
│   ├── router.tsx              # Route definitions (centralized)
│   ├── App.tsx
│   └── providers.tsx           # Context, QueryClient, etc.
│
├── pages/                      # Route-level components (one per route)
│   ├── Home/
│   │   ├── index.tsx
│   │   ├── Home.tsx
│   │   └── Home.test.tsx
│   ├── Dashboard/
│   │   ├── index.tsx
│   │   ├── Dashboard.tsx
│   │   └── components/         # Page-specific components
│   │       └── StatsCard.tsx
│   └── NotFound/
│       └── index.tsx
│
├── layouts/                    # Shared layout wrappers
│   ├── RootLayout.tsx
│   ├── AuthLayout.tsx
│   └── DashboardLayout.tsx
│
├── components/                 # Shared/global UI components
│   ├── ui/
│   └── common/
│
├── features/                   # Feature-based modules (large apps)
│   └── auth/
│       ├── pages/
│       ├── components/
│       └── hooks/
│
├── hooks/                      # Global custom hooks
├── lib/                        # Utilities, helpers, route constants
└── types/                      # Global TypeScript types
```

---

## 1. Centralize Route Definitions

Keep all routes in one file. Never scatter `<Route>` components across the app.

```tsx
// app/router.tsx
import { createBrowserRouter } from "react-router-dom";
import RootLayout from "@/layouts/RootLayout";
import AuthLayout from "@/layouts/AuthLayout";
import ErrorPage from "@/pages/ErrorPage";

// Lazy loaded pages
const Home = lazy(() => import("@/pages/Home"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Settings = lazy(() => import("@/pages/Dashboard/Settings"));
const Login = lazy(() => import("@/pages/Login"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { path: "about", element: <About /> },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Dashboard /> },
          { path: "settings", element: <Settings /> },
        ],
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
    ],
  },
]);
```

---

## 2. Use Layout Routes with `<Outlet />`

Layouts wrap shared UI (navbar, sidebar, footer) around child routes.

```tsx
// layouts/RootLayout.tsx
import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RootLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
```

```tsx
// layouts/DashboardLayout.tsx
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
```

---

## 3. Protect Routes with a Wrapper Component

Never do auth checks inside pages. Use a dedicated `ProtectedRoute` wrapper.

```tsx
// components/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageLoader />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
```

---

## 4. Lazy Load All Pages

Always lazy load page-level components. Wrap with `<Suspense>` at the router or layout level.

```tsx
import { lazy, Suspense } from "react";

const Dashboard = lazy(() => import("@/pages/Dashboard"));

// In router:
{
  path: "dashboard",
  element: (
    <Suspense fallback={<PageLoader />}>
      <Dashboard />
    </Suspense>
  ),
}
```

> **Tip:** Wrap `<Suspense>` around `<RouterProvider>` at the top level so all lazy routes are covered automatically.

```tsx
// App.tsx
<Suspense fallback={<FullPageLoader />}>
  <RouterProvider router={router} />
</Suspense>
```

---

## 5. Add `errorElement` for Error Boundaries

Attach error elements at the root and optionally at nested segments.

```tsx
// pages/ErrorPage.tsx
import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>{error.status} — {error.statusText}</h1>
        <Link to="/">Go Home</Link>
      </div>
    );
  }

  return <h1>An unexpected error occurred.</h1>;
}
```

---

## 6. Use Route Constants

Never hardcode path strings across the app. Define them once.

```ts
// lib/routes.ts
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  DASHBOARD_SETTINGS: "/dashboard/settings",
  PRODUCT: (id: string) => `/products/${id}`,
} as const;
```

```tsx
// Usage
import { ROUTES } from "@/lib/routes";

<Link to={ROUTES.PRODUCT("abc123")}>View Product</Link>
<Navigate to={ROUTES.LOGIN} replace />
```

---

## 7. Type-Safe Route Params

Wrap `useParams()` in typed hooks to avoid raw string access.

```ts
// hooks/useTypedParams.ts
import { useParams } from "react-router-dom";

export function useProductId(): string {
  const { id } = useParams<{ id: string }>();
  if (!id) throw new Error("Route param 'id' is missing");
  return id;
}

// Usage in page
const id = useProductId();
```

---

## 8. Handle Redirects Cleanly

Use `<Navigate>` for declarative redirects and `useNavigate` for imperative ones.

```tsx
// Declarative — in JSX
<Navigate to={ROUTES.DASHBOARD} replace />

// Imperative — after form submit, API call, etc.
const navigate = useNavigate();

async function handleLogin() {
  await login(credentials);
  navigate(ROUTES.DASHBOARD, { replace: true });
}
```

---

## 9. Pass State Between Routes

Use `state` for transient data (e.g., redirect origin, flash messages).

```tsx
// Sender
<Navigate to="/login" state={{ from: location }} replace />

// Receiver
const location = useLocation();
const from = location.state?.from?.pathname ?? ROUTES.DASHBOARD;
navigate(from, { replace: true });
```

---

## 10. Use `index` Routes for Default Children

Always define an `index: true` child for parent routes to avoid blank layouts.

```tsx
{
  path: "dashboard",
  element: <DashboardLayout />,
  children: [
    { index: true, element: <DashboardHome /> },  // renders at /dashboard
    { path: "settings", element: <Settings /> },   // renders at /dashboard/settings
  ],
}
```

---

## Anti-Patterns to Avoid

| ❌ Anti-Pattern | ✅ Best Practice |
|---|---|
| Scattering `<Route>` across components | Centralize all routes in `router.tsx` |
| Eager importing all page components | Lazy load with `React.lazy` |
| Hardcoding path strings (`"/dashboard"`) | Use `ROUTES` constants |
| Auth checks inside page components | Use `<ProtectedRoute>` wrapper |
| No `errorElement` on routes | Add error boundaries per route segment |
| Raw `useParams()` without type safety | Wrap in typed param hooks |
| Nesting layouts inside pages | Use layout routes with `<Outlet />` |
| Forgetting `replace` on auth redirects | Always use `replace` for auth navigation |

---

## Quick Checklist for Agents

- [ ] All routes defined in a single `router.tsx`
- [ ] Layout routes use `<Outlet />` — no repeated nav/footer
- [ ] All pages are lazy loaded with `React.lazy`
- [ ] `<Suspense>` wraps `<RouterProvider>` at the top level
- [ ] `errorElement` set on root and sensitive nested routes
- [ ] Auth protection handled by `<ProtectedRoute>`, not inside pages
- [ ] Path strings centralized in `ROUTES` constants
- [ ] Route params accessed via typed hooks
- [ ] `replace: true` used on all auth-related navigations
- [ ] `index: true` defined for all parent layout routes

---

> **Note for Next.js (App Router) users:** Next.js uses file-system routing instead of React Router. However, the layout, lazy loading, auth protection, and error boundary concepts map directly to `layout.tsx`, `loading.tsx`, `error.tsx`, and middleware.
