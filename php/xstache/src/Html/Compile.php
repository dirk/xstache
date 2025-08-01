<?php

declare(strict_types=1);

namespace Xstache\Html;

use LogicException;
use Xstache\Ast;

class Compile
{
    public static function compile(Ast\NodeList $node_list): string
    {
        return self::children($node_list->children);
    }

    public static function children(Ast\Child|array|null $children, int $indent = 0): string
    {
        if ($children === null) {
            return "''";
        }

        if (is_array($children)) {
            $first = array_key_first($children);
            $output = [];
            foreach ($children as $key => $child) {
                $output[] = sprintf(
                    '%s%s',
                    $key !== $first ? self::indent($indent) : '',
                    self::child($child, $indent + 1),
                );
            }
            return implode('.', $output);
        }

        return self::child($children, $indent + 1);
    }

    public static function child(Ast\Child $child, int $indent = 0): string
    {
        if ($child instanceof Ast\ElementNode) {
            return self::element($child, $indent);

        } else if ($child instanceof Ast\SectionNode) {
            throw new \RuntimeException('Unreachable');

        } else if ($child instanceof Ast\TextNode) {
            return self::text($child);

        } else if ($child instanceof Ast\VariableNode) {
            return self::variable($child);

        } else {
            throw new LogicException(sprintf(
                "Unsupported child type '%s'",
                is_object($child) ? get_class($child) : gettype($child),
            ));
        }
    }

    public static function element(Ast\ElementNode $element, int $indent = 0): string
    {
        $name = $element->opening->name->value;

        $attributes = ['['];
        $last = array_key_last($element->opening->attributes);
        foreach ($element->opening->attributes as $key => $attribute) {
            $attributes[] = self::indent($indent + 1);
            $attributes[] = var_export($attribute->name->value, true);
            $attributes[] = ' => ';
            $attributes[] = $attribute->value === null
                ? 'true'
                : self::variable($attribute->value);
            $attributes[] = ',';
            if ($key === $last) {
                $attributes[] = self::indent($indent);
            }
        }
        $attributes[] = ']';
        $attributes = implode('', $attributes);

        $implementation = sprintf(
            "function (%s) {%sreturn %s;%s}",
            self::context(),
            self::indent($indent + 1),
            self::children($element->children, $indent + 2),
            self::indent($indent),
        );

        $indent = self::indent($indent);
        return sprintf(
            'XR::element(%s%s, %s%s, %s%s, %s%s)',
            $indent,
            self::context(),
            $indent,
            var_export($name, true),
            $indent,
            $attributes,
            $indent,
            $implementation,
        );
    }

    public static function text(Ast\TextNode $text): string
    {
        $escaped = htmlspecialchars($text->value, ENT_QUOTES, 'UTF-8');
        return var_export($escaped, true);
    }

    public static function variable(Ast\VariableNode $variable): string
    {
        return sprintf(
            'XR::variable(%s, [%s])',
            self::context(),
            implode(', ', array_map(
                fn(Ast\KeyNode $part) => var_export($part->value, true),
                $variable->key,
            )),
        );
    }

    public static function context(): string
    {
        return '$context';
    }

    public static function indent(int $indent): string{
        if ($indent === 0) {
            return '';
        }
        return "\n" . str_repeat(' ', $indent * 4);
    }
}
