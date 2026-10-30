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
    ): string {
        return $implementation
            ? sprintf(
                '<%s%s>%s</%s>',
                $name,
                self::attributes($context, $attributes),
                $implementation($context),
                $name,
            )
            : sprintf(
                '<%s%s />',
                $name,
                self::attributes($context, $attributes),
            );
    }

    public static function attributes(
        Context $context,
        array $attributes,
    ): string {
        if (empty($attributes)) {
            return '';
        }
        $buffer = [];
        foreach ($attributes as $key => $value) {
            if ($value) {
                $attribute = " $key";
                // TODO: Support closures for values to support sections and inverted sections as
                //     attribute values.
                if ($value !== true) {
                    $stringified = self::coerceToString($value);
                    $escaped = self::escape($stringified);
                    $attribute .= "=\"$escaped\"";
                }
                $buffer[] = $attribute;
            }
        }
        return implode('', $buffer);
    }

    private static function coerceToString($input): string {
        return $input ? (string)$input : '';
    }

    private static function escape(string $input): string {
        return htmlspecialchars($input);
    }
}
