import TableSizeDialog from '../TableSizeDialog';
import { IndentIncrease, OutdentIcon } from "lucide-react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
    $getSelection,
    $isRangeSelection,
    INDENT_CONTENT_COMMAND,
    OUTDENT_CONTENT_COMMAND,
} from "lexical";
import { INSERT_TABLE_COMMAND } from "@lexical/table";

const TableAndIndentFormatSection = () => {
    const [editor] = useLexicalComposerContext();

    // Increase Indent
    const handleIncreaseIndent = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
            }
        });
    };

    // Decrease Indent
    const handleDecreaseIndent = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
            }
        });
    };

    // Create Table
    const onTableCreate = (rows: number, columns: number) => {
        // Check if the input is valid
        if (
            isNaN(columns) ||
            columns <= 0 ||
            rows <= 0 ||
            isNaN(rows)
        ) {
            return;
        }

        editor.dispatchCommand(INSERT_TABLE_COMMAND, {
            columns: columns.toString(),
            rows: rows.toString()
        });
    };

    return (
        <div className="flex items-center space-x-1 border-r pr-1 mr-1">
            <TableSizeDialog onSizeConfirm={onTableCreate} />
            <button
                onClick={handleIncreaseIndent}
                className={`h-8 w-8 rounded-md flex items-center justify-center transition-colors hover:bg-muted`}
                title="Positive Indent"
            >
                <IndentIncrease size={18} />
            </button>
            <button
                onClick={handleDecreaseIndent}
                className={`h-8 w-8 rounded-md flex items-center justify-center transition-colors hover:bg-muted`}
                title="Positive Indent"
            >
                <OutdentIcon size={18} />
            </button>
        </div>
    );
}

export default TableAndIndentFormatSection;