import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { parseAndValidate, sortObjectKeys } from '../utils/json';
import { Button } from '@ui/components/Button';

type ErrorInfo = { message: string; line?: number; column?: number } | null;

const STORAGE_KEY = 'json-formatter:last';

export function JsonFormatterPage() {
  const [value, setValue] = useState<string>(() => localStorage.getItem(STORAGE_KEY) || '{\n  "hello": "world"\n}');
  const [error, setError] = useState<ErrorInfo>(null);
  const [sortKeys, setSortKeys] = useState<boolean>(false);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, value);
  }, [value]);

  const validate = useCallback((text: string) => {
    const res = parseAndValidate(text);
    setError(res.error);
    return res.ok;
  }, []);

  const onPretty = useCallback(() => {
    if (!validate(value)) return;
    const obj = JSON.parse(value);
    const sorted = sortKeys ? sortObjectKeys(obj) : obj;
    setValue(JSON.stringify(sorted, null, 2));
  }, [value, sortKeys, validate]);

  const onMinify = useCallback(() => {
    if (!validate(value)) return;
    const obj = JSON.parse(value);
    const sorted = sortKeys ? sortObjectKeys(obj) : obj;
    setValue(JSON.stringify(sorted));
  }, [value, sortKeys, validate]);

  const onCopy = useCallback(async () => {
    await navigator.clipboard.writeText(value);
  }, [value]);

  const onDownload = useCallback(() => {
    const blob = new Blob([value], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [value]);

  const onUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setValue(String(reader.result || ''));
    reader.readAsText(file);
  }, []);

  const onMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => onPretty());
  };

  const options = useMemo(() => ({
    minimap: { enabled: false },
    wordWrap: 'on',
    formatOnPaste: true,
    formatOnType: true
  }), []);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">JSON Formatter</h1>
      <div className="flex items-center gap-2 mb-3">
        <Button onClick={onPretty}>Pretty Print (Ctrl/Cmd+Enter)</Button>
        <Button variant="secondary" onClick={onMinify}>Minify</Button>
        <Button variant="secondary" onClick={() => validate(value)}>Validate</Button>
        <Button variant="secondary" onClick={() => editorRef.current?.getAction('editor.foldAll')?.run?.()}>Collapse All</Button>
        <Button variant="secondary" onClick={() => editorRef.current?.getAction('editor.unfoldAll')?.run?.()}>Expand All</Button>
        <label className="inline-flex items-center gap-2 ml-4">
          <input type="checkbox" checked={sortKeys} onChange={(e) => setSortKeys(e.target.checked)} />
          Sort keys
        </label>
        <div className="ml-auto flex items-center gap-2">
          <input type="file" accept="application/json" onChange={onUpload} />
          <Button variant="ghost" onClick={onCopy}>Copy</Button>
          <Button variant="ghost" onClick={onDownload}>Download</Button>
        </div>
      </div>
      <div className="border rounded overflow-hidden">
        <Editor
          height="60vh"
          defaultLanguage="json"
          value={value}
          onChange={(v) => setValue(v || '')}
          onMount={onMount}
          options={options}
        />
      </div>
      {error && (
        <div className="mt-3 text-red-700 bg-red-50 border border-red-200 rounded p-3">
          <strong>Invalid JSON:</strong> {error.message}
          {typeof error.line === 'number' && typeof error.column === 'number' && (
            <span> (line {error.line}, column {error.column})</span>
          )}
        </div>
      )}
    </div>
  );
}

// utils moved to ../utils/json


