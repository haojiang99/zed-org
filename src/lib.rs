use std::env;
use zed_extension_api::{self as zed, Result};

const SERVER_PATH: &str = "language-server/server.js";

struct OrgExtension;

impl zed::Extension for OrgExtension {
    fn new() -> Self {
        Self
    }

    fn language_server_command(
        &mut self,
        _language_server_id: &zed::LanguageServerId,
        _worktree: &zed::Worktree,
    ) -> Result<zed::Command> {
        let current_dir = env::current_dir()
            .map_err(|e| format!("Failed to get current directory: {}", e))?;

        // Construct path from work directory to installed directory through symlink
        // From: /extensions/work/org
        // To:   /extensions/installed/org/language-server/server.js
        // Need to go up 2 levels: ../../installed/org/language-server/server.js
        let server_path = current_dir
            .join("../../installed/org")
            .join(SERVER_PATH)
            .to_string_lossy()
            .to_string();

        Ok(zed::Command {
            command: zed::node_binary_path()?,
            args: vec![server_path, "--stdio".to_string()],
            env: Default::default(),
        })
    }
}

zed::register_extension!(OrgExtension);
