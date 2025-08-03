import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import { Config } from './types';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

export async function initConfig(configPath: string = '.branch2ports'): Promise<void> {
  console.log('🚀 branch2ports の設定ファイルを作成します\n');

  const fullPath = path.resolve(configPath);
  
  if (fs.existsSync(fullPath)) {
    const overwrite = await question(`設定ファイル ${configPath} が既に存在します。上書きしますか？ (y/N): `);
    if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
      console.log('設定ファイルの作成をキャンセルしました。');
      rl.close();
      return;
    }
  }

  const outputFile = await question('出力ファイル名を指定してください (.env): ') || '.env';
  const offsetRangeInput = await question('オフセット値の範囲を指定してください (1000): ');
  const offsetRange = parseInt(offsetRangeInput) || 1000;

  console.log('\n📋 サービスのポート設定を行います');
  console.log('何も入力せずにEnterを押すとデフォルト値が使用されます\n');

  const basePort: Record<string, number> = {};
  
  const defaultServices = [
    { name: 'frontend', port: 3000 },
    { name: 'backend', port: 5000 },
    { name: 'database', port: 5432 }
  ];

  for (const { name, port } of defaultServices) {
    const serviceName = await question(`サービス名 (${name}): `) || name;
    const portInput = await question(`ポート番号 (${port}): `);
    const servicePort = parseInt(portInput) || port;
    basePort[serviceName] = servicePort;
  }

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const addMore = await question('\n別のサービスを追加しますか？ (y/N): ');
    if (addMore.toLowerCase() !== 'y' && addMore.toLowerCase() !== 'yes') {
      break;
    }

    const serviceName = await question('サービス名: ');
    if (!serviceName.trim()) {
      console.log('サービス名が入力されませんでした。スキップします。');
      continue;
    }

    const portInput = await question('ポート番号: ');
    const servicePort = parseInt(portInput);
    if (isNaN(servicePort) || servicePort <= 0 || servicePort > 65535) {
      console.log('無効なポート番号です。スキップします。');
      continue;
    }

    basePort[serviceName.trim()] = servicePort;
  }

  const config: Config = {
    basePort,
    outputFile,
    offsetRange
  };

  try {
    const configData = JSON.stringify(config, null, 2);
    fs.writeFileSync(fullPath, configData, 'utf-8');
    
    console.log(`\n✅ 設定ファイル ${configPath} を作成しました！`);
    console.log('\n📝 設定内容:');
    console.log(`  出力ファイル: ${outputFile}`);
    console.log(`  オフセット範囲: ${offsetRange}`);
    console.log('  サービス:');
    for (const [service, port] of Object.entries(basePort)) {
      console.log(`    ${service}: ${port}`);
    }
    console.log('\n🎉 準備完了！npx branch2ports でポート番号を生成できます。');
  } catch (error) {
    console.error('設定ファイルの作成に失敗しました:', error);
  } finally {
    rl.close();
  }
}