import React from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { FORMAT_TEXT_COMMAND } from 'lexical';

const Toolbars = () => {
    const [editor] = useLexicalComposerContext();

    return (
        <div><button onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
        }}>B</button></div>
    );
}

export default Toolbars;