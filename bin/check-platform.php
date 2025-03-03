<?php

/**
 * Simple script to check if the current php platform environment matches the requirements.
 *
 * Gives nicely formatted output, esp. when missing PHP extensions or using the wrong PHP version.
 *
 * Needs to check if composer.lock exists because otherwise `composer check-platform-reqs` it will fail.
 */
if (file_exists('composer.lock')) {
    $exitCode = 0;

    // Run check-platform-reqs (with color due to --ansi) and capture the exit code
    passthru('composer check-platform-reqs --ansi', $exitCode);

    // If check-platform-reqs fails, exit with the same code to halt execution
    if ($exitCode !== 0) {
        exit($exitCode);
    }
} else {
    echo "\033[31mNo lockfile found, skipping platform checks.\033[0m\n";
}
