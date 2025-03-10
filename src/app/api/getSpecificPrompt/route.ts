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
    categories: string[];
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

    // Get Prompt from Supabase using Prompt ID passed in req.body
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
      promptData: data,
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
