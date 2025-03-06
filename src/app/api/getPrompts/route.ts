import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Prompt
interface RequestData {
  page: number;
  page_size: number;
  categories: string[] | null;
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
    if (!body.page === undefined || !body.page_size === undefined) {
      return NextResponse.json(
        { success: false, error: "Page and Page Size is required" },
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

    // Get Prompts from Supabase
    let data, error;

    // If not searching categories get all the prompts relevant
    if (!body.categories) {
      const result = await supabase
        .from("prompts")
        .select("*")
        .order("created_at", { ascending: false })
        .range(body.page * body.page_size, (body.page + 1) * body.page_size - 1);

      data = result.data;
      error = result.error;
    } 
    // If searching categories get the prompts relevant to the categories
    else {
      const result = await supabase
        .from("prompts")
        .select("*")
        .contains("categories", body.categories)
        .order("created_at", { ascending: false })
        .range(body.page * body.page_size, (body.page + 1) * body.page_size - 1);

      data = result.data;
      error = result.error;
    }

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Return success response
    const response: ResponseData = {
      success: true,
      prompts: data,
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
