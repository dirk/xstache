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

    public function testSection(): void
    {
        $this->assertMatchesTextSnapshot(self::template(<<<'EOD'
            {#truthy}truthy{/truthy}
            {#falsey}falsey{/falsey}
            {#repeated}repeated{/repeated}
        EOD)->render([
            'truthy' => true,
            'falsey' => false,
            'repeated' => [1, 2, 3],
        ]));
    }

    public function testInvertedSection(): void
    {
        $this->assertMatchesTextSnapshot(self::template(<<<'EOD'
            {^truthy}truthy{/truthy}
            {^falsey}falsey{/falsey}
            {^repeated}repeated{/repeated}
        EOD)->render([
            'truthy' => true,
            'falsey' => false,
            'repeated' => [1, 2, 3],
        ]));
    }

    private static function template(string $source): Template
    {
        $node_list = Parse::parse($source);
        $implementation = eval(Compile::compile($node_list));
        return new Template($implementation);
    }
}
