# Xstache

Isomorphic templating for the web. Xstache fuses concepts from JSX and Mustache to create a templating language that can render to both an HTML string and/or to a virtual DOM.

```xml
<button
    class=`button-primary {#icon}button-icon{/icon} {additionalButtonClasses}`
    onclick={onclick}
>
    {#icon}
        <span class="margin-right-1">
            {icon}
        </span>
    {/icon}
    {children}
</button>
```

### Supported Languages

- [x] JavaScript
    - [ ] Compile to a module or function that renders an HTML string
    - [x] Compile to a component that renders JSX
- [ ] PHP (coming soon)
- [ ] Ruby (coming soon)

## Usage

### JSX

Install the package to transform Xstache to JSX JavaScript:

```sh
npm install @xstache/jsx
```

Execute the CLI to compile your Xstache template(s) to JavaScript files:

```sh
npx xstache-jsx --write example.xstache
```

## License

Released under the [2-clause BSD license](LICENSE).
