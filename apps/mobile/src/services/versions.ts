import { createClient } from "@refine/sdk"
import {
  dismissalKey,
  resolveVersions,
  SERVER_HEADER,
  type UpdateTarget,
  type VersionInfo,
} from "@refine/versions"
import Constants from "expo-constants"
import * as Linking from "expo-linking"
import * as Updates from "expo-updates"
import { useSettingsStore } from "@/store/settings-store"
import { useVersionStore } from "@/store/version-store"

const REPO = "https://github.com/kyng-cytro/refine"

const SERVER_UPDATE_URL = `${REPO}/blob/main/GUIDE.md#updating`

export const APP_VERSION = Constants.expoConfig?.version ?? "0.0.0"

export const getVersionInfo = ({
  server,
  dismissed,
}: ReturnType<typeof useVersionStore.getState>): VersionInfo =>
  resolveVersions("mobile", APP_VERSION, server, dismissed)

export const checkVersions = async (): Promise<void> => {
  const { serverUrl } = useSettingsStore.getState()
  const { setServer } = useVersionStore.getState()
  if (!serverUrl) return setServer(null)
  try {
    setServer(await createClient({ baseURL: serverUrl, clientVersion: APP_VERSION }).meta())
  } catch {}
}

export const onResponse = (response: Response): void => {
  const version = response.headers.get(SERVER_HEADER)
  const known = useVersionStore.getState().server?.version
  if (response.status === 426 || (version && version !== known)) {
    void checkVersions()
  }
}

export const dismissUpdate = (target: UpdateTarget): void => {
  const state = useVersionStore.getState()
  const key = dismissalKey(getVersionInfo(state), target)
  if (key) state.dismiss(key)
}

const releasePage = (version: string | null) =>
  version
    ? `${REPO}/releases/tag/${encodeURIComponent(`@refine/mobile@${version}`)}`
    : `${REPO}/releases`

// Over-the-air updates only cover JS changes; native changes need a new APK.
export const installUpdate = async (target: UpdateTarget): Promise<void> => {
  if (target === "server") {
    await Linking.openURL(SERVER_UPDATE_URL)
    return
  }
  try {
    if (Updates.isEnabled) {
      const result = await Updates.checkForUpdateAsync()
      if (result.isAvailable) {
        await Updates.fetchUpdateAsync()
        await Updates.reloadAsync()
        return
      }
    }
  } catch {}
  const { latestApp } = getVersionInfo(useVersionStore.getState())
  await Linking.openURL(releasePage(latestApp))
}
