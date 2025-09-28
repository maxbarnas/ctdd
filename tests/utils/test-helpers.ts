import { tmpdir } from 'os';
import { join } from 'path';
import { mkdtemp, rm, writeFile, readFile, mkdir } from 'fs/promises';
import type { Spec } from '../../src/core.js';

export class TestEnvironment {
  public tempDir: string = '';
  public ctddDir: string = '';

  async setup(): Promise<void> {
    this.tempDir = await mkdtemp(join(tmpdir(), 'ctdd-test-'));
    this.ctddDir = join(this.tempDir, '.ctdd');
    await mkdir(this.ctddDir, { recursive: true });
    await mkdir(join(this.ctddDir, 'plugins'), { recursive: true });
    await mkdir(join(this.ctddDir, 'logs'), { recursive: true });
  }

  async cleanup(): Promise<void> {
    if (this.tempDir) {
      await rm(this.tempDir, { recursive: true, force: true });
    }
  }

  async writeSpec(spec: Spec): Promise<void> {
    const specPath = join(this.ctddDir, 'spec.json');
    await writeFile(specPath, JSON.stringify(spec, null, 2), 'utf-8');
  }

  async writeState(state: any): Promise<void> {
    const statePath = join(this.ctddDir, 'state.json');
    await writeFile(statePath, JSON.stringify(state, null, 2), 'utf-8');
  }

  async writeFile(relativePath: string, content: string): Promise<void> {
    const fullPath = join(this.tempDir, relativePath);
    await writeFile(fullPath, content, 'utf-8');
  }

  async readFile(relativePath: string): Promise<string> {
    const fullPath = join(this.tempDir, relativePath);
    return await readFile(fullPath, 'utf-8');
  }

  getPath(relativePath: string = ''): string {
    return join(this.tempDir, relativePath);
  }
}

export async function loadFixture(fixtureName: string): Promise<any> {
  const fixturePath = join(process.cwd(), 'tests', 'fixtures', fixtureName);
  const content = await readFile(fixturePath, 'utf-8');
  return JSON.parse(content);
}

export function createMockSpec(overrides: Partial<Spec> = {}): Spec {
  return {
    focus_card: {
      focus_card_id: 'FC-MOCK-001',
      title: 'Mock Test Project',
      goal: 'Test the CTDD framework',
      deliverables: ['test.js'],
      constraints: ['Node 18+'],
      non_goals: ['Production deployment'],
      sources_of_truth: ['test.js'],
      token_budget: 500
    },
    invariants: [
      { id: 'I1', text: 'Must be testable' },
      { id: 'I2', text: 'Must be fast' }
    ],
    cuts: [
      { id: 'AT1', text: 'Test passes' },
      { id: 'AT2', text: 'Test is fast' }
    ],
    ...overrides
  };
}

export function expectValidCommitId(commitId: string): void {
  // Format: CTDD:FC-XXX-NNN@hash7
  const pattern = /^CTDD:[A-Z0-9-]+@[a-f0-9]{7}$/;
  if (!pattern.test(commitId)) {
    throw new Error(`Invalid commit ID format: ${commitId}`);
  }
}