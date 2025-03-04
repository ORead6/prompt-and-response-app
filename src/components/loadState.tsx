import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

interface LoadStateProps {
  responseContent?: string;
}

const LoadState = ({ responseContent }: LoadStateProps) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Only try to load state if responseContent is a string and not empty
    if (responseContent && typeof responseContent === 'string' && responseContent.trim() !== '') {
      try {
        const parsedContent = JSON.parse(responseContent);
        const editorState = editor.parseEditorState(parsedContent);
        editor.setEditorState(editorState);
      } catch (error) {
        console.error("Error parsing response content:", error);
        // No need to set empty state here as InitialStatePlugin will handle fallback
      }
    }
  }, [editor, responseContent]);

  return null;
};

export default LoadState;