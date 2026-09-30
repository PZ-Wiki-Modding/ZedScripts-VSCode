import * as vscode from 'vscode';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import * as https from 'https';

const GITHUB_OWNER = 'PZ-Wiki-Modding';
const GITHUB_REPO = 'ZedScripts-LSP';

interface PlatformInfo {
    platform: string;
    arch: string;
    binaryName: string;
    downloadName: string;
}

function getPlatformInfo(): PlatformInfo {
    const platform = os.platform();
    const arch = os.arch();
    
    // Match the naming convention from GitHub Actions release workflow
    let downloadName: string;
    let binaryName: string;
    
    if (platform === 'win32') {
        downloadName = 'ZedScripts-windows-x86_64.exe';
        binaryName = 'ZedScripts.exe';
    } else if (platform === 'linux') {
        downloadName = 'ZedScripts-linux-x86_64';
        binaryName = 'ZedScripts';
    } else if (platform === 'darwin') {
        // macOS support - add when GitHub Actions workflow supports it
        throw new Error('macOS is not yet supported');
    } else {
        throw new Error(`Unsupported platform: ${platform}`);
    }
    
    return {
        platform,
        arch,
        binaryName,
        downloadName,
    };
}

async function downloadBinary(
    downloadName: string,
    destinationPath: string,
    version: string
): Promise<void> {
    const downloadUrl = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/download/v${version}/${downloadName}`;
    console.log(`Downloading binary from: ${downloadUrl}`);
    
    return new Promise((resolve, reject) => {
        const attemptDownload = (url: string) => {
            https
            .get(url, (response) => {
                // Handle redirects (301, 302, 307, 308)
                if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400) {
                    const redirectUrl = response.headers.location;
                    if (!redirectUrl) {
                        reject(new Error(`Redirect with no location header. Status: ${response.statusCode}`));
                        return;
                    }
                    console.log(`Following redirect to: ${redirectUrl}`);
                    attemptDownload(redirectUrl);
                    return;
                }
                
                if (response.statusCode === 404) {
                    reject(new Error(`Binary not found: ${url}`));
                    return;
                }
                
                if (response.statusCode !== 200) {
                    reject(
                        new Error(
                            `Failed to download binary. Status: ${response.statusCode}`
                        )
                    );
                    return;
                }
                
                const file = fs.createWriteStream(destinationPath);
                response.pipe(file);
                
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
                
                file.on('error', (err) => {
                    fs.unlink(destinationPath, () => {});
                    reject(err);
                });
            })
            .on('error', reject);
        };
        
        attemptDownload(downloadUrl);
    });
}

export async function ensureLSPBinary(
    context: vscode.ExtensionContext,
    extensionVersion: string
): Promise<string> {
    const platformInfo = getPlatformInfo();
    const storagePath = context.globalStoragePath;
    const binaryPath = path.join(storagePath, platformInfo.binaryName);
    const versionFile = path.join(storagePath, '.version');
    
    // Ensure storage directory exists
    if (!fs.existsSync(storagePath)) {
        fs.mkdirSync(storagePath, { recursive: true });
    }
    
    // Check if binary exists and version matches
    if (fs.existsSync(binaryPath) && fs.existsSync(versionFile)) {
        const cachedVersion = fs.readFileSync(versionFile, 'utf-8').trim();
        if (cachedVersion === extensionVersion) {
            console.log(`Using cached LSP binary at ${binaryPath} with version ${cachedVersion}`);
            return binaryPath;
        }
    }

    console.log(`Downloading LSP binary to ${binaryPath} with version ${extensionVersion}`);
    
    // Show progress notification
    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: 'Downloading ZedScripts LSP Server...',
            cancellable: false,
        },
        async (progress) => {
            try {
                progress.report({ increment: 0 });
                await downloadBinary(
                    platformInfo.downloadName,
                    binaryPath,
                    extensionVersion
                );
                progress.report({ increment: 50 });
                
                // Make executable on Unix systems
                if (platformInfo.platform !== 'win32') {
                    fs.chmodSync(binaryPath, 0o755);
                }
                
                // Write version file
                fs.writeFileSync(versionFile, extensionVersion, 'utf-8');
                
                progress.report({ increment: 100 });
            } catch (error) {
                throw new Error(
                    `Failed to download LSP server: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        }
    );
    
    return binaryPath;
}