/**
 * GitHub Releases API Service for Threadline Desktop Builds
 * 
 * Fetches latest releases and binary assets (macOS .dmg, Windows .exe/.msi)
 * directly from the GitHub repository release page.
 */

export interface ReleaseAsset {
  name: string;
  browser_download_url: string;
  size: number;
  download_count?: number;
  content_type?: string;
  updated_at?: string;
}

export interface GithubReleaseInfo {
  tagName: string;
  name: string;
  publishedAt: string;
  htmlUrl: string;
  body?: string;
  windowsAsset: ReleaseAsset | null;
  macosAsset: ReleaseAsset | null;
  allAssets: ReleaseAsset[];
  isFallback: boolean;
  repo: string;
}

export const DEFAULT_GITHUB_REPO = 'sunilsahudy/Threadline---Tauri';

// In-memory cache to prevent hitting GitHub unauthenticated rate limit (60 req/hr)
let cachedRelease: GithubReleaseInfo | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) {
    return `${mb.toFixed(1)} MB`;
  }
  const kb = bytes / 1024;
  return `${kb.toFixed(0)} KB`;
}

/**
 * Fetch latest release from GitHub API with graceful fallbacks
 */
export async function fetchLatestRelease(repo: string = DEFAULT_GITHUB_REPO): Promise<GithubReleaseInfo> {
  const now = Date.now();
  if (cachedRelease && cachedRelease.repo === repo && (now - lastFetchTime < CACHE_TTL_MS)) {
    return cachedRelease;
  }

  const cleanRepo = repo.trim().replace(/^https?:\/\/github\.com\//, '');
  const apiUrl = `https://api.github.com/repos/${cleanRepo}/releases/latest`;
  const releasesPageUrl = `https://github.com/${cleanRepo}/releases`;

  try {
    const res = await fetch(apiUrl, {
      headers: {
        Accept: 'application/vnd.github.v3+json'
      }
    });

    if (!res.ok) {
      // If 404 or rate-limited, also attempt to fetch list of releases in case "latest" isn't marked
      if (res.status === 404) {
        const listRes = await fetch(`https://api.github.com/repos/${cleanRepo}/releases?per_page=1`, {
          headers: { Accept: 'application/vnd.github.v3+json' }
        });
        if (listRes.ok) {
          const listData = await listRes.json();
          if (Array.isArray(listData) && listData.length > 0) {
            return parseReleaseData(listData[0], cleanRepo);
          }
        }
      }
      throw new Error(`GitHub API returned status ${res.status}`);
    }

    const data = await res.json();
    const result = parseReleaseData(data, cleanRepo);
    cachedRelease = result;
    lastFetchTime = now;
    return result;
  } catch (err) {
    console.warn('[Threadline] Could not fetch GitHub release via API, using fallback release endpoints:', err);
    // Return structured fallback with direct release URLs
    const fallback: GithubReleaseInfo = {
      tagName: 'v0.1.0',
      name: 'Threadline Studio v0.1.0',
      publishedAt: new Date().toISOString(),
      htmlUrl: releasesPageUrl,
      body: 'Production Tauri v2 desktop builds for macOS (Universal) and Windows (64-bit).',
      windowsAsset: {
        name: 'Threadline_0.1.0_x64-setup.exe',
        browser_download_url: `${releasesPageUrl}/download/v0.1.0/Threadline_0.1.0_x64-setup.exe`,
        size: 78643200 // ~75 MB
      },
      macosAsset: {
        name: 'Threadline_0.1.0_universal.dmg',
        browser_download_url: `${releasesPageUrl}/download/v0.1.0/Threadline_0.1.0_universal.dmg`,
        size: 82837504 // ~79 MB
      },
      allAssets: [],
      isFallback: true,
      repo: cleanRepo
    };
    return fallback;
  }
}

function parseReleaseData(data: any, repo: string): GithubReleaseInfo {
  const assets: ReleaseAsset[] = Array.isArray(data.assets)
    ? data.assets.map((a: any) => ({
        name: a.name || '',
        browser_download_url: a.browser_download_url || '',
        size: a.size || 0,
        download_count: a.download_count,
        content_type: a.content_type,
        updated_at: a.updated_at
      }))
    : [];

  // Find Windows installer (.msi or .exe)
  const windowsAsset =
    assets.find((a) => a.name.endsWith('.msi') || a.name.endsWith('-setup.exe') || a.name.endsWith('.exe')) ||
    assets.find((a) => a.name.toLowerCase().includes('windows') || a.name.toLowerCase().includes('win64')) ||
    null;

  // Find macOS installer (.dmg or .app.tar.gz)
  const macosAsset =
    assets.find((a) => a.name.endsWith('.dmg')) ||
    assets.find((a) => a.name.endsWith('.app.tar.gz')) ||
    assets.find((a) => a.name.toLowerCase().includes('darwin') || a.name.toLowerCase().includes('macos') || a.name.toLowerCase().includes('apple')) ||
    null;

  return {
    tagName: data.tag_name || 'v0.1.0',
    name: data.name || 'Threadline Desktop Release',
    publishedAt: data.published_at || new Date().toISOString(),
    htmlUrl: data.html_url || `https://github.com/${repo}/releases`,
    body: data.body || '',
    windowsAsset,
    macosAsset,
    allAssets: assets,
    isFallback: false,
    repo
  };
}
