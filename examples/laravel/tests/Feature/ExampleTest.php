<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function testRendersXstache(): void
    {
        $response = $this->get('/');

        $response->assertOk();
        $this->assertEquals("Hello world!\n", $response->getContent());
    }
}
