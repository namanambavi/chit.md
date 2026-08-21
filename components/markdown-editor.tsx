"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { markdown } from "@codemirror/lang-markdown";
import { tags } from "@lezer/highlight";
import { defaultKeymap, historyKeymap, indentWithTab } from "@codemirror/commands";
import { Markdown } from "@/components/markdown";
import { CopyButton } from "@/components/copy-button";

type Mode = "write" | "split" | "preview";

const formatTools = [
  { label: "H1", title: "Heading 1", before: "# ", after: "", placeholder: "Heading" },
  { label: "H2", title: "Heading 2", before: "## ", after: "", placeholder: "Heading" },
  { label: "B", title: "Bold", before: "**", after: "**", placeholder: "bold text" },
  { label: "I", title: "Italic", before: "_", after: "_", placeholder: "italic text" },
  { label: "LINK", title: "Link", before: "[", after: "](https://)", placeholder: "link text" },
  { label: "CODE", title: "Inline code", before: "`", after: "`", placeholder: "code" },
  { label: "LIST", title: "Bulleted list", before: "- ", after: "", placeholder: "List item" },
  { label: "QUOTE", title: "Blockquote", before: "> ", after: "", placeholder: "Quote" },
] as const;

const editorTheme = EditorView.theme({
  "&": { height: "100%", backgroundColor: "var(--surface)", color: "var(--text)" },
  ".cm-scroller": { fontFamily: 'ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, monospace', lineHeight: "1.65" },
  ".cm-content": { padding: "22px 8px 80px", caretColor: "var(--text)" },
  ".cm-line": { padding: "0 14px" },
  ".cm-gutters": { backgroundColor: "var(--surface)", color: "var(--text-tertiary)", border: "0", paddingTop: "22px" },
  ".cm-activeLine, .cm-activeLineGutter": { backgroundColor: "var(--surface-subtle)" },
  ".cm-selectionBackground, ::selection": { backgroundColor: "var(--selection) !important" },
  "&.cm-focused": { outline: "none" },
});

const editorHighlightStyle = HighlightStyle.define([
  { tag: [tags.heading1, tags.heading2, tags.heading3, tags.heading4], color: "var(--text)", fontWeight: "700" },
  { tag: [tags.processingInstruction, tags.meta], color: "var(--text-secondary)" },
  { tag: [tags.link, tags.url], color: "var(--text)", textDecoration: "underline" },
  { tag: tags.strong, color: "var(--text)", fontWeight: "700" },
  { tag: tags.emphasis, color: "var(--text)", fontStyle: "italic" },
  { tag: [tags.monospace, tags.quote], color: "var(--text-secondary)" },
]);

export function MarkdownEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const mount = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const initialValue = useRef(value);
  const [mode, setMode] = useState<Mode>("split");
  const emitChange = useEffectEvent((nextValue: string) => onChange(nextValue));

  useEffect(() => {
    if (!mount.current) return;
    const editor = new EditorView({
      parent: mount.current,
      state: EditorState.create({
        doc: initialValue.current,
        extensions: [
          basicSetup,
          markdown(),
          keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
          EditorView.lineWrapping,
          editorTheme,
          syntaxHighlighting(editorHighlightStyle),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) emitChange(update.state.doc.toString());
          }),
        ],
      }),
    });
    view.current = editor;
    return () => { editor.destroy(); view.current = null; };
  }, []); // The editor owns its document after mounting.

  function insert(before: string, after = "", placeholder = "text") {
    const editor = view.current;
    if (!editor) return;
    const selection = editor.state.selection.main;
    const selected = editor.state.sliceDoc(selection.from, selection.to) || placeholder;
    const replacement = `${before}${selected}${after}`;
    editor.dispatch({
      changes: { from: selection.from, to: selection.to, insert: replacement },
      selection: { anchor: selection.from + before.length, head: selection.from + before.length + selected.length },
      scrollIntoView: true,
    });
    editor.focus();
  }

  return <section className="markdown-editor chit-stack editor-chit" aria-label="Markdown editor">
    <div className="editor-toolbar">
      <div className="format-tools" aria-label="Formatting tools">
        {formatTools.map((tool) => <button key={tool.label} type="button" title={tool.title} aria-label={tool.title} onClick={()=>insert(tool.before,tool.after,tool.placeholder)}>{tool.label}</button>)}
        <CopyButton value={value}/>
      </div>
      <div className="view-switcher" aria-label="Editor view">
        {(["write", "split", "preview"] as const).map((option) => <button key={option} type="button" className={mode===option?"active":""} aria-pressed={mode===option} onClick={()=>setMode(option)}>{option}</button>)}
      </div>
    </div>
    <div className="editor-workspace" data-mode={mode}>
      <div className="source-pane"><div className="pane-label">SOURCE</div><div className="editor-mount" ref={mount}/></div>
      <div className="preview-pane" aria-label="Rendered preview"><div className="pane-label">RENDERED</div><Markdown variant="rendered">{value}</Markdown></div>
    </div>
    <div className="editor-status"><span>MARKDOWN</span><span>{value.length.toLocaleString()} CHARACTERS</span></div>
  </section>;
}
