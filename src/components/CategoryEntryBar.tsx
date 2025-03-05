import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CategoryEntryBar = ({ onStateChange }) => {
  const [categoryInput, setCategoryInput] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  const handleCategoryKeyDown = (e: any) => {
    if (e.key === "Enter" && categoryInput.trim()) {
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
    setCategories(
      categories.filter((category) => category !== categoryToRemove)
    );
  };

  useEffect(() => {
    onStateChange(categories);
  }, [categories, onStateChange]);

  return (
    <div className="mb-0">
      <div className="flex items-center gap-2 mb-2">
        <Input
          id="categories"
          value={categoryInput}
          onChange={(e) => setCategoryInput(e.target.value)}
          onKeyDown={handleCategoryKeyDown}
          placeholder="Type a category and press Enter"
          className="flex-1"
        />
        <Button
          variant="outline"
          type="button"
          size="sm"
          onClick={() => {
            if (categoryInput.trim()) {
              const newCategory = categoryInput.trim();
              if (!categories.includes(newCategory)) {
                setCategories([...categories, newCategory]);
              }
              setCategoryInput("");
            }
          }}
        >
          Add
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        {categories.length > 0
          ? categories.map((category, index) => (
              <div
                key={index}
                className="flex items-center bg-primary/10 text-primary rounded-full px-3 py-1"
              >
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
            ))
          : null}
      </div>
    </div>
  );
};

export default CategoryEntryBar;
