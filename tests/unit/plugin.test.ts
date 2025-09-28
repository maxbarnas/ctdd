import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { runPlugins, loadPlugins } from '../../src/plugin.js';
import { TestEnvironment, createMockSpec } from '../utils/test-helpers.js';

describe('Plugin System', () => {
  let testEnv: TestEnvironment;

  beforeEach(async () => {
    testEnv = new TestEnvironment();
    await testEnv.setup();
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  describe('loadPlugins', () => {
    it('should return empty array when no plugins exist', async () => {
      const plugins = await loadPlugins(testEnv.tempDir);
      expect(plugins).toEqual([]);
    });

    it('should load valid plugin files', async () => {
      const plugin = {
        id: 'test-plugin',
        title: 'Test Plugin',
        kind: 'file_exists',
        file: 'test.txt',
        should_exist: true,
        report_as: 'TEST1'
      };

      await testEnv.writeFile('.ctdd/plugins/test.json', JSON.stringify(plugin));

      const plugins = await loadPlugins(testEnv.tempDir);
      expect(plugins).toHaveLength(1);
      expect(plugins[0].id).toBe('test-plugin');
    });

    it('should skip invalid plugin files', async () => {
      await testEnv.writeFile('.ctdd/plugins/invalid.json', '{ invalid json }');
      await testEnv.writeFile('.ctdd/plugins/valid.json', JSON.stringify({
        id: 'valid',
        kind: 'file_exists',
        file: 'test.txt',
        should_exist: true
      }));

      const plugins = await loadPlugins(testEnv.tempDir);
      expect(plugins).toHaveLength(1);
      expect(plugins[0].id).toBe('valid');
    });
  });

  describe('runPlugins', () => {
    beforeEach(async () => {
      // runPlugins requires a spec file to exist
      const spec = createMockSpec();
      await testEnv.writeSpec(spec);
    });

    it('should execute file_exists plugins', async () => {
      const plugin = {
        id: 'file-check',
        kind: 'file_exists',
        file: 'exists.txt',
        should_exist: true,
        report_as: 'FC1'
      };

      await testEnv.writeFile('.ctdd/plugins/file-check.json', JSON.stringify(plugin));
      await testEnv.writeFile('exists.txt', 'This file exists');

      const results = await runPlugins(testEnv.tempDir);
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('FC1'); // Uses report_as
      expect(results[0].status).toBe('PASS');
    });

    it('should execute grep plugins', async () => {
      const plugin = {
        id: 'grep-check',
        kind: 'grep',
        file: 'source.txt',
        pattern: 'hello',
        must_exist: true,
        report_as: 'GC1'
      };

      await testEnv.writeFile('.ctdd/plugins/grep-check.json', JSON.stringify(plugin));
      await testEnv.writeFile('source.txt', 'hello world');

      const results = await runPlugins(testEnv.tempDir);
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('GC1'); // Uses report_as
      expect(results[0].status).toBe('PASS');
    });

    it('should handle missing files gracefully', async () => {
      const plugin = {
        id: 'missing-file',
        kind: 'file_exists',
        file: 'nonexistent.txt',
        should_exist: false,
        report_as: 'MF1'
      };

      await testEnv.writeFile('.ctdd/plugins/missing-file.json', JSON.stringify(plugin));

      const results = await runPlugins(testEnv.tempDir);
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('MF1'); // Uses report_as
      expect(results[0].status).toBe('PASS'); // File doesn't exist and shouldn't exist
    });

    it('should return empty array when no plugins exist', async () => {
      const results = await runPlugins(testEnv.tempDir);
      expect(results).toEqual([]);
    });
  });
});