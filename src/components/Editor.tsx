"use client";

import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import Toolbars from "./Toolbars";
import { HeadingNode } from "@lexical/rich-text";
import LoadState from "./loadState";
import { ListNode, ListItemNode } from "@lexical/list";

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error: unknown) {
	console.error(error);
}

export default function Editor() {
	const initialConfig = {
		namespace: "MyEditor",
		theme: theme,
		onError,
		nodes: [HeadingNode, ListNode, ListItemNode],
		editable: false,
	};

	return (
		<div className="max-w-4xl mx-auto bg-none border rounded-lg h-[50vh] p-5">
			<LexicalComposer initialConfig={initialConfig}>
				<LoadState />
				<Toolbars />
        <ListPlugin />
				<RichTextPlugin
					contentEditable={
						<ContentEditable className=" focus:outline-none" />
					}
					placeholder={<div>Enter some text...</div>}
					ErrorBoundary={LexicalErrorBoundary}
				/>
				<HistoryPlugin />
				<AutoFocusPlugin />
			</LexicalComposer>
		</div>
	);
}

const theme = {
	ltr: "ltr",
	rtl: "rtl",
	paragraph: "",
	quote: "editor-quote",
	heading: {
		h1: "text-3xl font-bold",
		h2: "editor-heading-h2",
		h3: "editor-heading-h3",
		h4: "editor-heading-h4",
		h5: "editor-heading-h5",
		h6: "editor-heading-h6",
	},
	list: {
		nested: {
			listitem: "editor-nested-listitem",
		},
		ol: "list-decimal",
		ul: "list-disc",
		listitem: "editor-listItem",
		listitemChecked: "editor-listItemChecked",
		listitemUnchecked: "editor-listItemUnchecked",
	},
	hashtag: "editor-hashtag",
	image: "editor-image",
	link: "editor-link",
	text: {
		bold: "font-bold",
		code: "editor-textCode",
		italic: "italic",
		strikethrough: "line-through",
		subscript: "editor-textSubscript",
		superscript: "editor-textSuperscript",
		underline: "underline",
		underlineStrikethrough: "editor-textUnderlineStrikethrough",
	},
	code: "editor-code",
	codeHighlight: {
		atrule: "editor-tokenAttr",
		attr: "editor-tokenAttr",
		boolean: "editor-tokenProperty",
		builtin: "editor-tokenSelector",
		cdata: "editor-tokenComment",
		char: "editor-tokenSelector",
		class: "editor-tokenFunction",
		"class-name": "editor-tokenFunction",
		comment: "editor-tokenComment",
		constant: "editor-tokenProperty",
		deleted: "editor-tokenProperty",
		doctype: "editor-tokenComment",
		entity: "editor-tokenOperator",
		function: "editor-tokenFunction",
		important: "editor-tokenVariable",
		inserted: "editor-tokenSelector",
		keyword: "editor-tokenAttr",
		namespace: "editor-tokenVariable",
		number: "editor-tokenProperty",
		operator: "editor-tokenOperator",
		prolog: "editor-tokenComment",
		property: "editor-tokenProperty",
		punctuation: "editor-tokenPunctuation",
		regex: "editor-tokenVariable",
		selector: "editor-tokenSelector",
		string: "editor-tokenSelector",
		symbol: "editor-tokenProperty",
		tag: "editor-tokenProperty",
		url: "editor-tokenOperator",
		variable: "editor-tokenVariable",
	},
};