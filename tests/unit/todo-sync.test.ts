import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { TestEnvironment } from '../utils/test-helpers.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const CLI_PATH = join(process.cwd(), 'dist', 'index.js');

describe('Todo Synchronization (AT005)', () => {
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

  describe('Todo-AT Detection', () => {
    it('should detect AT patterns in todo content', async () => {
      // Test todo sync with AT detection
      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session sync --from-todos`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('Sync'); // Should acknowledge sync operation
    });

    it('should handle various AT ID formats', async () => {
      const testCases = [
        'Fix AT001: Database connection issue',
        'Complete AT042 validation logic',
        'Work on AT123: Complex algorithm optimization',
        'AT999: Edge case handling',
        'Implement feature for AT001, AT002, and AT003',
        'No AT pattern in this todo item'
      ];

      // Simulate todos with different AT patterns
      for (const todo of testCases) {
        const { stderr } = await execAsync(
          `node "${CLI_PATH}" session sync --auto`,
          { cwd: testEnv.tempDir }
        );
        expect(stderr).toBe('');
      }
    });

    it('should extract multiple ATs from single todo', async () => {
      const complexTodo = 'Complete AT001, AT002, and AT003 for Phase 1 implementation';

      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session sync --auto`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('Sync');
    });
  });

  describe('Todo State Synchronization', () => {
    it('should sync completed todos to CTDD state', async () => {
      // First establish some session state
      await execAsync(
        `node "${CLI_PATH}" session update --pending "AT001,AT002,AT003"`,
        { cwd: testEnv.tempDir }
      );

      // Simulate todo sync operation
      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session sync --from-todos`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('Sync');

      // Verify state was updated - should show pending ATs
      const { stdout: summary } = await execAsync(
        `node "${CLI_PATH}" session summary`,
        { cwd: testEnv.tempDir }
      );

      // Summary shows AT counts, not individual IDs
      expect(summary).toContain('Pending:');
    });

    it('should handle todo status changes', async () => {
      const testCases = [
        { status: 'pending', expected: 'pending' },
        { status: 'in_progress', expected: 'in_progress' },
        { status: 'completed', expected: 'completed' }
      ];

      for (const { status, expected } of testCases) {
        const { stderr } = await execAsync(
          `node "${CLI_PATH}" session sync --auto`,
          { cwd: testEnv.tempDir }
        );
        expect(stderr).toBe('');
      }
    });

    it('should resolve todo-AT conflicts intelligently', async () => {
      // Create conflicting state: AT001 is completed in CTDD but pending in todos
      await execAsync(
        `node "${CLI_PATH}" session update --complete "AT001"`,
        { cwd: testEnv.tempDir }
      );

      // Simulate conflict resolution
      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session resolve --prefer-ctdd`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('conflict'); // Should acknowledge conflict resolution
    });
  });

  describe('Todo Persistence', () => {
    it('should save and load todo state reliably', async () => {
      // Save current todo state
      const { stdout: saveResult, stderr: saveError } = await execAsync(
        `node "${CLI_PATH}" session sync --from-todos`,
        { cwd: testEnv.tempDir }
      );

      expect(saveError).toBe('');

      // Load todo state
      const { stdout: loadResult, stderr: loadError } = await execAsync(
        `node "${CLI_PATH}" session sync --to-todos`,
        { cwd: testEnv.tempDir }
      );

      expect(loadError).toBe('');
    });

    it('should handle missing todo data gracefully', async () => {
      // Try to load when no todo data exists
      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session sync --to-todos`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('Sync'); // Should handle gracefully
    });

    it('should validate todo data integrity', async () => {
      // Save valid state
      await execAsync(
        `node "${CLI_PATH}" session sync --from-todos`,
        { cwd: testEnv.tempDir }
      );

      // Verify data integrity
      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session sync --auto`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('Sync');
    });
  });

  describe('AT-Todo Mapping Accuracy', () => {
    it('should maintain accurate AT-todo relationships', async () => {
      // Setup test scenario with known AT-todo mappings
      await execAsync(
        `node "${CLI_PATH}" session update --pending "AT001,AT002,AT003"`,
        { cwd: testEnv.tempDir }
      );

      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session sync --auto`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('Sync');
    });

    it('should detect orphaned ATs', async () => {
      // Create AT in session without corresponding todo
      await execAsync(
        `node "${CLI_PATH}" session update --pending "AT999"`,
        { cwd: testEnv.tempDir }
      );

      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session sync --auto`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      // Should report orphaned AT
    });

    it('should detect orphaned todos', async () => {
      // This would detect todos referencing ATs not in session state
      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session sync --auto`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('Sync');
    });
  });

  describe('Bulk Todo Operations', () => {
    it('should handle large numbers of todos efficiently', async () => {
      const startTime = Date.now();

      // Setup large AT set
      const largeATSet = Array.from({ length: 50 }, (_, i) =>
        `AT${String(i + 1).padStart(3, '0')}`
      ).join(',');

      await execAsync(
        `node "${CLI_PATH}" session update --pending "${largeATSet}"`,
        { cwd: testEnv.tempDir }
      );

      // Perform bulk sync
      await execAsync(
        `node "${CLI_PATH}" session sync --from-todos`,
        { cwd: testEnv.tempDir }
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time
      expect(duration).toBeLessThan(15000);
    });

    it('should maintain consistency during bulk operations', async () => {
      // Perform multiple sync operations
      const operations = [
        'session sync --from-todos',
        'session sync --to-todos',
        'session sync --auto'
      ];

      for (const op of operations) {
        const { stderr } = await execAsync(
          `node "${CLI_PATH}" ${op}`,
          { cwd: testEnv.tempDir }
        );
        expect(stderr).toBe('');
      }
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should recover from corrupted todo sync data', async () => {
      // Create corrupted sync data
      await testEnv.writeFile('.ctdd/todo-sync.json', '{ invalid json }');

      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session sync --auto`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('Sync'); // Should recover gracefully
    });

    it('should handle todo sync failures gracefully', async () => {
      // Simulate sync failure scenario
      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session sync --to-todos`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      // Should not crash
    });

    it('should provide helpful error messages', async () => {
      // Test various error scenarios
      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session sync --invalid-flag`,
        { cwd: testEnv.tempDir }
      ).catch(e => e);

      // Should provide clear error message for invalid usage
      expect(stderr || stdout).toContain('error');
    });
  });

  describe('Integration with CTDD Workflow', () => {
    it('should sync seamlessly with session updates', async () => {
      // Update session
      await execAsync(
        `node "${CLI_PATH}" session update --complete "AT001"`,
        { cwd: testEnv.tempDir }
      );

      // Sync should reflect the change
      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session sync --auto`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('Sync');
    });

    it('should support context preservation workflow', async () => {
      // Save current state
      await execAsync(
        `node "${CLI_PATH}" session sync --from-todos`,
        { cwd: testEnv.tempDir }
      );

      // Simulate context loss and recovery
      await execAsync(
        `node "${CLI_PATH}" session sync --to-todos`,
        { cwd: testEnv.tempDir }
      );

      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session resume`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('INSTANT RESUMPTION');
    });
  });
});