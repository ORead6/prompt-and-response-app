import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        // Parse the request body
        const body = await req.json();
        const { promptId, page, page_size } = body;

        // Validate the request data
        if (!promptId || page === undefined || page_size === undefined) {
            return NextResponse.json(
                { success: false, error: "Prompt ID, Page and Page Size are required" },
                { status: 400 }
            );
        }

        // Create Supabase Client
        const supabase = await createClient();

        // Get Responses from Supabase
        const { data, error } = await supabase
            .from("responses")
            .select("*")
            .eq("prompt_id", promptId)
            .order("created_at", { ascending: false })
            .range(page * page_size, (page + 1) * page_size - 1);
        
        if (error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        // Return success response
        return NextResponse.json({
            success: true,
            responses: data
        }, { status: 200 });

    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json(
            { success: false, error: "Failed to process request" },
            { status: 500 }
        );
    }
}