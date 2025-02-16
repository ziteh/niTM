# niTM

***n***iTM ***i***s a ***T***ag ***M***anager

Manage your image and video files using the [XMP](https://exiftool.org/TagNames/XMP.html) Subject fields, powered by [ExifTool](https://exiftool.org/). XMP Subject tags are widely recognized by various applications, including Windows File Explorer and [immich Tags](https://immich.app/docs/features/tags).

> Tech stack: [Tauri](https://tauri.app) + [Solid.js](https://www.solidjs.com/) + [SUID](https://suid.io/)
>
> [XMP (Extensible Metadata Platform)](https://www.adobe.com/products/xmp.html) is an ISO standard ([ISO 16684-1:2019](https://www.iso.org/standard/75163.html)), originally created by Adobe.

## Usage

Ensure you have the following installed:

1. Tauri development environment – [Setup Guide](https://tauri.app/start/prerequisites/)
2. Node.js and pnpm
3. ExifTool (and add to your `PATH`)

```bash
pnpm install
pnpm run tauri
```
