# Xstache

Isomorphic templating for the web. Xstache is an experimental fusion of XML and Mustache to create a templating language designed for how we render HTML today.

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
