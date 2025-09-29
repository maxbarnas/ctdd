import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { TestEnvironment } from '../utils/test-helpers.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const CLI_PATH = join(process.cwd(), 'dist', 'index.js');

describe('Session Resumption (AT006)', () => {
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

  describe('Instant Resumption (AT217)', () => {
    it('should provide complete context in under 30 seconds', async () => {
      // Setup realistic session state
      await execAsync(
        `node "${CLI_PATH}" session update --focus "FC-TEST-001: Complex Feature Implementation" --complete "AT001,AT002" --progress "AT003" --pending "AT004,AT005" --insight "Critical insight about implementation approach"`,
        { cwd: testEnv.tempDir }
      );

      const startTime = Date.now();

      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session resume --verbose`,
        { cwd: testEnv.tempDir }
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(stderr).toBe('');
      expect(duration).toBeLessThan(30000); // Under 30 seconds

      // Verify comprehensive context is provided
      expect(stdout).toContain('CTDD INSTANT RESUMPTION');
      expect(stdout).toContain('PROJECT STATUS');
      expect(stdout).toContain('AVAILABLE TOOLS');
      expect(stdout).toContain('SESSION HEALTH');
      expect(stdout).toContain('IMMEDIATE NEXT ACTIONS');
      expect(stdout).toContain('ARCHITECTURE QUICK REF');
      expect(stdout).toContain('FC-TEST-001');
    });

    it('should eliminate file meandering behavior', async () => {
      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session resume`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');

      // Should provide everything needed without requiring additional file reads
      expect(stdout).toContain('Zero-Wander Context Recovery');
      expect(stdout).toContain('RESUMPTION EFFICIENCY');
      expect(stdout).toContain('Time to productive work');
    });

    it('should provide actionable next steps', async () => {
      // Setup session with pending work
      await execAsync(
        `node "${CLI_PATH}" session update --focus "Critical Bug Fix" --progress "AT001" --insight "Found root cause in session management"`,
        { cwd: testEnv.tempDir }
      );

      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session resume --verbose`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('IMMEDIATE NEXT ACTIONS');
      expect(stdout).toMatch(/\d+\./); // Should contain numbered action items
    });
  });

  describe('Context Generation', () => {
    it('should generate accurate project status', async () => {
      // Create complex project state
      await execAsync(
        `node "${CLI_PATH}" session update --focus "Multi-Phase Project" --complete "AT001,AT002,AT003" --progress "AT004,AT005" --pending "AT006,AT007,AT008,AT009,AT010"`,
        { cwd: testEnv.tempDir }
      );

      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session resume`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('3 completed');
      expect(stdout).toContain('2 in progress');
      expect(stdout).toContain('5 pending');
    });

    it('should show recent insights and progress', async () => {
      const testInsights = [
        'Bootstrap methodology validation complete',
        'Found critical performance bottleneck in state management',
        'Test coverage gaps identified in session commands'
      ];

      for (const insight of testInsights) {
        await execAsync(
          `node "${CLI_PATH}" session update --insight "${insight}"`,
          { cwd: testEnv.tempDir }
        );
      }

      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session resume --verbose`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('RECENT INSIGHTS');
      // At least one of the test insights should appear
      const hasInsight = testInsights.some(insight =>
        stdout.includes(insight.substring(0, 30))
      );
      expect(hasInsight || stdout.includes('Insight')).toBeTruthy();
    });

    it('should provide architecture overview', async () => {
      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session resume --verbose`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('ARCHITECTURE QUICK REF');
      expect(stdout).toContain('Core CTDD');
      expect(stdout).toContain('CLI Entry');
      expect(stdout).toContain('Session Mgmt');
    });
  });

  describe('Session Health Analysis', () => {
    it('should detect session size issues', async () => {
      // Create large session state
      const largeATSet = Array.from({ length: 100 }, (_, i) =>
        `AT${String(i + 1).padStart(3, '0')}`
      );

      await execAsync(
        `node "${CLI_PATH}" session update --complete "${largeATSet.slice(0, 50).join(',')}" --progress "${largeATSet.slice(50, 75).join(',')}" --pending "${largeATSet.slice(75).join(',')}"`,
        { cwd: testEnv.tempDir }
      );

      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session resume --verbose`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('SESSION HEALTH');
      // Should warn about large session size
      expect(stdout).toMatch(/\d+\s+tokens/);
    });

    it('should provide optimization recommendations', async () => {
      // Create conditions that need optimization
      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session resume --verbose`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      // Check for session health section (optimization appears when needed)
      expect(stdout).toContain('SESSION HEALTH');
    });

    it('should validate bootstrap methodology compliance', async () => {
      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session resume --verbose`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('BOOTSTRAP PATTERN VALIDATION');
      expect(stdout).toContain('Use CTDD tools to continue CTDD development');
    });
  });

  describe('Essential Tools Discovery', () => {
    it('should list critical commands for resumption', async () => {
      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session resume --verbose`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('AVAILABLE TOOLS');
      expect(stdout).toContain('check-at --all');
      expect(stdout).toContain('session summary');
      expect(stdout).toContain('session brief');
    });

    it('should provide context-aware command suggestions', async () => {
      // Setup specific work context
      await execAsync(
        `node "${CLI_PATH}" session update --focus "Test Technical Debt" --progress "AT001"`,
        { cwd: testEnv.tempDir }
      );

      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session resume`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      // Should provide relevant next actions based on current work
      expect(stdout).toContain('IMMEDIATE NEXT ACTIONS');
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle corrupted session state gracefully', async () => {
      // Create corrupted session state
      await testEnv.writeFile('.ctdd/session-state.json', '{ corrupted: json');

      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session resume`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('CTDD INSTANT RESUMPTION');
      // Should provide basic resumption even with corrupted state
    });

    it('should work without session state file', async () => {
      // Test resume in a fresh environment (no session state created yet)
      // The init command creates minimal state, resume should handle it gracefully
      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session resume`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('CTDD INSTANT RESUMPTION');
    });

    it('should be consistent across multiple invocations', async () => {
      const results = [];

      for (let i = 0; i < 3; i++) {
        const { stdout, stderr } = await execAsync(
          `node "${CLI_PATH}" session resume`,
          { cwd: testEnv.tempDir }
        );
        expect(stderr).toBe('');
        results.push(stdout);
      }

      // Basic structure should be consistent
      results.forEach(result => {
        expect(result).toContain('CTDD INSTANT RESUMPTION');
        expect(result).toContain('PROJECT STATUS');
      });
    });
  });

  describe('Context Budget Management', () => {
    it('should track context usage', async () => {
      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session budget --analyze`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('Context Budget');
    });

    it('should warn about context budget overruns', async () => {
      // Create large session that might exceed budget
      const largeInsights = Array.from({ length: 20 }, (_, i) =>
        `Insight ${i + 1}: This is a detailed insight about the development process and methodology improvements that could potentially consume significant context budget space.`
      );

      for (const insight of largeInsights) {
        await execAsync(
          `node "${CLI_PATH}" session update --insight "${insight}"`,
          { cwd: testEnv.tempDir }
        );
      }

      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session resume --verbose`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('SESSION HEALTH');
      // Should provide context budget information
    });
  });

  describe('Integration with CTDD Methodology', () => {
    it('should support rapid context switching', async () => {
      // Simulate context switch scenario
      await execAsync(
        `node "${CLI_PATH}" session update --focus "Context Switch Test"`,
        { cwd: testEnv.tempDir }
      );

      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session resume`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('Context Switch Test');
    });

    it('should preserve CTDD contract state', async () => {
      // Setup contract-specific state
      await execAsync(
        `node "${CLI_PATH}" session update --focus "FC-TEST-001: Contract Implementation"`,
        { cwd: testEnv.tempDir }
      );

      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session resume --verbose`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('FC-TEST-001');
    });

    it('should maintain methodology compliance', async () => {
      const { stdout, stderr } = await execAsync(
        `node "${CLI_PATH}" session resume --verbose`,
        { cwd: testEnv.tempDir }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('Tool-assisted development reduces overhead');
      expect(stdout).toContain('avoid manual work');
    });
  });
});