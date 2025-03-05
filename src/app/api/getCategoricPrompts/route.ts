import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Categories to find
interface RequestData {
    categories: string[];
}

// API Response
interface ResponseData {
    prompts: any[] | null;
    success: boolean;
}

export async function POST(req: NextRequest) {
    try {
        // Parse the request body
        const body: RequestData = await req.json();

        // Validate the request data
        if (!body.categories) {
            return NextResponse.json(
                { success: false, error: "Prompt Category is Required for this API to run" },
                { status: 400 }
            );
        }

        // Create Supabase Client
        const supabase = await createClient();

        const { data: sessionData, error: sessionError } = await supabase.auth.getUser();

        if (sessionError) {
            return NextResponse.json(
                { success: false, error: sessionError.message },
                { status: 500 }
            );
        }

        // Check if user is authenticated
        if (!sessionData.user) {
            return NextResponse.json(
                { success: false, error: "User is not authenticated" },
                { status: 401 }
            );
        }


        // Get prompts where all of the categories that are passed are in the categories column
        const { data, error } = await supabase
            .from("prompts")
            .select("*")
            .contains("categories", body.categories)

        const response: ResponseData = {
            prompts: data,
            success: true
        }

        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json(
            { success: false, error: "Failed to process request" },
            { status: 500 }
        );
    }
}
