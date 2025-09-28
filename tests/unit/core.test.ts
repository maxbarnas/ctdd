import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  computeCommitId,
  ensureProjectDirs,
  loadSpec,
  loadState,
  initProject,
  applyDeltaObject,
  renderPrePrompt,
  renderPostPrompt
} from '../../src/core.js';
import { TestEnvironment, createMockSpec, expectValidCommitId, loadFixture } from '../utils/test-helpers.js';

describe('Core Functions', () => {
  let testEnv: TestEnvironment;

  beforeEach(async () => {
    testEnv = new TestEnvironment();
    await testEnv.setup();
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  describe('computeCommitId', () => {
    it('should generate consistent commit IDs for same spec', () => {
      const spec = createMockSpec();
      const commitId1 = computeCommitId(spec);
      const commitId2 = computeCommitId(spec);

      expect(commitId1).toBe(commitId2);
      expectValidCommitId(commitId1);
    });

    it('should generate different commit IDs for different specs', () => {
      const spec1 = createMockSpec();
      const spec2 = createMockSpec({
        focus_card: { ...spec1.focus_card, title: 'Different Title' }
      });

      const commitId1 = computeCommitId(spec1);
      const commitId2 = computeCommitId(spec2);

      expect(commitId1).not.toBe(commitId2);
      expectValidCommitId(commitId1);
      expectValidCommitId(commitId2);
    });

    it('should include focus_card_id in commit ID', () => {
      const spec = createMockSpec();
      const commitId = computeCommitId(spec);

      expect(commitId).toContain(spec.focus_card.focus_card_id);
    });
  });

  describe('ensureProjectDirs', () => {
    it('should create .ctdd directory structure', async () => {
      await ensureProjectDirs(testEnv.tempDir);

      // Check directories exist
      const ctddPath = testEnv.getPath('.ctdd');
      const pluginsPath = testEnv.getPath('.ctdd/plugins');
      const logsPath = testEnv.getPath('.ctdd/logs');

      // Verify directories were created by trying to write to them
      await testEnv.writeFile('.ctdd/test.txt', 'test');
      await testEnv.writeFile('.ctdd/plugins/test.json', '{}');
      await testEnv.writeFile('.ctdd/logs/test.log', 'log');

      expect(await testEnv.readFile('.ctdd/test.txt')).toBe('test');
    });

    it('should not fail if directories already exist', async () => {
      await ensureProjectDirs(testEnv.tempDir);
      await ensureProjectDirs(testEnv.tempDir); // Second call should not throw
    });
  });

  describe('loadSpec', () => {
    it('should load valid spec from file', async () => {
      const originalSpec = await loadFixture('sample-spec.json');
      await testEnv.writeSpec(originalSpec);

      const loadedSpec = await loadSpec(testEnv.tempDir);

      expect(loadedSpec).toEqual(originalSpec);
      expect(loadedSpec.focus_card.focus_card_id).toBe('FC-TEST-001');
      expect(loadedSpec.invariants).toHaveLength(3);
      expect(loadedSpec.cuts).toHaveLength(3);
    });

    it('should throw error if spec file does not exist', async () => {
      await expect(loadSpec(testEnv.tempDir)).rejects.toThrow();
    });

    it('should validate spec schema', async () => {
      const invalidSpec = { invalid: 'spec' };
      await testEnv.writeSpec(invalidSpec as any);

      await expect(loadSpec(testEnv.tempDir)).rejects.toThrow();
    });
  });

  describe('loadState', () => {
    it('should return null if state file does not exist', async () => {
      const state = await loadState(testEnv.tempDir);
      expect(state).toBeNull();
    });

    it('should load valid state from file', async () => {
      const originalState = {
        commit_id: 'CTDD:FC-TEST-001@abc123f',
        history: [],
        last_pre: null,
        last_post: null
      };
      await testEnv.writeState(originalState);

      const loadedState = await loadState(testEnv.tempDir);

      expect(loadedState).toEqual(originalState);
    });
  });

  describe('initProject', () => {
    it('should create spec and state files', async () => {
      await ensureProjectDirs(testEnv.tempDir);
      const result = await initProject(testEnv.tempDir);

      expect(result).toHaveProperty('commitId');
      expectValidCommitId(result.commitId);

      // Verify spec was created
      const spec = await loadSpec(testEnv.tempDir);
      expect(spec.focus_card.focus_card_id).toBe('FC-001');

      // Verify state was created
      const state = await loadState(testEnv.tempDir);
      expect(state).toHaveProperty('commit_id', result.commitId);
    });

    it('should throw error if spec already exists', async () => {
      await ensureProjectDirs(testEnv.tempDir);
      await initProject(testEnv.tempDir);

      await expect(initProject(testEnv.tempDir)).rejects.toThrow('Spec already exists');
    });
  });

  describe('applyDeltaObject', () => {
    it('should modify invariant text', async () => {
      const spec = createMockSpec();
      // Add invariant I2 to match the delta
      spec.invariants.push({ id: 'I2', text: 'No external dependencies allowed' });
      await testEnv.writeSpec(spec);

      const delta = await loadFixture('sample-delta.json');
      const result = await applyDeltaObject(testEnv.tempDir, delta);

      expect(result).toHaveProperty('newCommitId');
      expectValidCommitId(result.newCommitId);

      // Verify the spec was updated
      const updatedSpec = await loadSpec(testEnv.tempDir);
      const modifiedInvariant = updatedSpec.invariants.find(inv => inv.id === 'I2');
      expect(modifiedInvariant?.text).toBe('No external dependencies except for testing');
    });

    it('should add new CUTs', async () => {
      const spec = createMockSpec();
      await testEnv.writeSpec(spec);

      const delta = {
        type: 'add',
        new_tests: [
          { id: 'AT99', text: 'New acceptance test' }
        ]
      };

      const result = await applyDeltaObject(testEnv.tempDir, delta);

      expect(result).toHaveProperty('newCommitId');

      const updatedSpec = await loadSpec(testEnv.tempDir);
      expect(updatedSpec.cuts).toHaveLength(3); // 2 original + 1 new
      const newCut = updatedSpec.cuts.find(cut => cut.id === 'AT99');
      expect(newCut?.text).toBe('New acceptance test');
    });

    it('should remove invariants', async () => {
      const spec = createMockSpec();
      await testEnv.writeSpec(spec);

      const delta = {
        type: 'remove',
        target: 'I1'
      };

      const result = await applyDeltaObject(testEnv.tempDir, delta);

      expect(result).toHaveProperty('newCommitId');

      const updatedSpec = await loadSpec(testEnv.tempDir);
      expect(updatedSpec.invariants).toHaveLength(1);
      expect(updatedSpec.invariants.find(inv => inv.id === 'I1')).toBeUndefined();
    });

    it('should throw error for invalid target', async () => {
      const spec = createMockSpec();
      await testEnv.writeSpec(spec);

      const delta = {
        type: 'modify',
        target: 'NONEXISTENT',
        from: 'old',
        to: 'new'
      };

      await expect(applyDeltaObject(testEnv.tempDir, delta)).rejects.toThrow('Target not found: NONEXISTENT');
    });
  });

  describe('renderPrePrompt', () => {
    it('should render complete pre-test prompt', () => {
      const spec = createMockSpec();
      const commitId = computeCommitId(spec);

      const prompt = renderPrePrompt(spec, commitId);

      expect(prompt).toContain('You are resuming work');
      expect(prompt).toContain(commitId);
      expect(prompt).toContain(spec.focus_card.goal);
      expect(prompt).toContain('I1:');
      expect(prompt).toContain('AT1:');
    });

    it('should include all invariants and CUTs', () => {
      const spec = createMockSpec();
      const commitId = computeCommitId(spec);

      const prompt = renderPrePrompt(spec, commitId);

      // Check all invariants are present
      spec.invariants.forEach(invariant => {
        expect(prompt).toContain(`${invariant.id}:`);
        expect(prompt).toContain(invariant.text);
      });

      // Check all CUTs are present
      spec.cuts.forEach(cut => {
        expect(prompt).toContain(`${cut.id}:`);
        expect(prompt).toContain(cut.text);
      });
    });
  });

  describe('renderPostPrompt', () => {
    it('should render complete post-test prompt', () => {
      const spec = createMockSpec();
      const commitId = computeCommitId(spec);

      const prompt = renderPostPrompt(spec, commitId);

      expect(prompt).toContain('Commit:');
      expect(prompt).toContain(commitId);
      expect(prompt).toContain('AT1');
      expect(prompt).toContain('AT2');
    });

    it('should include artifact hint when provided', () => {
      const spec = createMockSpec();
      const commitId = computeCommitId(spec);
      const hint = 'Created parser.js and test.csv';

      const prompt = renderPostPrompt(spec, commitId, hint);

      expect(prompt).toContain(hint);
    });
  });
});