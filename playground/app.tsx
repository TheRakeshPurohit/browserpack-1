import { Files } from '@common/api';
import React, { useEffect, useRef, useState } from 'react';
import FolderTree from 'react-folder-tree';
import 'react-folder-tree/dist/style.css';
import './style.css';
import react from './templates/react';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/javascript/javascript';
import { getProjectTemplateDefintion } from '@common/utils';
import angular from './templates/angular';
import Browserpack from '@client';
import { debounce } from 'lodash-es';

const templates: any = {
  react: react,
  angular: angular
};

type TreeData = {
  name: string;
  isOpen: boolean;
  children?: TreeData[];
  fsPath: string;
  isDir?: boolean;
};

function generateFileTree(files: Files) {
  let tree: TreeData = {
    name: 'project',
    isOpen: true,
    children: [],
    fsPath: '/'
  };

  for (const file in files) {
    const fileParts = file.split('/');
    let curRoot = tree;

    for (let i = 0; i < fileParts.length; i++) {
      if (fileParts[i].length == 0) continue;

      let dir: TreeData | undefined = curRoot.children?.find(
        (child) => child.name === fileParts[i]
      );

      if (!dir) {
        dir = {
          name: fileParts[i],
          isOpen: true,
          fsPath: fileParts.slice(0, i + 1).join('/')
        };

        if (i != fileParts.length - 1) {
          dir.children = [];
          dir.isDir = true;
        }

        curRoot.children?.push(dir);
      }

      curRoot = dir;
    }
  }

  return tree;
}

const sendPatch = debounce(
  (browserpack: Browserpack, selectedFile: string, value) => {
    browserpack.patch({
      [selectedFile]: {
        content: value
      }
    });
  },
  200
);

export default function App() {
  const [selectedTemplate, setSelectedTemplate] = useState(angular);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [code, setCode] = useState<any>();
  const [fileTree, setFileTree] = useState<TreeData>({
    name: '/',
    children: [],
    isOpen: false,
    fsPath: '/'
  });
  const browserpack = useRef<Browserpack>();

  useEffect(() => {
    const templateDefinition = getProjectTemplateDefintion(selectedTemplate);

    setSelectedFile(templateDefinition.entry);
    setFileTree(generateFileTree(selectedTemplate));

    browserpack.current = new Browserpack(
      '#preview',
      selectedTemplate,
      process.env.NODE_ENV === 'production'
        ? '/preview'
        : 'http://localhost:3001'
    );
    browserpack.current.init();

    browserpack.current.onReady(async () => {
      await browserpack.current?.bundle();

      browserpack.current?.run();
    });

    return () => browserpack.current?.cleanup();
  }, [selectedTemplate]);

  useEffect(() => {
    if (selectedFile) {
      setCode(selectedTemplate[selectedFile].content);
    }
  }, [selectedFile]);

  return (
    <div className="workspace">
      <div className="file-tree">
        <select
          onChange={(evt) => setSelectedTemplate(templates[evt.target.value])}
          className="project-selector"
        >
          <option value="angular">Angular</option>
          <option value="react">React</option>
        </select>
        <FolderTree
          onNameClick={({ nodeData }: any) => {
            setSelectedFile(nodeData.fsPath);
          }}
          data={fileTree}
          showCheckbox={false}
        />
      </div>
      <div className="editor">
        <CodeMirror
          className="editor"
          value={code}
          onBeforeChange={(editor, data, value) => {
            setCode(value);

            selectedTemplate[selectedFile] = {
              content: value
            };

            if (browserpack.current) {
              sendPatch(browserpack.current, selectedFile, value);
            }
          }}
          options={{
            mode: 'javascript',
            theme: 'material',
            lineNumbers: true
          }}
          onChange={(editor, data, value) => {}}
        />
      </div>
    </div>
  );
}
