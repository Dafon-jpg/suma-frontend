import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { userId, email, name } = body;

        if (!userId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data, error } = await supabase
            .from("users")
            .update({ email: email, name: name })
            .eq("id", userId)
            .select()
            .single();

        if (error) {
            console.error("API Settings Update Error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ user: data });

    } catch (error: any) {
        console.error("API Route Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
