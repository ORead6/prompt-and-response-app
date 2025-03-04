import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import React, { useEffect } from "react";

const text = `{"root":{"children":[{"children":[{"detail":0,"format":8,"mode":"normal","style":"","text":"Hello world asdasdasdsadsadasdsa","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":"das ","type":"text","version":1},{"detail":0,"format":1,"mode":"normal","style":"","text":"asdassdasd","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":" asdasd","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1,"textFormat":8,"textStyle":""}],"direction":"ltr","format":"","indent":0,"type":"root","version":1,"textFormat":8}}`;

// How we load in messages remembering their rich state
export default function LoadState() {
  const [editor] = useLexicalComposerContext();

  // FETCH FROM DB OR LOCAL STORE
  useEffect(() => {
    // VALUE TO PASS IN ->GET FROM DB
    const newState = editor.parseEditorState(text);
    editor.setEditorState(newState);
    editor.setEditable(true);
  }, []);

  return <div></div>;
}
