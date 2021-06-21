import { Files } from '@common/api';
import React from 'react';
import FolderTree from 'react-folder-tree';
import 'react-folder-tree/dist/style.css';
import './style.css';
import react from './templates/react';

function generateFileTree(files: Files) {
  type TreeData = {
    name: string;
    isOpen: boolean;
    children?: TreeData[];
    fsPath: string;
    isDir?: boolean;
  };
  let tree: TreeData = {
    name: 'react',
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
        curRoot = dir;
      }
    }
  }

  return tree;
}

export default function App() {
  return (
    <div className="file-tree">
      <FolderTree
        onNameClick={({ defaultOnClick, nodeData }: any) => {
          defaultOnClick();

          console.log(nodeData);
        }}
        data={generateFileTree(react)}
        showCheckbox={false}
      />
    </div>
  );
}
