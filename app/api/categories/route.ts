import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, icon, user_id } = body;

        if (!name || !user_id) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // We use the service_role key to bypass RLS, OR if it's not available, 
        // we use the anon key. If RLS blocks anon, the user needs to provide service_role or disable RLS.
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data, error } = await supabase
            .from("categories")
            .insert({ name, icon, user_id })
            .select()
            .single();

        if (error) {
            console.error("API Category Insert Error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ category: data });

    } catch (error: any) {
        console.error("API Route Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
