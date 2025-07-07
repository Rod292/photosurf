import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";
import { cookies } from "next/headers";

export default async function AdminLayout({ children }: PropsWithChildren) {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin-session');

    if (!adminSession || adminSession.value !== 'authenticated') {
        redirect('/login');
    }

    return (
        <div>
            <div className="bg-gray-100 p-4 flex justify-between items-center">
                <div>
                    <span className="text-sm text-gray-600">Connecté en tant que: </span>
                    <span className="font-medium">Administrateur</span>
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