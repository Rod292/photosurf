import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";

export default async function AdminLayout({ children }: PropsWithChildren) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
  }

    return <>{children}</>;
} 