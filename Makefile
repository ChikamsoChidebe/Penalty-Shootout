# Penalty Shootout Duel - Makefile
# Comprehensive build and deployment automation

.PHONY: help install clean build test deploy verify dev lint format

# Default target
help:
	@echo "🎯 Penalty Shootout Duel - Available Commands"
	@echo ""
	@echo "📦 Setup & Installation:"
	@echo "  make install          Install all dependencies"
	@echo "  make install-foundry  Install Foundry toolchain"
	@echo ""
	@echo "🔨 Development:"
	@echo "  make dev             Start development server"
	@echo "  make build           Build the project"
	@echo "  make clean           Clean build artifacts"
	@echo ""
	@echo "🧪 Testing:"
	@echo "  make test            Run all tests"
	@echo "  make test-unit       Run unit tests only"
	@echo "  make test-fuzz       Run fuzz tests"
	@echo "  make test-gas        Run gas usage tests"
	@echo "  make test-coverage   Generate coverage report"
	@echo ""
	@echo "🚀 Deployment:"
	@echo "  make deploy-local    Deploy to local network"
	@echo "  make deploy-somnia   Deploy to Somnia Testnet"
	@echo "  make verify-somnia   Verify contracts on Somnia"
	@echo ""
	@echo "🔧 Utilities:"
	@echo "  make lint            Run linting"
	@echo "  make format          Format code"
	@echo "  make node            Start local Hardhat node"
	@echo "  make console         Open Hardhat console"

# Colors for output
RED=\033[0;31m
GREEN=\033[0;32m
YELLOW=\033[1;33m
BLUE=\033[0;34m
NC=\033[0m # No Color

# Environment check
check-env:
	@if [ ! -f .env ]; then \
		echo "$(RED)❌ .env file not found. Copy .env.sample to .env and configure it.$(NC)"; \
		exit 1; \
	fi

# Installation targets
install:
	@echo "$(BLUE)📦 Installing dependencies...$(NC)"
	npm install
	@if command -v forge >/dev/null 2>&1; then \
		echo "$(GREEN)✅ Foundry already installed$(NC)"; \
	else \
		echo "$(YELLOW)⚠️  Foundry not found. Run 'make install-foundry' to install it.$(NC)"; \
	fi

install-foundry:
	@echo "$(BLUE)🔨 Installing Foundry...$(NC)"
	curl -L https://foundry.paradigm.xyz | bash
	foundryup
	@echo "$(GREEN)✅ Foundry installed successfully$(NC)"

# Development targets
dev:
	@echo "$(BLUE)🚀 Starting development server...$(NC)"
	npm run dev

build: clean
	@echo "$(BLUE)🔨 Building project...$(NC)"
	npm run compile
	npm run build
	@echo "$(GREEN)✅ Build completed$(NC)"

clean:
	@echo "$(BLUE)🧹 Cleaning build artifacts...$(NC)"
	rm -rf out/
	rm -rf artifacts/
	rm -rf cache/
	rm -rf .next/
	rm -rf node_modules/.cache/
	@echo "$(GREEN)✅ Clean completed$(NC)"

# Testing targets
test:
	@echo "$(BLUE)🧪 Running all tests...$(NC)"
	forge test -vvv
	npm run test:hardhat
	@echo "$(GREEN)✅ All tests completed$(NC)"

test-unit:
	@echo "$(BLUE)🧪 Running unit tests...$(NC)"
	forge test -vvv --match-contract "ShootoutTest"

test-fuzz:
	@echo "$(BLUE)🎲 Running fuzz tests...$(NC)"
	forge test -vvv --match-test "testFuzz"

test-gas:
	@echo "$(BLUE)⛽ Running gas usage tests...$(NC)"
	forge test --gas-report
	@echo "$(GREEN)✅ Gas report generated$(NC)"

test-coverage:
	@echo "$(BLUE)📊 Generating coverage report...$(NC)"
	forge coverage --report lcov
	@if command -v genhtml >/dev/null 2>&1; then \
		genhtml lcov.info -o coverage/; \
		echo "$(GREEN)✅ Coverage report generated in coverage/$(NC)"; \
	else \
		echo "$(YELLOW)⚠️  Install lcov to generate HTML coverage report$(NC)"; \
	fi

# Deployment targets
deploy-local: check-env
	@echo "$(BLUE)🚀 Deploying to local network...$(NC)"
	npm run node &
	sleep 5
	npm run deploy:local
	@echo "$(GREEN)✅ Local deployment completed$(NC)"

deploy-somnia: check-env
	@echo "$(BLUE)🚀 Deploying to Somnia Testnet...$(NC)"
	@if [ -z "$(PRIVATE_KEY)" ]; then \
		echo "$(RED)❌ PRIVATE_KEY not set in .env$(NC)"; \
		exit 1; \
	fi
	@if [ -z "$(SOMNIA_RPC_URL)" ]; then \
		echo "$(RED)❌ SOMNIA_RPC_URL not set in .env$(NC)"; \
		exit 1; \
	fi
	npm run deploy:somnia
	@echo "$(GREEN)✅ Somnia deployment completed$(NC)"

verify-somnia: check-env
	@echo "$(BLUE)🔍 Verifying contracts on Somnia...$(NC)"
	npm run verify:somnia
	@echo "$(GREEN)✅ Contract verification completed$(NC)"

# Utility targets
lint:
	@echo "$(BLUE)🔍 Running linting...$(NC)"
	npm run lint
	forge fmt --check
	@echo "$(GREEN)✅ Linting completed$(NC)"

format:
	@echo "$(BLUE)✨ Formatting code...$(NC)"
	npm run lint --fix
	forge fmt
	@echo "$(GREEN)✅ Code formatted$(NC)"

node:
	@echo "$(BLUE)🌐 Starting local Hardhat node...$(NC)"
	npm run node

console: check-env
	@echo "$(BLUE)💻 Opening Hardhat console...$(NC)"
	npx hardhat console --network localhost

# Advanced targets
security-check:
	@echo "$(BLUE)🔒 Running security checks...$(NC)"
	@if command -v slither >/dev/null 2>&1; then \
		slither contracts/; \
	else \
		echo "$(YELLOW)⚠️  Slither not installed. Install with: pip install slither-analyzer$(NC)"; \
	fi
	@if command -v mythril >/dev/null 2>&1; then \
		myth analyze contracts/Shootout.sol; \
	else \
		echo "$(YELLOW)⚠️  Mythril not installed. Install with: pip install mythril$(NC)"; \
	fi

benchmark:
	@echo "$(BLUE)📊 Running benchmarks...$(NC)"
	forge test --gas-report > gas-report.txt
	@echo "$(GREEN)✅ Benchmark completed. Results in gas-report.txt$(NC)"

docs:
	@echo "$(BLUE)📚 Generating documentation...$(NC)"
	forge doc
	@echo "$(GREEN)✅ Documentation generated in docs/$(NC)"

# CI/CD targets
ci-test:
	@echo "$(BLUE)🤖 Running CI tests...$(NC)"
	npm ci
	forge test
	npm run test:hardhat
	npm run lint
	npm run build

ci-deploy: ci-test deploy-somnia verify-somnia

# Docker targets (optional)
docker-build:
	@echo "$(BLUE)🐳 Building Docker image...$(NC)"
	docker build -t penalty-shootout-duel .

docker-run:
	@echo "$(BLUE)🐳 Running Docker container...$(NC)"
	docker run -p 3000:3000 penalty-shootout-duel

# Maintenance targets
update-deps:
	@echo "$(BLUE)📦 Updating dependencies...$(NC)"
	npm update
	forge update
	@echo "$(GREEN)✅ Dependencies updated$(NC)"

check-updates:
	@echo "$(BLUE)🔍 Checking for updates...$(NC)"
	npm outdated
	forge tree

# Demo targets
demo-setup: install build deploy-local
	@echo "$(GREEN)🎬 Demo environment ready!$(NC)"
	@echo "$(BLUE)Next steps:$(NC)"
	@echo "1. Start frontend: make dev"
	@echo "2. Open http://localhost:3000"
	@echo "3. Connect wallet to localhost:8545"

demo-reset: clean install build deploy-local
	@echo "$(GREEN)🔄 Demo environment reset!$(NC)"

# Help for specific commands
help-deploy:
	@echo "🚀 Deployment Help"
	@echo ""
	@echo "Before deploying:"
	@echo "1. Copy .env.sample to .env"
	@echo "2. Set PRIVATE_KEY (without 0x prefix)"
	@echo "3. Set SOMNIA_RPC_URL"
	@echo "4. Ensure you have testnet ETH"
	@echo ""
	@echo "Commands:"
	@echo "  make deploy-somnia   Deploy to Somnia Testnet"
	@echo "  make verify-somnia   Verify on block explorer"

help-test:
	@echo "🧪 Testing Help"
	@echo ""
	@echo "Available test types:"
	@echo "  make test           Run all tests"
	@echo "  make test-unit      Unit tests only"
	@echo "  make test-fuzz      Fuzz testing"
	@echo "  make test-gas       Gas usage analysis"
	@echo "  make test-coverage  Coverage report"

# Version and info
version:
	@echo "Penalty Shootout Duel v1.0.0"
	@echo "Built for Somnia Hackathon"
	@node --version
	@npm --version
	@if command -v forge >/dev/null 2>&1; then forge --version; fi

info:
	@echo "$(BLUE)📋 Project Information$(NC)"
	@echo "Name: Penalty Shootout Duel"
	@echo "Version: 1.0.0"
	@echo "Network: Somnia Testnet (Chain ID: 50311)"
	@echo "Tech Stack: Solidity, Next.js, Foundry, Hardhat"
	@echo "Repository: https://github.com/your-username/penalty-shootout-duel"