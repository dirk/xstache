<?php

declare(strict_types=1);

namespace Xstache;

class Parse
{
    public static function parse(string $source)
    {
        $reader = new SourceReader($source);
        $children = self::children($reader);
        return new Ast\NodeList($children);
    }

    public static function children(SourceReader $reader): Ast\Child|array|null
    {
        $children = null;

        while (true) {
            $child = self::child($reader);
            if ($child === null) {
                break;
            }
            
            if (!$children) {
                $children = $child;
            } else if (is_array($children)) {
                $children[] = $child;
            } else {
                $children = [$children, $child];
            }
        }

        return $children;
    }

    public static function child(SourceReader $reader): Ast\Child|null
    {
        $text = self::text($reader);
        if ($text) {
            return $text;
        }

        $element = self::element($reader);
        if ($element) {
            return $element;
        }

        $variable = self::variable($reader);
        if ($variable) {
            return $variable;
        }

        return null;
    }

    public static function element(SourceReader $reader): Ast\ElementNode|null
    {
        $opening = self::openingElement($reader);
        if (!$opening) {
            return null;
        }
        
        if ($opening->self_closing) {
            return new Ast\ElementNode(
                $opening,
                // null,
                null,
            );
        } else {
            $children = self::children($reader);

            $closing = self::closingElement($reader);
            if (!$closing) {
                throw new ParseException(
                    'Expected closing element tag',
                    $reader->location(),
                );
            }

            return new Ast\ElementNode(
                $opening,
                // closing,
                $children,
            );
        }
    }

    private static function openingElement(SourceReader $reader): Ast\ElementOpeningNode|null
    {
        $peek = $reader->peek(2);
        if (!$peek || $peek[0] !== '<' || $peek === '</') {
            return null;
        }
        $reader->read(); // Consume the '<'.

        $name = self::identifier($reader);
        if (!$name) {
            throw new ParseException(
                'Expected an identifier for the element name',
                $reader->location(),
            );
        }

        $attributes = [];
        while (true) {
            $separator = self::whitespace($reader);
            // There must be some sort of whitespace (newline, space, tab, etc.) after the element
            // name/preceding attribute.
            if ($separator === "") {
                break;
            }

            $attribute = self::attribute($reader);
            if (!$attribute) {
                break;
            }
            $attributes[] = $attribute;
        }

        $self_closing = false;
        if ($reader->peek() === '/') {
            $self_closing = true;
            $reader->read();
        }

        $location = $reader->location();
        $char = $reader->read();
        if ($char !== '>') {
            throw new ParseException(
                sprintf("Expected '>', got '%s'", $char),
                $location,
            );
        }

        return new Ast\ElementOpeningNode(
            $name,
            $attributes,
            $self_closing,
        );
    }

    private static function closingElement(SourceReader $reader): Ast\ElementClosingNode|null
    {
        if ($reader->peek(2) !== '</') {
            return null;
        }
        $reader->read(); // Consume the '<',
        $reader->read(); // and the '/'.

        $name = self::identifier($reader);
        if (!$name) {
            throw new ParseException(
                'Expected an identifier for the closing element name',
                $reader->location(),
            );
        }

        self::whitespace($reader);
        $location = $reader->location();
        $char = $reader->read();
        if ($char !== '>') {
            throw new ParseException(
                sprintf("Expected '>', got '%s'", $char),
                $location,
            );
        }

        return new Ast\ElementClosingNode($name);
    }

    public static function attribute(SourceReader $reader): Ast\AttributeNode|null
    {
        $name = self::identifier($reader);
        if (!$name) {
            return null;
        }

        $value = null;
        if ($reader->peek() === '=') {
            $reader->read();
            $variable = self::variable($reader);
            if ($variable) {
                $value = $variable;
            } else {
                throw new ParseException(
                    sprintf(
                        "Expected variable, got '%s'",
                        $reader->peek(),
                    ),
                    $reader->location(),
                );
            }
        }

        return new Ast\AttributeNode($name, $value);
    }

    public static function text(SourceReader $reader): Ast\TextNode|null
    {
        $contains_text = false;
        $value = $reader->readWhile(function (string $char) use (&$contains_text): bool {
            if (self::isWhitespace($char)) {
                return true;
            } else if ($char === '<' || $char === '{') {
                return false;
            } else {
                $contains_text = true;
                return true;
            }
        });
        if ($value && $contains_text) {
            return new Ast\TextNode($value);
        }
        return null;
    }

    public static function variable(SourceReader $reader): Ast\VariableNode|null
    {
        $peek = $reader->peek(2);
        if (
            !$peek
            || $peek[0] !== '{'
            || $peek === '{#'
            || $peek === '{^'
            || $peek === '{/'
        ) {
            return null;
        }
        $reader->read(); // Consume the '{'.

        self::whitespace($reader);
        $key = self::key($reader);

        $char = $reader->read();
        if ($char !== '}') {
            throw new ParseException(
                sprintf("Expected '}', got '%s'", $char),
                $reader->location(),
            );
        }

        return new Ast\VariableNode($key);
    }

    public static function key(SourceReader $reader): array|null
    {
        $one = function (SourceReader $reader): Ast\KeyNode|null {
            $value = $reader->readWhile(fn($char) => (
                !self::isWhitespace($char)
                && $char !== '.'
                && $char !== '}'
            ));
            if ($value === '') {
                return null;
            }
            return new Ast\KeyNode($value);
        };

        $head = $one($reader);
        if (!$head) {
            throw new ParseException(
                sprintf(
                    "Unexpected character '%s' while parsing key",
                    $reader->peek(),
                ),
                $reader->location(),
            );
        }

        $parts = [$head];
        while (true) {
            self::whitespace($reader);
            if ($reader->peek() === '.') {
                $reader->read();
                self::whitespace($reader);
                $next = $one($reader);
                if (!$next) {
                    throw new ParseException(
                        sprintf(
                            "Unexpected character '%s' while parsing key",
                            $reader->peek(),
                        ),
                        $reader->location(),
                    );
                }
                $parts[] = $next;
            } else {
                break;
            }
        }

        return $parts;
    }

    public static function isIdentifier(string $char): bool
    {
        return (
            $char === '-'
            || ($char >= 'a' && $char <= 'z')
            || ($char >= 'A' && $char <= 'Z')
        );
    }

    public static function identifier(SourceReader $reader): Ast\IdentifierNode|null
    {
        $value = $reader->readWhile([self::class, 'isIdentifier']);
        return $value ? new Ast\IdentifierNode($value) : null;
    }

    public static function isWhitespace(string $char): bool
    {
        return match ($char) {
            " ", "\t", "\n", "\r" => true,
            default => false,
        };
    }

    public static function whitespace(SourceReader $reader): string
    {
        return $reader->readWhile([self::class, 'isWhitespace']);
    }
}
