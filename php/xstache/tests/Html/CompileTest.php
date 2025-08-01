<?php

declare(strict_types=1);

namespace Xstache\Html;

use PHPUnit\Framework\TestCase;
use Spatie\Snapshots\MatchesSnapshots;
use Xstache\Parse;

class CompileTest extends TestCase
{
    use MatchesSnapshots;

    public function testCompile(): void
    {
        $this->assertMatchesTextSnapshot(self::compile(<<<'EOD'
            <form action={action} method={method}>
                <input disabled />
            </form>
        EOD));
    }

    public function testCompileMultipleChildren(): void
    {
        $this->assertMatchesTextSnapshot(self::compile(<<<'EOD'
            <strong>Heading</strong>
            {subhead}
            <p>Paragraph</p>
        EOD));
    }

    private static function compile(string $source): string
    {
        $node_list = Parse::parse($source);
        return Compile::compile($node_list);
    }
}
