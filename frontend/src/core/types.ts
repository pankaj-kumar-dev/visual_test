// ─── Framework target ─────────────────────────────────────────────────────────

export type FrameworkTarget = 'cypress' | 'playwright';

// ─── Selector ─────────────────────────────────────────────────────────────────

export type SelectorStrategy =
  | 'testId'        // [data-testid="x"] or custom attribute
  | 'role'          // ARIA role + optional accessible name
  | 'label'         // by <label> text
  | 'placeholder'   // by placeholder attribute
  | 'text'          // by visible text content
  | 'css'           // raw CSS selector (escape hatch)
  | 'xpath';        // XPath (last resort)

export interface SelectorNode {
  strategy: SelectorStrategy;
  value: string;
  name?: string;       // role: filter by accessible name
  exact?: boolean;     // text: exact match (default true)
  attribute?: string;  // testId: override 'data-testid' e.g. 'data-cy'
}

// ─── Assertions ───────────────────────────────────────────────────────────────

export type AssertionKind =
  | 'be.visible' | 'be.hidden' | 'be.enabled' | 'be.disabled' | 'be.checked'
  | 'exist'      | 'not.exist'
  | 'have.text'  | 'contain.text' | 'have.value'
  | 'have.class' | 'have.attr'
  | 'include'    | 'equal'
  | 'be.gt' | 'be.gte' | 'be.lt' | 'be.lte';

// ─── Command arguments ────────────────────────────────────────────────────────

export type ArgNode =
  | { kind: 'selector';  value: SelectorNode }
  | { kind: 'string';    value: string }
  | { kind: 'number';    value: number }
  | { kind: 'boolean';   value: boolean }
  | { kind: 'assertion'; assertion: AssertionKind; expected?: string }
  | { kind: 'options';   value: Record<string, unknown> }
  | { kind: 'alias';     name: string };

// ─── Command chain ────────────────────────────────────────────────────────────

export interface CommandNode {
  id: string;
  name: string;           // registered name in CommandRegistry
  args: ArgNode[];
  alias?: string;         // .as('name') — subject alias for later reference
  chain: CommandNode[];   // chained continuation — unlimited depth
}

// ─── Step ─────────────────────────────────────────────────────────────────────

export interface StepNode {
  id: string;
  command: CommandNode;
  label?: string;         // UI label override (auto-derived if absent)
  disabled?: boolean;
}

// ─── Lifecycle hooks ──────────────────────────────────────────────────────────

export type HookKind = 'beforeAll' | 'beforeEach' | 'afterEach' | 'afterAll';

// ─── Tree nodes ───────────────────────────────────────────────────────────────

export interface SuiteTreeNode {
  id: string;
  kind: 'suite';
  name: string;
  parentId: string | null;             // null ONLY for root suite
  children: string[];                  // ordered IDs — SuiteTreeNode | TestTreeNode
  hooks: Record<HookKind, string[]>;   // ordered HookTreeNode IDs per phase
  parallel?: boolean;
}

export interface TestTreeNode {
  id: string;
  kind: 'test';
  name: string;
  parentId: string;
  steps: StepNode[];
  tags?: string[];
  skip?: boolean;
  only?: boolean;
}

export interface HookTreeNode {
  id: string;
  kind: 'hook';
  hookKind: HookKind;
  parentId: string;
  steps: StepNode[];
}

export type TreeNode = SuiteTreeNode | TestTreeNode | HookTreeNode;

// ─── Environment ──────────────────────────────────────────────────────────────

export interface Environment {
  name: string;
  baseUrl: string;
}

// ─── Flow ─────────────────────────────────────────────────────────────────────

export interface Flow {
  version: '2.0';
  name: string;
  target: FrameworkTarget;
  baseUrl: string;
  environments: Environment[];
  activeEnvironment: string | null;
  tags: string[];
  rootSuiteId: string;
  nodes: Record<string, TreeNode>;
  createdAt: string;
  updatedAt: string;
}

export interface FlowMeta {
  name?: string;
  target?: FrameworkTarget;
  baseUrl?: string;
  tags?: string[];
  environments?: Environment[];
  activeEnvironment?: string | null;
}

// ─── Selection state ──────────────────────────────────────────────────────────

export type Selection =
  | { kind: 'node'; nodeId: string }
  | { kind: 'step'; nodeId: string; stepId: string }
  | null;

// ─── Command registry types ───────────────────────────────────────────────────

export type CommandCategory = 'query' | 'action' | 'assertion' | 'utility';

export type SubjectKind =
  | 'element'
  | 'elements'
  | 'string'
  | 'void'
  | 'window'
  | 'document';

export interface ArgDefinition {
  name: string;
  kind: ArgNode['kind'];
  required: boolean;
  label: string;
  strategies?: SelectorStrategy[];
  assertions?: AssertionKind[];
  placeholder?: string;
}

export interface CommandDefinition {
  name: string;
  label: string;
  icon: string;
  category: CommandCategory;
  yields: SubjectKind;
  requires: SubjectKind | 'any' | 'none';
  isRoot: boolean;
  isChainable: boolean;
  args: ArgDefinition[];
  defaultArgs(): ArgNode[];
  validate(args: ArgNode[]): Array<{ field: string; message: string }>;
}

// ─── Validation ───────────────────────────────────────────────────────────────

export type ValidationSeverity = 'error' | 'warn';

export interface ValidationError {
  severity: ValidationSeverity;
  nodeId: string;
  stepId?: string;
  commandPath?: number[];
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}
