import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { TestEnvironment } from '../utils/test-helpers.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const CLI_PATH = join(process.cwd(), 'dist', 'index.js');

describe('Session State Management (AT004)', () => {
  let testEnv: TestEnvironment;

  beforeEach(async () => {
    testEnv = new TestEnvironment();
    await testEnv.setup();

    // Initialize CTDD project
    await execAsync(`node "${CLI_PATH}" init`, { cwd: testEnv.tempDir });
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  describe('loadSessionState', () => {
    it('should handle missing session state file gracefully', async () => {
      // Session commands should work even without session-state.json
      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session summary`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('SESSION SUMMARY');
    });

    it('should handle corrupted session state JSON', async () => {
      // Create corrupted session state
      await testEnv.writeFile('.ctdd/session-state.json', '{ invalid json }');

      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session summary`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('SESSION SUMMARY');
    });

    it('should load valid session state correctly', async () => {
      const validState = {
        ctdd_session: {
          current_status: {
            current_focus: "Test Focus",
            active_contract: "Test Contract"
          },
          acceptance_criteria_status: {
            completed: ["AT001"],
            in_progress: ["AT002"],
            pending: ["AT003"]
          }
        }
      };

      await testEnv.writeFile('.ctdd/session-state.json', JSON.stringify(validState, null, 2));

      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session summary`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('Test Focus');
    });
  });

  describe('saveSessionState', () => {
    it('should create session state file when updating', async () => {
      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session update --focus "Test Focus"`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('Updated focus');

      // Verify file was created
      const content = await testEnv.readFile('.ctdd/session-state.json');
      const state = JSON.parse(content);

      expect(state.ctdd_session.current_status.current_focus).toBe('Test Focus');
    });

    it('should preserve existing state when updating', async () => {
      // First update
      await execAsync(
        `node "${CLI_PATH}" session update --focus "Initial Focus"`,
        { cwd: testEnv.tempDir }
      );

      // Second update
      await execAsync(
        `node "${CLI_PATH}" session update --complete "AT001"`,
        { cwd: testEnv.tempDir }
      );

      const content = await testEnv.readFile('.ctdd/session-state.json');
      const state = JSON.parse(content);

      expect(state.ctdd_session.current_status.current_focus).toBe('Initial Focus');
      expect(state.ctdd_session.acceptance_criteria_status.completed).toContain('AT001');
    });

    it('should handle concurrent updates safely', async () => {
      // Simulate concurrent updates
      const promises = [
        execAsync(`node "${CLI_PATH}" session update --complete "AT001"`, { cwd: testEnv.tempDir }),
        execAsync(`node "${CLI_PATH}" session update --progress "AT002"`, { cwd: testEnv.tempDir }),
        execAsync(`node "${CLI_PATH}" session update --pending "AT003"`, { cwd: testEnv.tempDir })
      ];

      const results = await Promise.allSettled(promises);

      // At least one should succeed
      const successes = results.filter(r => r.status === 'fulfilled');
      expect(successes.length).toBeGreaterThan(0);

      // Verify final state is valid
      const content = await testEnv.readFile('.ctdd/session-state.json');
      expect(() => JSON.parse(content)).not.toThrow();
    });
  });

  describe('Session State Edge Cases', () => {
    it('should handle extremely large session states', async () => {
      // Create a large session state (simulate many historical ATs)
      const largeATs = Array.from({ length: 100 }, (_, i) => `AT${String(i + 1).padStart(3, '0')}`);

      const largeState = {
        ctdd_session: {
          acceptance_criteria_status: {
            completed: largeATs.slice(0, 50),
            in_progress: largeATs.slice(50, 75),
            pending: largeATs.slice(75, 100)
          },
          historical_data: {
            archived_contracts: Array.from({ length: 20 }, (_, i) => ({
              name: `Contract_${i}`,
              ats: largeATs.slice(i * 5, (i + 1) * 5),
              completion_date: new Date().toISOString()
            }))
          }
        }
      };

      await testEnv.writeFile('.ctdd/session-state.json', JSON.stringify(largeState, null, 2));

      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session analyze`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('Archaeological Data Analysis');
    });

    it('should handle malformed AT IDs gracefully', async () => {
      const malformedState = {
        ctdd_session: {
          acceptance_criteria_status: {
            completed: ["AT001", "INVALID_AT", "", "AT002"],
            in_progress: ["AT", "AT999999", "AT003"],
            pending: [null, undefined, "AT004"]
          }
        }
      };

      await testEnv.writeFile('.ctdd/session-state.json', JSON.stringify(malformedState, null, 2));

      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session update --complete "AT005"`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('Marked as completed: AT005');
    });

    it('should validate session state structure', async () => {
      const invalidStructure = {
        wrong_root: {
          not_ctdd_session: "invalid"
        }
      };

      await testEnv.writeFile('.ctdd/session-state.json', JSON.stringify(invalidStructure, null, 2));

      // Should auto-correct invalid structure
      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session update --focus "Corrected Focus"`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');

      const correctedContent = await testEnv.readFile('.ctdd/session-state.json');
      const correctedState = JSON.parse(correctedContent);

      expect(correctedState.ctdd_session).toBeDefined();
      expect(correctedState.ctdd_session.current_status.current_focus).toBe('Corrected Focus');
    });
  });

  describe('Session State Performance', () => {
    it('should handle rapid session updates efficiently', async () => {
      const startTime = Date.now();

      // Perform many rapid updates
      for (let i = 1; i <= 10; i++) {
        await execAsync(
          `node "${CLI_PATH}" session update --complete "AT${String(i).padStart(3, '0')}"`,
          { cwd: testEnv.tempDir }
        );
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (less than 30 seconds)
      expect(duration).toBeLessThan(30000);

      // Verify all updates were applied
      const content = await testEnv.readFile('.ctdd/session-state.json');
      const state = JSON.parse(content);

      expect(state.ctdd_session.acceptance_criteria_status.completed).toHaveLength(10);
    });

    it('should maintain state consistency under stress', async () => {
      // Create baseline state
      await execAsync(
        `node "${CLI_PATH}" session update --focus "Stress Test"`,
        { cwd: testEnv.tempDir }
      );

      // Perform various operations
      const operations = [
        `node "${CLI_PATH}" session update --complete "AT001,AT002,AT003"`,
        `node "${CLI_PATH}" session update --progress "AT004,AT005"`,
        `node "${CLI_PATH}" session update --pending "AT006,AT007,AT008"`,
        `node "${CLI_PATH}" session update --insight "Critical insight for stress testing"`
      ];

      for (const op of operations) {
        await execAsync(op, { cwd: testEnv.tempDir });
      }

      // Verify state consistency
      const content = await testEnv.readFile('.ctdd/session-state.json');
      const state = JSON.parse(content);

      expect(state.ctdd_session.current_status.current_focus).toBe('Stress Test');
      expect(state.ctdd_session.acceptance_criteria_status.completed).toContain('AT001');
      expect(state.ctdd_session.acceptance_criteria_status.in_progress).toContain('AT004');
      expect(state.ctdd_session.acceptance_criteria_status.pending).toContain('AT006');
    });
  });
});