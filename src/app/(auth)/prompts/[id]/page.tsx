"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import ResponseCreator from "@/components/responseCreator";
import ResponseViewer from "@/components/responseViewer";
import { createClient } from "@/utils/supabase/client";

const PromptViewer = () => {
  // Get Prompt ID from URL
  const params = useParams();
  const router = useRouter();

  // States
  const [promptData, setPromptData] = useState({
    title: "",
    prompt: "",
    created_at: "",
    author: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [responses, setResponses] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [isLoadingResponses, setIsLoadingResponses] = useState(false);
  const [hasMoreResponses, setHasMoreResponses] = useState(true);
  const loadingRef = useRef(null);
  const channelRef = useRef<any>(null);

  const promptID = params.id;
  const PAGE_SIZE = 10; // Number of responses per page

  // Fetch Prompt Data
  const fetchPrompt = async () => {
    setIsLoading(true);

    // API Call
    try {
      const response = await fetch("/api/getSpecificPrompt", {
        method: "POST",
        body: JSON.stringify({ id: promptID }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed with status: ${response.status}`, errorText);
        throw new Error(`Failed to fetch prompt: ${response.status}`);
      }

      // Get the response data
      const responseData = await response.json();
      console.log("Fetched data:", responseData);

      // Set State
      setPromptData(responseData.promptData);
    } catch (error) {
      console.error("Error fetching prompt:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch responses for the prompt
  const fetchResponses = async () => {
    if (isLoadingResponses || !hasMoreResponses) return;

    setIsLoadingResponses(true);

    try {
      const response = await fetch("/api/getResponses", {
        method: "POST",
        body: JSON.stringify({
          promptId: promptID,
          page,
          page_size: PAGE_SIZE,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed with status: ${response.status}`, errorText);
        throw new Error(`Failed to fetch responses: ${response.status}`);
      }

      // Get the response data
      const responseData = await response.json();

      // Extract the responses array from the response
      const newResponses = responseData.responses || [];

      if (newResponses.length < PAGE_SIZE) {
        setHasMoreResponses(false);
      }

      // Add the new responses to the existing ones
      setResponses((prevResponses) => {
        // Filter out duplicates before adding
        const existingIds = new Set(prevResponses.map((r) => r.id));
        const uniqueNewResponses = newResponses.filter(
          (r: any) => !existingIds.has(r.id)
        );
        return [...prevResponses, ...uniqueNewResponses];
      });
      setPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.error("Error fetching responses:", error);
    } finally {
      setIsLoadingResponses(false);
    }
  };

  // Fetch the prompt data on load
  useEffect(() => {
    fetchPrompt();
    fetchResponses();
    channelRef.current = realTimeResponses();

    return () => {
      channelRef.current?.unsubscribe();
    };
  }, []);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchResponses();
        }
      },
      { threshold: 1.0 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => {
      if (loadingRef.current) {
        observer.unobserve(loadingRef.current);
      }
    };
  }, [page, isLoadingResponses, hasMoreResponses]);

  // Handle real-time response insertions
  const handleRealTimeInsert = (payload: any) => {
    const { new: newResponse } = payload;
    // Only add the response if it's for the current prompt
    if (newResponse.prompt_id === promptID) {
      // Check if the response already exists to avoid duplicates
      setResponses((prevResponses) => {
        // Check if the response already exists in our state
        if (!prevResponses.some((response) => response.id === newResponse.id)) {
          return [newResponse, ...prevResponses];
        }
        return prevResponses;
      });
    }
  };

  // Establish Realtime connection to supabase
  const realTimeResponses = () => {
    const supabase = createClient();
    const channel = supabase.channel("responses");

    channel
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "responses",
        },
        (payload) => {
          switch (payload.eventType) {
            case "INSERT":
              handleRealTimeInsert(payload);
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("Realtime Connection Established");
        } else {
          return;
        }
      });

    return channel;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        {/* Back Button */}
        <Button
          onClick={() => router.push("/prompts")}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Prompts
        </Button>
      </div>

      <Card className="border-none shadow-none">
        <CardHeader className="px-0">
          {/* Skeleton for loading prompt */}
          {isLoading ? (
            <Skeleton className="h-8 w-3/4 mx-auto mb-2" />
          ) : (
            <div className="flex flex-col gap-1">
              {/* Prompt Title */}
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-semibold">
                  {promptData.title}
                </CardTitle>
              </div>

              {/* Prompt Creation Time */}
              <div className="text-xs text-muted-foreground">
                {promptData.author}{" "}
                {formatDistanceToNow(new Date(promptData.created_at), {
                  addSuffix: true,
                })}
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="px-0">
          {/* Skeleton */}
          {isLoading ? (
            <>
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-6 w-5/6 mb-2" />
              <Skeleton className="h-6 w-full" />
            </>
          ) : (
            // Prompt Content
            <div className="rounded-lg whitespace-pre-wrap text-sm md:text-base leading-relaxed font-light">
              {promptData.prompt}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response Creator */}
      <div className="mt-8 mb-8">
        <h2 className="text-xl font-semibold mb-4">Create Response</h2>
        <ResponseCreator promptID={promptID as string} />
      </div>

      {/* Responses Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Responses</h2>

        {responses.length === 0 && !isLoadingResponses ? (
          <div className="rounded-lg border border-dashed p-8 flex flex-col items-center justify-center gap-4 bg-muted/30">
            <div className="rounded-full bg-primary/10 p-3">
              <MessageSquare className="h-8 w-8 text-primary/60" />
            </div>
            <div className="text-center">
              <h3 className="font-medium text-base">No responses yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Be the first to share your thoughts on this prompt!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {responses.map((response, index) => (
              <div
                key={response.id}
                className="border rounded-lg p-4 shadow-sm"
              >
                <div className="text-xs text-muted-foreground mb-2">
                  {response.author || "Anonymous"} {formatDistanceToNow(new Date(response.created_at), {
                    addSuffix: true,
                  })}
                </div>
                <ResponseViewer responseContent={response.content} />
              </div>
            ))}

            {/* Loading indicator */}
            {hasMoreResponses && (
              <div ref={loadingRef} className="py-4 text-center">
                {isLoadingResponses ? (
                  <div className="flex justify-center">
                    <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <div className="h-10"></div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptViewer;
