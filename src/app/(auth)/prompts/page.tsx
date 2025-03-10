"use client";

import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import NoPromptsCard from "@/components/EmptyPromptPlaceholder";
import { useRouter, redirect } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import CategoryEntryBar from "@/components/CategoryEntryBar";
import CategoryDisplayBar from "@/components/CategoryDisplayBar";

// Type for prompt data
type Prompt = {
  id: string;
  title: string;
  prompt: string | null;
  author: string | null;
  created_at: string;
  categories: string[] | null;
};

const PromptPage = () => {
  const router = useRouter();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(-1);
  const loadingRef = useRef(null);

  const [categories, setCategories] = useState<string[]>([]);

  const PAGE_SIZE = 10;

  // Define interface for request body
  interface PromptRequestBody {
    page: number;
    page_size: number;
    categories?: string[];
  }

  // Allows state management of categories from CategoryEntryBar
  const handleCategoryStateChange = (categories: string[]) => {
    setCategories(categories);
  };

  // Fetch prompts from the server
  const fetchPrompts = async (options?: { forceFetch?: boolean }) => {
    // If force fetch then forget about loading or has more as it is a fresh fetch
    // Have to do this for category search and infinte loader to work together
    const forceFetch = options?.forceFetch ?? false;
    if (!forceFetch && (isLoading || !hasMore)) return;

    setIsLoading(true);

    let nextPage: number;
    if (forceFetch) {
      nextPage = 0;
    } else {
      nextPage = page + 1;
    }

    setPage(nextPage);

    try {
      // Only include categories in the request body if there are any
      let reqBody: PromptRequestBody = { page: nextPage, page_size: PAGE_SIZE };

      if (categories.length > 0) {
        reqBody = { ...reqBody, categories };
      }

      console.log(reqBody);

      // Call API
      const response = await fetch("/api/getPrompts", {
        method: "POST",
        body: JSON.stringify(reqBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed with status: ${response.status}`, errorText);
        throw new Error(`Failed to fetch prompts: ${response.status}`);
      }

      // Get the response data
      const responseData = await response.json();

      // Extract the prompts array from the response
      const prompts = responseData.prompts || [];

      if (prompts.length < PAGE_SIZE) {
        setHasMore(false);
      }

      // Add the new prompts to the existing ones
      setPrompts((prevPrompts) => {
        const newPromptIds = new Set(prompts.map((p: any) => p.id));
        const uniquePrevPrompts = prevPrompts.filter(
          (p) => !newPromptIds.has(p.id)
        );
        return [...uniquePrevPrompts, ...prompts];
      });
    } catch (error) {
      console.error("Error fetching prompts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to reset and trigger fetch when categories change.
  useEffect(() => {
    setPrompts([]);
    setPage(-1);
    setHasMore(true);
    fetchPrompts({ forceFetch: true });
    console.log("Categories changed:", categories);
  }, [categories]);

  // Use Effect to get initial prompts
  useEffect(() => {
    if (!initialFetchDone) {
      fetchPrompts();
      setInitialFetchDone(true);
    }
  }, [initialFetchDone]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchPrompts();
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
  }, [page, isLoading, hasMore]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 relative">
      <div className="sticky top-16 z-10 bg-background/95 pt-2 pb-4 mb-6 border-b shadow-none">
        {/* Header with "Prompt" and Create Prompt Button */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Prompts</h1>

          <Button
            onClick={() => redirect("/create-prompt")}
            className="bg-primary hover:bg-primary/90 font-medium px-6"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create Prompt
          </Button>
        </div>

        {/* Categories Search */}
        <CategoryEntryBar onStateChange={handleCategoryStateChange} />
      </div>

      {/* Display prompts */}
      <div className="mt-4">
        {prompts.length === 0 && !isLoading ? (
          <div className="rounded-lg border p-8 text-center text-muted-foreground">
            <NoPromptsCard />
          </div>
        ) : (
          // Infinite Scroll Display Prompts
          <div className="space-y-4">
            <AnimatePresence>
              {prompts.map((prompt, index) => (
                <motion.div
                  key={prompt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="rounded-lg border p-6 hover:shadow-md transition-all cursor-pointer hover:border-primary/30"
                  onClick={() => redirect(`/prompts/${prompt.id}`)}
                >
                  <h3 className="text-xl font-semibold text-foreground">
                    {prompt.title}
                  </h3>

                  {/* Categories display */}
                  {prompt.categories && prompt.categories.length > 0 && (
                    <CategoryDisplayBar categories={prompt.categories} />
                  )}

                  {prompt.prompt && (
                    <p className="mt-2 text-muted-foreground line-clamp-2">
                      {prompt.prompt}
                    </p>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading indicator */}
            {hasMore && (
              <div ref={loadingRef} className="py-4 text-center">
                {isLoading ? (
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

export default PromptPage;
