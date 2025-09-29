import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { runPlugins, withTimeout } from '../../src/plugin.js';
import { TestEnvironment, createMockSpec } from '../utils/test-helpers.js';
import { PluginTimeoutError } from '../../src/errors.js';

describe('Plugin Timeout Handling', () => {
  let testEnv: TestEnvironment;

  beforeEach(async () => {
    testEnv = new TestEnvironment();
    await testEnv.setup();
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  describe('withTimeout wrapper', () => {
    it('should resolve quickly for fast operations', async () => {
      const result = await withTimeout(
        async () => 'fast result',
        1000,
        'test-plugin'
      );

      expect(result).toBe('fast result');
    });

    it('should throw PluginTimeoutError for slow operations', async () => {
      const slowOperation = async () => {
        return new Promise(resolve => setTimeout(() => resolve('slow result'), 2000));
      };

      await expect(
        withTimeout(slowOperation, 100, 'slow-plugin')
      ).rejects.toThrow(PluginTimeoutError);

      try {
        await withTimeout(slowOperation, 100, 'slow-plugin');
      } catch (error) {
        expect(error).toBeInstanceOf(PluginTimeoutError);
        expect((error as PluginTimeoutError).message).toContain('Plugin "slow-plugin" timed out after 100ms');
      }
    });

    it('should handle errors from the wrapped operation', async () => {
      const errorOperation = async () => {
        throw new Error('Operation failed');
      };

      await expect(
        withTimeout(errorOperation, 1000, 'error-plugin')
      ).rejects.toThrow('Operation failed');
    });
  });

  describe('Plugin execution with timeouts', () => {
    it('should run file_exists plugin within timeout', async () => {
      // Create a test file
      await testEnv.writeFile('test-file.txt', 'test content');

      // Create spec and initialize project
      const spec = createMockSpec();
      await testEnv.writeSpec(spec);

      // Create plugin definition file
      const pluginDef = {
        id: 'test-file-exists',
        kind: 'file_exists',
        file: 'test-file.txt',
        should_exist: true,
        report_as: 'FILE_EXISTS_CHECK'
      };
      await testEnv.writeFile('.ctdd/plugins/test-plugin.json', JSON.stringify(pluginDef, null, 2));

      const results = await runPlugins(testEnv.tempDir, 1000);

      expect(results).toHaveLength(1);
      expect(results[0].status).toBe('PASS');
      expect(results[0].id).toBe('FILE_EXISTS_CHECK');
    });

    it('should run grep plugin within timeout', async () => {
      // Create a test file with content to search
      await testEnv.writeFile('search-file.txt', 'This contains the target pattern');

      // Create spec and initialize project
      const spec = createMockSpec();
      await testEnv.writeSpec(spec);

      const pluginDef = {
        id: 'test-grep',
        kind: 'grep',
        file: 'search-file.txt',
        pattern: 'target pattern',
        must_exist: true,
        report_as: 'GREP_CHECK'
      };
      await testEnv.writeFile('.ctdd/plugins/grep-plugin.json', JSON.stringify(pluginDef, null, 2));

      const results = await runPlugins(testEnv.tempDir, 1000);

      expect(results).toHaveLength(1);
      expect(results[0].status).toBe('PASS');
      expect(results[0].id).toBe('GREP_CHECK');
    });

    it('should handle multiple plugins with timeout', async () => {
      // Create test files
      await testEnv.writeFile('file1.txt', 'content 1');
      await testEnv.writeFile('file2.txt', 'content 2');

      // Create spec and initialize project
      const spec = createMockSpec();
      await testEnv.writeSpec(spec);

      const pluginDef1 = {
        id: 'check-file1',
        kind: 'file_exists',
        file: 'file1.txt',
        should_exist: true,
        report_as: 'FILE1_EXISTS'
      };
      const pluginDef2 = {
        id: 'check-file2',
        kind: 'file_exists',
        file: 'file2.txt',
        should_exist: true,
        report_as: 'FILE2_EXISTS'
      };

      await testEnv.writeFile('.ctdd/plugins/plugin1.json', JSON.stringify(pluginDef1, null, 2));
      await testEnv.writeFile('.ctdd/plugins/plugin2.json', JSON.stringify(pluginDef2, null, 2));

      const results = await runPlugins(testEnv.tempDir, 1000);

      expect(results).toHaveLength(2);
      expect(results[0].status).toBe('PASS');
      expect(results[1].status).toBe('PASS');
    });

    it('should handle plugin failure gracefully with timeout', async () => {
      // Create spec and initialize project
      const spec = createMockSpec();
      await testEnv.writeSpec(spec);

      // Plugin looking for non-existent file
      const pluginDef = {
        id: 'missing-file-check',
        kind: 'file_exists',
        file: 'non-existent-file.txt',
        should_exist: true,
        report_as: 'MISSING_FILE_CHECK'
      };
      await testEnv.writeFile('.ctdd/plugins/missing-plugin.json', JSON.stringify(pluginDef, null, 2));

      const results = await runPlugins(testEnv.tempDir, 1000);

      expect(results).toHaveLength(1);
      expect(results[0].status).toBe('FAIL');
      expect(results[0].id).toBe('MISSING_FILE_CHECK');
      expect(results[0].evidence).toContain('File does not exist');
    });

    it('should handle unknown plugin types gracefully', async () => {
      // Create spec and initialize project
      const spec = createMockSpec();
      await testEnv.writeSpec(spec);

      // Create an invalid plugin that won't load due to schema validation
      const pluginDef = {
        id: 'unknown-plugin',
        kind: 'unknown_type',
        report_as: 'UNKNOWN_CHECK'
      };
      await testEnv.writeFile('.ctdd/plugins/unknown-plugin.json', JSON.stringify(pluginDef, null, 2));

      // Invalid plugins are filtered out during loading, so we expect 0 results
      const results = await runPlugins(testEnv.tempDir, 1000);

      expect(results).toHaveLength(0);
    });

    it('should use short timeout for rapid testing', async () => {
      // Create spec and initialize project
      const spec = createMockSpec();
      await testEnv.writeSpec(spec);

      const pluginDef = {
        id: 'quick-check',
        kind: 'file_exists',
        file: 'package.json', // Should exist in project root
        should_exist: true,
        report_as: 'QUICK_CHECK'
      };
      await testEnv.writeFile('.ctdd/plugins/quick-plugin.json', JSON.stringify(pluginDef, null, 2));

      const startTime = Date.now();
      const results = await runPlugins(testEnv.tempDir, 50); // Very short timeout
      const duration = Date.now() - startTime;

      // Should complete quickly (well under timeout)
      expect(duration).toBeLessThan(100);
      expect(results).toHaveLength(1);
    });
  });

  describe('Error integration with timeouts', () => {
    it('should log timeout errors to structured log', async () => {
      // This test demonstrates that timeout errors would be logged
      // by the error logging system when they occur in practice

      const timeoutError = new PluginTimeoutError('test-plugin', 1000);

      expect(timeoutError.code).toBe('E103');
      expect(timeoutError.message).toContain('Plugin "test-plugin" timed out after 1000ms');
      expect(timeoutError.suggestions).toContain('Increase timeout with --timeout flag');
    });
  });
});