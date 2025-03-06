import { Heading1, Heading2, Heading3 } from "lucide-react"
import {
    $getSelection,
    $isRangeSelection,
    $createParagraphNode,
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $setBlocksType } from "@lexical/selection";
import { $createHeadingNode, $isHeadingNode } from "@lexical/rich-text";
import { useState, useEffect } from "react";
import { useCallback } from "react";
import { mergeRegister } from "@lexical/utils";


const HeadingFormatSection = () => {
    const [editor] = useLexicalComposerContext();

    // Setup States
    const [isHeading1, setIsHeading1] = useState(false);
    const [isHeading2, setIsHeading2] = useState(false);
    const [isHeading3, setIsHeading3] = useState(false);

    // Update Toolbar based on selection
    const $updateToolbar = useCallback(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {

            // Get the parent node of the selection to check for block level formatting
            const anchorNode = selection.anchor.getNode();
            const element =
                anchorNode.getKey() === "root"
                    ? anchorNode
                    : anchorNode.getTopLevelElementOrThrow();

            // Check if element is a heading
            setIsHeading1(
                element ? $isHeadingNode(element) && element.getTag() === "h1" : false
            );
            setIsHeading2(
                element ? $isHeadingNode(element) && element.getTag() === "h2" : false
            );
            setIsHeading3(
                element ? $isHeadingNode(element) && element.getTag() === "h3" : false
            );
        }
    }, [editor]);

    // On update of editor, update toolbar
    useEffect(() => {
        mergeRegister(
            editor.registerUpdateListener(
                ({ editorState, dirtyElements, dirtyLeaves }) => {
                    editorState.read(() => {
                        $updateToolbar();
                    });
                }
            ))
    }, []);

    // Format Text to be underlined
    const handleHeading = (headingLevel: any) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                // Check if current block is already the selected heading type
                const anchorNode = selection.anchor.getNode();
                const element =
                    anchorNode.getKey() === "root"
                        ? anchorNode
                        : anchorNode.getTopLevelElementOrThrow();

                const isCurrentlyHeading = $isHeadingNode(element) && element.getTag() === headingLevel;

                if (isCurrentlyHeading) {
                    // If it's already the selected heading type, convert to paragraph
                    $setBlocksType(selection, () => $createParagraphNode());
                } else {
                    // Convert to the selected heading type
                    $setBlocksType(selection, () => $createHeadingNode(headingLevel));
                }
            }
        });
    };

    return (
        <div className="flex items-center space-x-1 border-r pr-1 mr-1">
            <button
                onClick={() => handleHeading("h1")}
                className={`h-8 w-8 rounded-md flex items-center justify-center transition-colors hover:bg-muted ${isHeading1 ? "bg-accent text-accent-foreground" : ""
                    }`}
                title="Heading 1"
            >
                <Heading1 size={18} />
            </button>
            <button
                onClick={() => handleHeading("h2")}
                className={`h-8 w-8 rounded-md flex items-center justify-center transition-colors hover:bg-muted ${isHeading2 ? "bg-accent text-accent-foreground" : ""
                    }`}
                title="Heading 2"
            >
                <Heading2 size={18} />
            </button>
            <button
                onClick={() => handleHeading("h3")}
                className={`h-8 w-8 rounded-md flex items-center justify-center transition-colors hover:bg-muted ${isHeading3 ? "bg-accent text-accent-foreground" : ""
                    }`}
                title="Heading 3"
            >
                <Heading3 size={18} />
            </button>
        </div>
    );
}

export default HeadingFormatSection;