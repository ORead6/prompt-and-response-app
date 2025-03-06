import { List, ListOrdered } from "lucide-react"
import {
    $getSelection,
    $isRangeSelection,
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useState, useEffect } from "react";
import { useCallback } from "react";
import { $isListNode, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND } from "@lexical/list";
import { mergeRegister } from "@lexical/utils";

const ListFormatSection = () => {
    const [editor] = useLexicalComposerContext();

    const [isOrderedList, setIsOrderedList] = useState(false);
    const [isUnorderedList, setIsUnorderedList] = useState(false);

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

            // Check if element is part of a list
            // Only try to get parent if it's not the root node
            const isRootNode = element.getKey() === 'root';

            // Safely check for list formatting
            if (!isRootNode) {
                const parentList = $isListNode(element) ? element : element.getParent();
                setIsOrderedList(
                    $isListNode(parentList) && parentList.getListType() === "number"
                );
                setIsUnorderedList(
                    $isListNode(parentList) && parentList.getListType() === "bullet"
                );

            } else {
                setIsOrderedList(false);
                setIsUnorderedList(false);

            }
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

    //   Create Ordered List
    const handleOLButton = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                if (isOrderedList) {
                    editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
                    setIsOrderedList(true);
                }
                else {
                    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
                    setIsOrderedList(false);
                }
            }
        });
    };

    //   Create Unordered List
    const handleULButton = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                if (isUnorderedList) {
                    editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
                    setIsUnorderedList(true);
                }
                else {
                    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
                    setIsUnorderedList(false);
                }
            }
        });
    };

    return (
        <div className="flex items-center space-x-1 border-r pr-1 mr-1">
            <button
                onClick={handleULButton}
                className={`h-8 w-8 rounded-md flex items-center justify-center transition-colors hover:bg-muted ${isUnorderedList ? "bg-accent text-accent-foreground" : ""
                    }`}
                title="Bullet List"
            >
                <List size={18} />
            </button>
            <button
                onClick={handleOLButton}
                className={`h-8 w-8 rounded-md flex items-center justify-center transition-colors hover:bg-muted ${isOrderedList ? "bg-accent text-accent-foreground" : ""
                    }`}
                title="Numbered List"
            >
                <ListOrdered size={18} />
            </button>

        </div>
    );
}

export default ListFormatSection;