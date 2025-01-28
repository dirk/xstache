JAVASCRIPT_PACKAGES := javascript/packages/xstache $(wildcard javascript/packages/@xstache/*)

.PHONY: build dependencies format license

all: format test

dependencies:
	cd javascript && pnpm install

build: dependencies
	cd javascript && pnpm run build

format: dependencies
	cd javascript && pnpm run prettier

test: build
	cd javascript && pnpm test

# Copy LICENSE into all packages.
license:
	@for dir in $(JAVASCRIPT_PACKAGES); do \
		cp LICENSE $$dir/LICENSE; \
	done
