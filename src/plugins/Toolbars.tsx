"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useState, useEffect } from "react";

import FontFormatSection from "./toolbarSections/FontFormatSection";
import HeadingFormatSection from "./toolbarSections/HeadingFormatSection";
import ListFormatSection from "./toolbarSections/ListFormatSection";
import TableAndIndentFormatSection from "./toolbarSections/TableAndIndentFormatSection";
import UndoRedoSection from "./toolbarSections/UndoRedoSection";

const Toolbars = () => {
  const [editor] = useLexicalComposerContext();

  const [isEditable, setIsEditable] = useState(editor._editable);

  useEffect(() => {
    setIsEditable(editor._editable);
  }, [editor._editable]);

  if (!isEditable) {
    return null;
  }

  return (
    <div className="flex items-center p-2 pe-0 shadow-none space-x-1 overflow-x-auto">
      <div className="flex-1 flex items-center">
        <FontFormatSection />
        <HeadingFormatSection />
        <ListFormatSection />
        <TableAndIndentFormatSection />
        <UndoRedoSection />
      </div>
    </div>
  );
};

export default Toolbars;
