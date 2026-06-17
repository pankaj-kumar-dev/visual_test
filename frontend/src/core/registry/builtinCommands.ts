import { commandRegistry } from './commandRegistry.ts';
import type { ArgNode, AssertionKind, CommandDefinition, SelectorStrategy } from '../types.ts';

// ─── Arg helpers ──────────────────────────────────────────────────────────────

const ALL_STRATEGIES: SelectorStrategy[] = [
  'testId', 'role', 'label', 'placeholder', 'text', 'css',
];

const SELECTOR_ARG = (strategies = ALL_STRATEGIES) => ({
  name:     'selector',
  kind:     'selector' as const,
  required: true,
  label:    'Selector',
  strategies,
});

const ALIAS_ARG = {
  name:     'alias',
  kind:     'alias' as const,
  required: false,
  label:    'Alias ref',
  placeholder: 'alias name',
};

const TEXT_ARG = (label = 'Text', placeholder = '') => ({
  name: 'text',
  kind: 'string' as const,
  required: true,
  label,
  placeholder,
});

const ASSERTION_ARG: CommandDefinition['args'][0] = {
  name:       'assertion',
  kind:       'assertion' as const,
  required:   true,
  label:      'Assertion',
  assertions: [
    'be.visible', 'be.hidden', 'be.enabled', 'be.disabled', 'be.checked',
    'exist', 'not.exist',
    'have.text', 'contain.text', 'have.value',
    'have.class', 'have.attr',
    'include', 'equal',
  ] as AssertionKind[],
};

function requireNonEmpty(args: ArgNode[], kindFilter: ArgNode['kind']): string | null {
  const arg = args.find((a) => a.kind === kindFilter);
  if (!arg) return 'Required';
  if (arg.kind === 'string'   && !arg.value.trim())   return 'Cannot be empty';
  if (arg.kind === 'selector' && !arg.value.value.trim()) return 'Cannot be empty';
  if (arg.kind === 'alias'    && !arg.name.trim())    return 'Cannot be empty';
  return null;
}

// ─── Builtin registrations ────────────────────────────────────────────────────

commandRegistry

  // ── visit ──────────────────────────────────────────────────────────────────
  .register({
    name:        'visit',
    label:       'Visit URL',
    icon:        '🌐',
    category:    'utility',
    yields:      'void',
    requires:    'none',
    isRoot:      true,
    isChainable: false,
    args: [TEXT_ARG('URL', 'https://example.com')],
    defaultArgs: () => [{ kind: 'string', value: '' }],
    validate(args) {
      const err = requireNonEmpty(args, 'string');
      return err ? [{ field: 'url', message: err }] : [];
    },
  })

  // ── get ────────────────────────────────────────────────────────────────────
  .register({
    name:        'get',
    label:       'Get element',
    icon:        '🎯',
    category:    'query',
    yields:      'element',
    requires:    'none',
    isRoot:      true,
    isChainable: false,
    args: [SELECTOR_ARG()],
    defaultArgs: () => [{ kind: 'selector', value: { strategy: 'testId', value: '' } }],
    validate(args) {
      const sArg = args.find((a) => a.kind === 'selector');
      const aArg = args.find((a) => a.kind === 'alias');
      if (!sArg && !aArg) return [{ field: 'selector', message: 'Selector or alias required' }];
      if (sArg && sArg.kind === 'selector' && !sArg.value.value.trim()) {
        return [{ field: 'selector', message: 'Cannot be empty' }];
      }
      return [];
    },
  })

  // ── find ───────────────────────────────────────────────────────────────────
  .register({
    name:        'find',
    label:       'Find within',
    icon:        '🔍',
    category:    'query',
    yields:      'element',
    requires:    'element',
    isRoot:      false,
    isChainable: true,
    args: [SELECTOR_ARG(['testId', 'css', 'role'])],
    defaultArgs: () => [{ kind: 'selector', value: { strategy: 'testId', value: '' } }],
    validate(args) {
      const err = requireNonEmpty(args, 'selector');
      return err ? [{ field: 'selector', message: err }] : [];
    },
  })

  // ── contains ───────────────────────────────────────────────────────────────
  .register({
    name:        'contains',
    label:       'Contains text',
    icon:        '🔤',
    category:    'query',
    yields:      'element',
    requires:    'any',
    isRoot:      true,
    isChainable: true,
    args: [TEXT_ARG('Text content', 'Submit')],
    defaultArgs: () => [{ kind: 'string', value: '' }],
    validate(args) {
      const err = requireNonEmpty(args, 'string');
      return err ? [{ field: 'text', message: err }] : [];
    },
  })

  // ── click ──────────────────────────────────────────────────────────────────
  .register({
    name:        'click',
    label:       'Click',
    icon:        '👆',
    category:    'action',
    yields:      'element',
    requires:    'element',
    isRoot:      false,
    isChainable: true,
    args: [],
    defaultArgs: () => [],
    validate: () => [],
  })

  // ── type ───────────────────────────────────────────────────────────────────
  .register({
    name:        'type',
    label:       'Type text',
    icon:        '⌨️',
    category:    'action',
    yields:      'element',
    requires:    'element',
    isRoot:      false,
    isChainable: true,
    args: [TEXT_ARG('Text to type', 'Hello world')],
    defaultArgs: () => [{ kind: 'string', value: '' }],
    validate(args) {
      const err = requireNonEmpty(args, 'string');
      return err ? [{ field: 'text', message: err }] : [];
    },
  })

  // ── clear ──────────────────────────────────────────────────────────────────
  .register({
    name:        'clear',
    label:       'Clear field',
    icon:        '✖',
    category:    'action',
    yields:      'element',
    requires:    'element',
    isRoot:      false,
    isChainable: true,
    args: [],
    defaultArgs: () => [],
    validate: () => [],
  })

  // ── select ─────────────────────────────────────────────────────────────────
  .register({
    name:        'select',
    label:       'Select option',
    icon:        '▾',
    category:    'action',
    yields:      'element',
    requires:    'element',
    isRoot:      false,
    isChainable: true,
    args: [TEXT_ARG('Option value', 'option-value')],
    defaultArgs: () => [{ kind: 'string', value: '' }],
    validate(args) {
      const err = requireNonEmpty(args, 'string');
      return err ? [{ field: 'value', message: err }] : [];
    },
  })

  // ── check ──────────────────────────────────────────────────────────────────
  .register({
    name:        'check',
    label:       'Check box',
    icon:        '☑',
    category:    'action',
    yields:      'element',
    requires:    'element',
    isRoot:      false,
    isChainable: true,
    args: [],
    defaultArgs: () => [],
    validate: () => [],
  })

  // ── should ─────────────────────────────────────────────────────────────────
  .register({
    name:        'should',
    label:       'Assert',
    icon:        '✓',
    category:    'assertion',
    yields:      'element',
    requires:    'any',
    isRoot:      false,
    isChainable: true,
    args: [ASSERTION_ARG],
    defaultArgs: () => [{ kind: 'assertion', assertion: 'be.visible' }],
    validate(args) {
      const a = args.find((x) => x.kind === 'assertion');
      if (!a) return [{ field: 'assertion', message: 'Required' }];
      return [];
    },
  })

  // ── and ────────────────────────────────────────────────────────────────────
  .register({
    name:        'and',
    label:       'And (assert)',
    icon:        '✓✓',
    category:    'assertion',
    yields:      'element',
    requires:    'any',
    isRoot:      false,
    isChainable: true,
    args: [ASSERTION_ARG],
    defaultArgs: () => [{ kind: 'assertion', assertion: 'be.visible' }],
    validate(args) {
      const a = args.find((x) => x.kind === 'assertion');
      if (!a) return [{ field: 'assertion', message: 'Required' }];
      return [];
    },
  })

  // ── url ────────────────────────────────────────────────────────────────────
  .register({
    name:        'url',
    label:       'Get URL',
    icon:        '🔗',
    category:    'query',
    yields:      'string',
    requires:    'none',
    isRoot:      true,
    isChainable: false,
    args: [],
    defaultArgs: () => [],
    validate: () => [],
  })

  // ── title ──────────────────────────────────────────────────────────────────
  .register({
    name:        'title',
    label:       'Get title',
    icon:        '📋',
    category:    'query',
    yields:      'string',
    requires:    'none',
    isRoot:      true,
    isChainable: false,
    args: [],
    defaultArgs: () => [],
    validate: () => [],
  })

  // ── wait ───────────────────────────────────────────────────────────────────
  .register({
    name:        'wait',
    label:       'Wait',
    icon:        '⏱',
    category:    'utility',
    yields:      'void',
    requires:    'none',
    isRoot:      true,
    isChainable: false,
    args: [{ name: 'ms', kind: 'number', required: false, label: 'Milliseconds', placeholder: '1000' }],
    defaultArgs: () => [{ kind: 'number', value: 1000 }],
    validate: () => [],
  })

  // ── fixture ────────────────────────────────────────────────────────────────
  .register({
    name:        'fixture',
    label:       'Load fixture',
    icon:        '📂',
    category:    'utility',
    yields:      'void',
    requires:    'none',
    isRoot:      true,
    isChainable: true,
    args: [TEXT_ARG('Fixture name', 'user.json')],
    defaultArgs: () => [{ kind: 'string', value: '' }],
    validate(args) {
      const err = requireNonEmpty(args, 'string');
      return err ? [{ field: 'name', message: err }] : [];
    },
  })

  // ── env ────────────────────────────────────────────────────────────────────
  .register({
    name:        'env',
    label:       'Get env var',
    icon:        '⚙',
    category:    'utility',
    yields:      'string',
    requires:    'none',
    isRoot:      true,
    isChainable: true,
    args: [TEXT_ARG('Variable name', 'API_URL')],
    defaultArgs: () => [{ kind: 'string', value: '' }],
    validate(args) {
      const err = requireNonEmpty(args, 'string');
      return err ? [{ field: 'name', message: err }] : [];
    },
  });
