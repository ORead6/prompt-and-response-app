"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";

const PromptPage = () => {
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  // Will Eventually get Prompts from API
  const retrievedPrompts = [1];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ title, body });
    // Reset form (Will do stuff with data later) and hide it
    setTitle("");
    setBody("");
    setShowForm(false);
  };

  // Check form isnt blank
  const isFormValid = title.trim() !== "" && body.trim() !== "";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="relative">
        <AnimatePresence mode="wait">
          {/* Show Create Prompt Button Dependant on State */}
          {!showForm ? (
            <motion.div
              key="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-end mb-6"
            >
              <Button
                onClick={() => setShowForm(true)}
                className="bg-primary hover:bg-primary/90"
              >
                Create Prompt
              </Button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-card rounded-lg p-6 shadow-lg"
              onSubmit={handleSubmit}
            >
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium mb-1"
                  >
                    Title
                  </label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter prompt title"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="body"
                    className="block text-sm font-medium mb-1"
                  >
                    Body
                  </label>
                  <Textarea
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Enter prompt body"
                    required
                    className="min-h-[150px]"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!isFormValid}>
                    Create Prompt
                  </Button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Content where Prompts will be */}
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          {retrievedPrompts.length === 0 ? (
            <p>No prompts available</p>
          ) : (
            <p>Available Prompts</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptPage;
