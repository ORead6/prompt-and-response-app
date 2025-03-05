"use client";

import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import NoPromptsCard from "@/components/EmptyPromptPlaceholder";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import CategoryEntryBar from "@/components/CategoryEntryBar";

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

  const handleCategoryStateChange = (categories: string[]) => {
    setCategories(categories);

    // API CALL TO GET NEW PROMPTS
  };

  const fetchPrompts = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    const nextPage = page + 1;
    setPage(nextPage);

    try {
      const response = await fetch("/api/getPrompts", {
        method: "POST",
        body: JSON.stringify({ page: nextPage, page_size: PAGE_SIZE }),
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

  // Initial data fetch
  useEffect(() => {
    fetchPrompts();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 relative">
      <div className="sticky top-16 z-10 bg-background/95 pt-2 pb-4 mb-6 border-b shadow-none">
        {/* Header with "Prompt" and Create Prompt Button */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Prompts</h1>

          <Button
            onClick={() => router.push("/create-prompt")}
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
          // Infinte Scroll Display Prompts
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
                  onClick={() => router.push(`/prompts/${prompt.id}`)}
                >
                  <h3 className="text-xl font-semibold text-foreground">
                    {prompt.title}
                  </h3>

                  {/* Categories display */}
                  {prompt.categories && prompt.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 mb-2">
                      {prompt.categories.map((category, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm font-medium"
                        >
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </span>
                      ))}
                    </div>
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
