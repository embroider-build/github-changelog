#!/usr/bin/env node

"use strict";

async function run() {
  var cli = await import("../lib/cli.js");

  await cli.run();
}

run();
