import { existsSync, statSync } from 'node:fs';
import { getWorkspaceRoot } from './utils.js';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  statSync: vi.fn().mockReturnValue({ isDirectory: () => true }),
}));

describe('getWorkspaceRoot', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return cwd when .domscribe exists there', () => {
    // Arrange
    vi.mocked(existsSync).mockReturnValue(true);

    // Act
    const result = getWorkspaceRoot();

    // Assert
    expect(result).toBe(process.cwd());
  });

  it('should walk up and find .domscribe in parent directory', () => {
    // Arrange
    vi.mocked(existsSync).mockImplementation((p) => {
      const str = String(p);
      // Only .domscribe in root '/' matches
      return str === '/.domscribe';
    });
    vi.mocked(statSync).mockReturnValue({
      isDirectory: () => true,
    } as ReturnType<typeof statSync>);

    // Act
    const result = getWorkspaceRoot();

    // Assert
    expect(result).toBe('/');
  });

  it('should return undefined when no .domscribe is found', () => {
    // Arrange
    vi.mocked(existsSync).mockReturnValue(false);

    // Act
    const result = getWorkspaceRoot();

    // Assert
    expect(result).toBeUndefined();
  });
});
