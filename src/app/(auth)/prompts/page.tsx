"use client";

import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import NoPromptsCard from "@/components/ui/EmptyPromptPlaceholder";
import { useRouter } from "next/navigation";

const PromptPage = () => {
  // Form state
  const router = useRouter();

  // Will Eventually get Prompts from API
  const retrievedPrompts = [];

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

        {/* Content where Prompts will be */}
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          {retrievedPrompts.length === 0 ? (
            <NoPromptsCard />
          ) : (
            <p>Available Prompts</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptPage;
