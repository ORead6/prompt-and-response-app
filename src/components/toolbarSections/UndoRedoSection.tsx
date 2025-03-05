import React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
    CAN_REDO_COMMAND,
    CAN_UNDO_COMMAND,
    REDO_COMMAND,
    UNDO_COMMAND,
} from "lexical";
import { useState, useEffect } from "react";
import { mergeRegister } from "@lexical/utils";
import { Redo, Undo } from "lucide-react";

const LowPriority = 1;

const UndoRedoSection = () => {
    const [editor] = useLexicalComposerContext();

    // Setup states
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    // Update Toolbar based on whether Undo / Redo is available
    useEffect(() => {
        mergeRegister(
            editor.registerCommand(
                CAN_UNDO_COMMAND,
                (payload) => {
                    setCanUndo(payload);
                    return false;
                },
                LowPriority
            ),
            editor.registerCommand(
                CAN_REDO_COMMAND,
                (payload) => {
                    setCanRedo(payload);
                    return false;
                },
                LowPriority
            )
        );
    }, [editor]);

    return (
        <div className="flex items-center space-x-1">
            <button
                disabled={!canUndo}
                onClick={() => {
                    editor.dispatchCommand(UNDO_COMMAND, undefined);
                }}
                className="h-8 w-8 rounded-md flex items-center justify-center transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                title="Undo"
            >
                <Undo size={18} />
            </button>
            <button
                disabled={!canRedo}
                onClick={() => {
                    editor.dispatchCommand(REDO_COMMAND, undefined);
                }}
                className="h-8 w-8 rounded-md flex items-center justify-center transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                title="Redo"
            >
                <Redo size={18} />
            </button>
        </div>
    );
}

export default UndoRedoSection;