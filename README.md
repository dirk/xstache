# Xstache

Isomorphic templating for the web. Xstache fuses concepts from JSX and Mustache to create a templating language that can render to both an HTML string *or* to a virtual DOM.

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
