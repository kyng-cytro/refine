import {
  AndroidConfig,
  ConfigPlugin,
  withAndroidManifest,
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
        // Replace placeholder package if needed
        content = content.replace(/^package com\.refine\.app$/m, `package ${pkg}`);
        fs.writeFileSync(dest, content);
      }

      return cfg;
    },
  ]);

  return config;
};

export default withProcessTextActivity;
