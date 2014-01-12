#!/usr/bin/env node

var spawn   = require('child_process').spawn
  , fs      = require('fs')
  , options = require('argsparser').parse()
  , params  = [];

//process.exit(1);
// -a > archive mode; equals -rlptgoD (no -H,-A,-X)
// -v > verbosely!
// -z > compress files when transmitting
params.push('-avz');

// don't actually change anything, just "fake" it
if (options['dry-run']) {
  params.push('--dry-run');
}

// update only those files that have changed since last bkp
params.push('--update');

// I'm bored, so show me something in the screen while I'm waiting
params.push('--progress');

// delete the files that are present in the destination, but not in the source
params.push('--delete');

if (! options['--bkp-path']) {
  throw new Error('you must supply --bkp-path in order to make bkp');
} else if (options['--bkp-path'] && (! fs.existsSync(options['--bkp-path']))) {
  throw new Error('the path suplied in --bkp-path isn\'t valid');
}

// logs out to a file
params.push('--log-file=' + options['--bkp-path'] + 'rsync.log');

// include PATTERNs file for checking what should and what should not be backed-up
params.push('--include-from=' + __dirname + '/rsync.include');

// source PATH
params.push('' + process.env.HOME + '/');

// destination PATH
params.push('' + options['--bkp-path'] + process.env.USER);

var rsync = spawn('rsync', params);

rsync.stdout.setEncoding('utf-8');
rsync.stdout.on('data', function (data) {
  console.log(data);
});

rsync.stderr.setEncoding('utf-8');
rsync.stderr.on('data', function (error) {
  console.log('ERROR: ', error);
});

rsync.on('close', function (code) {
  console.log('rsync exited with code: ', code);
});

