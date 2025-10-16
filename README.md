# **GLB GLTF Viewer** 🛰️

![Static Badge](https://img.shields.io/badge/license-MIT-brightgreen?label=LICENSE)

A lightweight viewer for `.glb` and `.gltf` models built with React Three Fiber. Drag-and-drop any supported file to preview it instantly with orbit controls, auto-rotation, and lighting presets.

---

## Getting Started

### Requirements

- [Bun](https://bun.sh/) `v1.3.0+`
- [Node.js](https://nodejs.org/) (LTS)

### Install dependencies

```bash
bun install
```

### Run the development server

```bash
bun dev
```

---

> [!NOTE]
> Prefer using another package manager? Remove `bun.lock` and install with one of the following:
>
> ```bash
> # npm install
> # yarn install
> # pnpm install
> ```

---

## Uploading Models

### Supported File Types

- Single `.glb` file (all-in-one 3D model)
- Folder containing `.gltf` with assets (`.bin`, `.jpg`, `.png`)
- Zipped (`.zip`) GLTF folder with all assets

### How to Upload

1. Drag and drop your file/folder/zip into the viewer
2. Or click to open file picker and select your model
3. Wait for the model to load
4. Use mouse/touch to rotate, zoom, and pan

---

## License

This project is licensed under the [MIT](LICENSE) license.
