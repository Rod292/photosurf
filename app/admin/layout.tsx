import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";

export default async function AdminLayout({ children }: PropsWithChildren) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
  }

    return (
        <div>
            <div className="bg-gray-100 p-4 flex justify-between items-center">
                <div>
                    <span className="text-sm text-gray-600">Connecté en tant que: </span>
                    <span className="font-medium">{user.email}</span>
                </div>
                <a 
                    href="/logout" 
                    className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                    Se déconnecter
                </a>
            </div>
            {children}
        </div>
    );
} 