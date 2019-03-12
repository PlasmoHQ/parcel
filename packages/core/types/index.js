// @flow strict-local

import type {AST as _AST, Config as _Config, Node as _Node} from './unsafe';

export type AST = _AST;
export type Config = _Config;
export type Node = _Node;

export type JSONValue =
  | null
  | boolean
  | number
  | string
  | Array<JSONValue>
  | JSONObject;

export type JSONObject = {
  [key: string]: JSONValue
};

export type PackageName = string;
export type FilePath = string;
export type Glob = string;
type Semver = string;
type SemverRange = string;
export type ModuleSpecifier = string;

export type GlobMap<T> = {[Glob]: T};
export type ParcelConfig = {|
  extends?: PackageName | FilePath | Array<PackageName | FilePath>,
  resolvers?: Array<PackageName>,
  transforms?: {
    [Glob]: Array<PackageName>
  },
  bundler?: PackageName,
  namers?: Array<PackageName>,
  runtimes?: {
    [EnvironmentContext]: Array<PackageName>
  },
  packagers?: {
    [Glob]: PackageName
  },
  optimizers?: {
    [Glob]: Array<PackageName>
  },
  reporters?: Array<PackageName>
|};

export type Engines = {
  node?: SemverRange,
  electron?: SemverRange,
  browsers?: Array<string>
};

export type Target = {|
  name: string,
  distPath?: FilePath,
  env: Environment
|};

export type EnvironmentContext =
  | 'browser'
  | 'web-worker'
  | 'service-worker'
  | 'node'
  | 'electron';

export type EnvironmentOpts = {
  context: EnvironmentContext,
  engines: Engines,
  includeNodeModules?: boolean
};

export interface Environment {
  context: EnvironmentContext;
  engines: Engines;
  includeNodeModules: boolean;

  merge(env: ?EnvironmentOpts): Environment;
  isBrowser(): boolean;
  isNode(): boolean;
  isElectron(): boolean;
  isIsolated(): boolean;
}

type PackageDependencies = {|
  [PackageName]: Semver
|};

export type PackageJSON = {
  name: PackageName,
  version: Semver,
  main?: FilePath,
  module?: FilePath,
  browser?: FilePath | {[FilePath]: FilePath | boolean},
  source?: FilePath | {[FilePath]: FilePath},
  alias?: {
    [PackageName | FilePath | Glob]: PackageName | FilePath
  },
  browserslist?: Array<string>,
  engines?: Engines,
  targets?: {
    [string]: EnvironmentOpts
  },
  dependencies?: PackageDependencies,
  devDependencies?: PackageDependencies,
  peerDependencies?: PackageDependencies
};

export type ParcelOptions = {|
  entries?: Array<FilePath>,
  rootDir?: FilePath,
  config?: ParcelConfig,
  defaultConfig?: ParcelConfig,
  env?: {[string]: string},
  targets?: Array<Target>,

  watch?: boolean,
  cache?: boolean,
  cacheDir?: FilePath,
  killWorkers?: boolean,
  production?: boolean,
  minify?: boolean,
  sourceMaps?: boolean,
  publicUrl?: string,
  hot?: ServerOptions | boolean,
  serve?: ServerOptions | boolean,
  autoinstall?: boolean,
  logLevel?: number

  // contentHash
  // scopeHoist
  // throwErrors
  // global?
  // detailedReport
|};

export type ServerOptions = {|
  host?: string,
  port?: number,
  https?: HTTPSOptions | boolean
|};

export type HTTPSOptions = {|
  cert?: FilePath,
  key?: FilePath
|};

export type CLIOptions = {
  cacheDir?: FilePath,
  watch?: boolean,
  distDir?: FilePath,
  production?: boolean,
  cache?: boolean
};

export type SourceLocation = {|
  filePath: string,
  start: {line: number, column: number},
  end: {line: number, column: number}
|};

export type Meta = {
  globals?: Map<string, Asset>,
  [string]: JSONValue
};
export type DependencyOptions = {|
  moduleSpecifier: ModuleSpecifier,
  isAsync?: boolean,
  isEntry?: boolean,
  isOptional?: boolean,
  isURL?: boolean,
  loc?: SourceLocation,
  env?: EnvironmentOpts,
  meta?: Meta,
  target?: Target
|};

export interface Dependency {
  id: string;
  moduleSpecifier: ModuleSpecifier;
  isAsync: ?boolean;
  isEntry: ?boolean;
  isOptional: ?boolean;
  isURL: ?boolean;
  loc: ?SourceLocation;
  env: Environment;
  meta: ?Meta;
  target: ?Target;

  // TODO: get this from graph instead of storing them on dependencies
  sourcePath: FilePath;
}

export type File = {
  filePath: FilePath,
  hash?: string
};

export type TransformerRequest = {
  filePath: FilePath,
  env: Environment,
  code?: string
};

export interface Asset {
  id: string;
  hash: string;
  filePath: FilePath;
  type: string;
  code: string;
  ast: ?AST;
  dependencies: Array<Dependency>;
  connectedFiles: Array<File>;
  output: AssetOutput;
  outputSize: number;
  outputHash: string;
  env: Environment;
  meta: Meta;

  getConfig(
    filePaths: Array<FilePath>,
    options: ?{packageKey?: string, parse?: boolean}
  ): Promise<Config | null>;
  getPackage(): Promise<PackageJSON | null>;
  addDependency(dep: DependencyOptions): string;
  createChildAsset(result: TransformerResult): Asset;
  getOutput(): Promise<AssetOutput>;
}

export type AssetOutput = {|
  code: string,
  map?: SourceMap,
  [string]: Blob | JSONValue
|};

export type SourceMap = JSONObject;
export type Blob = string | Buffer;

export type TransformerResult = {
  type: string,
  code?: string,
  ast?: ?AST,
  dependencies?: Array<DependencyOptions>,
  connectedFiles?: Array<File>,
  output?: AssetOutput,
  env?: EnvironmentOpts,
  meta?: Meta
};

type Async<T> = T | Promise<T>;

export type Transformer = {
  getConfig?: (asset: Asset, opts: CLIOptions) => Async<Config | void>,
  canReuseAST?: (ast: AST, opts: CLIOptions) => boolean,
  parse?: (asset: Asset, config: ?Config, opts: CLIOptions) => Async<?AST>,
  transform(
    asset: Asset,
    config: ?Config,
    opts: CLIOptions
  ): Async<Array<TransformerResult | Asset>>,
  generate?: (
    asset: Asset,
    config: ?Config,
    opts: CLIOptions
  ) => Async<AssetOutput>,
  postProcess?: (
    assets: Array<Asset>,
    config: ?Config,
    opts: CLIOptions
  ) => Async<Array<TransformerResult>>
};

export type CacheEntry = {
  filePath: FilePath,
  env: Environment,
  hash: string,
  assets: Array<Asset>,
  initialAssets: ?Array<Asset> // Initial assets, pre-post processing
};

export interface TraversalActions {
  skipChildren(): void;
  stop(): void;
}

export type GraphTraversalCallback<TNode, TContext> = (
  node: TNode,
  context: ?TContext,
  traversal: TraversalActions
) => ?TContext;

export type NodeId = string;

export type Edge = {|
  from: NodeId,
  to: NodeId
|};

export interface Graph<TNode: Node> {
  nodes: Map<string, TNode>;
  edges: Set<Edge>;
  merge(graph: Graph<TNode>): void;
  traverse<TContext>(
    visit: GraphTraversalCallback<TNode, TContext>,
    startNode: ?TNode
  ): ?TContext;
}

// TODO: what do we want to expose here?
export interface AssetGraph extends Graph<Node> {
  traverseAssets(visit: GraphTraversalCallback<Asset, Node>): ?Node;
  createBundle(asset: Asset): Bundle;
  getTotalSize(asset?: Asset): number;
  getEntryAssets(): Array<Asset>;
  removeAsset(asset: Asset): void;
  getDependencies(asset: Asset): Array<Dependency>;
  getDependencyResolution(dependency: Dependency): ?Asset;
}

export type BundleGroup = {
  dependency: Dependency,
  target: ?Target,
  entryAssetId: string
};

export type Bundle = {|
  id: string,
  type: string,
  assetGraph: AssetGraph,
  env: Environment,
  isEntry?: boolean,
  target?: Target,
  filePath?: FilePath
|};

export interface BundleGraph extends Graph<Node> {
  addBundleGroup(parentBundle: ?Bundle, bundleGroup: BundleGroup): void;
  addBundle(bundleGroup: BundleGroup, bundle: Bundle): void;
  isAssetInAncestorBundle(bundle: Bundle, asset: Asset): boolean;
  findBundlesWithAsset(asset: Asset): Array<Bundle>;
  getBundles(bundleGroup: BundleGroup): Array<Bundle>;
  getBundleGroups(bundle: Bundle): Array<BundleGroup>;
  traverseBundles<TContext>(
    visit: GraphTraversalCallback<Bundle, TContext>
  ): ?TContext;
}

export type Bundler = {|
  bundle(
    graph: AssetGraph,
    bundleGraph: BundleGraph,
    opts: CLIOptions
  ): Async<void>
|};

export type Namer = {|
  name(bundle: Bundle, opts: CLIOptions): Async<?FilePath>
|};

export type Runtime = {|
  apply(bundle: Bundle, opts: CLIOptions): Async<void>
|};

export type Packager = {|
  package(bundle: Bundle, opts: CLIOptions): Async<Blob>
|};

export type Optimizer = {|
  optimize(bundle: Bundle, contents: Blob, opts: CLIOptions): Async<Blob>
|};

export type Resolver = {|
  resolve(
    dependency: Dependency,
    opts: CLIOptions,
    rootDir: string
  ): Async<FilePath | null>
|};

export type Reporter = {|
  report(bundles: Array<Bundle>, opts: CLIOptions): void
|};
