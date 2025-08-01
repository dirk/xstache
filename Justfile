mod javascript

[private]
list:
    @just --list

dependencies: javascript::dependencies

build: javascript::build

format: javascript::format

license: javascript::license

test: javascript::test

coverage-html: javascript::coverage-html
    @echo "Coverage reports:"
    @echo "- JavaScript:" `just javascript/coverage-index-html`
