import {
  AndroidConfig,
  ConfigPlugin,
  withAndroidManifest,
  withAppBuildGradle,
  withDangerousMod,
} from '@expo/config-plugins';
import * as fs from 'fs';
import * as path from 'path';

const { getMainApplicationOrThrow } = AndroidConfig.Manifest;

const withProcessTextActivity: ConfigPlugin = (config) => {
  config = withAndroidManifest(config, (cfg) => {
    const mainApp = getMainApplicationOrThrow(cfg.modResults);

    mainApp.activity = (mainApp.activity ?? []).filter(
      (a) => a.$['android:name'] !== '.ProcessTextActivity'
    );

    mainApp.activity.push({
      $: {
        'android:name': '.ProcessTextActivity',
        'android:label': 'Refine',
        'android:exported': 'true',
        'android:theme': '@style/Theme.Transparent',
      },
      'intent-filter': [
        {
          action: [{ $: { 'android:name': 'android.intent.action.PROCESS_TEXT' } }],
          category: [{ $: { 'android:name': 'android.intent.category.DEFAULT' } }],
          data: [{ $: { 'android:mimeType': 'text/plain' } }],
        },
      ],
    });

    return cfg;
  });

  config = withAppBuildGradle(config, (cfg) => {
    const dep = `implementation("androidx.security:security-crypto:1.1.0-alpha06")`;
    if (!cfg.modResults.contents.includes('security-crypto')) {
      cfg.modResults.contents = cfg.modResults.contents.replace(
        /dependencies\s*\{/,
        `dependencies {\n    ${dep}`,
      );
    }
    return cfg;
  });

  config = withDangerousMod(config, [
    'android',
    (cfg) => {
      const resDir = path.join(cfg.modRequest.platformProjectRoot, 'app/src/main/res/values');
      const stylesPath = path.join(resDir, 'styles.xml');

      const transparentStyle = `
  <style name="Theme.Transparent" parent="Theme.AppCompat.NoActionBar">
    <item name="android:windowIsTranslucent">true</item>
    <item name="android:windowBackground">@android:color/transparent</item>
    <item name="android:windowNoTitle">true</item>
    <item name="android:backgroundDimEnabled">false</item>
  </style>`;

      if (fs.existsSync(stylesPath)) {
        let content = fs.readFileSync(stylesPath, 'utf8');
        if (!content.includes('Theme.Transparent')) {
          content = content.replace('</resources>', `${transparentStyle}\n</resources>`);
          fs.writeFileSync(stylesPath, content);
        }
      } else {
        fs.mkdirSync(resDir, { recursive: true });
        fs.writeFileSync(
          stylesPath,
          `<?xml version="1.0" encoding="utf-8"?>\n<resources>${transparentStyle}\n</resources>\n`,
        );
      }

      return cfg;
    },
  ]);

  config = withDangerousMod(config, [
    'android',
    (cfg) => {
      const pkg = cfg.android?.package ?? 'com.refine.app';
      const pkgPath = pkg.replace(/\./g, '/');
      const destDir = path.join(
        cfg.modRequest.platformProjectRoot,
        'app/src/main/java',
        pkgPath
      );
      const src = path.join(__dirname, '../modules/ProcessTextActivity.kt');
      const dest = path.join(destDir, 'ProcessTextActivity.kt');

      if (fs.existsSync(src)) {
        fs.mkdirSync(destDir, { recursive: true });
        let content = fs.readFileSync(src, 'utf8');
        content = content.replace(/^package com\.refine\.app$/m, `package ${pkg}`);
        fs.writeFileSync(dest, content);
      }

      return cfg;
    },
  ]);

  return config;
};

export default withProcessTextActivity;
