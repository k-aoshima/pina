# PinaToy's — フィギュア・カタログサイト

ネオブルータリズムスタイルのフィギュア紹介・カタログサイトです。  
3D モデルビューア、商品グリッド、そしてインタラクティブな 3D ランナーゲームを備えた SPA です。

---

## 機能

### メインサイト (`/`)
- **パララックスヒーロー** — スクロール連動のアニメーションヘッダー
- **商品グリッド** — フィルタリング付きの商品カード一覧
- **モーダル詳細ビュー** — 360° 3D モデルビューア（STL / GLB 対応）
- **Digital Archives** — フィギュアアーカイブ・ギャラリーセクション

### ゲーム (`/game`)
- Three.js 製 3D ランナーゲーム
- キャラクター選択：**FanFan**・**Rabbit**・**Tako**（全 3 種）
- ダブルジャンプ対応（スペース / 上矢印 / タップ）
- ハイスコア保持（Zustand）
- モバイル縦向き時の回転案内モーダル、スクロールヒント UI

---

## 収録フィギュア

| 名前 | サブタイトル | カテゴリ | 価格 |
|---|---|---|---|
| RABBIT FANG | Blue Lavender Edition | ORIGINALS | ¥8,800 |
| PROPELLER PANDA | Sky High Series | LIMITED | ¥12,000 |
| TAKO SUIHAN | Classic Logo Vinyl | SOFT VINYL | ¥3,500 |

---

## 技術スタック

| 分類 | ライブラリ / ツール |
|---|---|
| UI フレームワーク | React 19 + TypeScript |
| ビルドツール | Vite 7 |
| スタイリング | Tailwind CSS 3 |
| 状態管理 | Zustand 5 |
| ルーティング | React Router DOM 7 |
| 3D レンダリング | Three.js + @react-three/fiber + @react-three/drei |
| アイコン | lucide-react |
| リンター | ESLint 9 |

---

## ディレクトリ構成

```
src/
├── app/              # エントリポイント、ルーター、プロバイダー
├── components/
│   ├── layouts/      # Header / Footer / MainLayout
│   ├── three/        # Three.js 共通コンポーネント（ModelView360, GlbMesh, STLMesh ...）
│   └── ui/           # Button / Card / Label / Modal
├── config/           # 共有定数
├── features/
│   ├── game/         # 3D ランナーゲーム一式（Runner3D, GamePage, useGameStore）
│   ├── hero/         # パララックスヒーローセクション
│   └── products/     # 商品データ、グリッド、モーダル、useProductStore
├── hooks/            # useScrollPosition など
├── stores/           # グローバル UI ストア（useUIStore）
├── types/            # 型定義
└── utils/            # cn（Tailwind クラス結合）、format
public/
├── models/           # 3D モデルアセット（Rabbit.stl, FanFan.stl, Tako.glb）
├── figures/          # 商品サムネイル画像
└── assets/           # その他静的アセット
```

---

## セットアップ

```bash
yarn install
```

## 開発サーバー起動

```bash
yarn dev
# → http://localhost:5173 （LAN 内ホストにも公開されます）
```

## 本番ビルド

```bash
yarn build
```

## ビルド成果物のプレビュー

```bash
yarn preview
```

## リント

```bash
yarn lint
```

---

## 商品・3D モデルの追加手順

1. **3D モデルを追加** — `public/models/` に `.stl` または `.glb` を配置
2. **サムネイル画像を追加** — `public/figures/` に画像を配置
3. **商品データを追加** — `src/features/products/data/products.ts` にエントリを追記
4. `ProductCard` / `ProductModal` は自動的に新エントリを描画します
