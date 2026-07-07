import { app, Menu, nativeImage, Tray, type MenuItemConstructorOptions } from "electron"
import { join } from "path"
import { state } from "./state"
import { createMainWindow } from "./windows/main-window"

let tray: Tray | null = null

const iconPath = (name: string) =>
  app.isPackaged
    ? join(process.resourcesPath, "tray", name)
    : join(__dirname, "../../resources/tray", name)

const trayImage = () => {
  const name = process.platform === "darwin" ? "trayTemplate.png" : "tray-32.png"
  const image = nativeImage.createFromPath(iconPath(name))
  if (process.platform === "darwin") image.setTemplateImage(true)
  return image
}

const buildMenu = (): Menu => {
  const { tones, models, toneSlug, modelId } = state.snapshot()

  const modelItems: MenuItemConstructorOptions[] = models.length
    ? models.map((m) => ({
        label: m.label,
        type: "radio",
        checked: m.id === modelId,
        click: () => state.update({ modelId: m.id }),
      }))
    : [{ label: "No models", enabled: false }]

  const toneItems: MenuItemConstructorOptions[] = tones.length
    ? tones.map((t) => ({
        label: t.name,
        type: "radio",
        checked: t.slug === toneSlug,
        click: () => state.update({ toneSlug: t.slug }),
      }))
    : [{ label: "No tones", enabled: false }]

  return Menu.buildFromTemplate([
    { label: "Open Refine", click: () => createMainWindow() },
    { type: "separator" },
    { label: "Model", submenu: modelItems },
    { label: "Tone", submenu: toneItems },
    { type: "separator" },
    { label: "Quit", click: () => app.quit() },
  ])
}

export const refreshTray = (): void => {
  if (!tray) return
  tray.setContextMenu(buildMenu())
}

export const createTray = (): void => {
  if (tray) return
  tray = new Tray(trayImage())
  tray.setToolTip("Refine")
  tray.on("click", () => createMainWindow())
  refreshTray()
  state.subscribe(refreshTray)
}
