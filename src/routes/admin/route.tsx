import { LoginForm } from "@/features/admin/LoginForm";
import { AdminAuthProvider, useAdminAuth } from "@/lib/adminAuth";
import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "短冊管理画面" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <AdminAuthProvider>
      <AdminGate />
    </AdminAuthProvider>
  );
}

// 資格情報が無い間はログインフォームを表示するガード
function AdminGate() {
  const { credentials } = useAdminAuth();

  if (!credentials) {
    return <LoginForm />;
  }

  return <Outlet />;
}
