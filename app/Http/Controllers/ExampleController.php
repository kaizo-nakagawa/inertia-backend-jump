<?php

namespace App\Http\Controllers;

use stdClass;

class ExampleController
{
    public function index()
    {
        return $this->responser(function ($ctx) {
            $ctx->component = fn() => 'Example';
            $ctx->get_data = fn() => ['message' => 'Hello World'];
        });
    }







    public function store()
    {
        return $this->responser(function ($ctx) {
            $ctx->component = fn() => 'Example2';
            $ctx->get_data = fn() => ['message' => 'Hello World'];
        });
    }

    

    public function update()
    {
        return $this->responser(function ($ctx) {
            $ctx->component = fn() => 'Example2';
            $ctx->get_datas = fn() => ['message' => 'Hello World'];
        });
    }
}
