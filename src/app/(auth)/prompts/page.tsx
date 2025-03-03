"use client";

import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import NoPromptsCard from "@/components/EmptyPromptPlaceholder";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

// Type for prompt data
type Prompt = {
  id: string,
  title: string,
  prompt: string | null,
  author: string | null,
  created_at: string,
};

const PromptPage = () => {
  const router = useRouter();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const loadingRef = useRef(null);

  const PAGE_SIZE = 10;

  const fetchPrompts = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/getPrompts", {
        method: "POST",
        body: JSON.stringify({ page, page_size: PAGE_SIZE })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed with status: ${response.status}`, errorText);
        throw new Error(`Failed to fetch prompts: ${response.status}`);
      }

      // Get the response data
      const responseData = await response.json();
      console.log("API Response:", responseData);

      // Extract the prompts array from the response
      const prompts = responseData.prompts || [];

      if (prompts.length < PAGE_SIZE) {
        setHasMore(false);
      }

      // Add the new prompts to the existing ones
      setPrompts(prevPrompts => [...prevPrompts, ...prompts]);
      setPage(prevPage => prevPage + 1);
    } catch (error) {
      console.error("Error fetching prompts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
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
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-end mb-6"
          >
            <Button
              onClick={() => router.push("/create-prompt")}
              className="bg-primary hover:bg-primary/90"
            >
              Create Prompt
            </Button>
          </motion.div>
        </AnimatePresence>

        {/* Display prompts */}
        {prompts.length === 0 && !isLoading ? (
          <div className="rounded-lg border p-8 text-center text-muted-foreground">
            <NoPromptsCard />
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {prompts.map((prompt, index) => (
                <motion.div
                  key={prompt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="rounded-lg border p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/prompts/${prompt.id}`)}
                >
                  <h3 className="text-xl font-semibold text-foreground">{prompt.title}</h3>
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