import React from 'react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';

const DiffViewer = ({ oldValue, newValue, darkMode }) => {
  const customStyles = {
    variables: {
      dark: {
        diffViewerBackground: 'transparent',
        diffViewerColor: '#e2e8f0', 
        addedBackground: 'rgba(16, 185, 129, 0.12)', 
        addedColor: '#34d399',
        removedBackground: 'rgba(244, 63, 94, 0.12)', 
        removedColor: '#fb7185',
        wordAddedBackground: 'rgba(16, 185, 129, 0.35)',
        wordRemovedBackground: 'rgba(244, 63, 94, 0.35)',
        addedGutterBackground: 'rgba(16, 185, 129, 0.08)',
        removedGutterBackground: 'rgba(244, 63, 94, 0.08)',
        gutterBackground: 'transparent',
        gutterBackgroundDark: 'transparent',
        highlightBackground: 'rgba(99, 102, 241, 0.1)', 
        highlightGutterBackground: 'rgba(99, 102, 241, 0.2)',
        codeFoldGutterBackground: 'rgba(30, 41, 59, 0.5)', 
        codeFoldBackground: 'rgba(30, 41, 59, 0.3)',
        emptyLineBackground: 'transparent',
        gutterColor: '#64748b', 
        addedGutterColor: '#10b981', 
        removedGutterColor: '#f43f5e',
        codeFoldContentColor: '#94a3b8',
        diffViewerTitleBackground: 'transparent',
        diffViewerTitleColor: '#94a3b8',
        diffViewerTitleBorderColor: 'transparent'
      },
      light: {
        diffViewerBackground: 'transparent',
        diffViewerColor: '#334155',
        addedBackground: 'rgba(16, 185, 129, 0.1)',
        addedColor: '#065f46',
        removedBackground: 'rgba(244, 63, 94, 0.1)',
        removedColor: '#9f1239',
        wordAddedBackground: 'rgba(16, 185, 129, 0.3)',
        wordRemovedBackground: 'rgba(244, 63, 94, 0.3)',
        addedGutterBackground: 'rgba(16, 185, 129, 0.05)',
        removedGutterBackground: 'rgba(244, 63, 94, 0.05)',
        gutterBackground: 'transparent',
        gutterBackgroundDark: 'transparent',
        highlightBackground: 'rgba(99, 102, 241, 0.1)',
        highlightGutterBackground: 'rgba(99, 102, 241, 0.2)',
        codeFoldGutterBackground: 'rgba(241, 245, 249, 0.5)',
        codeFoldBackground: 'rgba(241, 245, 249, 0.3)',
        emptyLineBackground: 'transparent',
        gutterColor: '#94a3b8',
        addedGutterColor: '#059669',
        removedGutterColor: '#e11d48',
        codeFoldContentColor: '#64748b',
        diffViewerTitleBackground: 'transparent',
        diffViewerTitleColor: '#475569',
        diffViewerTitleBorderColor: 'transparent'
      }
    },
    line: {
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
      fontSize: "13px",
      lineHeight: "1.7",
      padding: "2px",
    },
    titleBlock: {
      padding: "16px 20px",
      textAlign: "center",
      fontWeight: "700",
      fontSize: "12px",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
    },
    marker: {
      width: "25px",
      paddingLeft: "10px",
    },
    diffContainer: {
      "& tbody tr": {
        transition: "background-color 0.2s ease"
      },
      "& tbody tr:hover": {
        backgroundColor: "rgba(255, 255, 255, 0.02)"
      }
    }
  };

  return (
    <div className="rounded-b-2xl overflow-hidden [&>div]:!bg-transparent">
      <ReactDiffViewer
        oldValue={oldValue}
        newValue={newValue}
        splitView={true}
        compareMethod={DiffMethod.WORDS}
        useDarkTheme={darkMode}
        styles={customStyles}
        leftTitle="Original Code"
        rightTitle="Improved Code"
      />
    </div>
  );
};

export default DiffViewer;
