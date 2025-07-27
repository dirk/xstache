<?php

declare(strict_types=1);

namespace Xstache;

use PHPUnit\Framework\TestCase;
use Spatie\Snapshots\MatchesSnapshots;

class ParseTest extends TestCase
{
    use MatchesSnapshots;

    public function testTextNode(): void
    {
        $raw = "Hello, World!";
        $reader = new SourceReader($raw);
        $textNode = Parse::text($reader);
        $this->assertInstanceOf(Ast\TextNode::class, $textNode);
        $this->assertEquals($raw, $textNode->value);
    }

    public function testChildren(): void
    {
        $this->assertMatchesSnapshot(
            Parse::children(new SourceReader('<div></div>')),
        );
    }

    public function testElementErrorsOnAttributesInClosingTag(): void
    {
        $this->expectExceptionMessage("Expected '>', got 'c' at 1:12");
        Parse::element(new SourceReader('<div></div class>'));
    }
}
