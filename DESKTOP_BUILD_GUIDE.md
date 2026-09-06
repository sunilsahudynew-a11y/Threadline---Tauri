# Building Threadline Studio for macOS & Windows

Threadline is built on **Tauri v2**, giving you a lightweight native desktop app on macOS and Windows with zero web bloat and direct filesystem access (Obsidian-style vault folders).

---

## Option 1: Automated Cloud Build via GitHub Actions (Recommended — No Setup Required)

We have included a pre-configured workflow in `.github/workflows/release.yml`.

1. **Export to GitHub**:
   - In Google AI Studio, click the project settings menu and select **Export to GitHub** (or push this code to your GitHub repo).
2. **Trigger the Build**:
   - In your GitHub repository, go to the **Actions** tab.
   - Select **Release Tauri App** from the left sidebar.
   - Click **Run workflow** (or push a tag like `git tag v1.0.0 && git push --tags`).
3. **Download Installers**:
   - GitHub will automatically spin up macOS and Windows virtual machines, compile the app, and attach the ready-to-install packages under the **Releases** section:
     - **macOS**: `Threadline_1.0.0_universal.dmg` (supports both Apple Silicon M1/M2/M3/M4 & Intel)
     - **Windows**: `Threadline_1.0.0_x64-setup.exe` and `.msi`

You can then download these files directly to your machine or save them to your Google Drive!

---

## Option 2: Build Locally on Your Own Machine

If you want to compile the desktop binary locally on your Mac or PC:

### Prerequisites

1. **Node.js**: Install Node.js 18+ (from [nodejs.org](https://nodejs.org/)).
2. **Rust**: Install Rust by following the official prompt at [rustup.rs](https://rustup.rs/):
   - **macOS**: Run in Terminal:
     ```bash
     curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
     ```
     Ensure Xcode Command Line Tools are installed:
     ```bash
     xcode-select --install
     ```
   - **Windows**: Download and run `rustup-init.exe` from [rustup.rs](https://rustup.rs/). Install the C++ Build Tools when prompted by the Visual Studio installer.

---

### Build Steps

1. **Export and Extract**:
   - From AI Studio, click **Settings > Export to ZIP** and unzip it on your computer.
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Compile the Desktop App**:
   ```bash
   npm run tauri build
   ```

### Output Files:
- **macOS**:
  - `src-tauri/target/release/bundle/dmg/Threadline_0.1.0_x64.dmg` (or universal)
  - `src-tauri/target/release/bundle/macos/Threadline.app`
- **Windows**:
  - `src-tauri/target/release/bundle/nsis/Threadline_0.1.0_x64-setup.exe`
  - `src-tauri/target/release/bundle/msi/Threadline_0.1.0_x64_en-US.msi`

Double-click the installer on your computer to install Threadline as a native desktop application.

---

## macOS: "Cannot be opened because Apple cannot check it for malicious software"

This is standard macOS **Gatekeeper** behavior for any app built outside the Mac App Store that is not signed with a paid ($99/year) Apple Developer certificate.

You can allow and open it in seconds using any of these methods:

### Method A: Right-Click > Open (Fastest, One-Time)
1. In **Finder**, go to your **Applications** folder (or wherever the `Threadline.app` is).
2. **Right-click** (or hold `Control` and click) on the **Threadline** icon.
3. Select **Open** from the menu.
4. In the dialog that appears, click the **Open** button.
5. macOS will remember your choice permanently, and future double-clicks will launch the app normally.

### Method B: System Settings
1. Click **Done** or **OK** on the warning popup.
2. Open macOS **System Settings** > **Privacy & Security**.
3. Scroll down to the **Security** section.
4. You will see a notification: *"Threadline was blocked from use because it is not from an identified developer"*.
5. Click **Open Anyway**, enter your Mac password or Touch ID, and click **Open**.

### Method C: Terminal Command (Removes Quarantine Flag)
If macOS continues to block the app, open Terminal and run:
```bash
xattr -cr /Applications/Threadline.app
```
*(Replace `/Applications/Threadline.app` with the path to the app if you haven't dragged it to Applications yet).*
