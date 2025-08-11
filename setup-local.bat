@echo off
echo 🚀 Setting up local development environment...
echo.

echo 📦 Installing dependencies...
call npm install

echo.
echo 🔧 Compiling contracts...
call npx hardhat compile

echo.
echo 🏗️  Starting Hardhat node...
echo ⚠️  Keep this terminal open and run the deployment in another terminal:
echo    npm run deploy:localhost
echo.
echo 🌐 After deployment, start the frontend with:
echo    npm run dev
echo.

call npx hardhat node