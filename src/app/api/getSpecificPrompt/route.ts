import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Prompt
interface RequestData {
    id: string;
}

// API Response 
interface ResponseData {
    success: boolean;
    promptData: {
        id?: string;
        title?: string;
        prompt?: string;
        [key: string]: any;
        author: string;
    };
}

export async function POST(req: NextRequest) {
    try {
        // Parse the request body
        const body: RequestData = await req.json();

        // Validate the request data
        if (!body.id) {
            return NextResponse.json(
                { success: false, error: "Prompt ID is Required" },
                { status: 400 }
            );
        }

        // Create Supabase Client
        const supabase = await createClient();

        // Get Prompt from Supabase
        const { data, error } = await supabase
            .from("prompts")
            .select("*")
            .eq("id", body.id)
            .single(); // Ensure single prompt is retrieved
        
        if (error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        // Return success response
        const response: ResponseData = {
            success: true,
            promptData: data
        };

        return NextResponse.json(response, { status: 201 });

    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json(
            { success: false, error: "Failed to process request" },
            { status: 500 }
        );
    }
}