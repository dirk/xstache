<?php

declare(strict_types=1);

namespace Xstache;

class ParseException extends \Exception
{
    public function __construct(
        string $message,
        public readonly SourceLocation $location,
    ) {
        parent::__construct(sprintf(
            '%s at %s',
            $message,
            $this->location->__toString(),
        ));
    }
}
