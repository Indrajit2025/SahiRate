npm create vite@latest temp-app -- --template react-ts
Move-Item -Path temp-app\* -Destination . -Force
Move-Item -Path temp-app\.* -Destination . -Force
Remove-Item temp-app -Recurse -Force
npm install
npm install -D tailwindcss postcss autoprefixer @types/node
npx tailwindcss init -p
npm install react-router-dom lucide-react clsx tailwind-merge
New-Item -ItemType Directory -Force -Path "src/components/ui"
New-Item -ItemType Directory -Force -Path "src/pages/collector"
New-Item -ItemType Directory -Force -Path "src/pages/recycler"
New-Item -ItemType Directory -Force -Path "src/pages/admin"
New-Item -ItemType Directory -Force -Path "src/routes"
New-Item -ItemType Directory -Force -Path "src/services"
New-Item -ItemType Directory -Force -Path "src/utils"
New-Item -ItemType Directory -Force -Path "src/types"
New-Item -ItemType Directory -Force -Path "src/stores"
New-Item -ItemType Directory -Force -Path "src/db"
New-Item -ItemType Directory -Force -Path "src/sync"
New-Item -ItemType Directory -Force -Path "src/hooks"
New-Item -ItemType Directory -Force -Path "src/i18n"
New-Item -ItemType Directory -Force -Path "src/ml"
