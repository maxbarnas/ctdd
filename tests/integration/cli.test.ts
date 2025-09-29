import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { TestEnvironment, loadFixture, expectValidCommitId } from '../utils/test-helpers.js';

const execAsync = promisify(exec);

// Path to the built CLI
const CLI_PATH = join(process.cwd(), 'dist', 'index.js');

describe('CLI Integration Tests', () => {
  let testEnv: TestEnvironment;

  beforeEach(async () => {
    testEnv = new TestEnvironment();
    await testEnv.setup();

    // Ensure we have a built version to test
    try {
      await execAsync('npm run build');
    } catch (error) {
      console.warn('Build failed, tests may fail:', error);
    }
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  describe('ctdd init', () => {
    it('should initialize CTDD project successfully', async () => {
      const { stdout, stderr } = await execAsync(`node "${CLI_PATH}" init`, {
        cwd: testEnv.tempDir
      });

      expect(stderr).toBe('');
      expect(stdout).toContain('✅ Project initialized with commit ID:');
      expect(stdout).toContain('CTDD:FC-001@');

      // Verify files were created
      const specContent = await testEnv.readFile('.ctdd/spec.json');
      const spec = JSON.parse(specContent);
      expect(spec.focus_card.focus_card_id).toBe('FC-001');
    });

    it('should fail if project already initialized', async () => {
      // Initialize once
      await execAsync(`node "${CLI_PATH}" init`, { cwd: testEnv.tempDir });

      // Try to initialize again
      try {
        await execAsync(`node "${CLI_PATH}" init`, { cwd: testEnv.tempDir });
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.stderr || error.stdout).toContain('Spec already exists');
      }
    });
  });

  describe('ctdd status', () => {
    it('should show current project status', async () => {
      // Initialize project first
      await execAsync(`node "${CLI_PATH}" init`, { cwd: testEnv.tempDir });

      const { stdout, stderr } = await execAsync(`node "${CLI_PATH}" status`, {
        cwd: testEnv.tempDir
      });

      expect(stderr).toBe('');
      expect(stdout).toContain('Commit: CTDD:FC-001@');
      expect(stdout).toContain('Title: New CTDD Project');
      expect(stdout).toContain('Goal: Define your project goal here.');
      expect(stdout).toContain('History entries: 0');
    });

    it('should fail if no project exists', async () => {
      try {
        await execAsync(`node "${CLI_PATH}" status`, { cwd: testEnv.tempDir });
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.stderr || error.stdout).toContain('[E001]');
        expect(error.stderr || error.stdout).toContain('CTDD spec file not found');
      }
    });
  });

  describe('ctdd hash', () => {
    it('should compute and display commit ID', async () => {
      // Initialize project first
      await execAsync(`node "${CLI_PATH}" init`, { cwd: testEnv.tempDir });

      const { stdout, stderr } = await execAsync(`node "${CLI_PATH}" hash`, {
        cwd: testEnv.tempDir
      });

      expect(stderr).toBe('');
      const commitId = stdout.trim();
      expectValidCommitId(commitId);
      expect(commitId).toContain('CTDD:FC-001@');
    });
  });

  describe('ctdd pre', () => {
    it('should generate pre-test prompt', async () => {
      // Initialize project first
      await execAsync(`node "${CLI_PATH}" init`, { cwd: testEnv.tempDir });

      const { stdout, stderr } = await execAsync(`node "${CLI_PATH}" pre`, {
        cwd: testEnv.tempDir
      });

      expect(stderr).toBe('');
      expect(stdout).toContain('You are resuming work');
      expect(stdout).toContain('CTDD:FC-001@');
      expect(stdout).toContain('I1:');
      expect(stdout).toContain('AT1:');
      expect(stdout).toContain('"commit_id"');
    });

    it('should write prompt to file when --out specified', async () => {
      // Initialize project first
      await execAsync(`node "${CLI_PATH}" init`, { cwd: testEnv.tempDir });

      const outputPath = join(testEnv.tempDir, 'pre-prompt.txt');
      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" pre --out "${outputPath}"`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toBe(''); // No stdout when writing to file

      const promptContent = await testEnv.readFile('pre-prompt.txt');
      expect(promptContent).toContain('You are resuming work');
      expect(promptContent).toContain('CTDD:FC-001@');
    });
  });

  describe('ctdd post', () => {
    it('should generate post-test prompt', async () => {
      // Initialize project first
      await execAsync(`node "${CLI_PATH}" init`, { cwd: testEnv.tempDir });

      const { stdout, stderr } = await execAsync(`node "${CLI_PATH}" post`, {
        cwd: testEnv.tempDir
      });

      expect(stderr).toBe('');
      expect(stdout).toContain('Commit: CTDD:FC-001@');
      expect(stdout).toContain('I1, I2');
      expect(stdout).toContain('AT1, AT2');
      expect(stdout).toContain('"post_check"');
    });

    it('should include artifact hint when provided', async () => {
      // Initialize project first
      await execAsync(`node "${CLI_PATH}" init`, { cwd: testEnv.tempDir });

      // Create artifact file
      const artifactPath = join(testEnv.tempDir, 'artifact.txt');
      await testEnv.writeFile('artifact.txt', 'Created parser.js and test files');

      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" post --artifact "${artifactPath}"`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('Created parser.js and test files');
    });
  });

  describe('ctdd validate-pre', () => {
    it('should validate correct pre-response JSON', async () => {
      // Initialize project first
      await execAsync(`node "${CLI_PATH}" init`, { cwd: testEnv.tempDir });

      // Create valid pre-response
      const preResponse = await loadFixture('sample-pre-response.json');
      await testEnv.writeFile('pre-response.json', JSON.stringify(preResponse));

      const responsePath = join(testEnv.tempDir, 'pre-response.json');
      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" validate-pre "${responsePath}"`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('✅ Pre-response validation passed');
    });

    it('should reject invalid pre-response JSON', async () => {
      // Initialize project first
      await execAsync(`node "${CLI_PATH}" init`, { cwd: testEnv.tempDir });

      // Create invalid pre-response
      const invalidResponse = { invalid: 'data' };
      await testEnv.writeFile('invalid-pre.json', JSON.stringify(invalidResponse));

      const responsePath = join(testEnv.tempDir, 'invalid-pre.json');
      try {
        await execAsync(
          `node "${CLI_PATH}" validate-pre "${responsePath}"`,
          { cwd: testEnv.tempDir }
        );
        expect.fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.stderr || error.stdout).toContain('Pre-response schema validation failed');
      }
    });
  });

  describe('ctdd validate-post', () => {
    it('should validate correct post-response JSON', async () => {
      // Initialize project first
      await execAsync(`node "${CLI_PATH}" init`, { cwd: testEnv.tempDir });

      // Create valid post-response
      const postResponse = await loadFixture('sample-post-response.json');
      await testEnv.writeFile('post-response.json', JSON.stringify(postResponse));

      const responsePath = join(testEnv.tempDir, 'post-response.json');
      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" validate-post "${responsePath}"`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('✅ Post-response validation passed');
    });
  });

  describe('ctdd delta', () => {
    it('should apply delta and update commit ID', async () => {
      // Initialize project first
      await execAsync(`node "${CLI_PATH}" init`, { cwd: testEnv.tempDir });

      // Get initial commit ID
      const { stdout: initialHash } = await execAsync(`node "${CLI_PATH}" hash`, {
        cwd: testEnv.tempDir
      });

      // Apply delta
      const delta = await loadFixture('sample-delta.json');
      await testEnv.writeFile('delta.json', JSON.stringify(delta));

      const deltaPath = join(testEnv.tempDir, 'delta.json');
      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" delta "${deltaPath}"`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('Applied delta');
      expect(stdout).toContain('New commit:');

      // Verify commit ID changed
      const { stdout: newHash } = await execAsync(`node "${CLI_PATH}" hash`, {
        cwd: testEnv.tempDir
      });

      expect(newHash.trim()).not.toBe(initialHash.trim());
      expectValidCommitId(newHash.trim());
    });
  });

  describe('ctdd checks', () => {
    it('should run plugin checks', async () => {
      // Initialize project first
      await execAsync(`node "${CLI_PATH}" init`, { cwd: testEnv.tempDir });

      const { stdout, stderr } = await execAsync(`node "${CLI_PATH}" checks`, {
        cwd: testEnv.tempDir
      });

      expect(stderr).toBe('');
      // Should list available plugins or show no plugins message
      expect(stdout).toBeDefined();
    });

    it('should output JSON format when requested', async () => {
      // Initialize project first
      await execAsync(`node "${CLI_PATH}" init`, { cwd: testEnv.tempDir });

      const { stdout, stderr } = await execAsync(`node "${CLI_PATH}" checks --json`, {
        cwd: testEnv.tempDir
      });

      expect(stderr).toBe('');

      // Should be valid JSON
      expect(() => JSON.parse(stdout)).not.toThrow();
    });
  });

  describe('ctdd --help', () => {
    it('should display help information', async () => {
      const { stdout, stderr } = await execAsync(`node "${CLI_PATH}" --help`);

      expect(stderr).toBe('');
      expect(stdout).toContain('Context Test-Driven Development (CTDD) CLI');
      expect(stdout).toContain('Commands:');
      expect(stdout).toContain('init');
      expect(stdout).toContain('status');
      expect(stdout).toContain('pre');
      expect(stdout).toContain('post');
    });
  });

  describe('ctdd --version', () => {
    it('should display version information', async () => {
      const { stdout, stderr } = await execAsync(`node "${CLI_PATH}" --version`);

      expect(stderr).toBe('');
      expect(stdout.trim()).toMatch(/^\d+\.\d+\.\d+$/); // Semantic version format
    });
  });
});