<?php

declare(strict_types=1);

namespace Xstache\Html;

use LogicException;
use Xstache\Ast;

class Compile
{
    public function __construct(
        private readonly ?string $indent_step,
    ) {
    }

    public static function compile(
        Ast\NodeList $node_list,
        $indent_step = '    ',
    ): string {
        return (new self($indent_step))->nodeList($node_list);
    }

    public function nodeList(Ast\NodeList $node_list): string
    {
        $indent = $this->indent(0);
        return sprintf(
            'use \\Xstache\\Html\\Runtime as XR;%sreturn function ($context) {%sreturn %s;%s};',
            $indent,
            $this->indent(1),
            $this->children($node_list->children, 2),
            $indent,
        );
    }

    public function children(Ast\Child|array|null $children, int $indent = 0): string
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
                    $key !== $first ? $this->indent($indent) : '',
                    $this->child($child, $indent + 1),
                );
            }
            return implode('.', $output);
        }

        return $this->child($children, $indent + 1);
    }

    public function child(Ast\Child $child, int $indent = 0): string
    {
        if ($child instanceof Ast\ElementNode) {
            return $this->element($child, $indent);

        } else if ($child instanceof Ast\SectionNode) {
            throw new \RuntimeException('Unreachable');

        } else if ($child instanceof Ast\TextNode) {
            return $this->text($child);

        } else if ($child instanceof Ast\VariableNode) {
            return $this->variable($child);

        } else {
            throw new LogicException(sprintf(
                "Unsupported child type '%s'",
                is_object($child) ? get_class($child) : gettype($child),
            ));
        }
    }

    public function element(Ast\ElementNode $element, int $indent = 0): string
    {
        $name = $element->opening->name->value;
        $self_closing = $element->opening->self_closing;

        $attributes = ['['];
        $last = array_key_last($element->opening->attributes);
        foreach ($element->opening->attributes as $key => $attribute) {
            $attributes[] = $this->indent($indent + 1);
            $attributes[] = var_export($attribute->name->value, true);
            $attributes[] = ' => ';
            $attributes[] = $attribute->value === null
                ? 'true'
                : $this->variable($attribute->value);
            $attributes[] = ',';
            if ($key === $last) {
                $attributes[] = $this->indent($indent);
            }
        }
        $attributes[] = ']';
        $attributes = implode('', $attributes);

        $implementation = $self_closing
            ? 'null'
            : sprintf(
                "function (%s) {%sreturn %s;%s}",
                $this->context(),
                $this->indent($indent + 1),
                $this->children($element->children, $indent + 2),
                $this->indent($indent),
            );

        $indent = $this->indent($indent);
        return sprintf(
            'XR::element(%s%s, %s%s, %s%s, %s%s)',
            $indent,
            $this->context(),
            $indent,
            var_export($name, true),
            $indent,
            $attributes,
            $indent,
            $implementation,
        );
    }

    public function text(Ast\TextNode $text): string
    {
        $escaped = htmlspecialchars($text->value, ENT_QUOTES, 'UTF-8');
        return var_export($escaped, true);
    }

    public function variable(Ast\VariableNode $variable): string
    {
        return sprintf(
            'XR::variable(%s, [%s])',
            $this->context(),
            implode(', ', array_map(
                fn(Ast\KeyNode $part) => var_export($part->value, true),
                $variable->key,
            )),
        );
    }

    public function context(): string
    {
        return '$context';
    }

    public function indent(int $indent): string {
        if (!$this->indent_step) {
            return '';
        }
        return "\n" . str_repeat($this->indent_step, $indent);
    }
}
