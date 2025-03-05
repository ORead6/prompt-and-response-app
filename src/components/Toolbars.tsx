"use client";

import React, { useCallback } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_TEXT_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  REDO_COMMAND,
  REMOVE_TEXT_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import { useState, useEffect } from "react";
import { mergeRegister } from "@lexical/utils";
import { Heading1, Heading2, Heading3, IndentIncrease, List, ListCheck, ListChecks, ListOrdered, OutdentIcon, Plus, Redo, Table, Undo } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { $createHeadingNode, $isHeadingNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { $isListNode, INSERT_CHECK_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND } from "@lexical/list";
import { Button } from "./ui/button";
import { set } from "date-fns";
import { useRouter } from "next/navigation";
import { INSERT_TABLE_COMMAND } from "@lexical/table";
import { InsertTableCommandPayload } from "@lexical/table";
import TableSizeDialog from "./TableSizeDialog";

const LowPriority = 1;

interface ToolbarsProps {
  currPromptId?: string;
}

const Toolbars = ({
  currPromptId = "",
}: ToolbarsProps) => {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikeThrough, setIsStrikeThrough] = useState(false);
  const [isOrderedList, setIsOrderedList] = useState(false);
  const [isUnorderedList, setIsUnorderedList] = useState(false);

  const [isEditorEmpty, setIsEditorEmpty] = useState(true);
  const [richContent, setRichContent] = useState({});
  const [isHeading1, setIsHeading1] = useState(false);
  const [isHeading2, setIsHeading2] = useState(false);
  const [isHeading3, setIsHeading3] = useState(false);
  const [isEditable, setIsEditable] = useState(editor._editable);

  const router = useRouter();

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();

    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikeThrough(selection.hasFormat("strikethrough"));

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
          editorState.read(() => {
            $updateToolbar();
          });

          if (dirtyElements.size === 0 && dirtyLeaves.size === 0) {
            return;
          }

          // Save Content Locally
          setRichContent(editorState.toJSON());

        }
      ),
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
  }, [editor, $updateToolbar]);

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

  const handleIncreaseIndent = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
      }
    });
  };

  const handleDecreaseIndent = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
      }
    });
  };

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

  const onTableCreate = (rows: number, columns: number) => {
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

  useEffect(() => {
    setIsEditable(editor._editable);
  }, [editor._editable]);

  if (!isEditable) {
    return null;
  }

  return (
    <div className="flex items-center p-2 pe-0 shadow-none space-x-1 overflow-x-auto">
      <div className="flex-1 flex items-center">
        <div className="flex items-center space-x-1 border-r pr-1 mr-1">
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
        </div>

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


        <div className="ml-auto">
          <div className="flex items-center">
            <Button onClick={handleCreateResponse} variant={"outline"}>
              Create Response
              <Plus size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toolbars;
