import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { Pencil, X, Check } from "lucide-react";
import { useEffect, useState } from "react";
import Toolbars from "./Toolbars";

const EditResponse = () => {
    const [editor] = useLexicalComposerContext();
    const [isEditing, setIsEditing] = useState(false);

    const handleEdit = () => {
        editor.setEditable(true);
        setIsEditing(true);
    };

    const handleSave = () => {
        editor.setEditable(false);
        setIsEditing(false);
    };

    const handleCancel = () => {
        // Just revert to non-editing state without saving
        editor.setEditable(false);
        setIsEditing(false);
    };

    return (
        <div className="relative">
            <div className="flex justify-between items-center">
                <div className={`flex-1`}>
                    {isEditing && <Toolbars />}
                </div>
                <div className="flex items-center p-2 rounded-md shadow-sm space-x-1">
                    {!isEditing ? (
                        <button
                            onClick={handleEdit}
                            className="h-8 w-8 rounded-md flex items-center justify-center transition-colors hover:bg-muted"
                            title="Edit Response"
                        >
                            <Pencil size={18} />
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handleCancel}
                                className="h-8 w-8 rounded-md flex items-center justify-center transition-colors hover:bg-muted"
                                title="Cancel Edits"
                            >
                                <X size={18} />
                            </button>
                            <button
                                onClick={handleSave}
                                className="h-8 w-8 rounded-md flex items-center justify-center transition-colors hover:bg-muted bg-accent text-accent-foreground"
                                title="Save Edits"
                            >
                                <Check size={18} />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditResponse;