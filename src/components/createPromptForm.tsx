import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const CreatePromptForm = ({ maxLength }: { maxLength: number }) => {
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");

  return (
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
        {/* Create Prompt Button */}
        <Button className="bg-primary hover:bg-primary/90 px-8">
          Create Prompt
          <Plus />
        </Button>
      </div>
    </form>
  );
};

export default CreatePromptForm;
