import React from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ code, setCode, language, darkMode }) => {
  // Map common names to monaco language IDs
  const getMonacoLanguage = (lang) => {
    const map = {
      'JavaScript': 'javascript',
      'Python': 'python',
      'Java': 'java',
      'C++': 'cpp',
      'TypeScript': 'typescript',
      'Go': 'go',
      'Rust': 'rust'
    };
    return map[lang] || 'javascript';
  };

  return (
    <div className="w-full h-full flex flex-col flex-grow min-h-[400px]">
      <div className="flex-grow w-full h-full">
        <Editor
          height="400px"
          language={getMonacoLanguage(language)}
          theme={darkMode ? "vs-dark" : "light"}
          value={code}
          onChange={(value) => setCode(value || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
