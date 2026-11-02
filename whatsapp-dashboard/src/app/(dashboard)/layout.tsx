import { Sidebar } from "@/components/Sidebar";
import { createClient } from "@/utils/supabase/server";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let role = "MEMBRO"; // Default
  if (user) {
    const { data: profile } = await supabase
      .from("userprofile")
      .select("role")
      .eq("userid", user.id)
      .single();
      
    if (profile && profile.role) {
      role = profile.role;
    }
  }

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden w-full">
      <Sidebar userRole={role} />
      <main className="flex-1 overflow-y-auto bg-slate-50 relative">
        <div className="max-w-7xl mx-auto py-4 md:py-6 w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
