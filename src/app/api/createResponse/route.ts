import { NextResponse, NextRequest } from "next/server";
import { v4 as uuid } from "uuid";
import { createClient } from "@/utils/supabase/server";

// Response
interface RequestData {
  content: {};
  promptId: string;
  author: string | null;
}

// API Response
// Allow for null prompt and author
// Allow for null author as this is for user auth
interface ResponseData {
  success: boolean;
  data?: {
    id: string;
    prompt_id: string;
    content: {};
    author?: string | null;
  };
}

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body: RequestData = await req.json();

    // Validate the request data
    if (!body.content || !body.promptId) {
      return NextResponse.json(
        { success: false, error: "Rich Content and PromptID is required" },
        { status: 400 }
      );
    }

    // Create Supabase Client
    const supabase = await createClient();

    const { data, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      return NextResponse.json(
        { success: false, error: sessionError.message },
        { status: 500 }
      );
    }

    // Check if user is authenticated
    if (!data) {
      return NextResponse.json(
        { success: false, error: "User is not authenticated" },
        { status: 401 }
      );
    }

    // Gen Prompt UUID
    const responseID = uuid();

    // Create response Object
    const responseData = {
      id: responseID,
      prompt_id: body.promptId,
      content: body.content as string,
      author: body.author || null,
    };

    // Insert Prompt into Supabase
    const { error } = await supabase.from("responses").insert([responseData]);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Return success response
    const response: ResponseData = {
      success: true,
      data: {
        id: responseID,
        prompt_id: body.promptId,
        content: body.content as string,
        author: body.author || "",
      },
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
