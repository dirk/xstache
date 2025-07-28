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

    public function testElement(): void
    {
        $name = new Ast\IdentifierNode('div');
        $this->assertEquals(
            new Ast\ElementNode(
                new Ast\ElementOpeningNode(
                    $name,
                    [],
                    false,
                ),
                new Ast\ElementClosingNode($name),
                null,
            ),
            Parse::element(new SourceReader('<div></div>')),
        );
    }

    public function testElementSelfClosingWithAttributes(): void
    {
        $this->assertEquals(
            new Ast\ElementNode(
                new Ast\ElementOpeningNode(
                    new Ast\IdentifierNode('div'),
                    [
                        new Ast\AttributeNode(
                            new Ast\IdentifierNode('foo'),
                            new Ast\VariableNode([
                                new Ast\KeyNode('bar'),
                            ]),
                        ),
                        new Ast\AttributeNode(
                            new Ast\IdentifierNode('woo'),
                            null,
                        ),
                    ],
                    true,
                ),
                null,
                null,
            ),
            Parse::element(new SourceReader('<div foo={bar} woo />')),
        );
    }

    public function testElementErrorsOnAttributesInClosingTag(): void
    {
        $this->expectExceptionMessage("Expected '>', got 'c' at 1:12");
        Parse::element(new SourceReader('<div></div class>'));
    }

    public function testSection(): void
    {
        $this->assertEquals(
            new Ast\SectionNode(
                new Ast\SectionOpeningNode([new Ast\KeyNode('foo')]),
                new Ast\SectionClosingNode([new Ast\KeyNode('foo')]),
                new Ast\TextNode('bar'),
            ),
            Parse::section(new SourceReader('{#foo}bar{/foo}')),
        );
    }

    public function testKeySingle(): void
    {
        $this->assertEquals([new Ast\KeyNode('foo')], Parse::key(new SourceReader('foo')));

        $reader = new SourceReader('bar ');
        $this->assertEquals([new Ast\KeyNode('bar')], Parse::key($reader));
        $this->assertTrue($reader->eof());
    }

    public function testKeyMulti(): void
    {
        $reader = new SourceReader("foo.\n\tbar ");
        $this->assertEquals(
            [new Ast\KeyNode('foo'), new Ast\KeyNode('bar')],
            Parse::key($reader),
        );
        $this->assertTrue($reader->eof());
    }

    public function testKeyLeadingWhitespace(): void
    {
        $this->expectExceptionMessage("Unexpected character ' ' while parsing key at 1:1");
        Parse::key(new SourceReader(' foo'));
    }

    public function testKeyDanglingSeparator(): void
    {
        $this->expectExceptionMessage("Unexpected character 'EOF' while parsing key at 1:5");
        Parse::key(new SourceReader('foo.'));
    }

    public function testKeyEmpty(): void
    {
        $this->expectExceptionMessage("Unexpected character 'EOF' while parsing key at 1:1");
        Parse::key(new SourceReader(''));
    }
}
