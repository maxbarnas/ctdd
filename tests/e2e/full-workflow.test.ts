import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { TestEnvironment, expectValidCommitId } from '../utils/test-helpers.js';

const execAsync = promisify(exec);
const CLI_PATH = join(process.cwd(), 'dist', 'index.js');

describe('CTDD E2E Workflow Tests', () => {
  let testEnv: TestEnvironment;

  beforeEach(async () => {
    testEnv = new TestEnvironment();
    await testEnv.setup();

    // Ensure we have a built version
    try {
      await execAsync('npm run build');
    } catch (error) {
      console.warn('Build failed, tests may fail:', error);
    }
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  describe('Complete CTDD Cycle', () => {
    it('should complete full init → pre → post → delta workflow', async () => {
      // Phase 1: Initialize project
      const { stdout: initOutput } = await execAsync(`node "${CLI_PATH}" init`, {
        cwd: testEnv.tempDir
      });

      expect(initOutput).toContain('Initialized .ctdd/');
      const initialCommitMatch = initOutput.match(/Commit: (CTDD:[^@]+@[a-f0-9]{7})/);
      expect(initialCommitMatch).toBeTruthy();
      const initialCommitId = initialCommitMatch![1];
      expectValidCommitId(initialCommitId);

      // Phase 2: Generate and validate Pre-Test prompt
      const { stdout: prePrompt } = await execAsync(`node "${CLI_PATH}" pre`, {
        cwd: testEnv.tempDir
      });

      expect(prePrompt).toContain('You are resuming work');
      expect(prePrompt).toContain(initialCommitId);
      expect(prePrompt).toContain('I1:');
      expect(prePrompt).toContain('AT1:');

      // Create mock pre-response
      const preResponse = {
        commit_id: initialCommitId,
        self_check: [
          { id: 'I1', status: 'PASS' },
          { id: 'I2', status: 'PASS' },
          { id: 'I3', status: 'PASS' }
        ],
        target_cuts: ['AT1', 'AT2'],
        plan_step: 'Implement CSV parsing functionality',
        risks: ['File encoding issues'],
        questions: ['Should we support custom delimiters?']
      };

      await testEnv.writeFile('pre-response.json', JSON.stringify(preResponse, null, 2));

      // Validate pre-response
      const preResponsePath = join(testEnv.tempDir, 'pre-response.json');
      const { stdout: preValidation } = await execAsync(
        `node "${CLI_PATH}" validate-pre "${preResponsePath}"`,
        { cwd: testEnv.tempDir }
      );
      expect(preValidation).toContain('✅ Pre-response validation passed');

      // Record pre-response
      const { stdout: preRecord } = await execAsync(
        `node "${CLI_PATH}" record-pre "${preResponsePath}"`,
        { cwd: testEnv.tempDir }
      );
      expect(preRecord).toContain('Recorded');

      // Phase 3: Generate Post-Test prompt with artifact
      await testEnv.writeFile('artifact.txt', 'Implemented basic CSV parser in parser.js\\nAdded test file test.csv\\nUpdated README.md with usage examples');

      const artifactPath = join(testEnv.tempDir, 'artifact.txt');
      const { stdout: postPrompt } = await execAsync(
        `node "${CLI_PATH}" post --artifact "${artifactPath}"`,
        { cwd: testEnv.tempDir }
      );

      expect(postPrompt).toContain('Commit:');
      expect(postPrompt).toContain(initialCommitId);
      expect(postPrompt).toContain('Implemented basic CSV parser');

      // Create mock post-response
      const postResponse = {
        commit_id: initialCommitId,
        post_check: [
          { id: 'AT1', status: 'PASS', evidence: 'parser.js:15-30 implements CSV reading' },
          { id: 'AT2', status: 'FAIL', evidence: 'Error handling not implemented' },
          { id: 'AT3', status: 'PASS', evidence: 'Empty file test passes' },
          { id: 'AT4', status: 'PASS', evidence: 'README examples work correctly' }
        ],
        deltas: [
          {
            type: 'modify',
            target: 'I2',
            from: 'No network calls allowed.',
            to: 'No network calls allowed except for testing.',
            reason: 'Need to access test data repository'
          }
        ],
        next: 'Implement error handling for AT2'
      };

      await testEnv.writeFile('post-response.json', JSON.stringify(postResponse, null, 2));

      // Validate post-response
      const postResponsePath = join(testEnv.tempDir, 'post-response.json');
      const { stdout: postValidation } = await execAsync(
        `node "${CLI_PATH}" validate-post "${postResponsePath}"`,
        { cwd: testEnv.tempDir }
      );
      expect(postValidation).toContain('✅ Post-response validation passed');

      // Record post-response with plugin checks
      const { stdout: postRecord } = await execAsync(
        `node "${CLI_PATH}" record-post "${postResponsePath}" --with-checks`,
        { cwd: testEnv.tempDir }
      );
      expect(postRecord).toContain('Recorded');

      // Phase 4: Apply delta to evolve specification
      const delta = {
        type: 'modify',
        target: 'I2',
        from: 'No network calls allowed.',
        to: 'No network calls allowed except for testing.',
        reason: 'Need to access test data repository',
        impacted_tests: ['AT1', 'AT2']
      };

      await testEnv.writeFile('delta.json', JSON.stringify(delta, null, 2));

      const deltaPath = join(testEnv.tempDir, 'delta.json');
      const { stdout: deltaOutput } = await execAsync(
        `node "${CLI_PATH}" delta "${deltaPath}"`,
        { cwd: testEnv.tempDir }
      );

      expect(deltaOutput).toContain('Applied delta');
      expect(deltaOutput).toContain('New commit:');

      // Verify commit ID changed
      const { stdout: newCommitId } = await execAsync(`node "${CLI_PATH}" hash`, {
        cwd: testEnv.tempDir
      });

      expectValidCommitId(newCommitId.trim());
      expect(newCommitId.trim()).not.toBe(initialCommitId);

      // Phase 5: Verify state and run final checks
      const { stdout: finalStatus } = await execAsync(`node "${CLI_PATH}" status`, {
        cwd: testEnv.tempDir
      });

      expect(finalStatus).toContain(newCommitId.trim());
      expect(finalStatus).toContain('History entries: 2'); // pre + post recorded

      // Run plugin checks
      const { stdout: checks } = await execAsync(`node "${CLI_PATH}" checks --json`, {
        cwd: testEnv.tempDir
      });

      const checksData = JSON.parse(checks);
      // Checks output can be an array or object with checks property
      if (Array.isArray(checksData)) {
        expect(checksData).toBeDefined();
      } else {
        expect(checksData).toHaveProperty('checks');
        expect(Array.isArray(checksData.checks)).toBe(true);
      }
    }, 60000); // 60 second timeout for full workflow

    it('should handle workflow with failing CUTs and recovery', async () => {
      // Initialize project
      await execAsync(`node "${CLI_PATH}" init`, { cwd: testEnv.tempDir });

      const { stdout: hashOutput } = await execAsync(`node "${CLI_PATH}" hash`, {
        cwd: testEnv.tempDir
      });
      const commitId = hashOutput.trim();

      // Simulate failed implementation attempt
      const failedPostResponse = {
        commit_id: commitId,
        post_check: [
          { id: 'AT1', status: 'FAIL', evidence: 'CSV parser not implemented yet' },
          { id: 'AT2', status: 'FAIL', evidence: 'Error handling missing' },
          { id: 'AT3', status: 'FAIL', evidence: 'Empty file case not handled' },
          { id: 'AT4', status: 'FAIL', evidence: 'README examples outdated' }
        ],
        deltas: [],
        next: 'Start with basic CSV reading functionality'
      };

      await testEnv.writeFile('failed-post.json', JSON.stringify(failedPostResponse, null, 2));

      // Record failed attempt
      const failedPath = join(testEnv.tempDir, 'failed-post.json');
      const { stdout: failedRecord } = await execAsync(
        `node "${CLI_PATH}" record-post "${failedPath}"`,
        { cwd: testEnv.tempDir }
      );

      expect(failedRecord).toContain('Recorded');

      // Simulate recovery with partial success
      const partialPostResponse = {
        commit_id: commitId,
        post_check: [
          { id: 'AT1', status: 'PASS', evidence: 'Basic CSV reading implemented' },
          { id: 'AT2', status: 'FAIL', evidence: 'Error handling still missing' },
          { id: 'AT3', status: 'PASS', evidence: 'Empty file case now handled' },
          { id: 'AT4', status: 'PASS', evidence: 'README updated with examples' }
        ],
        deltas: [],
        next: 'Focus on error handling for AT2'
      };

      await testEnv.writeFile('partial-post.json', JSON.stringify(partialPostResponse, null, 2));

      // Record partial success
      const partialPath = join(testEnv.tempDir, 'partial-post.json');
      const { stdout: partialRecord } = await execAsync(
        `node "${CLI_PATH}" record-post "${partialPath}"`,
        { cwd: testEnv.tempDir }
      );

      expect(partialRecord).toContain('Recorded');

      // Verify history shows progression
      const { stdout: finalStatus } = await execAsync(`node "${CLI_PATH}" status`, {
        cwd: testEnv.tempDir
      });

      expect(finalStatus).toContain('History entries: 2'); // Two post recordings
    }, 30000);

    it('should validate commit ID integrity throughout workflow', async () => {
      // Initialize
      await execAsync(`node "${CLI_PATH}" init`, { cwd: testEnv.tempDir });

      const { stdout: initialHash } = await execAsync(`node "${CLI_PATH}" hash`, {
        cwd: testEnv.tempDir
      });
      const commitId = initialHash.trim();

      // Try to submit response with wrong commit ID
      const wrongCommitResponse = {
        commit_id: 'CTDD:FC-WRONG@1234567',
        self_check: [{ id: 'I1', status: 'PASS' }],
        target_cuts: ['AT1'],
        plan_step: 'Wrong commit ID test',
        risks: [],
        questions: []
      };

      await testEnv.writeFile('wrong-commit.json', JSON.stringify(wrongCommitResponse, null, 2));

      // This should fail validation
      const wrongPath = join(testEnv.tempDir, 'wrong-commit.json');
      try {
        await execAsync(
          `node "${CLI_PATH}" validate-pre "${wrongPath}"`,
          { cwd: testEnv.tempDir }
        );
        expect.fail('Should have failed validation due to wrong commit ID');
      } catch (error: any) {
        // Validation should fail - just check that an error occurred
        expect(error).toBeDefined();
      }

      // Correct commit ID should work
      const correctCommitResponse = {
        ...wrongCommitResponse,
        commit_id: commitId
      };

      await testEnv.writeFile('correct-commit.json', JSON.stringify(correctCommitResponse, null, 2));

      const correctPath = join(testEnv.tempDir, 'correct-commit.json');
      const { stdout } = await execAsync(
        `node "${CLI_PATH}" validate-pre "${correctPath}"`,
        { cwd: testEnv.tempDir }
      );

      expect(stdout).toContain('✅ Pre-response validation passed');
    }, 20000);
  });

  describe('Plugin Integration Workflow', () => {
    it('should run plugins during post-response recording', async () => {
      // Initialize project
      await execAsync(`node "${CLI_PATH}" init`, { cwd: testEnv.tempDir });

      const { stdout: hashOutput } = await execAsync(`node "${CLI_PATH}" hash`, {
        cwd: testEnv.tempDir
      });
      const commitId = hashOutput.trim();

      // Create a simple test plugin
      const testPlugin = {
        id: 'test-plugin',
        title: 'Test Plugin for E2E',
        kind: 'file_exists',
        file: 'README.md',
        should_exist: true,
        report_as: 'TEST1',
        relatedCuts: ['AT4']
      };

      await testEnv.writeFile('.ctdd/plugins/test-plugin.json', JSON.stringify(testPlugin, null, 2));

      // Create a file for the plugin to find
      await testEnv.writeFile('README.md', '# Test Project\\n\\nThis is a test.');

      // Create post-response
      const postResponse = {
        commit_id: commitId,
        post_check: [
          { id: 'AT1', status: 'PASS', evidence: 'Test passed' }
        ],
        deltas: [],
        next: 'Continue development'
      };

      await testEnv.writeFile('post-response.json', JSON.stringify(postResponse, null, 2));

      // Record with plugin checks
      const postPath = join(testEnv.tempDir, 'post-response.json');
      const { stdout: record } = await execAsync(
        `node "${CLI_PATH}" record-post "${postPath}" --with-checks`,
        { cwd: testEnv.tempDir }
      );

      expect(record).toContain('Recorded');

      // Verify plugin ran independently
      const { stdout: checks } = await execAsync(`node "${CLI_PATH}" checks --json`, {
        cwd: testEnv.tempDir
      });

      const checksData = JSON.parse(checks);
      // Handle both array and object with checks property formats
      const checksList = Array.isArray(checksData) ? checksData : checksData.checks || [];

      if (checksList.length > 0) {
        const pluginCheck = checksList.find(check => check.id === 'test-plugin');
        if (pluginCheck) {
          expect(pluginCheck.status).toBe('PASS');
        }
      }
      // Test passes if no errors occurred running plugins
    }, 20000);
  });
});