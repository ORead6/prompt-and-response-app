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
import { ParagraphNode } from "lexical";
import EditResponse from "./EditResponse";
import { useEffect, useState } from "react";

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.  
function onError(error: unknown) {
	console.error(error);
}

export default function ResponseCreator({promptID = ""} : {promptID?: string | null}) {
	const initialConfig = {
		namespace: "MyEditor",
		theme: theme,
		onError,
		nodes: [HeadingNode, ListNode, ListItemNode, ParagraphNode],
		editable: true,
	};

	return (
		<div className={`max-w-4xl mx-auto bg-card rounded-lg shadow-sm overflow-hidden`}>
			<LexicalComposer initialConfig={initialConfig}>
				<Toolbars creatingResponse={true} currPromptId={promptID as string}/>
				<div className="px-4 min-h-[150px] overflow-y-auto relative border rounded-md py-2">
					<ListPlugin />
					<RichTextPlugin
						contentEditable={
							<ContentEditable
								className="focus:outline-none min-h-[100px] editor-content"
							/>
						}
						placeholder={
							<div className="absolute top-0 left-0 pointer-events-none px-4 py-2 text-gray-500">Add a Response</div>
						}
						ErrorBoundary={LexicalErrorBoundary}
					/>
					<HistoryPlugin />
					<AutoFocusPlugin />
				</div>
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
		h2: "text-2xl font-semibold",
		h3: "text-xl font-medium",
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