"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Send, HelpCircle, X } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const CreatePromptForm = ({
  maxLength = 300,
  titlePlaceholder = "Enter a title for your prompt",
  promptPlaceholder = "Describe your prompt in detail...",
  titleGuidance = "Add a descriptive title",
  promptGuidance = "Add your prompt details",
  showCharacterCount = true,
  enhancedButton = true
}) => {
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({ title: "", prompt: "" });
  const router = useRouter();
  const [categoryInput, setCategoryInput] = useState("");
  const [categories, setCategories] = useState<string[]>([]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate title
    if (!title.trim() || !prompt.trim()) {
      toast("Title and prompt are required");
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
          prompt: prompt.trim() || null,
          categories: categories.length ? categories : null,
        }),
      });

      const data = await response.json();

      console.log(data.data.id)

      if (data.success) {
        // Redirect to prompts page after successful creation
        router.push(`/prompts/${data.data.id}`);
      } else {
        toast("Failed to Create Prompt");
      }
    } catch (error) {
      console.error("Error creating prompt:", error);
      toast("An error occurred while creating the prompt");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategoryKeyDown = (e: any) => {
    if (e.key === 'Enter' && categoryInput.trim()) {
      e.preventDefault();
      const newCategory = categoryInput.trim();

      // Don't add duplicates
      if (!categories.includes(newCategory)) {
        setCategories([...categories, newCategory]);
      }

      setCategoryInput("");
    }
  };

  const removeCategory = (categoryToRemove: string) => {
    setCategories(categories.filter(category => category !== categoryToRemove));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label htmlFor="title" className="font-medium">
              Title <span className="text-red-500">*</span>
            </Label>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle size={16} className="text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{titleGuidance}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {showCharacterCount && (
            <div className={`text-xs ${title.length > maxLength ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
              {title.length}/{maxLength} characters
            </div>
          )}
        </div>

        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={titlePlaceholder}
          className={`w-full border-2 ${errors.title ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          maxLength={maxLength + 10} // Allow a bit over to show the error
        />

        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title}</p>
        )}
      </div>

      {/* Categories field */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="categories" className="font-medium">
            Categories
          </Label>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle size={16} className="text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Add categories to help your prompts be found!</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex flex-wrap gap-2 mb-2">
          {categories.map((category, index) => (
            <div key={index} className="flex items-center bg-primary/10 text-primary rounded-full px-3 py-1">
              <span>{category}</span>
              <button
                type="button"
                onClick={() => removeCategory(category)}
                className="ml-2 text-primary/70 hover:text-primary focus:outline-none"
                aria-label={`Remove ${category} category`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        <Input
          id="categories"
          value={categoryInput}
          onChange={(e) => setCategoryInput(e.target.value)}
          onKeyDown={handleCategoryKeyDown}
          placeholder="Type a category and press Enter"
          className="w-full"
        />
        <p className="text-sm text-muted-foreground">
          Press Enter to add each category
        </p>
      </div>

      {/* Prompt Input */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="prompt" className="font-medium">
            Prompt <span className="text-red-500">*</span>
          </Label>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle size={16} className="text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{promptGuidance}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={promptPlaceholder}
          className={`w-full min-h-[200px] border-2 ${errors.prompt ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
        />

        {errors.prompt && (
          <p className="text-red-500 text-sm mt-1">{errors.prompt}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-4 flex justify-center">
        {enhancedButton ? (
          <Button
            type="submit"
            disabled={isSubmitting}
            size="lg"
            className="w-full md:w-2/3 lg:w-1/2 py-6 text-lg font-medium bg-primary hover:bg-primary/90 flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02]"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                Creating Prompt...
              </>
            ) : (
              <>
                Create Prompt <Send size={18} className="ml-2" />
              </>
            )}
          </Button>
        ) : (
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Prompt"}
          </Button>
        )}
      </div>
    </form>
  );
};

export default CreatePromptForm;