<?php

declare(strict_types=1);

namespace Xstache\Html;

class Context
{
    public function __construct(
        private readonly mixed $data,
        private readonly Context|null $parent = null,
    ) {
    }

    public function value(array $keys): mixed {
        $found = true;
        $value = $this->data;
        foreach ($keys as $key) {
            $next = null;
            if (is_array($value) && array_key_exists($key, $value)) {
                $next = $value[$key];
            } elseif (isset($value->$key)) {
                $next = $value->$key;
            }

            if ($next) {
                $value = $next;
            } else {
                $found = false;
                break;
            }
        }
        if ($found) {
            return $value;
        }
        if ($this->parent) {
            return $this->parent->value($keys);
        }
        return null;
    }
}
