import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createImageNode } from "./nodes/ImageNode";
import { $insertNodes } from "lexical";

export default function ImagePlugin() {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setURL] = useState("");
  const [file, setFile] = useState<File>();
  const inputRef = useRef<HTMLInputElement>(null);

  const [editor] = useLexicalComposerContext();

  const onAddImage = () => {
    let src = "";
    if (url) src = url;
    if (file) src = URL.createObjectURL(file);

    editor.update(() => {
      const node = $createImageNode({ src, altText: "Dummy text" });
      $insertNodes([node]);
    });
    setFile(undefined);
    setURL("");
    setIsOpen(false);
  };

  return (
    <div className="flex items-center space-x-1 border-r mr-1">
      <button
        onClick={() => setIsOpen(true)}
        className={`h-8 w-8 rounded-md flex items-center justify-center transition-colors hover:bg-muted `}
        title="Image"
      >
        <ImagePlus size={18} />
      </button>
      <input
        type="file"
        ref={inputRef}
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setFile(file);
          }
          e.target.files = null;
        }}
      />
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                value={url}
                onChange={(e) => setURL(e.target.value)}
                placeholder="Add Image URL"
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => inputRef?.current?.click()}
              >
                {file ? file.name : "Upload Image"}
              </Button>
            </div>
            <DialogFooter>
              <Button
                variant="default"
                disabled={!url && !file}
                onClick={onAddImage}
              >
                Add Image
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
