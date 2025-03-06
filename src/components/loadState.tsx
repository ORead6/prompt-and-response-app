import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

interface LoadStateProps {
  responseContent?: string;
}

const LoadState = ({ responseContent }: LoadStateProps) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (
      responseContent &&
      typeof responseContent === "string" &&
      responseContent.trim() !== ""
    ) {
      // Use a microtask to defer the state update
      queueMicrotask(() => {
        // Your update logic here
        editor.update(() => {
          try {
            const parsedContent = JSON.parse(responseContent);
            const editorState = editor.parseEditorState(parsedContent);
            editor.setEditorState(editorState);
          } catch (error) {
            console.error("Error parsing response content:", error);
            // No need to set empty state here as InitialStatePlugin will handle fallback
          }
        });
      });
    }
  }, [responseContent, editor]);

  return null;
};

export default LoadState;
