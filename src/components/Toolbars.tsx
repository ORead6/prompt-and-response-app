"use client";

import React, { useCallback } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import { useState, useEffect } from "react";
import { mergeRegister } from "@lexical/utils";
import { Redo, Undo } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { $createHeadingNode, $isHeadingNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { $isListNode, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND } from "@lexical/list";

const LowPriority = 1;

const Toolbars = () => {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikeThrough, setIsStrikeThrough] = useState(false);
  const [isOrderedList, setIsOrderedList] = useState(false);
  const [isHeading1, setIsHeading1] = useState(false);

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
      const parentList = $isListNode(element)
        ? element
        : element.getParentOrThrow();
      setIsOrderedList(
        $isListNode(parentList) && parentList.getListType() === "number"
      );

      // Check if element is a heading
      setIsHeading1(
        element ? $isHeadingNode(element) && element.getTag() === "h1" : false
      );
    }
  }, [editor]);

//   Save Content when user stops typing after 500ms
  const handleSave = useDebouncedCallback((content) => {
    console.log(content);
  }, 500);

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
          handleSave(JSON.stringify(editorState));
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

  const handleHeading = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode("h1"));
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
            editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
            setIsOrderedList(false);
        }
      }
    });
  };

  if (!editor._editable) {
    return null;
  }

  return (
    <div className="flex flex-row space-x-3">
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
        }}
        className={`size-8 rounded flex items-center justify-center ${
          isBold ? "bg-gray-200" : ""
        }`}
      >
        B
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
        }}
        className={`size-8 italic rounded flex items-center justify-center ${
          isItalic ? "bg-gray-200" : ""
        }`}
      >
        i
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
        }}
        className={`size-8 underline rounded flex items-center justify-center ${
          isUnderline ? "bg-gray-200" : ""
        }`}
      >
        U
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
        }}
        className={`size-8 line-through rounded flex items-center justify-center ${
          isStrikeThrough ? "bg-gray-200" : ""
        }`}
      >
        S
      </button>
      <button onClick={handleHeading} className={` size-8 rounded-md `}>
        h1
      </button>
      <button
        onClick={handleOLButton}
        className={`size-8 rounded-md flex items-center justify-center ${
          isOrderedList ? "bg-gray-200" : ""
        }`}
      >
        UL
      </button>
      <button
        disabled={!canUndo}
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        className="size-8 rounded flex items-center justify-center disabled:opacity-50"
      >
        <Undo width={20} />
      </button>
      <button
        disabled={!canRedo}
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        className="size-8 rounded flex items-center justify-center disabled:opacity-50"
      >
        <Redo width={20} />
      </button>
    </div>
  );
};

export default Toolbars;
