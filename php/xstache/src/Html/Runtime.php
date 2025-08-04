<?php

declare(strict_types=1);

namespace Xstache\Html;

class Runtime
{
    public static function element(
        Context $context,
        string $name,
        array $attributes,
        $implementation,
    ) {
        return $implementation
            ? sprintf(
                '<%s%s>%s</%s>',
                $name,
                '', // self::attributes($attributes),
                $implementation($context),
                $name,
            )
            : sprintf(
                '<%s%s />',
                $name,
                '', // self::attributes($attributes),
            );
    }
}
