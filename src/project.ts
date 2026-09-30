import * as os from "os";
import * as path from "path";

export const EXTENSION_ID = "ZedScripts"
export const LANG_ZEDSCRIPTS = "ZedScripts"

export const globalConfigDir = path.join(os.homedir(), ".zedscripts");
export const CONFIGURATION_FILE_NAME = ".zedscripts.json";

export const LSP_VERSION = "0.0.2";