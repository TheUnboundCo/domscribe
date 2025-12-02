import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { QueryBySourceTool } from './query-by-source.tool.js';
import {
  createMockRelayClient,
  getResultText,
} from '../__test-utils__/mock-relay-client.js';
import { MCP_TOOLS } from './tool.defs.js';

describe('QueryBySourceTool', () => {
  describe('toolCallback', () => {
    it('should return manifest and runtime data for a found entry', async () => {
      // Arrange
      const mockClient = createMockRelayClient({
        queryBySource: vi.fn().mockResolvedValue({
          found: true,
          entryId: 'aB3dEf7h',
          sourceLocation: {
            file: 'src/components/Button.tsx',
            start: { line: 10, column: 4 },
            end: { line: 10, column: 30 },
            tagName: 'button',
            componentName: 'Button',
          },
          runtime: {
            rendered: true,
            componentProps: { label: 'Submit' },
            componentState: null,
            domSnapshot: {
              tagName: 'button',
              attributes: { class: 'btn' },
              innerText: 'Submit',
            },
          },
          browserConnected: true,
        }),
      });
      const tool = new QueryBySourceTool(mockClient);

      // Act
      const result: CallToolResult = await tool.toolCallback({
        file: 'src/components/Button.tsx',
        line: 10,
        column: 4,
      });

      // Assert
      expect(mockClient.queryBySource).toHaveBeenCalledWith({
        file: 'src/components/Button.tsx',
        line: 10,
        column: 4,
      });
      expect(result.structuredContent).toEqual({
        found: true,
        entryId: 'aB3dEf7h',
        sourceLocation: {
          file: 'src/components/Button.tsx',
          start: { line: 10, column: 4 },
          end: { line: 10, column: 30 },
          tagName: 'button',
          componentName: 'Button',
        },
        runtime: {
          rendered: true,
          componentProps: { label: 'Submit' },
          componentState: null,
          domSnapshot: {
            tagName: 'button',
            attributes: { class: 'btn' },
            innerText: 'Submit',
          },
        },
        browserConnected: true,
        error: undefined,
      });
      expect(JSON.parse(getResultText(result))).toEqual(
        result.structuredContent,
      );
    });

    it('should handle not-found responses', async () => {
      // Arrange
      const mockClient = createMockRelayClient({
        queryBySource: vi.fn().mockResolvedValue({
          found: false,
        }),
      });
      const tool = new QueryBySourceTool(mockClient);

      // Act
      const result: CallToolResult = await tool.toolCallback({
        file: 'src/components/Missing.tsx',
        line: 99,
      });

      // Assert
      expect(result.structuredContent).toEqual({
        found: false,
        entryId: undefined,
        sourceLocation: undefined,
        runtime: undefined,
        browserConnected: undefined,
        error: undefined,
      });
    });

    it('should pass optional parameters through to the client', async () => {
      // Arrange
      const mockClient = createMockRelayClient({
        queryBySource: vi.fn().mockResolvedValue({ found: false }),
      });
      const tool = new QueryBySourceTool(mockClient);

      // Act
      await tool.toolCallback({
        file: 'src/App.tsx',
        line: 5,
        column: 0,
        tolerance: 3,
        includeRuntime: false,
      });

      // Assert
      expect(mockClient.queryBySource).toHaveBeenCalledWith({
        file: 'src/App.tsx',
        line: 5,
        column: 0,
        tolerance: 3,
        includeRuntime: false,
      });
    });

    it('should return MCP error result on exception', async () => {
      // Arrange
      const mockClient = createMockRelayClient({
        queryBySource: vi
          .fn()
          .mockRejectedValue(new Error('Connection refused')),
      });
      const tool = new QueryBySourceTool(mockClient);

      // Act
      const result: CallToolResult = await tool.toolCallback({
        file: 'src/App.tsx',
        line: 1,
      });

      // Assert
      expect(result.isError).toBe(true);
      const parsed = JSON.parse(getResultText(result));
      expect(parsed.title).toBe('Connection refused');
    });
  });

  it('should have correct tool metadata', () => {
    const tool = new QueryBySourceTool(createMockRelayClient());

    expect(tool.name).toBe(MCP_TOOLS.QUERY_BY_SOURCE);
    expect(tool.description).toContain('source file');
    expect(tool.inputSchema).toBeDefined();
    expect(tool.outputSchema).toBeDefined();
  });
});
