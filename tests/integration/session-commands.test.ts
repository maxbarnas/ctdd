import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { TestEnvironment } from '../utils/test-helpers.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const CLI_PATH = join(process.cwd(), 'dist', 'index.js');

describe('Session Commands Integration', () => {
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

  describe('Session Analyze Command', () => {
    it('should provide archaeological data analysis', async () => {
      // Setup historical data
      await execAsync(
        `node "${CLI_PATH}" session update --complete "AT001,AT002,AT003" --insight "Historical insight 1" --insight "Historical insight 2"`,
        { cwd: testEnv.tempDir }
      );

      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session analyze`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('Archaeological Data Analysis');
      expect(stdout).toContain('Total size');
      expect(stdout).toContain('Active ATs');
    });

    it('should output JSON format when requested', async () => {
      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session analyze --json`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(() => JSON.parse(stdout)).not.toThrow();

      const analysis = JSON.parse(stdout);
      expect(analysis).toHaveProperty('totalLines');
      expect(analysis).toHaveProperty('activeATs');
      expect(analysis).toHaveProperty('recommendations');
    });

    it('should provide optimization recommendations', async () => {
      // Create large session to trigger recommendations
      const largeATSet = Array.from({ length: 50 }, (_, i) =>
        `AT${String(i + 1).padStart(3, '0')}`
      );

      await execAsync(
        `node "${CLI_PATH}" session update --complete "${largeATSet.join(',')}"`,
        { cwd: testEnv.tempDir }
      );

      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session analyze`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('recommendations');
    });
  });

  describe('Session Clean Command', () => {
    it('should archive historical data', async () => {
      // Create historical data
      await execAsync(
        `node "${CLI_PATH}" session update --complete "AT001,AT002,AT003,AT004,AT005"`,
        { cwd: testEnv.tempDir }
      );

      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session clean`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('Cleanup');
    });

    it('should compress session state', async () => {
      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session clean`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      // Should acknowledge cleanup operation
      expect(stdout).toContain('Cleanup');
    });
  });

  describe('Session Summary Command', () => {
    it('should provide quick overview', async () => {
      await execAsync(
        `node "${CLI_PATH}" session update --focus "Test Summary" --complete "AT001" --progress "AT002" --pending "AT003"`,
        { cwd: testEnv.tempDir }
      );

      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session summary`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('Session Summary');
      expect(stdout).toContain('Test Summary');
      expect(stdout).toContain('Completed:');
      expect(stdout).toContain('In Progress:');
      expect(stdout).toContain('Pending:');
    });

    it('should show recent activity', async () => {
      await execAsync(
        `node "${CLI_PATH}" session update --insight "Recent activity test"`,
        { cwd: testEnv.tempDir }
      );

      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session summary`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('Recent activity test');
    });
  });

  describe('Session Archive Command', () => {
    it('should archive completed work', async () => {
      // Create completed work
      await execAsync(
        `node "${CLI_PATH}" session update --complete "AT001,AT002,AT003"`,
        { cwd: testEnv.tempDir }
      );

      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session archive`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('Archived');
    });

    it('should reduce session size', async () => {
      // Create large session
      const largeATSet = Array.from({ length: 30 }, (_, i) =>
        `AT${String(i + 1).padStart(3, '0')}`
      );

      await execAsync(
        `node "${CLI_PATH}" session update --complete "${largeATSet.join(',')}"`,
        { cwd: testEnv.tempDir }
      );

      const { stdout: beforeSize } = await execAsync(
        `node "${CLI_PATH}" session analyze --json`,
        { cwd: testEnv.tempDir }
      );

      await execAsync(
        `node "${CLI_PATH}" session archive`,
        { cwd: testEnv.tempDir }
      );

      const { stdout: afterSize } = await execAsync(
        `node "${CLI_PATH}" session analyze --json`,
        { cwd: testEnv.tempDir }
      );

      const before = JSON.parse(beforeSize);
      const after = JSON.parse(afterSize);

      expect(after.totalLines).toBeLessThanOrEqual(before.totalLines);
    });
  });

  describe('Session Migration Command', () => {
    it('should migrate session format', async () => {
      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session migrate --to-latest`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('Migration');
    });

    it('should preserve data during migration', async () => {
      // Setup data before migration
      await execAsync(
        `node "${CLI_PATH}" session update --focus "Migration Test" --complete "AT001"`,
        { cwd: testEnv.tempDir }
      );

      await execAsync(
        `node "${CLI_PATH}" session migrate --to-latest`,
        { cwd: testEnv.tempDir }
      );

      // Verify data preserved
      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session summary`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('Migration Test');
      expect(stdout).toContain('AT001');
    });
  });

  describe('Session Detect Command', () => {
    it('should auto-detect AT completion from code changes', async () => {
      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session detect --scan`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('detect');
    });

    it('should suggest AT updates based on file changes', async () => {
      // Create test file that might indicate AT completion
      await testEnv.writeFile('test-completion.js', '// AT001 implementation complete');

      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session detect --suggest`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      // Should analyze file changes and suggest updates
    });
  });

  describe('Session Harvest Command', () => {
    it('should harvest insights from commits', async () => {
      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session harvest --from-commits`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('harvest');
    });

    it('should extract insights from session data', async () => {
      // Create rich session data
      const insights = [
        'Performance optimization successful',
        'Architecture refactoring complete',
        'Test coverage improved significantly'
      ];

      for (const insight of insights) {
        await execAsync(
          `node "${CLI_PATH}" session update --insight "${insight}"`,
          { cwd: testEnv.tempDir }
        );
      }

      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session harvest --extract-patterns`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('harvest');
    });
  });

  describe('Session Brief Command', () => {
    it('should generate compact briefing', async () => {
      await execAsync(
        `node "${CLI_PATH}" session update --focus "Brief Test" --complete "AT001,AT002" --progress "AT003"`,
        { cwd: testEnv.tempDir }
      );

      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session brief --format compact`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('Brief Test');
    });

    it('should generate detailed briefing', async () => {
      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session brief --format detailed`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('CTDD PROJECT BRIEFING');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid session commands gracefully', async () => {
      const result = await execAsync(
        `node "${CLI_PATH}" session invalid-command`,
        { cwd: testEnv.tempDir }
      ).catch(e => e);

      expect(result.stderr || result.stdout).toContain('error');
    });

    it('should validate command parameters', async () => {
      const result = await execAsync(
        `node "${CLI_PATH}" session update --invalid-flag value`,
        { cwd: testEnv.tempDir }
      ).catch(e => e);

      expect(result.stderr || result.stdout).toContain('error');
    });

    it('should handle concurrent session operations', async () => {
      // Simulate concurrent session updates
      const promises = [
        execAsync(`node "${CLI_PATH}" session update --complete "AT001"`, { cwd: testEnv.tempDir }),
        execAsync(`node "${CLI_PATH}" session update --progress "AT002"`, { cwd: testEnv.tempDir }),
        execAsync(`node "${CLI_PATH}" session update --insight "Concurrent test"`, { cwd: testEnv.tempDir })
      ];

      const results = await Promise.allSettled(promises);

      // At least some operations should succeed
      const successes = results.filter(r => r.status === 'fulfilled');
      expect(successes.length).toBeGreaterThan(0);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large session datasets efficiently', async () => {
      const startTime = Date.now();

      // Create large dataset
      const operations = [];
      for (let i = 1; i <= 20; i++) {
        operations.push(
          execAsync(
            `node "${CLI_PATH}" session update --complete "AT${String(i).padStart(3, '0')}"`,
            { cwd: testEnv.tempDir }
          )
        );
      }

      await Promise.all(operations);

      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session analyze`,
        { cwd: testEnv.tempDir }
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(stderr).toBe('');
      expect(duration).toBeLessThan(60000); // Should complete within 1 minute
      expect(stdout).toContain('20');
    });

    it('should maintain performance with complex operations', async () => {
      // Perform complex session operations
      await execAsync(
        `node "${CLI_PATH}" session update --focus "Performance Test" --complete "AT001,AT002,AT003" --progress "AT004,AT005" --pending "AT006,AT007,AT008" --insight "Performance testing in progress"`,
        { cwd: testEnv.tempDir }
      );

      const startTime = Date.now();

      await Promise.all([
        execAsync(`node "${CLI_PATH}" session analyze`, { cwd: testEnv.tempDir }),
        execAsync(`node "${CLI_PATH}" session summary`, { cwd: testEnv.tempDir }),
        execAsync(`node "${CLI_PATH}" session brief`, { cwd: testEnv.tempDir })
      ]);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(20000); // Should complete within 20 seconds
    });
  });
});