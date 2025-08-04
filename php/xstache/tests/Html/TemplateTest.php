<?php

declare(strict_types=1);

namespace Xstache\Html;

use PHPUnit\Framework\TestCase;
use Spatie\Snapshots\MatchesSnapshots;
use Xstache\Parse;

class TemplateTest extends TestCase
{
    use MatchesSnapshots;

    public function testCompileAndRender(): void
    {
        $this->assertMatchesTextSnapshot(self::template(<<<'EOD'
            <input disabled />
        EOD)->render([]));
    }

    private static function template(string $source): Template
    {
        $node_list = Parse::parse($source);
        $implementation = eval(Compile::compile($node_list));
        return new Template($implementation);
    }
}
