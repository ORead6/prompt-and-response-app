"use client"

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const CreatePromptForm = ({ maxLength }: { maxLength: number }) => {
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate title
    if (!title.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Create the prompt using API Route
    try {
      const response = await fetch("/api/createPrompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },  
        body: JSON.stringify({
          title: title.trim(),
          prompt: prompt.trim() || null
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Redirect to prompts page after successful creation
        router.push("/prompts");
      } else {
        alert(`Error: ${data.error || "Failed to create prompt"}`);
      }
    } catch (error) {
      console.error("Error creating prompt:", error);
      alert("An error occurred while creating the prompt");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
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
          required
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
        {/* Create Prompt Button */}
        <Button 
          type="submit" 
          className="bg-primary hover:bg-primary/90 px-8"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create Prompt"}
          {!isSubmitting && <Plus />}
        </Button>
      </div>
    </form>
  );
};

export default CreatePromptForm;