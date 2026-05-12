import type { ArgNode, CommandDefinition, CommandCategory, SubjectKind } from '../types.ts';

// ─── Registry ─────────────────────────────────────────────────────────────────

class CommandRegistry {
  private readonly defs = new Map<string, CommandDefinition>();

  register(def: CommandDefinition): this {
    if (this.defs.has(def.name)) {
      throw new Error(`Command "${def.name}" already registered`);
    }
    this.defs.set(def.name, def);
    return this;
  }

  get(name: string): CommandDefinition | null {
    return this.defs.get(name) ?? null;
  }

  getOrThrow(name: string): CommandDefinition {
    const def = this.defs.get(name);
    if (!def) throw new Error(`Command "${name}" not registered`);
    return def;
  }

  has(name: string): boolean {
    return this.defs.has(name);
  }

  all(): CommandDefinition[] {
    return Array.from(this.defs.values());
  }

  byCategory(category: CommandCategory): CommandDefinition[] {
    return this.all().filter((d) => d.category === category);
  }

  rootCommands(): CommandDefinition[] {
    return this.all().filter((d) => d.isRoot);
  }

  /** Validate args for a given command name. Returns field-level errors. */
  validateArgs(name: string, args: ArgNode[]): Array<{ field: string; message: string }> {
    const def = this.defs.get(name);
    if (!def) return [];
    return def.validate(args);
  }

  /**
   * Check whether command `b` can chain after command `a`.
   * Returns true if a.yields satisfies b.requires.
   */
  canChain(producerName: string, consumerName: string): boolean {
    const producer = this.defs.get(producerName);
    const consumer = this.defs.get(consumerName);
    if (!producer || !consumer) return false;
    if (!consumer.isChainable) return false;
    const req = consumer.requires;
    if (req === 'any') return true;
    if (req === 'none') return false; // root-only command
    return producer.yields === req;
  }
}

export const commandRegistry = new CommandRegistry();
