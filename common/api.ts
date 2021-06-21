export type Files = Record<
  string,
  {
    content: string;
  }
>;

export type ProjectTemplateDefintion = {
  htmlEntry: string;
  entry: string;
};

export type ProjectTemplate = 'react' | 'angular' | 'vanilla';

export type Asset = {
  code?: string | null;
  dependencies: string[];
};

export type DepGraph = Record<string, Asset>;

export type BundlerWorkerMessage =
  | {
      type: 'BUILD_DEP_GRAPH';
      payload: {
        files: Files;
        entryPoint?: string;
        invalidateFiles: string[];
      };
    }
  | {
      type: 'DEP_GRAPH_READY';
      payload: {
        depGraph: DepGraph;
      };
    }
  | {
      type: 'ERR';
      payload: {
        err: Error;
      };
    }
  | {
      type: 'TRANSFORM';
      payload: {
        filePath: string;
        code: string;
      };
    }
  | {
      type: 'TRANSFORM_READY';
      payload: {
        filePath: string;
        transformedCode: string;
      };
    };

export type ClientMessage =
  | {
      type: 'BUNDLE';
      payload: {
        files: Files;
      };
    }
  | {
      type: 'BUNDLE_READY';
    }
  | {
      type: 'BUNDLER_READY';
    }
  | {
      type: 'PATCH';
      payload: {
        files: Files;
      };
    }
  | {
      type: 'ERR';
      payload: {
        err: Error;
      };
    }
  | {
      type: 'RUN';
    };
