"use client"

import { useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
    $getSelection,
    $isRangeSelection,
    FORMAT_TEXT_COMMAND,
} from "lexical";
import { useCallback, useEffect } from "react";
import { mergeRegister } from "@lexical/utils";

const FontFormatSection = () => {
    const [editor] = useLexicalComposerContext();

    // Setup States
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [isStrikeThrough, setIsStrikeThrough] = useState(false);

    // Update Toolbar based on selection
    const $updateToolbar = useCallback(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
            setIsBold(selection.hasFormat("bold"));
            setIsItalic(selection.hasFormat("italic"));
            setIsUnderline(selection.hasFormat("underline"));
            setIsStrikeThrough(selection.hasFormat("strikethrough"));
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
    const handleUnderline = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                // If text is already strikethrough and trying to apply underline,
                // remove strikethrough first
                if (isStrikeThrough && !isUnderline) {
                    selection.formatText("strikethrough", null);
                }
                selection.formatText("underline", null);
            }
        });
    };

    // Format Text to be Strike through
    const handleStrikeThrough = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                // If text is already underline and trying to apply strikethrough,
                // remove underline first
                if (isUnderline && !isStrikeThrough) {
                    selection.formatText("underline", null);
                }
                selection.formatText("strikethrough", null);
            }
        });
    };


    return (<div className="flex items-center space-x-1 border-r pr-1 mr-1">
        <button
            onClick={() => {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
            }}
            className={`h-8 w-8 rounded-md flex items-center justify-center transition-colors hover:bg-muted ${isBold ? "bg-accent text-accent-foreground" : ""
                }`}
            title="Bold"
        >
            <span className="font-bold text-sm">B</span>
        </button>
        <button
            onClick={() => {
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
            }}
            className={`h-8 w-8 rounded-md flex items-center justify-center transition-colors hover:bg-muted ${isItalic ? "bg-accent text-accent-foreground" : ""
                }`}
            title="Italic"
        >
            <span className="italic text-sm">I</span>
        </button>
        <button
            onClick={handleUnderline}
            className={`h-8 w-8 rounded-md flex items-center justify-center transition-colors hover:bg-muted ${isUnderline ? "bg-accent text-accent-foreground" : ""
                }`}
            title="Underline"
        >
            <span className="underline text-sm">U</span>
        </button>
        <button
            onClick={handleStrikeThrough}
            className={`h-8 w-8 rounded-md flex items-center justify-center transition-colors hover:bg-muted ${isStrikeThrough ? "bg-accent text-accent-foreground" : ""
                }`}
            title="Strikethrough"
        >
            <span className="line-through text-sm">S</span>
        </button>
    </div>);
}

export default FontFormatSection;