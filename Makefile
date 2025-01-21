.PHONY: build dependencies format

all: format build

dependencies:
	cd javascript && pnpm install

build: dependencies
	cd javascript && pnpm run build

format: dependencies
	cd javascript && pnpm run prettier

test: build
	cd javascript && pnpm test
