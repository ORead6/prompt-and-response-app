"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
    $createParagraphNode,
    $getRoot,
} from "lexical";
import { useState, useEffect } from "react";
import { mergeRegister } from "@lexical/utils";
import { Plus } from "lucide-react";

import { Button } from "./ui/button";

const CreateResponseButton = ({ currPromptId }: { currPromptId: string }) => {
    const [editor] = useLexicalComposerContext();

    const [isEditorEmpty, setIsEditorEmpty] = useState(true);
    const [richContent, setRichContent] = useState({});

    useEffect(() => {
        // Check if editor is empty in an effect instead of during render
        const isEmpty = editor.read(() => {
            const root = $getRoot();
            const firstChild = root.getFirstChild();
            return firstChild?.getTextContent() === '' && root.getChildrenSize() === 1;
        });

        setIsEditorEmpty(isEmpty);
    }, [editor, richContent]);

    //   Change styling of text on button presses
    useEffect(() => {
        mergeRegister(
            editor.registerUpdateListener(
                ({ editorState, dirtyElements, dirtyLeaves }) => {

                    if (dirtyElements.size === 0 && dirtyLeaves.size === 0) {
                        return;
                    }

                    // Save Content Locally
                    setRichContent(editorState.toJSON());

                }
            ),
        );
    }, [editor]);

    const handleCreateResponse = async () => {
        if (isEditorEmpty) {
            alert("Response Cannot Be Empty")
            return;
        }

        try {
            const response = await fetch("/api/createResponse", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: richContent,
                    promptId: currPromptId,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setRichContent({})

                editor.update(() => {
                    // Clear the editor state
                    const root = $getRoot();
                    root.clear();

                    // Create an empty paragraph to avoid empty editor issues
                    const paragraph = $createParagraphNode();
                    root.append(paragraph);
                });

            } else {
                console.log(`Error: ${data.error || "Failed to create Response"}`);
            }
        } catch (error) {
            console.error("Error creating Response:", error);
        } finally {
            console.log("Response Created");
        }
    };


    return (
        <div className="ml-auto">
            <div className="flex items-center">
                <Button onClick={handleCreateResponse} variant={"outline"}>
                    Create Response
                    <Plus size={18} />
                </Button>
            </div>
        </div>
    );
}

export default CreateResponseButton;