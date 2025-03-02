"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CreatePromptPage = () => {
  const router = useRouter();
  const maxLength = 300;

  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div>
        <div className="flex justify-start mb-6">
          <Button
            onClick={() => router.push("/prompts")}
            className="bg-primary hover:bg-primary/90"
          >
            <ArrowLeft className="mr-2" />
            Back
          </Button>
        </div>
        <form className="flex flex-col space-y-4">
          {/* Title input with character counter */}
          <div className="relative">
            <input
              className="flex border text-2xl py-6 px-6 rounded-lg w-full 
                border-gray-300 dark:border-gray-700
                focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                transition-all duration-200
                bg-background text-foreground"
              placeholder="Title*"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={maxLength}
            />
            <div
              className={`absolute bottom-3 right-4 text-sm ${
                title.length === maxLength
                  ? "text-red-500 font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {title.length}/{maxLength}
            </div>
          </div>

          <textarea
            className="flex border text-lg py-6 px-6 rounded-lg w-full 
                border-gray-300 dark:border-gray-700
                focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                transition-all duration-200
                bg-background text-foreground font-light
                min-h-[225px] resize-y"
            placeholder="Prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="flex justify-end">
          <Button className="bg-primary hover:bg-primary/90 px-8">
            Create Prompt
            <Plus  />
          </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePromptPage;
