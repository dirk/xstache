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
        $this->assertMatchesCompiledSnapshot(<<<'EOD'
            <form action={action} method={method}>
                <input disabled />
            </form>
        EOD);
    }

    public function testCompileMultipleChildren(): void
    {
        $this->assertMatchesCompiledSnapshot(<<<'EOD'
            <strong>Heading</strong>
            {subhead}
            <p>Paragraph</p>
        EOD);
    }

    public function testCompileSections(): void
    {
        $this->assertMatchesCompiledSnapshot(<<<'EOD'
            {#conditional}True{/conditional}
        EOD);
    }

    private function assertMatchesCompiledSnapshot(string $source): void
    {
        $node_list = Parse::parse($source);
        $compiled = Compile::compile($node_list);
        $this->assertMatchesTextSnapshot($compiled);
    }
}
