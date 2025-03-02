"use client";

import CreatePromptForm from "@/components/createPromptForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const CreatePromptPage = () => {
  const router = useRouter();
  const maxLength = 300;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div>
        {/* Back Button & Title*/}
        <div className="flex items-center mb-6">
          <div className="flex-shrink-0">
            <Button
              onClick={() => router.push("/prompts")}
              className="bg-primary hover:bg-primary/90"
            >
              <ArrowLeft className="mr-2" />
              Back
            </Button>
          </div>
          <div className="flex-grow text-center">
            <h1 className="text-2xl font-semibold">Create Prompt</h1>
          </div>
          <div className="flex-shrink-0 w-[88px]"></div>
        </div>

        {/* Create Prompt Form */}
        <CreatePromptForm maxLength={maxLength} />

      </div>
    </div>
  );
};

export default CreatePromptPage;
