mod javascript

[private]
list:
    @just --list

dependencies: javascript::dependencies

build: javascript::build

format: javascript::format

license: javascript::license

test: javascript::test

coverage: javascript::coverage
    @echo "Coverage reports:"
    @echo "- JavaScript:" `just javascript/coverage-index`
