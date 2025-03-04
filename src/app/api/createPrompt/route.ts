import { NextResponse, NextRequest } from "next/server";
import { v4 as uuid } from "uuid";
import { createClient } from "@/utils/supabase/server";

// Prompt
interface RequestData {
  title: string;
  prompt: string | null;
}

// API Response
// Allow for null prompt and author
// Allow for null author as this is for user auth 
interface ResponseData {
  success: boolean;
  data?: {
    id: string;
    title: string;
    prompt: string | null;
    author: string | null;
  };
}

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body: RequestData = await req.json();

    // Validate the request data
    if (!body.title) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 }
      );
    }

    // Create Supabase Client
    const supabase = await createClient();

    const { data, error: sessionError } = await supabase.auth.getUser();

    if (sessionError) {
      return NextResponse.json(
        { success: false, error: sessionError.message },
        { status: 500 }
      );
    }

    // Check if user is authenticated
    if (!data.user) {
      return NextResponse.json(
        { success: false, error: "User is not authenticated" },
        { status: 401 }
      );
    }

    // Get UUID from session
    const userID = data.user.id;

    // Get Username from supabase profiles
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", userID);

    if (profileError) {
      return NextResponse.json(
        { success: false, error: profileError.message },
        { status: 500 }
      );
    }

    // Gen Prompt UUID
    const promptID = uuid();

    // Create Prompt Object
    const promptData = {
      id: promptID,
      title: body.title,
      prompt: body.prompt,
      author: profileData[0].username,
    };

    // Insert Prompt into Supabase
    const { error } = await supabase.from("prompts").insert([promptData]);

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
        id: promptID,
        title: body.title,
        prompt: body.prompt,
        author: userID!,
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
