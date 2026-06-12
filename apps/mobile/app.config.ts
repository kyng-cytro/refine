import {
  AndroidConfig,
  withAndroidManifest,
  withAppBuildGradle,
  withDangerousMod,
  type ConfigPlugin,
} from "@expo/config-plugins"
import type { ExpoConfig } from "expo/config"
import * as fs from "fs"
import * as path from "path"

const IS_DEV = process.env.APP_VARIANT !== "production"

const withProcessTextActivity: ConfigPlugin = (config) => {
  config = withAndroidManifest(config, (cfg) => {
    const mainApp = AndroidConfig.Manifest.getMainApplicationOrThrow(
      cfg.modResults,
    )

    mainApp.activity = (mainApp.activity ?? []).filter(
      (a) => a.$["android:name"] !== ".ProcessTextActivity",
    )
    mainApp.activity.push({
      $: {
        "android:name": ".ProcessTextActivity",
        "android:label": "Refine",
        "android:exported": "true",
        "android:theme": "@style/Theme.Transparent",
      },
      "intent-filter": [
        {
          action: [
            { $: { "android:name": "android.intent.action.PROCESS_TEXT" } },
          ],
          category: [
            { $: { "android:name": "android.intent.category.DEFAULT" } },
          ],
          data: [{ $: { "android:mimeType": "text/plain" } }],
        },
      ],
    })
    return cfg
  })

  config = withAppBuildGradle(config, (cfg) => {
    const dep = `implementation("androidx.security:security-crypto:1.1.0-alpha06")`
    if (!cfg.modResults.contents.includes("security-crypto")) {
      cfg.modResults.contents = cfg.modResults.contents.replace(
        /dependencies\s*\{/,
        `dependencies {\n    ${dep}`,
      )
    }
    return cfg
  })

  config = withDangerousMod(config, [
    "android",
    (cfg) => {
      const resDir = path.join(
        cfg.modRequest.platformProjectRoot,
        "app/src/main/res/values",
      )
      const stylesPath = path.join(resDir, "styles.xml")
      const transparentStyle = `
  <style name="Theme.Transparent" parent="Theme.AppCompat.NoActionBar">
    <item name="android:windowIsTranslucent">true</item>
    <item name="android:windowBackground">@android:color/transparent</item>
    <item name="android:windowNoTitle">true</item>
    <item name="android:backgroundDimEnabled">false</item>
  </style>`

      if (fs.existsSync(stylesPath)) {
        let content = fs.readFileSync(stylesPath, "utf8")
        if (!content.includes("Theme.Transparent")) {
          content = content.replace(
            "</resources>",
            `${transparentStyle}\n</resources>`,
          )
          fs.writeFileSync(stylesPath, content)
        }
      } else {
        fs.mkdirSync(resDir, { recursive: true })
        fs.writeFileSync(
          stylesPath,
          `<?xml version="1.0" encoding="utf-8"?>\n<resources>${transparentStyle}\n</resources>\n`,
        )
      }
      return cfg
    },
  ])

  config = withDangerousMod(config, [
    "android",
    (cfg) => {
      const pkg = cfg.android?.package ?? "com.cytro.refine"
      const pkgPath = pkg.replace(/\./g, "/")
      const destDir = path.join(
        cfg.modRequest.platformProjectRoot,
        "app/src/main/java",
        pkgPath,
      )
      const src = path.join(__dirname, "modules/ProcessTextActivity.kt")
      const dest = path.join(destDir, "ProcessTextActivity.kt")

      if (fs.existsSync(src)) {
        fs.mkdirSync(destDir, { recursive: true })
        let content = fs.readFileSync(src, "utf8")
        content = content.replace(/^package .+$/m, `package ${pkg}`)
        fs.writeFileSync(dest, content)
      }
      return cfg
    },
  ])

  return config
}

const config: ExpoConfig = {
  name: IS_DEV ? "Refine (Dev)" : "Refine",
  slug: "refine",
  owner: "cytro",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "refine",
  userInterfaceStyle: "automatic",
  android: {
    package: IS_DEV ? "com.cytro.refine.dev" : "com.cytro.refine",
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    predictiveBackGestureEnabled: false,
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#0f172a",
        android: {
          image: "./assets/images/splash-icon.png",
          imageWidth: 96,
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    eas: {
      projectId: "a995655c-ad09-4eb6-88eb-1e668ad9cbd6",
    },
  },
}

export default withProcessTextActivity(config)
